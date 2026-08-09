"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { createEvent, updateEvent } from "@/app/events/actions";
import { eventImageUrl } from "@/app/lib/events/cover";
import { toDatetimeLocalValue } from "@/app/lib/events/format";
import {
  EVENT_IMAGE_TYPES,
  imageFileError,
  uploadEventImage,
} from "@/app/components/events/upload";
import {
  EVENT_CATEGORIES,
  type EventCategory,
  type EventInput,
  type EventRecord,
} from "@/types/event";

const inputClasses =
  "w-full rounded-[12px] border-2 border-emn-offwhite bg-emn-offwhite px-3 py-2 text-sm text-emn-black placeholder:text-emn-black/40 focus:border-emn-green focus:outline-none";
const labelClasses =
  "text-xs font-bold uppercase tracking-[0.12em] text-emn-offwhite";
const fileClasses =
  "text-sm text-emn-offwhite/80 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-emn-offwhite file:px-4 file:py-1.5 file:text-sm file:font-bold file:text-emn-black";

function Labelled({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "md:col-span-2" : ""}`}>
      <span className={labelClasses}>{label}</span>
      {children}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-bold text-emn-offwhite">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-emn-green"
      />
      {label}
    </label>
  );
}

// Shared create/edit form. Times use the browser's local timezone on the way
// in and out; the resolved timezone is stored alongside so public pages render
// the same wall-clock the committee entered.
export default function EventForm({
  mode,
  event,
  onDone,
  onCancel,
}: {
  mode: "create" | "edit";
  event?: EventRecord;
  onDone: (slug: string) => void;
  onCancel?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(event?.title ?? "");
  const [summary, setSummary] = useState(event?.summary ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [category, setCategory] = useState<EventCategory>(
    event?.category ?? "social"
  );
  const [startsAt, setStartsAt] = useState(
    toDatetimeLocalValue(event?.starts_at ?? null)
  );
  const [endsAt, setEndsAt] = useState(
    toDatetimeLocalValue(event?.ends_at ?? null)
  );
  const [venueName, setVenueName] = useState(event?.venue_name ?? "");
  const [venueAddress, setVenueAddress] = useState(event?.venue_address ?? "");
  const [isOnline, setIsOnline] = useState(event?.is_online ?? false);
  const [rsvpUrl, setRsvpUrl] = useState(event?.rsvp_url ?? "");
  const [featured, setFeatured] = useState(event?.featured ?? false);
  const [isPublished, setIsPublished] = useState(event?.is_published ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const currentCover = eventImageUrl(event?.cover_path);

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    if (picked) {
      const err = imageFileError(picked);
      if (err) {
        setError(err);
        setFile(null);
        return;
      }
    }
    setError(null);
    setFile(picked);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (!title.trim()) {
      setError("Event title is required.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      let cover_path: string | undefined;
      if (file) cover_path = await uploadEventImage("cover", file);

      const input: EventInput = {
        title,
        summary: summary || null,
        description: description || null,
        category,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        venue_name: venueName || null,
        venue_address: venueAddress || null,
        is_online: isOnline,
        rsvp_url: rsvpUrl || null,
        featured,
        is_published: isPublished,
        ...(cover_path !== undefined ? { cover_path } : {}),
      };

      const result =
        mode === "create"
          ? await createEvent(input)
          : await updateEvent(event!.id, input);
      if (!result.ok) throw new Error(result.error);
      onDone(result.data.slug);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the event."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Labelled label="Title *" full>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
            placeholder="Event title"
            className={inputClasses}
          />
        </Labelled>
        <Labelled label="Summary (shown on cards)" full>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={busy}
            placeholder="One-line description"
            className={inputClasses}
          />
        </Labelled>
        <Labelled label="Description (detail page)" full>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={busy}
            rows={4}
            placeholder="Full description. Blank lines start new paragraphs."
            className={inputClasses}
          />
        </Labelled>
        <Labelled label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory)}
            disabled={busy}
            className={inputClasses}
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </Labelled>
        <Labelled label="Sign-up / RSVP link">
          <input
            type="url"
            value={rsvpUrl}
            onChange={(e) => setRsvpUrl(e.target.value)}
            disabled={busy}
            placeholder="https://eventbrite.com/e/..."
            className={inputClasses}
          />
        </Labelled>
        <Labelled label="Starts">
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            disabled={busy}
            className={inputClasses}
          />
        </Labelled>
        <Labelled label="Ends">
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            disabled={busy}
            className={inputClasses}
          />
        </Labelled>
        <Labelled label="Venue name">
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            disabled={busy}
            placeholder="The Spot, University of Melbourne"
            className={inputClasses}
          />
        </Labelled>
        <Labelled label="Venue address">
          <input
            type="text"
            value={venueAddress}
            onChange={(e) => setVenueAddress(e.target.value)}
            disabled={busy}
            placeholder="Carlton VIC"
            className={inputClasses}
          />
        </Labelled>
        <div className="md:col-span-2">
          <Labelled label="Cover image (PNG, JPEG or WebP · up to 5 MB)">
            <input
              ref={fileRef}
              type="file"
              accept={EVENT_IMAGE_TYPES.join(",")}
              onChange={onPick}
              disabled={busy}
              className={fileClasses}
            />
          </Labelled>
          {currentCover && !file && (
            <p className="mt-2 text-xs text-emn-offwhite/60">
              A cover is already set — choose a file only to replace it.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 md:col-span-2">
          <Checkbox
            label="Online event"
            checked={isOnline}
            onChange={setIsOnline}
            disabled={busy}
          />
          <Checkbox
            label="Feature as headline"
            checked={featured}
            onChange={setFeatured}
            disabled={busy}
          />
          <Checkbox
            label="Published (visible to public)"
            checked={isPublished}
            onChange={setIsPublished}
            disabled={busy}
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-[12px] border-2 border-red-700 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="rounded-full border-2 border-emn-offwhite bg-emn-green px-5 py-2 text-sm font-black text-white disabled:opacity-50"
        >
          {busy
            ? "Saving…"
            : mode === "create"
              ? "Add event"
              : "Save changes"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-sm font-bold text-emn-offwhite/80 underline underline-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
