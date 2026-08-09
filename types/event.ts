// Mirrors public.events / public.event_photos
// (supabase/migrations/20260809000000_events.sql). Timestamps are ISO strings
// as returned by supabase-js.
export type EventCategory = "social" | "professional" | "educational";
export type EventSource = "eventbrite" | "manual";

export const EVENT_CATEGORIES: EventCategory[] = [
  "social",
  "professional",
  "educational",
];

export interface EventRecord {
  id: string;
  eventbrite_id: string | null;
  source: EventSource;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  category: EventCategory;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string | null;
  venue_name: string | null;
  venue_address: string | null;
  is_online: boolean;
  cover_path: string | null;
  rsvp_url: string | null;
  capacity: number | null;
  is_free: boolean | null;
  featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface EventPhoto {
  id: string;
  event_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
  created_by: string | null;
}

export interface EventWithPhotos extends EventRecord {
  photos: EventPhoto[];
}

// Fields a committee member supplies when creating or editing an event.
// `cover_path` is omitted on edits that keep the existing cover.
export interface EventInput {
  title: string;
  summary?: string | null;
  description?: string | null;
  category: EventCategory;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  is_online?: boolean;
  rsvp_url?: string | null;
  capacity?: number | null;
  is_free?: boolean | null;
  featured?: boolean;
  is_published?: boolean;
  cover_path?: string | null;
  slug?: string;
}
