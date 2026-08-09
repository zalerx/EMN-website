import { getCommitteeSession } from "@/app/lib/require-committee";
import {
  listAllEvents,
  listPublishedEvents,
  splitEvents,
} from "@/app/lib/events/queries";
import EventHeadline from "@/app/components/events/event-headline";
import EventsGrid from "@/app/components/events/events-grid";
import EventsManager from "@/app/components/events/events-manager";
import type { EventRecord } from "@/types/event";

// Dynamic (not ISR): the page reads the committee session on every request to
// decide whether to show management tools, exactly like the sponsors page.
// Mutations still revalidate this path so data stays fresh.
export default async function EventsPage() {
  // If Supabase isn't configured (no env) the reads throw — fall back to an
  // empty state so the page still renders for public visitors.
  let events: EventRecord[] = [];
  try {
    events = await listPublishedEvents();
  } catch (e) {
    console.error("[events] list failed:", e);
  }

  let isCommittee = false;
  try {
    isCommittee = (await getCommitteeSession()) !== null;
  } catch (e) {
    console.error("[events] session check failed:", e);
  }

  // Committee members manage the full list (including hidden events) via the
  // service-role read; the public hero/grid only ever show published events.
  let allEvents: EventRecord[] = [];
  if (isCommittee) {
    try {
      allEvents = await listAllEvents();
    } catch (e) {
      console.error("[events] admin list failed:", e);
    }
  }

  const { featured, grid } = splitEvents(events);
  const hasEvents = events.length > 0;

  return (
    <main className="px-3 pb-16 md:px-[18px] md:pb-[21px]">
      {/* Hero */}
      <section className="mx-auto mt-12 flex max-w-[1236px] flex-col items-center px-0 text-center md:mt-[72px] md:px-[18px]">
        <h1 className="mb-6 font-candu text-[54px] uppercase leading-[0.9] text-emn-green-dark md:mb-[26px] md:text-[72px] lg:text-[120px]">
          Events
        </h1>
        <p className="mb-[14px] max-w-[760px] text-xl font-bold leading-[1.3] md:text-2xl">
          Discover social, educational and professional events.
        </p>
        <p className="max-w-[680px] text-base leading-[1.5] text-emn-black/85 md:text-lg">
          From pub nights and coffee catchups to alumni panels and case
          competitions — explore what emerging markets can offer you, and meet
          the people exploring them with you.
        </p>
      </section>

      {featured && <EventHeadline event={featured} />}

      {grid.length > 0 && <EventsGrid events={grid} />}

      {!hasEvents && (
        <p className="mx-auto mt-16 max-w-[1236px] px-[18px] text-lg font-bold text-emn-black/70">
          No events are published right now — stay tuned for what&apos;s next!
        </p>
      )}

      {isCommittee && <EventsManager events={allEvents} />}
    </main>
  );
}
