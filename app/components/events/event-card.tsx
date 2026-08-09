import Link from "next/link";
import MediaBox from "@/app/components/events/media-box";
import { eventImageUrl } from "@/app/lib/events/cover";
import { formatEventDateTime, isPastEvent } from "@/app/lib/events/format";
import { cn } from "@/app/lib/utils";
import type { EventRecord } from "@/types/event";

// Grid card from the Events.html mock, with the two looks swapped: upcoming
// events are the solid green tile with a category chip, while past events use
// the light off-white card with a green outline. Client-safe (no server-only
// imports) so it renders inside the client-side filterable grid.
export default function EventCard({ event }: { event: EventRecord }) {
  // `solid` drives the dark-green treatment. It's given to UPCOMING events and
  // withheld from PAST events (swapped from the original mock).
  const solid = !isPastEvent(event);
  const cover = eventImageUrl(event.cover_path);
  const location = event.is_online ? "Online" : event.venue_name;

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group relative block rounded-[18px] border-4 border-emn-green-dark px-[22px] pb-[26px] pt-[42px] transition-transform duration-200 hover:-translate-y-2 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-emn-green",
        solid ? "bg-emn-green-dark hover:bg-[#1d6136]" : "bg-emn-offwhite hover:bg-white"
      )}
    >
      <span
        className={cn(
          "absolute -top-[22px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[28px_0_28px_0] border-4 px-[26px] pb-[7px] pt-[13px] font-candu text-2xl uppercase leading-none tracking-[0.04em] transition-colors",
          solid
            ? "border-emn-offwhite bg-emn-green-dark text-emn-offwhite group-hover:border-emn-green-dark group-hover:bg-emn-offwhite group-hover:text-emn-green-dark"
            : "border-emn-green-dark bg-emn-offwhite text-emn-green-dark group-hover:bg-emn-green-dark group-hover:text-emn-offwhite"
        )}
      >
        {event.title}
      </span>

      <MediaBox
        src={cover}
        alt={event.title}
        className="aspect-square rounded-[12px]"
        imgClassName="transition-transform duration-300 group-hover:scale-105"
      />

      <div
        className={cn(
          "flex flex-col gap-3 pt-[18px] text-center",
          solid ? "text-emn-offwhite" : "text-emn-green-dark"
        )}
      >
        <div className="text-sm font-black tracking-[0.02em]">
          {formatEventDateTime(event.starts_at, event)}
        </div>
        {location && (
          <div
            className={cn(
              "-mt-2 text-[11px] font-bold uppercase tracking-[0.06em]",
              solid ? "text-emn-offwhite/75" : "text-emn-green-dark/75"
            )}
          >
            {location}
          </div>
        )}
        {event.summary && (
          <p className="px-1 text-[13px] leading-[1.45]">{event.summary}</p>
        )}
        {solid && (
          <span className="mt-auto inline-flex items-center justify-center self-center rounded-[12px_0_12px_0] bg-emn-offwhite px-3 pb-1 pt-[5px] text-[11px] font-black uppercase tracking-[0.12em] text-emn-black">
            {event.category}
          </span>
        )}
      </div>
    </Link>
  );
}
