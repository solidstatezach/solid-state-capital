-- Migration: atomic withdrawal-request approval
-- Fixes the double-payout race: the old API ran five separate steps
-- (read request, check pending, read balance, insert ledger, debit, mark
-- approved), so two concurrent approvals could both pay out.
-- This function locks the request row and the investor row inside a single
-- transaction; a second attempt fails cleanly with "Request is already …".
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
begin
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
end;
$$;

-- Only authenticated (admin-gated at the API layer) callers may run it.
revoke all on function public.resolve_withdrawal_request(uuid, text) from public;
grant execute on function public.resolve_withdrawal_request(uuid, text) to authenticated;
