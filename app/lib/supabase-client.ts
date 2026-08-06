import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Anon-key Supabase client (browser-safe; RLS limits it to published
// articles). Created lazily so a missing env var fails at first use with a
// clear message instead of crashing every route at import time.
let client: SupabaseClient | null = null;

export function getSupabaseAnon(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
