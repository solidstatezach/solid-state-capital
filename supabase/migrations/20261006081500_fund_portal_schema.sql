-- ============================================================================
-- Solid State Capital — fund portal schema
-- ----------------------------------------------------------------------------
-- This migration REPLACES the stale initial migration (20260906014430),
-- which created tables (portfolios, holdings, transactions,
-- performance_snapshots) that the application no longer queries. Running the
-- old migration left every dashboard query failing with "relation does not
-- exist". This file describes the schema the code actually uses.
--
-- Tables:
--   profiles               one row per auth user (admin flag lives here)
--   investors              fund investors, optionally linked to an auth user
--   investor_transactions  deposits / withdrawals / profit / loss ledger
--   portfolio_positions    per-investor holdings (asset, qty, avg cost, price)
--   withdrawal_requests    investor-submitted payout requests (pending review)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  is_admin   boolean not null default false,
  balance    numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── investors ───────────────────────────────────────────────────────────────
create table public.investors (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid unique references auth.users(id) on delete set null,
  full_name      text not null,
  email          text,
  balance        numeric not null default 0,
  total_invested numeric not null default 0,
  total_profit   numeric not null default 0,
  status         text not null default 'active'
                 check (status in ('active', 'pending', 'inactive')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── investor_transactions ───────────────────────────────────────────────────
create table public.investor_transactions (
  id               uuid primary key default gen_random_uuid(),
  investor_id      uuid not null references public.investors(id) on delete cascade,
  transaction_type text not null
                       check (transaction_type in ('deposit', 'withdrawal', 'profit', 'loss')),
  amount           numeric not null check (amount >= 0),
  notes            text,
  created_at       timestamptz not null default now()
);
create index investor_transactions_investor_id_idx
  on public.investor_transactions (investor_id);
create index investor_transactions_created_at_idx
  on public.investor_transactions (created_at desc);

-- ── portfolio_positions ─────────────────────────────────────────────────────
create table public.portfolio_positions (
  id           uuid primary key default gen_random_uuid(),
  investor_id  uuid not null references public.investors(id) on delete cascade,
  asset        text not null,
  quantity     numeric not null default 0,
  average_cost numeric not null default 0,
  current_price numeric not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index portfolio_positions_investor_id_idx
  on public.portfolio_positions (investor_id);

-- ── withdrawal_requests ─────────────────────────────────────────────────────
create table public.withdrawal_requests (
  id             uuid primary key default gen_random_uuid(),
  investor_id    uuid not null references public.investors(id) on delete cascade,
  amount         numeric not null check (amount > 0),
  wallet_address text not null,
  status         text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  created_at     timestamptz not null default now()
);
create index withdrawal_requests_investor_id_idx
  on public.withdrawal_requests (investor_id);

-- ── keep updated_at fresh ───────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger investors_touch_updated_at
  before update on public.investors
  for each row execute function public.touch_updated_at();
create trigger portfolio_positions_touch_updated_at
  before update on public.portfolio_positions
  for each row execute function public.touch_updated_at();

-- ── auto-create profile + investor on signup ────────────────────────────────
-- requireAdmin() looks up profiles.is_admin for the logged-in user, and the
-- investor portal looks up investors by user_id, so both rows must exist for
-- a new user to do anything. The investor starts as 'pending' until an admin
-- funds or approves it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  )
  on conflict (id) do nothing;

  insert into public.investors (user_id, full_name, email, status)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    'pending'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── row level security ──────────────────────────────────────────────────────
alter table public.profiles              enable row level security;
alter table public.investors             enable row level security;
alter table public.investor_transactions enable row level security;
alter table public.portfolio_positions  enable row level security;
alter table public.withdrawal_requests   enable row level security;

-- Helper: true when the current JWT user is flagged as an admin.
-- SECURITY DEFINER so it can read profiles without recursing into RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_admin = true
  );
$$;

-- profiles: users see/edit their own; admins see/edit all
create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());
create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

-- investors: investors see their own row; admins manage all
create policy "Investors can view their own record"
  on public.investors for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
create policy "Admins can manage investors"
  on public.investors for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- investor_transactions: ownership flows through investors.user_id
create policy "Investors can view their own transactions"
  on public.investor_transactions for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.investors i
      where i.id = investor_transactions.investor_id
        and i.user_id = (select auth.uid())
    )
  );
create policy "Admins can manage transactions"
  on public.investor_transactions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- portfolio_positions: same ownership pattern
create policy "Investors can view their own positions"
  on public.portfolio_positions for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.investors i
      where i.id = portfolio_positions.investor_id
        and i.user_id = (select auth.uid())
    )
  );
create policy "Admins can manage positions"
  on public.portfolio_positions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- withdrawal_requests: investors file their own; admins review all
create policy "Investors can view their own withdrawal requests"
  on public.withdrawal_requests for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.investors i
      where i.id = withdrawal_requests.investor_id
        and i.user_id = (select auth.uid())
    )
  );
create policy "Investors can file withdrawal requests"
  on public.withdrawal_requests for insert to authenticated
  with check (
    exists (
      select 1 from public.investors i
      where i.id = withdrawal_requests.investor_id
        and i.user_id = (select auth.uid())
    )
  );
create policy "Admins can manage withdrawal requests"
  on public.withdrawal_requests for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- Post-apply checklist (run once in the SQL editor):
--   1. Sign up, then promote yourself:
--        update public.profiles set is_admin = true where email = 'you@x.com';
--   2. Backfill: create investors rows and link them via investors.user_id.
-- ============================================================================
