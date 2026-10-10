# Component Inventory

## Pages

### Public / auth
| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Renders login; redirects to `/dashboard` if logged in |
| `/login` | `app/login/page.tsx` | Supabase password login |
| `/signup` | `app/signup/page.tsx` | Sign-up, trigger creates profile + investor |
| `/logout` | `app/logout/page.tsx` | Sign-out |

### Investor (all require auth; redirect `/login` otherwise)
| Route | File | Notes |
|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Total value, cost basis, unrealized P/L, real snapshot chart, allocation, recent txns |
| `/investor` | `app/investor/page.tsx` | Summary cards (total value, realized return, cash, positions) |
| `/investor/portfolio` | `app/investor/portfolio/page.tsx` | Positions table |
| `/investor/transactions` | `app/investor/transactions/page.tsx` | Ledger history |
| `/investor/withdraw` | `app/investor/withdraw/page.tsx` | Withdrawal form + request history + feedback states |
| `/investor/performance` | `app/investor/performance/page.tsx` | Real valuation + snapshot history chart |

### Admin (all `requireAdmin()`)
| Route | File | Notes |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | Real AUM, counts, snapshot chart, allocation, recent activity |
| `/admin/investors` | `app/admin/investors/page.tsx` | Investor list |
| `/admin/investors/new` | `app/admin/investors/new/page.tsx` + `NewInvestorForm.tsx` | Server wrapper gates admin; client form |
| `/admin/investors/[id]` | `app/admin/investors/[id]/page.tsx` | Read-only investor detail |
| `/admin/deposits/new` | `app/admin/deposits/new/` | Record deposit form |
| `/admin/withdrawals/new` | `app/admin/withdrawals/new/page.tsx` + `client.tsx` | Approval queue (approve/reject) |
| `/admin/portfolios` | `app/admin/portfolios/page.tsx` | Positions table |
| `/admin/portfolios/new` | `app/admin/portfolios/new/` | Add position form |
| `/admin/trading` | `app/admin/trading/page.tsx` + `TradeEntryForm.tsx` + `PositionsTable.tsx` | Trade entry + position edit/delete |
| `/admin/transactions` | `app/admin/transactions/page.tsx` | Full ledger |
| `/admin/transactions/new` | `app/admin/transactions/new/` | Manual ledger entry |
| `/admin/performance` | `app/admin/performance/page.tsx` + `SnapshotChart.tsx` + `RecordSnapshotButton.tsx` | Real valuation + history |
| `/admin/system` | `app/admin/system/page.tsx` | Placeholder ("coming soon") |

## API routes

| Route | Methods | Notes |
|---|---|---|
| `/api/admin/deposits` | POST | Ledger + balance update, audited (RLS-gated) |
| `/api/admin/investors` | GET | Investor list (RLS-gated) |
| `/api/admin/investors/[id]/transactions` | GET | Per-investor ledger (RLS-gated) |
| `/api/admin/portfolios` | GET/POST | List / create position, audited |
| `/api/admin/portfolios/[id]` | PUT/DELETE | Update / delete position, audited |
| `/api/admin/snapshots` | GET/POST | History / record today's snapshots, audited |
| `/api/admin/stats` | GET | Dashboard counts |
| `/api/admin/trades` | POST | → `execute_trade()` RPC (self-authorizing, atomic) |
| `/api/admin/transactions` | GET/POST | Ledger list / manual entry, audited |
| `/api/admin/withdrawal-requests` | GET/POST | List / approve-reject via `resolve_withdrawal_request()` (explicit 403 + atomic fn) |
| `/api/withdraw` | POST | Investor files withdrawal request (user-bound) |

## Shared components

| Component | Notes |
|---|---|
| `components/admin/StatCard.tsx` | Metric card |
| `components/admin/AUMChart.tsx` | Prop-driven area chart (real data only) |
| `components/admin/AllocationChart.tsx` | Prop-driven pie |
| `components/admin/AdminSidebar.tsx` | Desktop nav |
| `components/admin/AdminMobileNav.tsx` | Mobile nav (`<lg`) |
| `components/investor/Nav.tsx` | Investor nav |
| `components/investor/MarketTicker.tsx` | CoinGecko ticker, fails silent |
| `components/investor/AllocationChart.tsx` | Investor pie |

## Lib

| Module | Notes |
|---|---|
| `lib/supabase/server.ts` | Per-request SSR client |
| `lib/supabase/client.ts` | Browser client |
| `lib/supabase/proxy.ts` | Session refresh |
| `lib/supabase/admin.ts` | `requireAdmin()` |
| `lib/supabase/currentInvestor.ts` | `getCurrentInvestor()` |
| `lib/supabase/audit.ts` | `logAudit()` (best-effort) |
| `lib/portfolio.ts` | Valuation math — single source of truth |

## Migrations

| File | Contents |
|---|---|
| `20261006081500_fund_portal_schema.sql` | Core tables, RLS, `is_admin()`, `handle_new_user()` |
| `20261007210000_atomic_withdrawal_approval.sql` | `resolve_withdrawal_request()` v1 |
| `20261010120000_audit_log_trading.sql` | `audit_log`, `portfolio_snapshots`, `execute_trade()`, `'trade'` type |
| `20261010130000_security_hardening.sql` | Admin guard inside `resolve_withdrawal_request()` + audit; position CHECKs |

## Scripts

| Script | Notes |
|---|---|
| `npm run dev` | `next dev --webpack` |
| `npm run build` | `next build --webpack` (needs env vars) |
| `npx tsc --noEmit` | Type check |
| `npm run test:accounting` | 35 accounting tests |
| `scripts/test-accounting.mjs` | Test implementation |
