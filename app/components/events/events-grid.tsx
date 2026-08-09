"use client";

import { useState } from "react";
import EventCard from "@/app/components/events/event-card";
import { isPastEvent } from "@/app/lib/events/format";
import { cn } from "@/app/lib/utils";
import type { EventRecord } from "@/types/event";

// Filter bar + grid from the mock. Filtering is client-side over the already
// loaded events (there are only a handful), so switching filters is instant
// and needs no round-trip. "Upcoming" is time-based; the rest match category.
const FILTERS = [
  { val: "all", label: "All" },
  { val: "upcoming", label: "Upcoming" },
  { val: "social", label: "Social" },
  { val: "professional", label: "Professional" },
  { val: "educational", label: "Educational" },
] as const;

type FilterVal = (typeof FILTERS)[number]["val"];

export default function EventsGrid({ events }: { events: EventRecord[] }) {
  const [filter, setFilter] = useState<FilterVal>("all");

  const visible = events.filter((e) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return !isPastEvent(e);
    return e.category === filter;
  });

  return (
    <>
      <div className="mx-auto mt-20 flex max-w-[1236px] flex-wrap items-center gap-x-10 gap-y-3 px-[18px] md:mt-[88px]">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-emn-black/60">
          Filter
        </span>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.val}
              type="button"
              onClick={() => setFilter(f.val)}
              aria-pressed={filter === f.val}
              className={cn(
                "h-[34px] rounded-[17px_0_17px_0] border-2 border-emn-green-dark px-4 pt-[2px] text-[13px] font-bold transition-colors",
                filter === f.val
                  ? "bg-emn-green-dark text-emn-offwhite"
                  : "bg-transparent text-emn-green-dark hover:bg-emn-green-dark/10"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-9 max-w-[1236px] px-[18px]">
        <h2 className="font-candu text-[32px] uppercase leading-none text-emn-green-dark md:text-[44px]">
          All Events
        </h2>
      </div>

      {visible.length > 0 ? (
        <div className="mx-auto grid max-w-[1236px] grid-cols-1 gap-x-9 gap-y-[58px] px-[18px] pt-[46px] sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="mx-auto max-w-[1236px] px-[18px] pt-[46px] text-base font-bold text-emn-black/60">
          No events match these filters.
        </p>
      )}
    </>
  );
}
