-- Stripe card deposits: payment-link tracking, webhook idempotency,
-- and an atomic deposit-recording function.
-- Idempotent: safe to run more than once.

-- ── link tracking ──────────────────────────────────────────────────────
create table if not exists public.stripe_deposit_links (
  id                uuid primary key default gen_random_uuid(),
  investor_id       uuid not null references public.investors(id) on delete cascade,
  amount_cents      integer not null check (amount_cents > 0),
  currency          text not null default 'usd',
  stripe_session_id text unique,
  url               text,
  status            text not null default 'pending'
    check (status in ('pending', 'paid', 'expired', 'canceled')),
  created_at        timestamptz not null default now()
);

-- ── webhook idempotency ────────────────────────────────────────────────
create table if not exists public.stripe_events (
  event_id   text primary key,
  type       text not null,
  created_at timestamptz not null default now()
);

alter table public.stripe_deposit_links enable row level security;
alter table public.stripe_events enable row level security;

drop policy if exists "Admins can manage stripe deposit links"
  on public.stripe_deposit_links;
create policy "Admins can manage stripe deposit links"
  on public.stripe_deposit_links
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can manage stripe events"
  on public.stripe_events;
create policy "Admins can manage stripe events"
  on public.stripe_events
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── atomic deposit recording ───────────────────────────────────────────
-- Called by the Stripe webhook after signature verification. Inserts the
-- event id first: a concurrent/retried delivery for the same event hits
-- the conflict and returns 'duplicate' before any money moves, so a card
-- payment can never credit a balance twice.
create or replace function public.record_stripe_deposit(
  p_event_id   text,
  p_event_type text,
  p_investor_id uuid,
  p_amount     numeric,
  p_session_id text,
  p_link_id    uuid
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance  numeric;
  v_invested numeric;
begin
  insert into public.stripe_events (event_id, type)
  values (p_event_id, p_event_type)
  on conflict (event_id) do nothing;

  if not found then
    return 'duplicate';
  end if;

  select balance, total_invested
    into v_balance, v_invested
  from public.investors
  where id = p_investor_id;

  if not found then
    raise exception 'investor not found: %', p_investor_id;
  end if;

  insert into public.investor_transactions
    (investor_id, transaction_type, amount, notes)
  values
    (p_investor_id, 'deposit', p_amount,
     'Stripe card deposit (session ' || p_session_id || ')');

  update public.investors
  set balance        = coalesce(v_balance, 0) + p_amount,
      total_invested = coalesce(v_invested, 0) + p_amount
  where id = p_investor_id;

  if p_link_id is not null then
    update public.stripe_deposit_links
    set status = 'paid'
    where id = p_link_id;
  end if;

  insert into public.audit_log (action, entity, after, notes)
  values (
    'transaction.deposit',
    'investor_transactions',
    jsonb_build_object(
      'investor_id', p_investor_id,
      'amount', p_amount,
      'stripe_session_id', p_session_id
    ),
    'Stripe card deposit of $' || p_amount || ' for investor ' || p_investor_id
  );

  return 'ok';
end;
$$;

-- Webhook-only: no direct client access. The Next.js webhook route calls
-- this with the service-role key after verifying Stripe's signature.
revoke all on function public.record_stripe_deposit(
  text, text, uuid, numeric, text, uuid
) from public, anon, authenticated;
grant execute on function public.record_stripe_deposit(
  text, text, uuid, numeric, text, uuid
) to service_role;
