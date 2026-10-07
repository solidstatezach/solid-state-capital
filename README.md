# Solid State Capital — White-Label Fund Portal Starter

A production-ready Next.js starter for running a private investment fund portal:
investors see their own portfolio through a polished dashboard, and fund
admins get a full back office — investor management, deposits/withdrawals,
transaction ledger, portfolio positions, and AUM reporting.

Built on **Next.js 16 + React 19 + Supabase (Postgres + Auth + Row-Level Security)
+ Tailwind CSS 4 + Recharts**.

---

## What's inside

**Investor portal**
- Dashboard — portfolio value, total invested, total profit, account status
- Portfolio view with allocation charts
- Transaction history and performance views
- Withdrawal request flow

**Admin back office**
- AUM dashboard with investor overview
- Investor management (add investors, view per-investor detail)
- Deposits, withdrawals, and withdrawal-request approval queue
- Transaction ledger (record deposits / withdrawals / profits / losses)
- Portfolio positions and trading views, plus a system page

**Security & data**
- Supabase email/password auth with an admin-role helper
- Row-level security on every table — investors can only ever see their own data
- Single migration (`supabase/migrations/20261006081500_fund_portal_schema.sql`)
  creates all 5 tables the app uses, with constraints and indexes
- Auto-profiles: a profile row is created on signup so the admin role system
  works out of the box

---

## Quick start (buyer gets running in ~15 minutes)

**Prerequisites:** Node 20+, a free [Supabase](https://supabase.com) project,
a [Vercel](https://vercel.com) account (or any Node host).

1. **Clone and install**
   ```bash
   git clone https://github.com/solidstatezach/solid-state-capital solid-state-capital
   cd solid-state-capital
   npm install
   ```
2. **Set up the database** — in your Supabase project, run
   `supabase/migrations/20261006081500_fund_portal_schema.sql` in the SQL editor
   (or `supabase db push` with the Supabase CLI). This creates all tables, RLS
   policies, and the signup trigger.
3. **Configure environment** — copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. **Run it**
   ```bash
   npm run dev   # http://localhost:3000
   ```
5. **Make yourself admin** — sign up through the app, then run this once in the
   SQL editor:
   ```sql
   update public.profiles set is_admin = true where email = 'you@example.com';
   ```

---

## Project structure

- `app/` — routes: `/` landing, `/login`, `/signup`, `/dashboard` & `/investor/*`
  (investor portal), `/admin/*` (back office)
- `app/api/` — server routes for admin operations (investors, deposits,
  withdrawals, transactions, stats) and the investor withdrawal endpoint
- `supabase/migrations/` — the full database schema with RLS
- `components/` (if present) — shared UI

## Tech details

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database/Auth:** Supabase Postgres + Supabase Auth (SSR via `@supabase/ssr`)
- **Styling:** Tailwind CSS v4 · **Icons:** lucide-react · **Charts:** Recharts
- **License posture:** all runtime dependencies are MIT/Apache-2.0 (verified
  2026-10-06). No GPL/AGPL or Commons-Clause dependencies.

## Deploying

Push to Vercel — it detects Next.js automatically. Set the same two
`NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project settings and redeploy.

---

## License

Sold under a commercial license — see `LICENSE` for the Personal and
Commercial (white-label) tiers.

## Disclaimer

This is a software template for educational and demonstration purposes. It is
not investment advice, and it does not move or custody real funds. If you run
a real fund, consult counsel about securities and money-transmission
regulations in your jurisdiction.
