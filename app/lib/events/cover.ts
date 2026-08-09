// Public URL for an image in the public 'events' storage bucket (event covers
// and gallery photos). The bucket is public, so the URL is deterministic and
// needs no Supabase client or signing. Building it from NEXT_PUBLIC_SUPABASE_URL
// (inlined into the client bundle) keeps this usable from both server and
// client components. Mirrors app/lib/sponsors/logo.ts.
export function eventImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/events/${path}`;
}
