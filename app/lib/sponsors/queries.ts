import "server-only";
import { getSupabaseAnon } from "@/app/lib/supabase-client";
import type { Sponsor } from "@/types/sponsor";

// Sponsors are all public (no draft state), so the anon client under RLS
// serves both the public carousel and the committee manager list.
export async function listSponsors(): Promise<Sponsor[]> {
  const { data, error } = await getSupabaseAnon()
    .from("sponsors")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to list sponsors: ${error.message}`);
  return (data ?? []) as Sponsor[];
}
