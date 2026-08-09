import "server-only";
import { getSupabaseAnon } from "@/app/lib/supabase-client";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import { isPastEvent } from "@/app/lib/events/format";
import type { EventPhoto, EventRecord } from "@/types/event";

// Public reads use the anon key so RLS (published-only) stays in the loop even
// if a query here is ever written too loosely.

export async function listPublishedEvents(): Promise<EventRecord[]> {
  const { data, error } = await getSupabaseAnon()
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("starts_at", { ascending: true, nullsFirst: false });
  if (error) throw new Error(`Failed to list events: ${error.message}`);
  return (data ?? []) as EventRecord[];
}

export async function getPublishedEventBySlug(
  slug: string
): Promise<EventRecord | null> {
  const { data, error } = await getSupabaseAnon()
    .from("events")
    .select("*")
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load event: ${error.message}`);
  return (data as EventRecord | null) ?? null;
}

export async function listEventPhotos(eventId: string): Promise<EventPhoto[]> {
  const { data, error } = await getSupabaseAnon()
    .from("event_photos")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to load photos: ${error.message}`);
  return (data ?? []) as EventPhoto[];
}

//
// Committee-only reads. These use the service-role client, so callers must
// have already passed a committee check (getCommitteeSession/requireCommittee).
// Used by the admin manager and by hidden-event previews.
//
export async function listAllEvents(): Promise<EventRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true, nullsFirst: false });
  if (error) throw new Error(`Failed to list events: ${error.message}`);
  return (data ?? []) as EventRecord[];
}

export async function getEventAnyStatusBySlug(
  slug: string
): Promise<EventRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load event: ${error.message}`);
  return (data as EventRecord | null) ?? null;
}

export async function listAllEventSlugs(): Promise<string[]> {
  const { data, error } = await supabaseAdmin.from("events").select("slug");
  if (error) throw new Error(`Failed to load slugs: ${error.message}`);
  return ((data ?? []) as { slug: string }[]).map((r) => r.slug);
}

//
// Partition for the list page: which event is the hero "headline", and the
// ordered grid of everything else. Featured wins; otherwise the soonest
// upcoming event (or, failing that, the most recent past one) is the headline.
//
export interface SplitEvents {
  featured: EventRecord | null;
  grid: EventRecord[];
}

export function splitEvents(events: EventRecord[]): SplitEvents {
  const now = Date.now();
  const upcomingSoonest = [...events]
    .filter((e) => !isPastEvent(e, now))
    .sort(byStart(true));
  const pastRecent = [...events]
    .filter((e) => isPastEvent(e, now))
    .sort(byStart(false));

  const featured =
    events.find((e) => e.featured) ??
    upcomingSoonest[0] ??
    pastRecent[0] ??
    null;

  // Grid = upcoming (soonest first) then past (most recent first), minus the
  // headline so it is never shown twice.
  const grid = [...upcomingSoonest, ...pastRecent].filter(
    (e) => e.id !== featured?.id
  );

  return { featured, grid };
}

// Sort by start date; ascending = soonest first (upcoming), descending = most
// recent first (past). Undated events sort last either way.
function byStart(ascending: boolean) {
  return (a: EventRecord, b: EventRecord) => {
    const ta = a.starts_at ? new Date(a.starts_at).getTime() : null;
    const tb = b.starts_at ? new Date(b.starts_at).getTime() : null;
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return ascending ? ta - tb : tb - ta;
  };
}
