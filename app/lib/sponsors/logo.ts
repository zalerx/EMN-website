// Public URL for a logo in the public 'sponsors' storage bucket.
//
// The bucket is public, so the URL is deterministic and needs no Supabase
// client or signing. Building it from NEXT_PUBLIC_SUPABASE_URL (inlined into
// the client bundle) keeps this usable from both server and client components.
export function logoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/sponsors/${path}`;
}
