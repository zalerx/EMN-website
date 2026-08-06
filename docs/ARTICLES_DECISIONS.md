# Articles feature — decision log

## Handover (written 2026-07-19, end of unattended session)

**What got finished.** All four phases, each as one commit on `feat/articles`:

1. `articles phase 1` — typography/CSS-variable fix, `emn-green` standardisation, migration, types, Supabase clients, `require-committee`, session role, `.env.example`
2. `articles phase 2` — `/articles` index (search/tags/pagination), `/articles/[slug]` reader (markdown + PDF, draft preview, prev/next), loading/error/not-found, fixtures
3. `articles phase 3` — server actions, admin dashboard, drag-and-drop signed-URL upload with progress, admin table (publish/edit/delete)
4. `articles phase 4` — Header/Footer nav, `docs/ARTICLES.md`, this handover

`npm run build` and `npm run lint` both pass clean (build log note: one transient "socket hang up" during compilation that Next auto-retried; not related to this code). Nothing was left broken. Two pre-existing uncommitted items were on `main` before this session and were deliberately left out of every commit: a modified `app/about/page.tsx` and an untracked file named `".nvmrc 2"` (looks like a Finder duplicate — probably safe to delete, but that's your call).

**What needs a human before merge:**

- Run `supabase/migrations/20260718000000_articles.sql` on the dev project, verify, then on prod (creates table + RLS + `members.role` + private bucket).
- Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel — the only new env var; public reads fail without it.
- Set the first committee member: `update public.members set role = 'admin' where email = '…';`
- Optionally seed dev with `supabase/fixtures/` (upload the two files to the bucket first — paths are in the seed SQL's header comment).
- Visual QA: the font fix means Candu now *actually renders* for the first time — every heading on the site will look different from what's deployed. That's the bug being fixed, but eyeball it.

**What to review first (least-certain judgement calls):**

1. `app/components/articles/upload-form.tsx` — the raw XHR PUT to the signed upload URL (see the 2026-07-19 decision entry; one-line fallback documented there).
2. `tailwind.config.ts` — `emn-green` value change to `#6cbe45` shifts existing pages' green by a hair; revert to `#6ebf46` if the club prefers the deployed colour over the logo colour.
3. `app/articles/[slug]/page.tsx` — the conditional-session ISR/draft-preview interplay.

**What's untested (no live Supabase credentials were used):**

- The entire upload path against real Storage (signed URL PUT, bucket behaviour, 25 MB boundary).
- RLS behaviour of the new policies; the `members.role` alter against the real table shape.
- Magic-link sign-in with the modified session callback (code path unchanged except one extra selected column, but still).
- Signed-URL expiry vs ISR in production traffic.

**Anything blocked:** nothing. No permission denial occurred during the session; deny rules (`.env.local` reads, `supabase db push/link`, `vercel`) were configured and never contested.

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

## 2026-07-19 — Upload uses raw XHR PUT to the signed URL, not `uploadToSignedUrl`

The brief specifies `uploadToSignedUrl(path, token, file)` and also demands "real upload progress". Those conflict: supabase-js uses fetch, which has no upload-progress events. The form instead does an `XMLHttpRequest` PUT of the raw file body (with `Content-Type`) straight to the `signedUrl` returned by `createSignedUploadUrl` — the same endpoint `uploadToSignedUrl` targets, and the pattern Supabase's own docs show with curl. Consequence: no browser Supabase client is needed at all; `app/lib/supabase-client.ts` remains as the lazy anon client used by server-side public reads. **Untested against live storage** — if the binary PUT is rejected, swap the `putWithProgress` call for `getSupabaseAnon().storage.from("articles").uploadToSignedUrl(...)` and lose granular progress.

## 2026-07-19 — Frontmatter parsed server-side via an `extractFrontmatter` action

The brief has the client parse frontmatter to prefill the form, but `gray-matter` drags Buffer/js-yaml into the client bundle and Next no longer polyfills Buffer. Prefill instead calls a small committee-gated server action with the file text; `createArticle` re-parses the raw text itself (never trusting client-supplied metadata to match the file) and stores the frontmatter-stripped body in `content_md`.

## 2026-07-19 — Draft preview stays on the public slug without breaking ISR

`/articles/[slug]` only calls `getServerSession` when the published lookup misses. Published pages therefore never touch cookies and stay ISR-cacheable; unknown/draft slugs render dynamically per request, which is what a preview wants. Verified reasoning, not verified behaviour — flagged in "untested".

## 2026-07-19 — Deletion removes storage objects best-effort, before the row

`deleteArticle` removes `storage_path`/`cover_path` objects first and logs (but does not abort on) storage failures: an orphaned file is invisible and recoverable, an article row pointing at a deleted file renders a broken page. No soft delete — the confirmation step in the table is the guard; committee can re-upload.

## 2026-07-19 — Slug freeze rule

Slug is editable while `status = 'draft'` AND the article has never been published (`published_at` null). Once published (even if later unpublished), the slug is frozen server-side in `updateArticle` — shared URLs must not break. Unpublish keeps the original `published_at` so republishing doesn't reshuffle ordering.
