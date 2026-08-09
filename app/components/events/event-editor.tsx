"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Star, Trash2, X } from "lucide-react";
import EventForm from "@/app/components/events/event-form";
import {
  deleteEvent,
  setEventFeatured,
  setEventPublished,
} from "@/app/events/actions";
import type { EventRecord } from "@/types/event";

type ActionFn = () => Promise<{ ok: boolean; error?: string }>;

// Committee toolbar shown on an event's detail page: edit details inline,
// toggle featured/published, or delete (which returns to the list).
export default function EventEditor({ event }: { event: EventRecord }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function run(action: ActionFn, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      if (after) after();
      else router.refresh();
    });
  }

  return (
    <section className="mx-auto mt-12 max-w-[1272px] rounded-[30px] bg-emn-green-dark p-7 text-emn-offwhite md:p-9">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-candu text-3xl uppercase leading-none md:text-[40px]">
            Manage Event
          </h3>
          <p className="mt-2 text-sm text-emn-offwhite/85">
            Committee only. Edit details, feature it as the headline, hide it,
            or delete it.
          </p>
        </div>
        {editing && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-emn-offwhite px-4 py-2 text-sm font-bold text-emn-offwhite transition-colors hover:bg-emn-offwhite hover:text-emn-green-dark"
          >
            <X className="h-4 w-4" aria-hidden /> Close
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-6">
          <EventForm
            mode="edit"
            event={event}
            onDone={() => {
              setEditing(false);
              router.refresh();
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-bold">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded-full border-2 border-emn-offwhite bg-emn-green px-5 py-2 font-black text-white"
          >
            <Pencil className="h-4 w-4" aria-hidden /> Edit details
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setEventFeatured(event.id, !event.featured))}
            className="inline-flex items-center gap-1 underline decoration-emn-offwhite/40 underline-offset-2"
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
            className="inline-flex items-center gap-1 underline decoration-emn-offwhite/40 underline-offset-2"
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
          {confirmingDelete ? (
            <span className="inline-flex items-center gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(
                    () => deleteEvent(event.id),
                    () => router.push("/events")
                  )
                }
                className="text-red-300 underline underline-offset-2"
              >
                Confirm delete
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
      )}

      {!event.is_published && !editing && (
        <p className="mt-4 rounded-[12px] bg-emn-offwhite/10 px-4 py-3 text-sm font-bold">
          This event is hidden — only committee members can see this page.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs font-bold text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}
