# Solid State Capital — Architecture & Operations

Investor portfolio management platform: authenticated investor portal +
admin back office. Next.js 16 App Router, TypeScript, Supabase
(Postgres + Auth + RLS), Recharts, lucide-react. Deployed on Vercel
from GitHub (`solidstatezach/solid-state-capital`).

This is the **source project**. The white-label product
(`solidstatezach/investor-portal-starter`) is a separate repo; build here
first, mirror to the starter second. Never share Supabase projects,
env vars, or customer data between them.

## Environment variables (names only)

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | anon key (RLS enforced) |

No service-role key is used anywhere in the codebase. There is no
`.env.local` in this VM — `npm run build` fails here at page-data
collection for that reason; it builds on Vercel where vars are set.

## Database migrations (apply in order)

1. `20261006081500_fund_portal_schema.sql` — tables: profiles,
   investors, investor_transactions, portfolio_positions,
   withdrawal_requests; RLS policies; `is_admin()` helper;
   `handle_new_user()` trigger; `touch_updated_at()` triggers.
2. `20261007210000_atomic_withdrawal_approval.sql` —
   `resolve_withdrawal_request()` (atomic approve/reject).
3. `20261010120000_audit_log_trading.sql` — `audit_log` table,
   `portfolio_snapshots` table, `execute_trade()` function,
   `'trade'` added to `investor_transactions.transaction_type`.
4. `20261010130000_security_hardening.sql` — `is_admin()` enforced
   *inside* `resolve_withdrawal_request()` + audit rows on decisions;
   CHECK constraints on `portfolio_positions`
   (quantity/average_cost/current_price ≥ 0, non-blank asset).

Apply via Supabase dashboard SQL editor (this VM cannot reach Supabase
over Postgres TLS). Never edit an applied migration — add a new one.

## Auth & role model

- Supabase Auth (email/password). `proxy.ts` refreshes the session per
  request (Supabase SSR pattern).
- `auth.users` → `profiles` (is_admin flag) + `investors` (user_id,
  unique), both auto-created by the `handle_new_user()` trigger on
  signup. New investors start `pending`.
- Pages: `requireAdmin()` (`lib/supabase/admin.ts`) gates admin pages
  server-side; investor pages use `getCurrentInvestor()`
  (`auth.users.id → investors.user_id`) and redirect to `/login` when
  unauthenticated or unlinked.
- API routes rely on RLS policies (`is_admin()` or ownership via
  `investors.user_id`). Two SECURITY DEFINER functions enforce admin
  internally: `execute_trade()` and `resolve_withdrawal_request()`.
- Admin status comes only from `profiles.is_admin` (server-set). Never
  from user-editable metadata.

## Investor onboarding

1. User signs up (`/signup`) with name/email/password.
2. Trigger creates `profiles` row + `investors` row (`status=pending`).
3. Investor logs in, sees dashboard with zero balances.
4. Admin activates/funds via `/admin/investors/new` (link auth account
   by matching email, or create investor then have the user sign up —
   the trigger's `on conflict (user_id) do nothing` makes retries safe;
   `investors.user_id` is unique so duplicates are impossible).

## Portfolio calculations (`lib/portfolio.ts` — single source of truth)

- Position value = quantity × current_price
- Position cost basis = quantity × average_cost
- Unrealized P/L = value − cost
- Total account value = cash balance + Σ position values (cash once)
- `investors.balance` = cash. `investors.total_invested` = lifetime cash
  deposited. `investors.total_profit` = booked (realized) P/L from sells
  and manual profit/loss entries. None of these equals total equity.

## Trade processing

`POST /api/admin/trades` → `public.execute_trade()` — one atomic
transaction: locks investor row, validates side/qty/price, checks cash
(buy) or position qty (sell), updates balance + `total_profit`,
upserts/deletes the position (weighted average cost on buy), writes a
`'trade'` ledger row (positive amount, side in notes like
`[BUY 0.5 BTC @ 65000]`), writes an `audit_log` row. Returns
`{success, realized_pnl, tx_id}`.

## Deposits & withdrawals

- Deposits: admin records via `/admin/deposits/new` →
  `POST /api/admin/deposits` (ledger + balance update, audited).
- Withdrawals: investor files a request (`/investor/withdraw` →
  `POST /api/withdraw`, status `pending`). Admin approves/rejects at
  `/admin/withdrawals/new` → `POST /api/admin/withdrawal-requests` →
  `resolve_withdrawal_request()` (atomic: row locks, ledger, debit,
  status change, audit). Re-approving a decided request fails cleanly.

## Audit logging

`audit_log` is append-only: RLS allows admin SELECT/INSERT only, no
UPDATE/DELETE. `lib/supabase/audit.ts` → `logAudit()` is best-effort
(never throws). Trades and withdrawal decisions log inside their DB
functions (atomic); position and transaction mutations log at the route
level.

## Performance history

`portfolio_snapshots`: one row per investor per day (unique index on
`(investor_id, created_at::date)`). `POST /api/admin/snapshots`
records today's snapshot for all investors (idempotent). Charts render
only recorded snapshots — never fabricated or backfilled.

## Local development & testing

```bash
npm run dev              # next dev --webpack (Turbopack has ARM issues)
npx tsc --noEmit         # type check
npm run test:accounting  # 35 accounting tests (lib/portfolio.ts + trade math model)
npm run build            # needs Supabase env vars (fails in this VM)
```

No unit-test framework is configured; `test:accounting` is a standalone
Node script. There are no e2e tests. DB-backed tests require a
dev Supabase project (unavailable from this VM).

## Deployment

Push to `main` → Vercel builds and deploys. Before pushing: `npx tsc
--noEmit`, `npm run test:accounting`, review the diff, check for
secrets. Apply new migrations in the Supabase dashboard SQL editor
*before* deploying code that depends on them. Never force-push.

## Known limitations

- This VM cannot complete Postgres TLS to Supabase: migrations are
  reviewed locally and applied by hand; no live DB verification from here.
- `npm run build` fails in this VM (missing env vars) — pre-existing.
- No automated e2e tests; critical journeys verified by code inspection.
- Deposits/transactions routes do read-modify-write on balances without
  row locks (lost-update race under concurrent admins) — same bug class
  as the fixed withdrawal race; candidates for a future atomic function.
- Market data (CoinGecko ticker) is decorative and fails silent.
