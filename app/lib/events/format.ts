import type { EventRecord } from "@/types/event";

// Display helpers for event dates. NOT server-only: both the server pages and
// the client card/manager format the same way.
//
// Dates render in the event's own timezone (falling back to Melbourne), so a
// 6pm Melbourne event never shows as 8am to a visitor in another zone.
const DEFAULT_TZ = "Australia/Melbourne";

function tzOf(event: Pick<EventRecord, "timezone">): string {
  return event.timezone || DEFAULT_TZ;
}

// "AUGUST 6 2026" — matches the uppercase mock treatment. en-US gives the
// MONTH DAY YEAR order in the design (en-AU would be DAY MONTH YEAR).
export function formatEventDate(
  iso: string | null,
  event: Pick<EventRecord, "timezone">
): string {
  if (!iso) return "DATE TBC";
  return new Date(iso)
    .toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: tzOf(event),
    })
    .toUpperCase();
}

// "6:00PM"
export function formatEventTime(
  iso: string | null,
  event: Pick<EventRecord, "timezone">
): string | null {
  if (!iso) return null;
  return new Date(iso)
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: tzOf(event),
    })
    .replace(/\s+/g, "")
    .toUpperCase();
}

// "AUGUST 6 2026, 6:00PM" — the combined stamp used on cards and the hero.
export function formatEventDateTime(
  iso: string | null,
  event: Pick<EventRecord, "timezone">
): string {
  const date = formatEventDate(iso, event);
  const time = formatEventTime(iso, event);
  return time ? `${date}, ${time}` : date;
}

// "YYYY-MM-DDTHH:mm" in the browser's local timezone — the value shape a
// <input type="datetime-local"> expects. Empty string for null. The inverse
// (input value → ISO) is just `new Date(value).toISOString()`.
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// An event is "past" once it has ended (or, lacking an end time, once it has
// started). Events with no date at all are treated as upcoming.
export function isPastEvent(
  event: Pick<EventRecord, "starts_at" | "ends_at">,
  now: number = Date.now()
): boolean {
  const end = event.ends_at ?? event.starts_at;
  if (!end) return false;
  return new Date(end).getTime() < now;
}
