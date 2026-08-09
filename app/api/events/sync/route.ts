import { NextResponse } from "next/server";
import { importNewEventbriteEvents } from "@/app/lib/events/import";
import { eventbriteConfigured } from "@/app/lib/events/eventbrite";

// This mutates the DB — never cache it.
export const dynamic = "force-dynamic";

// Scheduled Eventbrite import. Triggered by Vercel Cron (see vercel.json),
// which sends `Authorization: Bearer $CRON_SECRET` automatically when the
// CRON_SECRET env var is set. Also callable by hand for the first import or
// testing:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/events/sync
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured." },
      { status: 500 }
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }
  if (!eventbriteConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Eventbrite is not configured." },
      { status: 500 }
    );
  }

  try {
    const result = await importNewEventbriteEvents();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed.";
    console.error("[events] sync failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
