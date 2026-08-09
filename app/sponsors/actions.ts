"use server";

import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import { requireCommittee } from "@/app/lib/require-committee";
import type { SponsorFit, SponsorInput, SponsorShape } from "@/types/sponsor";

// Uniform result shape so client components can branch without try/catch.
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// Public "Become a sponsor" enquiries land here. Kept in sync with the address
// shown on the sponsors page and used as the enquiry form's delivery target.
const SPONSOR_INBOX = "emergingmarketsnetworksponsors@gmail.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//
// Send a sponsorship enquiry to the club inbox over the same SMTP transport the
// membership magic-link flow uses (EMAIL_SERVER / EMAIL_FROM). This is a public
// action — no auth — so it only ever sends to the fixed SPONSOR_INBOX and never
// echoes the SMTP error back to the browser.
//
export async function sendSponsorEnquiry(input: {
  name: string;
  org: string;
  email: string;
  msg: string;
}): Promise<ActionResult<undefined>> {
  const name = input.name?.trim() ?? "";
  const org = input.org?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const msg = input.msg?.trim() ?? "";

  if (!name || !org || !email) {
    return fail("Please fill in your name, organisation and work email.");
  }
  if (!EMAIL_RE.test(email)) {
    return fail("That work email doesn't look right.");
  }

  const server = process.env.EMAIL_SERVER;
  const from = process.env.EMAIL_FROM;
  if (!server || !from) {
    console.error("[sponsors] EMAIL_SERVER/EMAIL_FROM not configured");
    return fail("Email isn't set up right now — please email us directly.");
  }

  const text = [
    `Name: ${name}`,
    `Organisation: ${org}`,
    `Work email: ${email}`,
    "",
    msg || "(no message)",
  ].join("\n");

  try {
    const transport = nodemailer.createTransport(server);
    await transport.sendMail({
      to: SPONSOR_INBOX,
      from, // must be the SMTP-authenticated sender, not the enquirer
      replyTo: email, // so "Reply" goes straight back to the enquirer
      subject: `Sponsorship enquiry — ${org || name}`,
      text,
    });
  } catch (err) {
    console.error("[sponsors] enquiry send failed:", err);
    return fail("Couldn't send your enquiry — please try again shortly.");
  }

  return { ok: true, data: undefined };
}

const LOGO_TYPES: Record<string, true> = {
  "image/png": true,
  "image/jpeg": true,
  "image/webp": true,
  "image/svg+xml": true,
};

function fail(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

function normaliseShape(shape: SponsorShape): SponsorShape {
  return shape === "circle" ? "circle" : "leaf";
}

function normaliseFit(fit: SponsorFit | undefined): SponsorFit {
  return fit === "contain" ? "contain" : "cover";
}

//
// Mint a signed upload URL so the logo goes straight from the browser to
// Supabase Storage. Vercel functions cap request bodies around 4.5 MB, so
// the bytes must never route through the app server (mirrors the articles
// upload pipeline).
//
export async function createSignedLogoUploadUrl(
  filename: string,
  contentType: string
): Promise<ActionResult<{ path: string; signedUrl: string; token: string }>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to upload logos.");
  }

  if (!LOGO_TYPES[contentType]) {
    return fail("Logos must be a PNG, JPEG, WebP or SVG image.");
  }

  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const path = `logos/${Date.now()}-${safeName || "logo"}`;

  const { data, error } = await supabaseAdmin.storage
    .from("sponsors")
    .createSignedUploadUrl(path);
  if (error || !data) {
    return fail(
      `Could not create an upload URL: ${error?.message ?? "unknown error"}`
    );
  }
  return {
    ok: true,
    data: { path: data.path, signedUrl: data.signedUrl, token: data.token },
  };
}

// Next sort_order = one past the current maximum, so new sponsors append.
async function nextSortOrder(): Promise<number> {
  const { data } = await supabaseAdmin
    .from("sponsors")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const top = (data as { sort_order: number } | null)?.sort_order ?? -1;
  return top + 1;
}

function cleanDetails(input: SponsorInput) {
  return {
    name: input.name.trim(),
    website: input.website?.trim() || null,
    shape: normaliseShape(input.shape),
    logo_fit: normaliseFit(input.logo_fit),
  };
}

export async function createSponsor(
  input: SponsorInput
): Promise<ActionResult<{ id: string }>> {
  let email: string;
  try {
    const session = await requireCommittee();
    email = session.user.email!;
  } catch {
    return fail("You need committee access to add sponsors.");
  }

  const details = cleanDetails(input);
  if (!details.name) return fail("Sponsor name is required.");

  const sort_order =
    typeof input.sort_order === "number" && !Number.isNaN(input.sort_order)
      ? input.sort_order
      : await nextSortOrder();

  const { data, error } = await supabaseAdmin
    .from("sponsors")
    .insert({
      ...details,
      logo_path: input.logo_path ?? null,
      sort_order,
      created_by: email,
    })
    .select("id")
    .maybeSingle();
  if (error) return fail(`Could not save the sponsor: ${error.message}`);

  revalidatePath("/sponsors");
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function updateSponsor(
  id: string,
  input: SponsorInput
): Promise<ActionResult<undefined>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to edit sponsors.");
  }

  const details = cleanDetails(input);
  if (!details.name) return fail("Sponsor name is required.");

  const update: Record<string, unknown> = { ...details };
  if (typeof input.sort_order === "number" && !Number.isNaN(input.sort_order)) {
    update.sort_order = input.sort_order;
  }
  // Only touch the logo when a fresh one was uploaded (path passed in);
  // an edit that leaves the logo alone omits logo_path entirely.
  if (input.logo_path !== undefined) {
    update.logo_path = input.logo_path;
  }

  const { error } = await supabaseAdmin
    .from("sponsors")
    .update(update)
    .eq("id", id);
  if (error) return fail(`Could not update the sponsor: ${error.message}`);

  revalidatePath("/sponsors");
  return { ok: true, data: undefined };
}

// Move a sponsor one place up (-1) or down (+1) in the display order. The
// whole list is renumbered to a clean 0..n-1 sequence so ordering stays unique
// and contiguous regardless of any legacy/duplicate sort_order values.
export async function moveSponsor(
  id: string,
  direction: -1 | 1
): Promise<ActionResult<undefined>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to reorder sponsors.");
  }

  const { data, error } = await supabaseAdmin
    .from("sponsors")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return fail(`Could not load sponsors: ${error.message}`);

  const rows = (data ?? []) as { id: string; sort_order: number }[];
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return fail("Sponsor not found.");

  const target = index + direction;
  if (target < 0 || target >= rows.length) {
    return { ok: true, data: undefined }; // already at the edge — no-op
  }

  const reordered = [...rows];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  // Write back only the rows whose position actually changed.
  const changed = reordered
    .map((row, i) => ({ id: row.id, next: i, prev: row.sort_order }))
    .filter((row) => row.next !== row.prev);
  for (const row of changed) {
    const { error: upErr } = await supabaseAdmin
      .from("sponsors")
      .update({ sort_order: row.next })
      .eq("id", row.id);
    if (upErr) return fail(`Could not reorder sponsors: ${upErr.message}`);
  }

  revalidatePath("/sponsors");
  return { ok: true, data: undefined };
}

export async function deleteSponsor(
  id: string
): Promise<ActionResult<undefined>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to delete sponsors.");
  }

  const { data: existing, error: loadError } = await supabaseAdmin
    .from("sponsors")
    .select("logo_path")
    .eq("id", id)
    .maybeSingle();
  if (loadError || !existing) return fail("Sponsor not found.");
  const logoPath = (existing as { logo_path: string | null }).logo_path;

  // Best-effort storage cleanup first; an orphaned file is recoverable,
  // an orphaned row pointing at a deleted file is not.
  if (logoPath) {
    const { error: storageError } = await supabaseAdmin.storage
      .from("sponsors")
      .remove([logoPath]);
    if (storageError) {
      console.error("[sponsors] logo cleanup failed:", storageError.message);
    }
  }

  const { error } = await supabaseAdmin.from("sponsors").delete().eq("id", id);
  if (error) return fail(`Could not delete the sponsor: ${error.message}`);

  revalidatePath("/sponsors");
  return { ok: true, data: undefined };
}
