import "server-only";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import {
  fetchOrganizationEvents,
  type EventbriteEvent,
} from "@/app/lib/events/eventbrite";
import { listAllEventSlugs } from "@/app/lib/events/queries";
import { makeUniqueSlug, slugify } from "@/app/lib/articles/slug";

export interface ImportResult {
  created: number;
  skipped: number;
  createdSlugs: string[];
}

// Insert-only import: brand-new Eventbrite events are added; anything already
// in the DB (matched on eventbrite_id) is skipped and never overwritten, so
// committee edits after import are permanent. Called by the scheduled sync
// route (app/api/events/sync).
export async function importNewEventbriteEvents(): Promise<ImportResult> {
  const remote = await fetchOrganizationEvents();

  // Which Eventbrite events do we already have?
  const { data: existingRows, error: existingErr } = await supabaseAdmin
    .from("events")
    .select("eventbrite_id")
    .not("eventbrite_id", "is", null);
  if (existingErr) {
    throw new Error(`Failed to read existing events: ${existingErr.message}`);
  }
  const existing = new Set(
    ((existingRows ?? []) as { eventbrite_id: string }[]).map(
      (r) => r.eventbrite_id
    )
  );

  const fresh = remote.filter((e) => !existing.has(e.eventbriteId));
  const skipped = remote.length - fresh.length;
  if (fresh.length === 0) {
    return { created: 0, skipped, createdSlugs: [] };
  }

  // Track slugs locally so uniqueness holds within this batch too.
  const takenSlugs = await listAllEventSlugs();
  const createdSlugs: string[] = [];
  let created = 0;

  for (const ev of fresh) {
    const slug = makeUniqueSlug(slugify(ev.title) || "event", takenSlugs);
    takenSlugs.push(slug);

    const cover_path = await importCover(ev, slug);

    const { error } = await supabaseAdmin.from("events").insert({
      eventbrite_id: ev.eventbriteId,
      source: "eventbrite",
      slug,
      title: ev.title,
      summary: ev.summary,
      description: ev.description,
      category: "social", // EMN taxonomy is local; committee reclassifies
      starts_at: ev.startsAt,
      ends_at: ev.endsAt,
      timezone: ev.timezone,
      venue_name: ev.venueName,
      venue_address: ev.venueAddress,
      is_online: ev.isOnline,
      cover_path,
      rsvp_url: ev.rsvpUrl,
      capacity: ev.capacity,
      is_free: ev.isFree,
      is_published: true,
      created_by: "eventbrite-sync",
    });
    if (error) {
      // Don't abort the whole batch for one bad row; log and carry on.
      console.error(
        `[events] import failed for "${ev.title}" (${ev.eventbriteId}): ${error.message}`
      );
      continue;
    }
    created++;
    createdSlugs.push(slug);
  }

  if (created > 0) revalidatePath("/events");
  return { created, skipped, createdSlugs };
}

// Download the Eventbrite cover into our own public bucket so imagery is
// first-party and stable. Best-effort: a failed cover never blocks the import.
async function importCover(
  ev: EventbriteEvent,
  slug: string
): Promise<string | null> {
  if (!ev.coverUrl) return null;
  try {
    const res = await fetch(ev.coverUrl, { cache: "no-store" });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";
    const bytes = new Uint8Array(await res.arrayBuffer());
    const path = `covers/${Date.now()}-${slug}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from("events")
      .upload(path, bytes, { contentType, upsert: true });
    if (error) {
      console.error(
        `[events] cover upload failed for ${slug}: ${error.message}`
      );
      return null;
    }
    return path;
  } catch (e) {
    console.error(`[events] cover download failed for ${slug}:`, e);
    return null;
  }
}
