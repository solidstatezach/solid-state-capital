-- Solid State Capital: initial database schema

create extension if not exists "pgcrypto";

-- Client profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Portfolios
create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Main Portfolio',
  base_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Current asset holdings
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  asset_symbol text not null,
  quantity numeric(30,12) not null default 0,
  average_cost numeric(30,12),
  current_price numeric(30,12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portfolio_id, asset_symbol)
);

-- Portfolio transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  asset_symbol text not null,
  transaction_type text not null
    check (transaction_type in ('buy', 'sell', 'deposit', 'withdrawal', 'fee', 'transfer')),
  quantity numeric(30,12),
  price numeric(30,12),
  amount_usd numeric(30,12),
  transaction_time timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

-- Historical portfolio values
create table public.performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  snapshot_date date not null,
  portfolio_value numeric(30,12) not null,
  profit_loss numeric(30,12),
  profit_loss_percent numeric(12,6),
  created_at timestamptz not null default now(),
  unique (portfolio_id, snapshot_date)
);

-- Indexes
create index portfolios_user_id_idx
  on public.portfolios(user_id);

create index holdings_portfolio_id_idx
  on public.holdings(portfolio_id);

create index transactions_portfolio_id_idx
  on public.transactions(portfolio_id);

create index performance_snapshots_portfolio_id_date_idx
  on public.performance_snapshots(portfolio_id, snapshot_date);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.performance_snapshots enable row level security;

-- Profiles: users can access only their own profile
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Portfolios: users can access only their own portfolios
create policy "Users can view their own portfolios"
  on public.portfolios
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Holdings: ownership comes through portfolio
create policy "Users can view their own holdings"
  on public.holdings
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.portfolios p
      where p.id = holdings.portfolio_id
        and p.user_id = (select auth.uid())
    )
  );

-- Transactions: ownership comes through portfolio
create policy "Users can view their own transactions"
  on public.transactions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.portfolios p
      where p.id = transactions.portfolio_id
        and p.user_id = (select auth.uid())
    )
  );

-- Performance: ownership comes through portfolio
create policy "Users can view their own performance"
  on public.performance_snapshots
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.portfolios p
      where p.id = performance_snapshots.portfolio_id
        and p.user_id = (select auth.uid())
    )
  );
