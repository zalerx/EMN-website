import "server-only";

// Eventbrite API v3 client. We only read the configured organization's events;
// the private token and organization id come from env (see README for setup).
//
// Docs: https://www.eventbrite.com/platform/api
//   List: GET /v3/organizations/{organization_id}/events/
//   Auth: Authorization: Bearer <EVENTBRITE_PRIVATE_TOKEN>
//   Find the org id once via GET /v3/users/me/organizations/
const BASE = "https://www.eventbriteapi.com/v3";

// Normalized shape the import pipeline consumes; keeps raw Eventbrite JSON
// contained to this module.
export interface EventbriteEvent {
  eventbriteId: string;
  title: string;
  summary: string | null;
  description: string | null;
  startsAt: string | null; // ISO (UTC)
  endsAt: string | null; // ISO (UTC)
  timezone: string | null; // IANA, e.g. 'Australia/Melbourne'
  venueName: string | null;
  venueAddress: string | null;
  isOnline: boolean;
  coverUrl: string | null;
  rsvpUrl: string | null;
  capacity: number | null;
  isFree: boolean | null;
}

interface RawEventbriteEvent {
  id: string;
  status?: string | null;
  name?: { text?: string | null } | null;
  summary?: string | null;
  description?: { text?: string | null } | null;
  url?: string | null;
  start?: { utc?: string | null; timezone?: string | null } | null;
  end?: { utc?: string | null } | null;
  online_event?: boolean | null;
  capacity?: number | null;
  is_free?: boolean | null;
  venue?: {
    name?: string | null;
    address?: { localized_address_display?: string | null } | null;
  } | null;
  logo?: {
    url?: string | null;
    original?: { url?: string | null } | null;
  } | null;
}

interface EventbritePage {
  events?: RawEventbriteEvent[];
  pagination?: {
    has_more_items?: boolean;
    continuation?: string | null;
  };
}

// Eventbrite statuses we don't want to surface on the site.
const SKIP_STATUSES = new Set(["draft", "canceled"]);

export function eventbriteConfigured(): boolean {
  return Boolean(
    process.env.EVENTBRITE_PRIVATE_TOKEN &&
      process.env.EVENTBRITE_ORGANIZATION_ID
  );
}

function normalize(raw: RawEventbriteEvent): EventbriteEvent {
  return {
    eventbriteId: raw.id,
    title: raw.name?.text?.trim() || "Untitled event",
    summary: raw.summary?.trim() || null,
    description: raw.description?.text?.trim() || null,
    startsAt: raw.start?.utc ?? null,
    endsAt: raw.end?.utc ?? null,
    timezone: raw.start?.timezone ?? null,
    venueName: raw.venue?.name?.trim() || null,
    venueAddress: raw.venue?.address?.localized_address_display?.trim() || null,
    isOnline: Boolean(raw.online_event),
    coverUrl: raw.logo?.original?.url ?? raw.logo?.url ?? null,
    rsvpUrl: raw.url ?? null,
    capacity: typeof raw.capacity === "number" ? raw.capacity : null,
    isFree: typeof raw.is_free === "boolean" ? raw.is_free : null,
  };
}

// Fetch every event belonging to the configured organization, following
// Eventbrite's continuation-token pagination to the end. Drafts and canceled
// events are filtered out.
export async function fetchOrganizationEvents(): Promise<EventbriteEvent[]> {
  const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
  const org = process.env.EVENTBRITE_ORGANIZATION_ID;
  if (!token || !org) {
    throw new Error(
      "Eventbrite is not configured (set EVENTBRITE_PRIVATE_TOKEN and EVENTBRITE_ORGANIZATION_ID)."
    );
  }

  const events: EventbriteEvent[] = [];
  let continuation: string | null = null;
  // Hard page cap so a malformed continuation loop can never run forever.
  for (let page = 0; page < 50; page++) {
    const url = new URL(`${BASE}/organizations/${org}/events/`);
    url.searchParams.set("expand", "venue,logo");
    url.searchParams.set("order_by", "start_desc");
    url.searchParams.set("page_size", "50");
    url.searchParams.set("status", "all"); // filter draft/canceled in code
    if (continuation) url.searchParams.set("continuation", continuation);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Eventbrite request failed (HTTP ${res.status}): ${body.slice(0, 300)}`
      );
    }

    const payload = (await res.json()) as EventbritePage;
    for (const raw of payload.events ?? []) {
      if (raw.status && SKIP_STATUSES.has(raw.status)) continue;
      events.push(normalize(raw));
    }

    const p = payload.pagination;
    if (!p?.has_more_items || !p.continuation) break;
    continuation = p.continuation;
  }

  return events;
}
