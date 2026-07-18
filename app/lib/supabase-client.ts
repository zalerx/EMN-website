import { createClient } from "@supabase/supabase-js";

// Browser-safe Supabase client using the publishable anon key.
// RLS limits it to reading published articles; it is also used by the
// admin upload form to stream files to a signed upload URL (the signed
// token, not this key, is what authorises that write).
export const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
