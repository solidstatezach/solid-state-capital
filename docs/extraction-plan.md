# Extraction Plan — Investor Portal Starter

How to separate the reusable white-label product
(`solidstatezach/investor-portal-starter`) from Solid State Capital
*after* the production application is stable. The starter already exists
as a separate private repo; this plan governs what moves across and how.

## Principles

1. **Source of truth**: Solid State Capital. Build and validate here
   first; mirror to the starter only when stable.
2. **No production bleed**: no customer rows, balances, transactions,
   secrets, env vars, or Supabase project references ever cross over.
3. **Branding is configuration**: the starter must not contain
   "Solid State Capital" strings, logos, or copy. Generic
   "Investor Portal" naming only.
4. **Migrations travel; data doesn't**: SQL migrations are mirrored
   verbatim; seed data is synthetic and clearly fictional.

## What mirrors (mechanical copy)

These are brand-neutral and copy cleanly today:

- `supabase/migrations/*` — all four migrations verbatim.
- `lib/` — all modules (`portfolio.ts`, `supabase/*`, `audit.ts`).
- `app/api/**` — all routes verbatim.
- `app/admin/**`, `app/investor/**`, `app/dashboard/**` — pages and
  components, after a branding pass (below).
- `components/**` — shared UI, after a branding pass.
- `scripts/test-accounting.mjs` and the `test:accounting` npm script.

## Branding pass (required per mirror)

Search the mirrored tree for brand strings before committing:

```bash
grep -ri "solid state capital\|solid-state-capital\|SSC" \
  app/ components/ lib/ --include="*.tsx" --include="*.ts" \
  | grep -v node_modules
```

Replace with the starter's generic naming. Check also: `package.json`
`name`, `README.md`, `LICENSE` holder, favicon/title in
`app/layout.tsx`, and any email copy.

## What does NOT mirror

- `.env.local` / any env files or secret values.
- `supabase/config.toml` project refs pointing at the production project
  (if ever added).
- Any database dump, CSV export, or screenshot containing real investor
  data.
- Vercel project links / deployment IDs for the production site.

## Starter-specific requirements (not in the source)

1. `supabase/seed.sql` with fictional demo investors (already present —
   keep it synthetic and regenerable).
2. `README.md`: setup checklist — create Supabase project, run
   migrations in order, set the two `NEXT_PUBLIC_*` vars, create the
   first admin by flipping `profiles.is_admin` in the dashboard,
   deploy to Vercel.
3. First-run guard: the starter README must warn that connecting it to
   the production Supabase project would mix customer data — use a
   fresh project per deployment.
4. Keep the demo seed out of production migrations (seed lives only in
   the starter repo, never in `supabase/migrations/`).

## Mirror procedure

1. In Solid State Capital: `npx tsc --noEmit`, `npm run test:accounting`,
   review diff.
2. Copy changed brand-neutral files to the starter (see list above).
3. Run the branding grep; fix hits.
4. In the starter: `npx tsc --noEmit`, `npm run test:accounting`.
5. Commit each repo separately with a message naming the mirrored change.
6. Push starter only after its own checks pass.

## Current status (2026-10-10)

The starter mirrors everything through the MVP pass, including the new
migrations, trade entry, snapshots, audit log, and docs. Both repos
type-check clean. The starter's Gumroad listing sells this codebase.
