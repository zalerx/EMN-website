"use server";

// Uniform result shape so client components can branch without try/catch.
// Mirrors ActionResult in app/sponsors/actions.ts.
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

//
// Public newsletter signup (footer form). Adds the email to beehiiv via its
// Create Subscription API. Runs server-side so the API key never reaches the
// browser. beehiiv's endpoint is idempotent — re-subscribing an existing email
// returns 200 rather than erroring — so any 2xx counts as success.
//
export async function subscribeToNewsletter(
  rawEmail: string,
  source = "footer"
): Promise<ActionResult<undefined>> {
  const email = rawEmail?.trim().toLowerCase() ?? "";

  if (!email) return fail("Please enter your email address.");
  if (!EMAIL_RE.test(email)) return fail("That email doesn't look right.");

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    console.error("[newsletter] BEEHIIV_API_KEY/BEEHIIV_PUBLICATION_ID not set");
    return fail("Newsletter signup isn't set up right now — please try later.");
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          // Re-enrol someone who had previously unsubscribed.
          reactivate_existing: true,
          // Let the publication's double opt-in setting govern confirmation
          // emails; don't fire an extra welcome on top of it.
          send_welcome_email: false,
          utm_source: source,
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[newsletter] beehiiv responded ${res.status}: ${detail.slice(0, 300)}`
      );
      return fail("Couldn't sign you up — please try again shortly.");
    }
  } catch (err) {
    console.error("[newsletter] beehiiv request failed:", err);
    return fail("Couldn't sign you up — please try again shortly.");
  }

  return { ok: true, data: undefined };
}
