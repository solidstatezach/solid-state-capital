-- Migration: security hardening (Phase 2).
--
-- 1. resolve_withdrawal_request() was SECURITY DEFINER with no internal
--    admin check: any authenticated user could call it directly via
--    supabase.rpc() and approve their own withdrawal. The function now
--    enforces public.is_admin() itself, and writes an audit_log row for
--    every approve/reject decision.
-- 2. portfolio_positions gets CHECK constraints so junk values (negative
--    quantity, negative prices, empty asset) cannot corrupt valuation math.
--
-- NOTE for the live project: the VM cannot run `supabase db push`
-- (Postgres TLS is blocked), so also paste this file's contents into the
-- Supabase dashboard SQL editor for the live project.

create or replace function public.resolve_withdrawal_request(
  request_id uuid,
  p_action   text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req record;
  bal numeric;
  v_actor uuid;
begin
  -- Authorization lives INSIDE the function: it is SECURITY DEFINER and
  -- granted to `authenticated`, so the API layer alone is not enough.
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  v_actor := (select auth.uid());

  if p_action not in ('approved', 'rejected') then
    raise exception 'action must be approved or rejected';
  end if;

  -- Lock the request row: concurrent approve/reject attempts serialize here.
  select * into req
  from public.withdrawal_requests
  where id = request_id
  for update;

  if not found then
    raise exception 'Request not found';
  end if;

  if req.status <> 'pending' then
    raise exception 'Request is already %', req.status;
  end if;

  if p_action = 'rejected' then
    update public.withdrawal_requests
    set status = 'rejected'
    where id = request_id;

    insert into public.audit_log
      (actor_id, action, entity, entity_id, after, notes)
    values
      (v_actor, 'withdrawal.reject', 'withdrawal_requests', request_id::text,
       jsonb_build_object('investor_id', req.investor_id,
                          'amount', req.amount),
       'Withdrawal request rejected');
    return;
  end if;

  -- approved: lock investor row before reading balance (no stale read).
  select balance into bal
  from public.investors
  where id = req.investor_id
  for update;

  if not found then
    raise exception 'Investor not found';
  end if;

  if bal < req.amount then
    raise exception 'Insufficient investor balance';
  end if;

  insert into public.investor_transactions
    (investor_id, transaction_type, amount, notes)
  values
    (req.investor_id,
     'withdrawal',
     req.amount,
     'Withdrawal request approved (wallet ' || req.wallet_address || ')');

  update public.investors
  set balance = bal - req.amount
  where id = req.investor_id;

  update public.withdrawal_requests
  set status = 'approved'
  where id = request_id;

  insert into public.audit_log
    (actor_id, action, entity, entity_id, after, notes)
  values
    (v_actor, 'withdrawal.approve', 'withdrawal_requests', request_id::text,
     jsonb_build_object('investor_id', req.investor_id,
                        'amount', req.amount,
                        'wallet_address', req.wallet_address),
     'Withdrawal request approved');
end;
$$;

-- Keep the existing grant model: authenticated may execute, but the
-- function now rejects non-admins itself.
revoke all on function public.resolve_withdrawal_request(uuid, text) from public;
grant execute on function public.resolve_withdrawal_request(uuid, text) to authenticated;

-- ── portfolio_positions sanity constraints ─────────────────────────────
-- Negative quantities or prices (and empty asset names) corrupt every
-- valuation and P/L figure derived from this table.
alter table public.portfolio_positions
  drop constraint if exists portfolio_positions_quantity_check;
alter table public.portfolio_positions
  add constraint portfolio_positions_quantity_check
  check (quantity >= 0);

alter table public.portfolio_positions
  drop constraint if exists portfolio_positions_average_cost_check;
alter table public.portfolio_positions
  add constraint portfolio_positions_average_cost_check
  check (average_cost >= 0);

alter table public.portfolio_positions
  drop constraint if exists portfolio_positions_current_price_check;
alter table public.portfolio_positions
  add constraint portfolio_positions_current_price_check
  check (current_price >= 0);

alter table public.portfolio_positions
  drop constraint if exists portfolio_positions_asset_check;
alter table public.portfolio_positions
  add constraint portfolio_positions_asset_check
  check (btrim(asset) <> '');
