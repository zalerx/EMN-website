-- Articles feature: table, RLS, committee roles, storage bucket.
-- Apply with `supabase db push` against a dev project first, or paste into
-- the SQL editor of the target project. Never run untested against prod.

--
-- articles table
--
create table public.articles (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  subtitle       text,
  author         text not null,
  summary        text,
  tags           text[] not null default '{}',
  cover_path     text,
  source_type    text not null check (source_type in ('markdown', 'pdf')),
  storage_path   text,          -- object key in the 'articles' storage bucket
  content_md     text,          -- markdown body; null for PDF articles
  reading_minutes integer,
  status         text not null default 'draft' check (status in ('draft', 'published')),
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     text
);

create index articles_status_published_at_idx
  on public.articles (status, published_at desc);

-- Keep updated_at honest on every write.
create or replace function public.set_articles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger articles_set_updated_at
  before update on public.articles
  for each row
  execute function public.set_articles_updated_at();

--
-- Row Level Security
--
-- Auth is NextAuth (not Supabase Auth), so there is no Supabase JWT and
-- auth.uid() is always null here. The model is therefore:
--   * reads:  anon/authenticated may select published rows only
--   * writes: no policies at all — every mutation goes through server
--     actions using the service role key (which bypasses RLS) after a
--     server-side committee-role check
alter table public.articles enable row level security;

create policy "Published articles are readable by everyone"
  on public.articles
  for select
  to anon, authenticated
  using (status = 'published');

--
-- Committee roles on the existing members table
--
alter table public.members
  add column if not exists role text not null default 'member'
  check (role in ('member', 'committee', 'admin'));

--
-- Private storage bucket for article files (markdown originals, PDFs, covers)
--
-- The bucket is private: downloads go through short-lived signed URLs
-- generated server-side, and uploads go through signed upload URLs created
-- by a committee-gated server action. Both are minted with the service role
-- key, so no storage.objects policies are needed (or wanted) here.
insert into storage.buckets (id, name, public)
values ('articles', 'articles', false)
on conflict (id) do nothing;
