"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Trash2, Upload } from "lucide-react";
import MediaBox from "@/app/components/events/media-box";
import { eventImageUrl } from "@/app/lib/events/cover";
import {
  EVENT_IMAGE_TYPES,
  imageFileError,
  uploadEventImage,
} from "@/app/components/events/upload";
import {
  addEventPhoto,
  deleteEventPhoto,
  moveEventPhoto,
} from "@/app/events/actions";
import type { EventPhoto } from "@/types/event";

type ActionFn = () => Promise<{ ok: boolean; error?: string }>;

export default function EventPhotoManager({
  eventId,
  photos,
}: {
  eventId: string;
  photos: EventPhoto[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload can be several files at once; each streams to storage then gets a
  // row. One bad file aborts the batch with its message.
  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (fileRef.current) fileRef.current.value = "";
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of files) {
        const err = imageFileError(file);
        if (err) throw new Error(err);
        const path = await uploadEventImage("gallery", file, eventId);
        const result = await addEventPhoto(eventId, { storage_path: path });
        if (!result.ok) throw new Error(result.error);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function run(action: ActionFn) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="mx-auto mt-8 max-w-[1272px] rounded-[30px] bg-emn-green-dark p-7 text-emn-offwhite md:p-9">
      <h3 className="font-candu text-3xl uppercase leading-none md:text-[40px]">
        Manage Photos
      </h3>
      <p className="mt-2 text-sm text-emn-offwhite/85">
        Committee only. Upload photos for this event&apos;s gallery; reorder
        them with the arrows.
      </p>

      <div className="mt-6">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-emn-offwhite bg-emn-green px-5 py-2 text-sm font-black text-white">
          <Upload className="h-4 w-4" aria-hidden />
          {uploading ? "Uploading…" : "Upload photos"}
          <input
            ref={fileRef}
            type="file"
            accept={EVENT_IMAGE_TYPES.join(",")}
            multiple
            onChange={onPick}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs font-bold text-red-300">
          {error}
        </p>
      )}

      {photos.length > 0 ? (
        <div
          className={`mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 ${pending ? "opacity-60" : ""}`}
        >
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-[14px] bg-emn-offwhite/[0.08]"
            >
              <MediaBox
                src={eventImageUrl(photo.storage_path)}
                alt={photo.caption ?? "Event photo"}
                className="aspect-[4/3]"
              />
              <div className="flex items-center justify-between gap-2 p-2">
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={pending || i === 0}
                    onClick={() => run(() => moveEventPhoto(photo.id, -1))}
                    aria-label="Move earlier"
                    className="rounded p-1 hover:bg-emn-offwhite/15 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={pending || i === photos.length - 1}
                    onClick={() => run(() => moveEventPhoto(photo.id, 1))}
                    aria-label="Move later"
                    className="rounded p-1 hover:bg-emn-offwhite/15 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => deleteEventPhoto(photo.id))}
                  aria-label="Delete photo"
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-300 underline underline-offset-2"
                >
                  <Trash2 className="h-4 w-4" aria-hidden /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-emn-offwhite/60">No photos yet.</p>
      )}
    </section>
  );
}
