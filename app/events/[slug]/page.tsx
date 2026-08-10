import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Button from "@/app/components/button";
import MediaBox from "@/app/components/events/media-box";
import EventEditor from "@/app/components/events/event-editor";
import EventPhotoManager from "@/app/components/events/event-photo-manager";
import { getCommitteeSession } from "@/app/lib/require-committee";
import {
  getEventAnyStatusBySlug,
  getPublishedEventBySlug,
  listEventPhotos,
} from "@/app/lib/events/queries";
import { eventImageUrl } from "@/app/lib/events/cover";
import { formatEventDate, formatEventTime, isPastEvent } from "@/app/lib/events/format";
import type { EventPhoto, EventRecord } from "@/types/event";

function capitalise(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

async function safeListPhotos(eventId: string): Promise<EventPhoto[]> {
  try {
    return await listEventPhotos(eventId);
  } catch (e) {
    console.error("[events] photo list failed:", e);
    return [];
  }
}

function SideRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={
        last
          ? "flex flex-col gap-1"
          : "flex flex-col gap-1 border-b-2 border-emn-offwhite/15 pb-4"
      }
    >
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-emn-offwhite/60">
        {label}
      </span>
      <span className="text-lg font-black tracking-[0.02em]">{value}</span>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let event: EventRecord | null = null;
  try {
    event = await getPublishedEventBySlug(slug);
  } catch {
    // fall through to empty metadata
  }
  if (!event) return {};
  const description = event.summary ?? "An event from The Emerging Markets Network.";
  const cover = eventImageUrl(event.cover_path);
  return {
    title: `${event.title} | The Emerging Markets Network`,
    description,
    openGraph: {
      title: event.title,
      description,
      type: "website",
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let event: EventRecord | null = null;
  try {
    event = await getPublishedEventBySlug(slug);
  } catch (e) {
    console.error("[events] detail load failed:", e);
  }

  let isCommittee = false;
  try {
    isCommittee = (await getCommitteeSession()) !== null;
  } catch (e) {
    console.error("[events] session check failed:", e);
  }

  // Hidden-event preview: only committee, and only when the published lookup
  // missed (so a public page never hits the service-role read).
  if (!event && isCommittee) {
    try {
      event = await getEventAnyStatusBySlug(slug);
    } catch (e) {
      console.error("[events] hidden preview load failed:", e);
    }
  }
  if (!event) notFound();
  const ev = event; // narrowed & stable for closures below

  const past = isPastEvent(ev);
  const cover = eventImageUrl(ev.cover_path);
  // Committee needs photos even for upcoming events (to build the gallery
  // ahead of time); the public only sees them on past events.
  const photos = past || isCommittee ? await safeListPhotos(ev.id) : [];
  const location = ev.is_online
    ? "Online"
    : [ev.venue_name, ev.venue_address].filter(Boolean).join(", ");
  const timeStr = formatEventTime(ev.starts_at, ev);
  const paragraphs = (ev.description ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main className="px-3 pb-16 md:px-[18px] md:pb-[21px]">
      <div className="mx-auto mt-6 max-w-[1272px] px-0 md:mt-9 md:px-[18px]">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 rounded-[28px] border-2 border-emn-black px-5 py-2 text-sm font-bold text-emn-black transition-colors hover:bg-emn-black hover:text-emn-offwhite"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> All events
        </Link>

        <MediaBox
          src={cover}
          alt={ev.title}
          className="mt-[22px] h-[280px] rounded-[24px] md:h-[460px]"
        />

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-[1.55fr_1fr] md:gap-14">
          <div>
            <h1 className="font-candu text-[56px] uppercase leading-[0.9] text-emn-green-dark md:text-[92px]">
              {ev.title}
            </h1>
            {ev.summary && (
              <p className="mt-6 max-w-[640px] text-xl font-bold leading-[1.35] md:text-[22px]">
                {ev.summary}
              </p>
            )}
            {paragraphs.length > 0 && (
              <div className="mt-5 flex flex-col gap-4">
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="max-w-[640px] text-base leading-[1.55] text-emn-black/85 md:text-[17px]"
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-5 rounded-[30px] bg-emn-green-dark p-8 text-emn-offwhite md:sticky md:top-[118px]">
            <SideRow label="Date" value={formatEventDate(ev.starts_at, ev)} />
            {timeStr && <SideRow label="Time" value={timeStr} />}
            {location && <SideRow label="Location" value={location} />}
            <SideRow label="Type" value={capitalise(ev.category)} last />
            {past ? (
              <p className="rounded-[14px_0_14px_0] bg-emn-offwhite/[0.08] px-4 py-3.5 text-sm font-bold leading-[1.4] text-emn-offwhite/85">
                This event has ended. Thanks to everyone who came — browse the
                photos below.
              </p>
            ) : ev.rsvp_url ? (
              <Button
                href={ev.rsvp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full text-xl font-black"
                innerClassName="flex h-[55px] w-full items-center justify-center px-8"
                color="emn-green"
                outlineColor="emn-offwhite"
                textColor="white"
              >
                Sign up here
              </Button>
            ) : (
              <p className="rounded-[14px_0_14px_0] bg-emn-offwhite/[0.08] px-4 py-3.5 text-sm font-bold text-emn-offwhite/85">
                Sign-up details coming soon.
              </p>
            )}
          </aside>
        </div>

        {past && photos.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-[26px] font-candu text-[32px] uppercase leading-none text-emn-green-dark md:text-[44px]">
              Photo Gallery
            </h2>
            <div className="grid grid-cols-2 gap-[18px] md:grid-cols-3">
              {photos.map((photo) => (
                <MediaBox
                  key={photo.id}
                  src={eventImageUrl(photo.storage_path)}
                  alt={photo.caption ?? ev.title}
                  className="aspect-[4/3] rounded-[14px]"
                />
              ))}
            </div>
          </section>
        )}

        {isCommittee && (
          <>
            <EventEditor event={ev} />
            <EventPhotoManager eventId={ev.id} photos={photos} />
          </>
        )}
      </div>
    </main>
  );
}
