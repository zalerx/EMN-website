# Articles feature — decision log

(Handover summary is added at the top when the build finishes.)

---

## 2026-07-18 — Session strategy is `database`, so the role rides the `session` callback, not a JWT

The brief said to attach the member role "in the NextAuth `jwt` and `session` callbacks … cache it on the token." This repo's `authOptions` uses `session: { strategy: "database" }` with the Supabase adapter — the `jwt` callback never runs under database sessions, so there is no token to cache on. The existing `session` callback already looks up the member row by email on every session read; I added `role` to that select and attached it to `session.user.role`. Cost: no extra query (it piggybacks on the existing one). Alternative: switch to JWT sessions — rejected, that would change auth behaviour for the whole site in an unrelated PR.

## 2026-07-18 — `emn-green` token already existed; changed its value to the logo green `#6cbe45`

The brief assumed no `emn-green` token existed and asked for one standardised on `#6cbe45` (the logo value). The repo has since grown a full `emn` colour palette in `tailwind.config.ts` with `green: "#6ebf46"`, used site-wide via classes. The logo (`public/EMN-logo.svg`) really is `#6cbe45`. I changed the token value to `#6cbe45` and updated the mirror map in `app/components/button.tsx` (the only other place the hex appears). This visually shifts every existing `emn-green` usage by an imperceptible amount rather than leaving the site off-logo. Alternative: keep `#6ebf46` — rejected because the brief explicitly standardises on the logo value, and a one-line token change is not a page refactor.

## 2026-07-18 — Typography fix confirmed a real bug

`app/ui/fonts.ts` loaded Candu via `next/font/local` but the export was never applied anywhere; `.font-candu { font-family: 'Candu', … }` in `globals.css` referenced the literal family name, which `next/font` hashes. So every `font-candu` heading was falling back to system sans. Fixed with the CSS-variable pattern from the brief: `variable: "--font-candu"` / `--font-schibsted`, both variable classes on `<body>`, real `fontFamily` tokens in Tailwind (`candu`, `sans`), and the hand-rolled `.font-candu` rule plus the literal `'Schibsted Grotesk'` body rule removed from `globals.css`. Existing `font-candu` class usages need no edits — Tailwind now generates that same class name from the token.

## 2026-07-18 — File layout follows the repo's flat `app/lib` convention

The brief's suggested layout used `app/lib/supabase/{client,admin}.ts` and `app/lib/auth/require-committee.ts`. The repo already has a flat `app/lib` with an existing service-role client at `app/lib/supabase-server.ts` (used by NextAuth). Creating a second service-role client would be a hazard, so I kept `supabase-server.ts` as the one admin client and hardened it with `import "server-only"`, added `app/lib/supabase-client.ts` (anon), and `app/lib/require-committee.ts`. Same shape, repo-native paths.

## 2026-07-18 — Installed `server-only` in addition to the expected dependency list

The brief's expected installs: `@supabase/supabase-js` (already present), `react-markdown`, `remark-gfm`, `rehype-sanitize`, `gray-matter`, `@tailwindcss/typography` — all installed. One addition beyond the list: **`server-only`**, the standard package that makes `import "server-only"` a build-time error if the module ever lands in a client bundle. The brief requires that guard by name; the package is its implementation.

## 2026-07-18 — Storage bucket created in the migration, not by hand

The bucket is a plain `insert into storage.buckets … on conflict do nothing` in the migration, so dev/prod setup is one migration run instead of migration + dashboard clicking. No `storage.objects` RLS policies are added: the bucket is private, and both uploads (signed upload URLs) and downloads (signed URLs) are minted server-side with the service role, which never consults storage policies.

## 2026-07-18 — Search input sanitised before PostgREST `or()` interpolation

The index search uses `.or("title.ilike.%q%,summary.ilike.%q%")`. PostgREST's `or()` syntax is comma/paren-delimited, so raw user input could alter the filter. Input is stripped to letters/numbers/spaces/hyphens (Unicode-aware) before interpolation. Alternative: an RPC with bound parameters — heavier than warranted for a public search over already-public rows.

## 2026-07-18 — `updated_at` maintained by a trigger

Added `set_articles_updated_at` trigger rather than trusting every future code path to remember to set `updated_at`. Cheap, standard, and keeps the column meaningful for the admin table's ordering.
