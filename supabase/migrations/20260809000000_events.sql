-- Events feature: tables, RLS, public 'events' storage bucket.
-- Apply with `supabase db push` against a dev project first, or paste into
-- the SQL editor of the target project. Never run untested against prod.
-- Mirrors the model established in 20260807000000_sponsors.sql and
-- 20260718000000_articles.sql.

--
-- events table
--
-- Events come from two sources:
--   * 'eventbrite' — auto-imported by the scheduled sync (app/api/events/sync).
--     The import is insert-only: it dedupes on eventbrite_id and NEVER updates
--     an existing row, so committee edits after import are permanent.
--   * 'manual'     — created by a committee member in the UI.
create table public.events (
  id             uuid primary key default gen_random_uuid(),
  eventbrite_id  text unique,              -- set for imported events; the sync dedup key
  source         text not null default 'manual' check (source in ('eventbrite', 'manual')),
  slug           text not null unique,
  title          text not null,
  summary        text,                     -- short lede shown on cards / hero
  description    text,                     -- long body on the detail page
  category       text not null default 'social'
                 check (category in ('social', 'professional', 'educational')),
  starts_at      timestamptz,
  ends_at        timestamptz,
  timezone       text,                     -- IANA tz (e.g. 'Australia/Melbourne') for display
  venue_name     text,
  venue_address  text,
  is_online      boolean not null default false,
  cover_path     text,                     -- object key in the 'events' storage bucket
  rsvp_url       text,                     -- Eventbrite public URL / external sign-up
  capacity       integer,
  is_free        boolean,
  featured       boolean not null default false,   -- drives the single headline slot
  is_published   boolean not null default true,    -- committee hide/show
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     text
);

create index events_starts_at_idx on public.events (starts_at desc);
create index events_published_starts_idx on public.events (is_published, starts_at desc);

-- Keep updated_at honest on every write.
create or replace function public.set_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on public.events
  for each row
  execute function public.set_events_updated_at();

--
-- event_photos table (gallery images shown on a past event's detail page)
--
create table public.event_photos (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  storage_path  text not null,            -- object key in 'events' bucket (gallery/{event_id}/…)
  caption       text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  created_by    text
);

create index event_photos_event_idx on public.event_photos (event_id, sort_order);

--
-- Row Level Security
--
-- Auth is NextAuth (not Supabase Auth), so auth.uid() is always null here.
--   * reads:  anon/authenticated may select published events, and photos that
--             belong to a published event
--   * writes: no policies — every mutation goes through server actions using
--     the service role key (which bypasses RLS) after a committee-role check
alter table public.events enable row level security;
alter table public.event_photos enable row level security;

create policy "Published events are readable by everyone"
  on public.events
  for select
  to anon, authenticated
  using (is_published = true);

create policy "Photos of published events are readable by everyone"
  on public.event_photos
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_photos.event_id and e.is_published
    )
  );

--
-- Public storage bucket for event covers and gallery photos
--
-- Public because these images are meant to be seen: reads use a stable public
-- URL with no signing. Uploads still go through committee-gated signed upload
-- URLs minted with the service role key, so no storage.objects write policies
-- are needed (or wanted) here.
insert into storage.buckets (id, name, public)
values ('events', 'events', true)
on conflict (id) do nothing;
