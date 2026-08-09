"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import EventForm from "@/app/components/events/event-form";
import { formatEventDate, isPastEvent } from "@/app/lib/events/format";
import {
  deleteEvent,
  setEventFeatured,
  setEventPublished,
} from "@/app/events/actions";
import type { EventRecord } from "@/types/event";

type ActionFn = () => Promise<{ ok: boolean; error?: string }>;

function EventRow({ event }: { event: EventRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const past = isPastEvent(event);

  function run(action: ActionFn) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      setConfirmingDelete(false);
      router.refresh();
    });
  }

  return (
    <div
      className={`rounded-[16px] bg-emn-offwhite/[0.08] p-4 ${pending ? "opacity-50" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate font-bold text-emn-offwhite">
            {event.featured && (
              <Star
                className="h-4 w-4 shrink-0 fill-emn-green text-emn-green"
                aria-label="Featured"
              />
            )}
            {event.title}
          </p>
          <p className="truncate text-xs text-emn-offwhite/60">
            {formatEventDate(event.starts_at, event)} · {event.category} ·{" "}
            {past ? "past" : "upcoming"}
            {!event.is_published && " · hidden"}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 text-sm font-bold">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setEventFeatured(event.id, !event.featured))}
            className="inline-flex items-center gap-1 text-emn-offwhite underline decoration-emn-offwhite/40 underline-offset-2"
          >
            <Star className="h-4 w-4" aria-hidden />
            {event.featured ? "Unfeature" : "Feature"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(() => setEventPublished(event.id, !event.is_published))
            }
            className="inline-flex items-center gap-1 text-emn-offwhite underline decoration-emn-offwhite/40 underline-offset-2"
          >
            {event.is_published ? (
              <>
                <EyeOff className="h-4 w-4" aria-hidden /> Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" aria-hidden /> Show
              </>
            )}
          </button>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1 text-emn-offwhite underline decoration-emn-offwhite/40 underline-offset-2"
          >
            <Pencil className="h-4 w-4" aria-hidden /> Edit
          </Link>
          {confirmingDelete ? (
            <span className="inline-flex items-center gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => deleteEvent(event.id))}
                className="text-red-300 underline underline-offset-2"
              >
                Confirm
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmingDelete(false)}
                className="text-emn-offwhite/70 underline underline-offset-2"
              >
                Keep
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex items-center gap-1 text-red-300 underline decoration-red-300/40 underline-offset-2"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Delete
            </button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-bold text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EventsManager({ events }: { events: EventRecord[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  // Collapsed by default: committee/admins get an entry point, not a panel
  // that's always taking up space on the page.
  if (!open) {
    return (
      <div className="mx-auto mt-10 flex max-w-[1272px] justify-end px-[18px]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-emn-green-dark px-4 py-2 text-sm font-bold text-emn-green-dark transition-colors hover:bg-emn-green-dark hover:text-white"
        >
          <Pencil className="h-4 w-4" aria-hidden /> Manage events
        </button>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="manage-events-heading"
      className="mx-auto mt-10 max-w-[1272px] rounded-[30px] bg-emn-green-dark p-7 text-emn-offwhite md:p-9"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3
            id="manage-events-heading"
            className="font-candu text-3xl uppercase leading-none md:text-[40px]"
          >
            Manage Events
          </h3>
          <p className="mt-2 text-sm text-emn-offwhite/85">
            Committee only. Add events, feature or hide them, or open one to edit
            its details and photos. Eventbrite events import automatically; your
            edits here are never overwritten.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-emn-offwhite px-4 py-2 text-sm font-bold text-emn-offwhite transition-colors hover:bg-emn-offwhite hover:text-emn-green-dark"
        >
          <X className="h-4 w-4" aria-hidden /> Done
        </button>
      </div>

      <div className="mt-6">
        {adding ? (
          <div className="rounded-[16px] bg-emn-offwhite/[0.08] p-4">
            <EventForm
              mode="create"
              onDone={() => {
                setAdding(false);
                router.refresh();
              }}
              onCancel={() => setAdding(false)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-emn-offwhite bg-emn-green px-5 py-2 text-sm font-black text-white"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add event
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-emn-offwhite/70">
          {events.length > 0
            ? `All events (${events.length})`
            : "No events yet"}
        </h4>
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
