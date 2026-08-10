import Link from "next/link";
import MediaBox from "@/app/components/events/media-box";
import { eventImageUrl } from "@/app/lib/events/cover";
import { formatEventDateTime, isPastEvent } from "@/app/lib/events/format";
import type { EventRecord } from "@/types/event";

// The large "headline" feature card at the top of the events list (mock's
// .headline). One event is featured at a time; past features flip their CTA
// to "View photos".
export default function EventHeadline({ event }: { event: EventRecord }) {
  const past = isPastEvent(event);
  const cover = eventImageUrl(event.cover_path);
  const location = event.is_online
    ? "Online"
    : [event.venue_name, event.venue_address].filter(Boolean).join(", ");

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative mx-auto mt-[70px] block max-w-[1272px] rounded-[30px] bg-emn-green-dark px-4 pb-9 pt-4 text-emn-offwhite [outline:4px_solid_#f1f1f1] [outline-offset:-16px] focus-visible:[outline:3px_solid_#6cbe45] focus-visible:[outline-offset:4px]"
    >
      <MediaBox
        src={cover}
        alt={event.title}
        className="h-[260px] rounded-t-[14px] md:h-[420px]"
        imgClassName="transition-transform duration-500 group-hover:scale-[1.025]"
      />

      <div className="flex flex-col gap-5 px-[22px] pt-[30px] md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="max-w-[600px]">
          <h2 className="font-candu text-3xl uppercase leading-[0.95] text-emn-offwhite md:text-[44px]">
            {event.title}
          </h2>
          {event.summary && (
            <p className="mt-3 text-lg leading-[1.5] text-emn-offwhite/85">
              {event.summary}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-col gap-2 md:items-end md:text-right">
          <span className="text-xl font-black tracking-[0.02em] text-emn-offwhite">
            {formatEventDateTime(event.starts_at, event)}
          </span>
          {location && (
            <span className="text-sm font-bold uppercase tracking-[0.06em] text-emn-offwhite/75">
              {location}
            </span>
          )}
          <span className="mt-3 self-start border-b-2 border-emn-green pb-[3px] text-base font-black text-emn-offwhite md:self-end">
            {past ? "View photos →" : "View details →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
