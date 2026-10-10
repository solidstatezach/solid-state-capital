-- Audit log, portfolio snapshots, and atomic trade execution.
--
-- audit_log is append-only: admins can read and insert, nobody can
-- update or delete. Every sensitive mutation should write a row here.
-- portfolio_snapshots stores one valuation row per investor per day so
-- the performance page can chart real history instead of fabricating it.

-- ── audit_log ─────────────────────────────────────────────────────────
create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references auth.users(id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  text,
  before     jsonb,
  after      jsonb,
  notes      text,
  created_at timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log (entity, entity_id);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

create policy "Admins can read audit log"
  on public.audit_log for select to authenticated
  using (public.is_admin());
create policy "Admins can append audit log"
  on public.audit_log for insert to authenticated
  with check (public.is_admin());
-- Intentionally no update/delete policies: the log is append-only.

-- ── portfolio_snapshots ───────────────────────────────────────────────
create table public.portfolio_snapshots (
  id           uuid primary key default gen_random_uuid(),
  investor_id  uuid not null references public.investors(id) on delete cascade,
  cash_balance numeric not null default 0,
  total_cost   numeric not null default 0,
  total_value  numeric not null default 0,
  created_at   timestamptz not null default now()
);
create index portfolio_snapshots_investor_idx
  on public.portfolio_snapshots (investor_id, created_at desc);
-- One snapshot per investor per calendar day: re-recording is idempotent.
create unique index portfolio_snapshots_investor_day_uidx
  on public.portfolio_snapshots (investor_id, (created_at::date));

alter table public.portfolio_snapshots enable row level security;

create policy "Investors can view own snapshots"
  on public.portfolio_snapshots for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.investors i
      where i.id = portfolio_snapshots.investor_id
        and i.user_id = (select auth.uid())
    )
  );
create policy "Admins can manage snapshots"
  on public.portfolio_snapshots for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── investor_transactions: allow 'trade' entries ──────────────────────────
-- The original check constraint only allowed deposit/withdrawal/profit/loss.
-- Trades are recorded with a positive amount; direction lives in notes.
alter table public.investor_transactions
  drop constraint if exists investor_transactions_transaction_type_check;
alter table public.investor_transactions
  add constraint investor_transactions_transaction_type_check
  check (transaction_type in
    ('deposit', 'withdrawal', 'profit', 'loss', 'trade'));

-- ── execute_trade() ───────────────────────────────────────────────────
-- Atomic buy/sell: locks the investor row, validates cash (buy) or
-- position quantity (sell), updates balance + position + ledger +
-- audit in one transaction. SECURITY DEFINER, but the function itself
-- requires an admin caller via public.is_admin().
create or replace function public.execute_trade(
  p_investor_id uuid,
  p_asset       text,
  p_side        text,
  p_quantity    numeric,
  p_price       numeric,
  p_notes       text default null
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_investor  investors%rowtype;
  v_position  portfolio_positions%rowtype;
  v_has_pos   boolean;
  v_cost      numeric;
  v_realized  numeric := 0;
  v_new_qty   numeric;
  v_new_avg   numeric;
  v_tx_id     uuid;
  v_actor     uuid;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  v_actor := (select auth.uid());

  if p_side not in ('buy', 'sell') then
    raise exception 'side must be ''buy'' or ''sell''';
  end if;
  if p_quantity <= 0 or p_price <= 0 then
    raise exception 'quantity and price must be positive';
  end if;
  if p_asset is null or btrim(p_asset) = '' then
    raise exception 'asset is required';
  end if;

  select * into v_investor
    from investors where id = p_investor_id for update;
  if not found then
    raise exception 'investor not found';
  end if;

  select * into v_position
    from portfolio_positions
    where investor_id = p_investor_id and asset = p_asset for update;
  v_has_pos := found;

  if p_side = 'buy' then
    v_cost := p_quantity * p_price;
    if coalesce(v_investor.balance, 0) < v_cost then
      raise exception 'insufficient cash balance';
    end if;

    update investors
      set balance = balance - v_cost, updated_at = now()
      where id = p_investor_id;

    if v_has_pos then
      v_new_qty := v_position.quantity + p_quantity;
      v_new_avg :=
        (v_position.quantity * v_position.average_cost + v_cost) / v_new_qty;
      update portfolio_positions
        set quantity = v_new_qty,
            average_cost = v_new_avg,
            current_price = p_price,
            updated_at = now()
        where id = v_position.id;
    else
      insert into portfolio_positions
        (investor_id, asset, quantity, average_cost, current_price)
        values (p_investor_id, p_asset, p_quantity, p_price, p_price);
    end if;
  else
    -- sell
    if not v_has_pos or v_position.quantity < p_quantity then
      raise exception 'insufficient position quantity';
    end if;
    v_realized := (p_price - v_position.average_cost) * p_quantity;

    update investors
      set balance = balance + p_quantity * p_price,
          total_profit = coalesce(total_profit, 0) + v_realized,
          updated_at = now()
      where id = p_investor_id;

    v_new_qty := v_position.quantity - p_quantity;
    if v_new_qty = 0 then
      delete from portfolio_positions where id = v_position.id;
    else
      update portfolio_positions
        set quantity = v_new_qty,
            current_price = p_price,
            updated_at = now()
        where id = v_position.id;
    end if;
  end if;

  insert into investor_transactions
    (investor_id, transaction_type, amount, notes)
    values (
      p_investor_id,
      'trade',
      p_quantity * p_price,
      nullif(
        coalesce(p_notes, '') || ' [' || upper(p_side) || ' '
          || p_quantity::text || ' ' || p_asset || ' @ ' || p_price::text || ']',
        ''
      )
    )
    returning id into v_tx_id;

  insert into audit_log
    (actor_id, action, entity, entity_id, after, notes)
    values (
      v_actor,
      'trade.' || p_side,
      'portfolio_positions',
      p_asset,
      jsonb_build_object(
        'investor_id', p_investor_id,
        'quantity', p_quantity,
        'price', p_price,
        'realized_pnl', v_realized,
        'tx_id', v_tx_id
      ),
      p_notes
    );

  return jsonb_build_object(
    'success', true,
    'realized_pnl', v_realized,
    'tx_id', v_tx_id
  );
end;
$$;
