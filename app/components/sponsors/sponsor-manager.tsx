"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Pencil, Trash2, X } from "lucide-react";
import Button from "@/app/components/button";
import { logoUrl } from "@/app/lib/sponsors/logo";
import {
  createSignedLogoUploadUrl,
  createSponsor,
  deleteSponsor,
  moveSponsor,
  updateSponsor,
} from "@/app/sponsors/actions";
import type { Sponsor, SponsorFit, SponsorShape } from "@/types/sponsor";

const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const inputClasses =
  "w-full rounded-[12px] border-2 border-emn-offwhite bg-emn-offwhite px-3 py-2 text-sm text-emn-black placeholder:text-emn-black/40 focus:border-emn-green focus:outline-none";
const labelClasses =
  "text-xs font-bold uppercase tracking-[0.12em] text-emn-offwhite";
const fileClasses =
  "text-sm text-emn-offwhite/80 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-emn-offwhite file:px-4 file:py-1.5 file:text-sm file:font-bold file:text-emn-black";

function logoFileError(file: File): string | null {
  if (!LOGO_TYPES.includes(file.type)) {
    return "Logos must be a PNG, JPEG, WebP or SVG image.";
  }
  if (file.size > MAX_LOGO_BYTES) {
    return "That logo is over the 2 MB limit.";
  }
  return null;
}

// Signed-URL upload: the file streams straight from the browser to Supabase
// Storage (the server only mints the URL after a committee check). Returns the
// stored object path.
async function uploadLogo(file: File): Promise<string> {
  const signed = await createSignedLogoUploadUrl(file.name, file.type);
  if (!signed.ok) throw new Error(signed.error);
  const res = await fetch(signed.data.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`Logo upload failed (HTTP ${res.status}).`);
  return signed.data.path;
}

function Labelled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelClasses}>{label}</span>
      {children}
    </label>
  );
}

function AddSponsorForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [shape, setShape] = useState<SponsorShape>("leaf");
  const [fit, setFit] = useState<SponsorFit>("cover");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    if (picked) {
      const err = logoFileError(picked);
      if (err) {
        setError(err);
        setFile(null);
        return;
      }
    }
    setError(null);
    setFile(picked);
  }

  function reset() {
    setName("");
    setWebsite("");
    setShape("leaf");
    setFit("cover");
    setFile(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (!name.trim()) {
      setError("Sponsor name is required.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const logo_path = file ? await uploadLogo(file) : null;
      const result = await createSponsor({
        name,
        website: website || null,
        shape,
        logo_fit: fit,
        logo_path,
      });
      if (!result.ok) throw new Error(result.error);
      reset();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not add the sponsor."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Labelled label="Name *">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            placeholder="Sponsor name"
            className={inputClasses}
          />
        </Labelled>
        <Labelled label="Website">
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={busy}
            placeholder="https://example.com"
            className={inputClasses}
          />
        </Labelled>
        <Labelled label="Tile shape">
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value as SponsorShape)}
            disabled={busy}
            className={inputClasses}
          >
            <option value="leaf">Leaf</option>
            <option value="circle">Circle</option>
          </select>
        </Labelled>
        <Labelled label="Logo fit">
          <select
            value={fit}
            onChange={(e) => setFit(e.target.value as SponsorFit)}
            disabled={busy}
            className={inputClasses}
          >
            <option value="cover">Fill shape (crop to edges)</option>
            <option value="contain">Fit inside (show whole logo)</option>
          </select>
        </Labelled>
        <div className="md:col-span-2">
          <Labelled label="Logo (PNG, JPEG, WebP or SVG · up to 2 MB)">
            <input
              ref={fileRef}
              type="file"
              accept={LOGO_TYPES.join(",")}
              onChange={onPick}
              disabled={busy}
              className={fileClasses}
            />
          </Labelled>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-[12px] border-2 border-red-700 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
        >
          {error}
        </p>
      )}

      <div>
        <Button
          className="text-base font-black"
          color="emn-green"
          outlineColor="emn-offwhite"
          textColor="white"
          disabled={busy || !name.trim()}
        >
          {busy ? "Adding…" : "Add sponsor"}
        </Button>
      </div>
    </form>
  );
}

function SponsorRow({
  sponsor,
  isFirst,
  isLast,
}: {
  sponsor: Sponsor;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(sponsor.name);
  const [website, setWebsite] = useState(sponsor.website ?? "");
  const [shape, setShape] = useState<SponsorShape>(sponsor.shape);
  const [fit, setFit] = useState<SponsorFit>(sponsor.logo_fit);
  const [newLogo, setNewLogo] = useState<File | null>(null);

  const currentLogo = logoUrl(sponsor.logo_path);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      setEditing(false);
      setConfirmingDelete(false);
      setNewLogo(null);
      router.refresh();
    });
  }

  function onLogoPick(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    if (picked) {
      const err = logoFileError(picked);
      if (err) {
        setError(err);
        setNewLogo(null);
        return;
      }
    }
    setError(null);
    setNewLogo(picked);
  }

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Sponsor name is required.");
      return;
    }
    run(async () => {
      // Upload a replacement logo first (if chosen); otherwise leave the
      // existing one untouched by omitting logo_path.
      let logo_path: string | undefined;
      if (newLogo) {
        try {
          logo_path = await uploadLogo(newLogo);
        } catch (err) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : "Logo upload failed.",
          };
        }
      }
      return updateSponsor(sponsor.id, {
        name,
        website: website || null,
        shape,
        logo_fit: fit,
        ...(logo_path !== undefined ? { logo_path } : {}),
      });
    });
  }

  return (
    <div
      className={`rounded-[16px] bg-emn-offwhite/[0.08] p-4 ${pending ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white">
          {currentLogo ? (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase public bucket
            <img
              src={currentLogo}
              alt={sponsor.name}
              className="max-h-full max-w-full object-contain p-1.5"
            />
          ) : (
            <span className="text-[10px] font-bold text-emn-black/50">
              No logo
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-emn-offwhite">{sponsor.name}</p>
          <p className="truncate text-xs text-emn-offwhite/60">
            {sponsor.website || "No website"} · {sponsor.shape} ·{" "}
            {sponsor.logo_fit === "contain" ? "fit" : "fill"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm font-bold">
          <div className="flex items-center">
            <button
              type="button"
              disabled={pending || isFirst}
              onClick={() => run(() => moveSponsor(sponsor.id, -1))}
              aria-label={`Move ${sponsor.name} up`}
              className="rounded p-1 text-emn-offwhite hover:bg-emn-offwhite/15 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              disabled={pending || isLast}
              onClick={() => run(() => moveSponsor(sponsor.id, 1))}
              aria-label={`Move ${sponsor.name} down`}
              className="rounded p-1 text-emn-offwhite hover:bg-emn-offwhite/15 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setEditing((v) => !v);
              setConfirmingDelete(false);
            }}
            className="text-emn-offwhite underline decoration-emn-offwhite/40 underline-offset-2"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          {confirmingDelete ? (
            <span className="inline-flex items-center gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => deleteSponsor(sponsor.id))}
                className="text-red-300 underline underline-offset-2"
              >
                Confirm
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
              onClick={() => {
                setConfirmingDelete(true);
                setEditing(false);
              }}
              aria-label={`Delete ${sponsor.name}`}
              className="inline-flex items-center gap-1 text-red-300 underline decoration-red-300/40 underline-offset-2"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Delete
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form
          onSubmit={onSave}
          className="mt-4 grid grid-cols-1 gap-3 border-t-2 border-emn-offwhite/15 pt-4 md:grid-cols-2"
        >
          <Labelled label="Name *">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
            />
          </Labelled>
          <Labelled label="Website">
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={inputClasses}
            />
          </Labelled>
          <Labelled label="Tile shape">
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as SponsorShape)}
              className={inputClasses}
            >
              <option value="leaf">Leaf</option>
              <option value="circle">Circle</option>
            </select>
          </Labelled>
          <Labelled label="Logo fit">
            <select
              value={fit}
              onChange={(e) => setFit(e.target.value as SponsorFit)}
              className={inputClasses}
            >
              <option value="cover">Fill shape (crop to edges)</option>
              <option value="contain">Fit inside (show whole logo)</option>
            </select>
          </Labelled>
          <div className="md:col-span-2">
            <Labelled label="Replace logo (optional)">
              <input
                ref={fileRef}
                type="file"
                accept={LOGO_TYPES.join(",")}
                onChange={onLogoPick}
                className={fileClasses}
              />
            </Labelled>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full border-2 border-emn-offwhite bg-emn-green px-5 py-1.5 text-sm font-black text-white disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-bold text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export default function SponsorManager({ sponsors }: { sponsors: Sponsor[] }) {
  const [open, setOpen] = useState(false);

  // Collapsed by default: committee/admins get an entry point, not a panel
  // that's always taking up space on the page.
  if (!open) {
    return (
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-emn-green-dark px-4 py-2 text-sm font-bold text-emn-green-dark transition-colors hover:bg-emn-green-dark hover:text-white"
        >
          <Pencil className="h-4 w-4" aria-hidden /> Edit sponsors
        </button>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="manage-sponsors-heading"
      className="mt-10 rounded-[30px] bg-emn-green-dark p-7 text-emn-offwhite md:p-9"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3
            id="manage-sponsors-heading"
            className="font-candu text-3xl uppercase leading-none md:text-[40px]"
          >
            Manage Sponsors
          </h3>
          <p className="mt-2 text-sm text-emn-offwhite/85">
            Committee only. Add a sponsor with its logo, or edit and remove
            existing ones. Changes appear on this page immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-emn-offwhite px-4 py-2 text-sm font-bold text-emn-offwhite transition-colors hover:bg-emn-offwhite hover:text-emn-green-dark"
        >
          <X className="h-4 w-4" aria-hidden /> Done
        </button>
      </div>

      <div className="mt-6">
        <AddSponsorForm />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-emn-offwhite/70">
          {sponsors.length > 0
            ? `Current sponsors (${sponsors.length})`
            : "No sponsors yet"}
        </h4>
        {sponsors.map((sponsor, i) => (
          <SponsorRow
            key={sponsor.id}
            sponsor={sponsor}
            isFirst={i === 0}
            isLast={i === sponsors.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
