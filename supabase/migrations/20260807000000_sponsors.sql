-- Sponsors feature: table, RLS, public logo bucket.
-- Apply with `supabase db push` against a dev project first, or paste into
-- the SQL editor of the target project. Never run untested against prod.
-- Mirrors the model established in 20260718000000_articles.sql.

--
-- sponsors table
--
create table public.sponsors (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  website      text,
  shape        text not null default 'leaf' check (shape in ('leaf', 'circle')),
  logo_path    text,                     -- object key in the 'sponsors' storage bucket
  logo_fit     text not null default 'cover' check (logo_fit in ('cover', 'contain')),
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   text
);

create index sponsors_sort_order_idx on public.sponsors (sort_order);

-- Keep updated_at honest on every write.
create or replace function public.set_sponsors_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sponsors_set_updated_at
  before update on public.sponsors
  for each row
  execute function public.set_sponsors_updated_at();

--
-- Row Level Security
--
-- Auth is NextAuth (not Supabase Auth), so auth.uid() is always null here.
--   * reads:  anon/authenticated may select every sponsor (all are public)
--   * writes: no policies — every mutation goes through server actions using
--     the service role key (which bypasses RLS) after a committee-role check
alter table public.sponsors enable row level security;

create policy "Sponsors are readable by everyone"
  on public.sponsors
  for select
  to anon, authenticated
  using (true);

--
-- Public storage bucket for sponsor logos
--
-- Public because logos are meant to be seen: reads use a stable public URL
-- with no signing. Uploads still go through committee-gated signed upload
-- URLs minted with the service role key, so no storage.objects write policies
-- are needed (or wanted) here.
insert into storage.buckets (id, name, public)
values ('sponsors', 'sponsors', true)
on conflict (id) do nothing;
