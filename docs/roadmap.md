# Roadmap

## Done (2026-10-10 MVP pass)

- [x] Positions CRUD: create/update/delete with audit rows.
- [x] Atomic trade entry (`execute_trade()`): weighted avg cost, realized
      P/L, ledger + audit in one transaction.
- [x] Withdrawal request workflow with atomic approve/reject
      (`resolve_withdrawal_request()`), self-approval blocked by an
      internal `is_admin()` guard.
- [x] Append-only audit log wired into positions, trades, transactions,
      deposits, snapshots, withdrawal decisions.
- [x] Real performance history: daily snapshots, honest empty states,
      no fabricated charts (fake AUM data removed).
- [x] Consistent valuation math (`lib/portfolio.ts`) on every page;
      misleading labels fixed (AUM, Total Profit → Unrealized P/L, etc.).
- [x] Investor isolation verified (user-bound queries + RLS); login
      redirects; withdraw feedback + request history.
- [x] Admin mobile nav; table overflow fixes; dead code removed.
- [x] 35 accounting tests (`npm run test:accounting`).
- [x] Docs: architecture README, component inventory, extraction plan.

## Next (ordered)

1. **Apply migrations 3 & 4 to live Supabase** (dashboard SQL editor)
   and push both repos — the code depends on the new tables/functions.
2. **Smoke test on the Vercel deployment**: login, investor isolation,
   admin trade, withdrawal approve/reject, snapshot record.
3. **Atomic deposits/transactions**: move the read-modify-write balance
   updates into a DB function (same race class as the fixed withdrawal
   bug) — `record_ledger_entry()` covering deposit/withdrawal/profit/loss.
4. **Duplicate-submission protection**: idempotency keys on trade and
   withdrawal-request endpoints (double-click safety beyond the atomic
   functions).
5. **E2E tests** against a dev Supabase project (Playwright/Cypress):
   signup → fund → trade → withdraw → approve journeys.
6. **Investor deposit requests**: mirror the withdrawal request flow so
   investors can request deposits instead of relying on admin entry.
7. **Rate limiting** on `/api/withdraw` (no duplicate/rapid submissions).
8. **Notifications**: email/webhook on withdrawal request filed and
   decided.
9. **Paginate admin tables** (transactions, investors) — currently
   unbounded selects.
10. **Legal review** of the dual-tier LICENSE placeholders before
    heavier distribution.

## Explicitly out of scope

Full brokerage/exchange/custody, automated real-money trading, price
oracles wired into valuation (prices are admin-entered), KYC/AML tooling.
