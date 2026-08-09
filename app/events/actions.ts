"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import { requireCommittee } from "@/app/lib/require-committee";
import { listAllEventSlugs } from "@/app/lib/events/queries";
import { makeUniqueSlug, slugify } from "@/app/lib/articles/slug";
import type { EventCategory, EventInput } from "@/types/event";

// Uniform result shape so client components can branch without try/catch.
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const IMAGE_TYPES: Record<string, true> = {
  "image/png": true,
  "image/jpeg": true,
  "image/webp": true,
};

const CATEGORIES: Record<EventCategory, true> = {
  social: true,
  professional: true,
  educational: true,
};

function fail(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

function safeName(filename: string): string {
  return (
    filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image"
  );
}

function normaliseCategory(category: EventCategory): EventCategory {
  return CATEGORIES[category] ? category : "social";
}

// The DB-ready column set from committee form input. Slug and cover_path are
// handled separately by the create/update callers.
function cleanInput(input: EventInput) {
  return {
    title: input.title.trim(),
    summary: input.summary?.trim() || null,
    description: input.description?.trim() || null,
    category: normaliseCategory(input.category),
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    timezone: input.timezone?.trim() || null,
    venue_name: input.venue_name?.trim() || null,
    venue_address: input.venue_address?.trim() || null,
    is_online: Boolean(input.is_online),
    rsvp_url: input.rsvp_url?.trim() || null,
    capacity:
      typeof input.capacity === "number" && !Number.isNaN(input.capacity)
        ? input.capacity
        : null,
    is_free: typeof input.is_free === "boolean" ? input.is_free : null,
    featured: Boolean(input.featured),
    is_published: input.is_published ?? true,
  };
}

// Keep the headline slot singular: only one event may be featured at a time.
async function unfeatureOthers(keepId: string): Promise<string | null> {
  const { error } = await supabaseAdmin
    .from("events")
    .update({ featured: false })
    .neq("id", keepId)
    .eq("featured", true);
  return error ? error.message : null;
}

// Revalidate the list plus a specific event's detail page (looked up by id).
async function revalidateEvent(id: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from("events")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  revalidatePath("/events");
  const slug = (data as { slug: string } | null)?.slug;
  if (slug) revalidatePath(`/events/${slug}`);
}

//
// Mint a signed upload URL so the image goes straight from the browser to
// Supabase Storage. Vercel functions cap request bodies around 4.5 MB, so the
// bytes must never route through the app server (mirrors the sponsors/articles
// upload pipeline). `kind` decides the folder; gallery photos are grouped by
// event id for tidy cleanup.
//
export async function createSignedEventImageUploadUrl(
  kind: "cover" | "gallery",
  filename: string,
  contentType: string,
  eventId?: string
): Promise<ActionResult<{ path: string; signedUrl: string; token: string }>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to upload images.");
  }

  if (!IMAGE_TYPES[contentType]) {
    return fail("Images must be a PNG, JPEG or WebP file.");
  }

  const name = `${Date.now()}-${safeName(filename)}`;
  const path =
    kind === "gallery"
      ? `gallery/${eventId ?? "misc"}/${name}`
      : `covers/${name}`;

  const { data, error } = await supabaseAdmin.storage
    .from("events")
    .createSignedUploadUrl(path);
  if (error || !data) {
    return fail(
      `Could not create an upload URL: ${error?.message ?? "unknown error"}`
    );
  }
  return {
    ok: true,
    data: { path: data.path, signedUrl: data.signedUrl, token: data.token },
  };
}

export async function createEvent(
  input: EventInput
): Promise<ActionResult<{ slug: string }>> {
  let email: string;
  try {
    const session = await requireCommittee();
    email = session.user.email!;
  } catch {
    return fail("You need committee access to add events.");
  }

  const clean = cleanInput(input);
  if (!clean.title) return fail("Event title is required.");

  const base = slugify(input.slug || clean.title) || "event";
  const slug = makeUniqueSlug(base, await listAllEventSlugs());

  const { data, error } = await supabaseAdmin
    .from("events")
    .insert({ source: "manual", slug, ...clean, cover_path: input.cover_path ?? null, created_by: email })
    .select("id")
    .maybeSingle();
  if (error) return fail(`Could not save the event: ${error.message}`);

  if (clean.featured && data) await unfeatureOthers((data as { id: string }).id);

  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
  return { ok: true, data: { slug } };
}

export async function updateEvent(
  id: string,
  input: EventInput
): Promise<ActionResult<{ slug: string }>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to edit events.");
  }

  const clean = cleanInput(input);
  if (!clean.title) return fail("Event title is required.");

  const update: Record<string, unknown> = { ...clean };
  // Only touch the cover when a fresh one was uploaded (path passed in);
  // an edit that leaves the cover alone omits cover_path entirely. The slug is
  // stable after creation and is intentionally not editable here.
  if (input.cover_path !== undefined) update.cover_path = input.cover_path;

  const { data, error } = await supabaseAdmin
    .from("events")
    .update(update)
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error) return fail(`Could not update the event: ${error.message}`);
  if (!data) return fail("Event not found.");

  if (clean.featured) await unfeatureOthers(id);

  const slug = (data as { slug: string }).slug;
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
  return { ok: true, data: { slug } };
}

export async function setEventFeatured(
  id: string,
  featured: boolean
): Promise<ActionResult<undefined>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to feature events.");
  }

  if (featured) {
    const err = await unfeatureOthers(id);
    if (err) return fail(`Could not update events: ${err}`);
  }
  const { error } = await supabaseAdmin
    .from("events")
    .update({ featured })
    .eq("id", id);
  if (error) return fail(`Could not update the event: ${error.message}`);

  await revalidateEvent(id);
  return { ok: true, data: undefined };
}

export async function setEventPublished(
  id: string,
  isPublished: boolean
): Promise<ActionResult<undefined>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to publish events.");
  }
  const { error } = await supabaseAdmin
    .from("events")
    .update({ is_published: isPublished })
    .eq("id", id);
  if (error) return fail(`Could not update the event: ${error.message}`);

  await revalidateEvent(id);
  return { ok: true, data: undefined };
}

export async function deleteEvent(
  id: string
): Promise<ActionResult<undefined>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to delete events.");
  }

  const { data: ev } = await supabaseAdmin
    .from("events")
    .select("cover_path, slug")
    .eq("id", id)
    .maybeSingle();
  const { data: photos } = await supabaseAdmin
    .from("event_photos")
    .select("storage_path")
    .eq("event_id", id);

  const row = ev as { cover_path: string | null; slug: string } | null;
  const paths = [
    ...(row?.cover_path ? [row.cover_path] : []),
    ...((photos ?? []) as { storage_path: string }[]).map((p) => p.storage_path),
  ];
  // Best-effort storage cleanup first; orphaned files are recoverable, but an
  // orphaned row pointing at deleted files is not.
  if (paths.length) {
    const { error: se } = await supabaseAdmin.storage
      .from("events")
      .remove(paths);
    if (se) console.error("[events] storage cleanup failed:", se.message);
  }

  // event_photos rows cascade away with the event.
  const { error } = await supabaseAdmin.from("events").delete().eq("id", id);
  if (error) return fail(`Could not delete the event: ${error.message}`);

  revalidatePath("/events");
  if (row?.slug) revalidatePath(`/events/${row.slug}`);
  return { ok: true, data: undefined };
}

//
// Gallery photos
//
async function nextPhotoOrder(eventId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from("event_photos")
    .select("sort_order")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const top = (data as { sort_order: number } | null)?.sort_order ?? -1;
  return top + 1;
}

export async function addEventPhoto(
  eventId: string,
  photo: { storage_path: string; caption?: string | null }
): Promise<ActionResult<{ id: string }>> {
  let email: string;
  try {
    const session = await requireCommittee();
    email = session.user.email!;
  } catch {
    return fail("You need committee access to add photos.");
  }
  if (!photo.storage_path) return fail("Missing uploaded photo.");

  const { data, error } = await supabaseAdmin
    .from("event_photos")
    .insert({
      event_id: eventId,
      storage_path: photo.storage_path,
      caption: photo.caption?.trim() || null,
      sort_order: await nextPhotoOrder(eventId),
      created_by: email,
    })
    .select("id")
    .maybeSingle();
  if (error) return fail(`Could not save the photo: ${error.message}`);

  await revalidateEvent(eventId);
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function deleteEventPhoto(
  id: string
): Promise<ActionResult<undefined>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to delete photos.");
  }

  const { data, error: loadError } = await supabaseAdmin
    .from("event_photos")
    .select("storage_path, event_id")
    .eq("id", id)
    .maybeSingle();
  if (loadError || !data) return fail("Photo not found.");
  const { storage_path, event_id } = data as {
    storage_path: string;
    event_id: string;
  };

  const { error: se } = await supabaseAdmin.storage
    .from("events")
    .remove([storage_path]);
  if (se) console.error("[events] photo cleanup failed:", se.message);

  const { error } = await supabaseAdmin
    .from("event_photos")
    .delete()
    .eq("id", id);
  if (error) return fail(`Could not delete the photo: ${error.message}`);

  await revalidateEvent(event_id);
  return { ok: true, data: undefined };
}

// Move a photo one place earlier (-1) or later (+1) in its event's gallery.
// The gallery is renumbered to a clean 0..n-1 sequence so ordering stays
// unique and contiguous (mirrors moveSponsor in app/sponsors/actions.ts).
export async function moveEventPhoto(
  id: string,
  direction: -1 | 1
): Promise<ActionResult<undefined>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to reorder photos.");
  }

  const { data: target, error: loadError } = await supabaseAdmin
    .from("event_photos")
    .select("event_id")
    .eq("id", id)
    .maybeSingle();
  if (loadError || !target) return fail("Photo not found.");
  const eventId = (target as { event_id: string }).event_id;

  const { data, error } = await supabaseAdmin
    .from("event_photos")
    .select("id, sort_order")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return fail(`Could not load photos: ${error.message}`);

  const rows = (data ?? []) as { id: string; sort_order: number }[];
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return fail("Photo not found.");

  const swap = index + direction;
  if (swap < 0 || swap >= rows.length) {
    return { ok: true, data: undefined }; // already at the edge — no-op
  }

  const reordered = [...rows];
  [reordered[index], reordered[swap]] = [reordered[swap], reordered[index]];

  const changed = reordered
    .map((row, i) => ({ id: row.id, next: i, prev: row.sort_order }))
    .filter((row) => row.next !== row.prev);
  for (const row of changed) {
    const { error: upErr } = await supabaseAdmin
      .from("event_photos")
      .update({ sort_order: row.next })
      .eq("id", row.id);
    if (upErr) return fail(`Could not reorder photos: ${upErr.message}`);
  }

  await revalidateEvent(eventId);
  return { ok: true, data: undefined };
}
