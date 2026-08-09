import { createSignedEventImageUploadUrl } from "@/app/events/actions";

// Client-side image constraints, mirrored by the server action's allowlist.
export const EVENT_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function imageFileError(file: File): string | null {
  if (!EVENT_IMAGE_TYPES.includes(file.type)) {
    return "Images must be a PNG, JPEG or WebP file.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "That image is over the 5 MB limit.";
  }
  return null;
}

// Signed-URL upload: the file streams straight from the browser to Supabase
// Storage (the server only mints the URL after a committee check). Returns the
// stored object path. Mirrors uploadLogo() in the sponsor manager.
export async function uploadEventImage(
  kind: "cover" | "gallery",
  file: File,
  eventId?: string
): Promise<string> {
  const signed = await createSignedEventImageUploadUrl(
    kind,
    file.name,
    file.type,
    eventId
  );
  if (!signed.ok) throw new Error(signed.error);
  const res = await fetch(signed.data.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`Image upload failed (HTTP ${res.status}).`);
  return signed.data.path;
}
