// Mirrors public.sponsors (supabase/migrations/20260807000000_sponsors.sql).
// Timestamps are ISO strings as returned by supabase-js.
export type SponsorShape = "leaf" | "circle";

// How the logo is scaled inside its tile: 'cover' fills the shape edge-to-edge
// (cropping any overflow); 'contain' fits the whole logo inside with padding.
export type SponsorFit = "cover" | "contain";

export interface Sponsor {
  id: string;
  name: string;
  website: string | null;
  shape: SponsorShape;
  logo_path: string | null;
  logo_fit: SponsorFit;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Fields a committee member supplies when creating or editing a sponsor.
// `logo_path` is omitted on edits that keep the existing logo.
export interface SponsorInput {
  name: string;
  website?: string | null;
  shape: SponsorShape;
  logo_fit?: SponsorFit;
  sort_order?: number;
  logo_path?: string | null;
}
