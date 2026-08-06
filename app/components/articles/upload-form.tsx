"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import Button from "@/app/components/button";
import { cn } from "@/app/lib/utils";
import { slugify } from "@/app/lib/articles/slug";
import {
  createArticle,
  createSignedUploadUrl,
  extractFrontmatter,
} from "@/app/articles/actions";

const MAX_ARTICLE_BYTES = 25 * 1024 * 1024;
const MAX_COVER_BYTES = 5 * 1024 * 1024;
const COVER_TYPES = ["image/png", "image/jpeg", "image/webp"];

type UploadPhase =
  | { kind: "idle" }
  | { kind: "uploading"; percent: number }
  | { kind: "saving" }
  | { kind: "done"; slug: string }
  | { kind: "error"; message: string };

interface Meta {
  title: string;
  subtitle: string;
  author: string;
  summary: string;
  tags: string;
  slug: string;
}

const EMPTY_META: Meta = {
  title: "",
  subtitle: "",
  author: "",
  summary: "",
  tags: "",
  slug: "",
};

function isMarkdown(file: File): boolean {
  return (
    file.type === "text/markdown" ||
    file.type === "text/x-markdown" ||
    file.name.toLowerCase().endsWith(".md")
  );
}

function articleFileError(file: File): string | null {
  if (file.type !== "application/pdf" && !isMarkdown(file)) {
    return "Only PDF and Markdown (.md) files are supported.";
  }
  if (file.size > MAX_ARTICLE_BYTES) {
    return "That file is over the 25 MB limit.";
  }
  return null;
}

// Signed-URL upload via XHR instead of supabase-js uploadToSignedUrl,
// because XHR exposes real upload progress events and fetch does not.
function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (fraction: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (HTTP ${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
}

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-[0.12em] text-emn-offwhite"
      >
        {label}
        {required && <span className="text-emn-green"> *</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-emn-offwhite/70">{hint}</p>}
    </div>
  );
}

const inputClasses =
  "w-full rounded-[16px] border-2 border-emn-offwhite bg-emn-offwhite px-4 py-2.5 text-base text-emn-black placeholder:text-emn-black/40 focus:border-emn-green focus:outline-none";

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [markdownText, setMarkdownText] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<Meta>(EMPTY_META);
  const [slugTouched, setSlugTouched] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [phase, setPhase] = useState<UploadPhase>({ kind: "idle" });

  const busy = phase.kind === "uploading" || phase.kind === "saving";
  const slugPreview = meta.slug || slugify(meta.title);

  function setMetaField(field: keyof Meta, value: string) {
    setMeta((m) => ({ ...m, [field]: value }));
  }

  async function acceptFile(candidate: File) {
    const error = articleFileError(candidate);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError(null);
    setFile(candidate);
    setPhase({ kind: "idle" });

    if (isMarkdown(candidate)) {
      const text = await candidate.text();
      setMarkdownText(text);
      const result = await extractFrontmatter(text);
      if (result.ok) {
        const fm = result.data;
        setMeta((m) => ({
          ...m,
          title: fm.title ?? m.title,
          author: fm.author ?? m.author,
          summary: fm.summary ?? m.summary,
          tags: fm.tags.length > 0 ? fm.tags.join(", ") : m.tags,
        }));
      }
    } else {
      setMarkdownText(null);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    if (busy) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) void acceptFile(dropped);
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) void acceptFile(picked);
  }

  function onCoverPick(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!COVER_TYPES.includes(picked.type)) {
      setFileError("Covers must be PNG, JPEG or WebP.");
      return;
    }
    if (picked.size > MAX_COVER_BYTES) {
      setFileError("Covers must be under 5 MB.");
      return;
    }
    setFileError(null);
    setCoverFile(picked);
  }

  function resetForm() {
    setFile(null);
    setMarkdownText(null);
    setCoverFile(null);
    setMeta(EMPTY_META);
    setSlugTouched(false);
    setFileError(null);
    setPhase({ kind: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || busy) return;

    const sourceType = isMarkdown(file) ? "markdown" : "pdf";
    const contentType =
      sourceType === "markdown" ? "text/markdown" : "application/pdf";

    try {
      // 1. Ask the server for a signed upload URL (committee check happens there)
      setPhase({ kind: "uploading", percent: 0 });
      const signed = await createSignedUploadUrl(file.name, contentType);
      if (!signed.ok) throw new Error(signed.error);

      // 2. Stream the file straight to Supabase Storage — never via our server
      const coverShare = coverFile ? 0.8 : 1;
      await putWithProgress(signed.data.signedUrl, file, contentType, (f) =>
        setPhase({ kind: "uploading", percent: Math.round(f * 90 * coverShare) })
      );

      // 3. Cover image, if any, goes the same way
      let coverPath: string | null = null;
      if (coverFile) {
        const signedCover = await createSignedUploadUrl(
          coverFile.name,
          coverFile.type
        );
        if (!signedCover.ok) throw new Error(signedCover.error);
        await putWithProgress(
          signedCover.data.signedUrl,
          coverFile,
          coverFile.type,
          (f) => setPhase({ kind: "uploading", percent: Math.round(72 + f * 18) })
        );
        coverPath = signedCover.data.path;
      }

      // 4. Write the row (server action re-verifies the committee role)
      setPhase({ kind: "saving" });
      const created = await createArticle({
        title: meta.title,
        subtitle: meta.subtitle || undefined,
        author: meta.author,
        summary: meta.summary || undefined,
        tags: meta.tags.split(",").map((t) => t.trim()).filter(Boolean),
        slug: meta.slug || undefined,
        sourceType,
        storagePath: signed.data.path,
        coverPath,
        markdownText,
      });
      if (!created.ok) throw new Error(created.error);

      setPhase({ kind: "done", slug: created.data.slug });
      router.refresh();
    } catch (err) {
      setPhase({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Something went wrong. Try again.",
      });
    }
  }

  if (phase.kind === "done") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[16px] bg-emn-offwhite p-6">
        <p className="inline-flex items-center gap-2 font-candu text-2xl uppercase text-emn-green-dark">
          <CheckCircle2 className="h-6 w-6" aria-hidden /> Draft saved
        </p>
        <p className="text-base text-emn-black">
          The article was uploaded as a draft. Preview it, then publish from
          the table beside this form.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/articles/${phase.slug}`}
            className="font-bold text-emn-green-dark underline decoration-emn-green decoration-2 underline-offset-4"
          >
            Preview draft
          </Link>
          <button
            type="button"
            onClick={resetForm}
            className="font-bold text-emn-black underline decoration-emn-black/30 decoration-2 underline-offset-4"
          >
            Upload another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* File drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center gap-3 rounded-[18px] border-[3px] border-dashed px-6 py-10 text-center transition-colors",
          dragActive
            ? "border-emn-green bg-emn-green/15"
            : "border-emn-offwhite/50 bg-emn-offwhite/[0.06] hover:border-emn-green hover:bg-emn-green/[0.12]"
        )}
      >
        <UploadCloud className="h-10 w-10 text-emn-offwhite/70" aria-hidden />
        {file ? (
          <p className="inline-flex items-center gap-2 text-base font-semibold text-emn-offwhite">
            <FileText className="h-5 w-5" aria-hidden />
            {file.name}
            <button
              type="button"
              onClick={resetForm}
              aria-label="Remove selected file"
              className="rounded-full p-1 hover:bg-emn-offwhite/15"
              disabled={busy}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </p>
        ) : (
          <>
            <p className="font-candu text-xl uppercase text-emn-offwhite">
              Drop file here
            </p>
            <p className="text-sm text-emn-offwhite/70">
              .md or .pdf — up to 25 MB
            </p>
          </>
        )}
        <label className="cursor-pointer font-bold text-emn-green underline decoration-emn-green decoration-2 underline-offset-4 focus-within:ring-2 focus-within:ring-emn-green">
          {file ? "Choose a different file" : "or browse for a file"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.md,application/pdf,text/markdown"
            onChange={onPick}
            disabled={busy}
            className="sr-only"
          />
        </label>
      </div>

      {fileError && (
        <p role="alert" className="rounded-[12px] border-2 border-red-700 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {fileError}
        </p>
      )}

      {/* Metadata */}
      {file && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field id="article-title" label="Title" required>
            <input
              id="article-title"
              type="text"
              required
              value={meta.title}
              onChange={(e) => {
                setMetaField("title", e.target.value);
                if (!slugTouched) setMetaField("slug", "");
              }}
              disabled={busy}
              className={inputClasses}
            />
          </Field>
          <Field id="article-author" label="Author" required>
            <input
              id="article-author"
              type="text"
              required
              value={meta.author}
              onChange={(e) => setMetaField("author", e.target.value)}
              disabled={busy}
              className={inputClasses}
            />
          </Field>
          <Field id="article-subtitle" label="Subtitle">
            <input
              id="article-subtitle"
              type="text"
              value={meta.subtitle}
              onChange={(e) => setMetaField("subtitle", e.target.value)}
              disabled={busy}
              className={inputClasses}
            />
          </Field>
          <Field
            id="article-tags"
            label="Tags"
            hint="Comma-separated, e.g. economics, primer"
          >
            <input
              id="article-tags"
              type="text"
              value={meta.tags}
              onChange={(e) => setMetaField("tags", e.target.value)}
              disabled={busy}
              className={inputClasses}
            />
          </Field>
          <div className="md:col-span-2">
            <Field id="article-summary" label="Summary">
              <textarea
                id="article-summary"
                rows={3}
                value={meta.summary}
                onChange={(e) => setMetaField("summary", e.target.value)}
                disabled={busy}
                className={inputClasses}
              />
            </Field>
          </div>
          <Field
            id="article-slug"
            label="Slug"
            hint={
              slugPreview
                ? `Will publish at /articles/${slugify(slugPreview)}`
                : "Generated from the title if left blank"
            }
          >
            <input
              id="article-slug"
              type="text"
              value={meta.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setMetaField("slug", e.target.value);
              }}
              disabled={busy}
              className={inputClasses}
            />
          </Field>
          <Field
            id="article-cover"
            label="Cover image"
            hint="Optional. PNG, JPEG or WebP up to 5 MB."
          >
            <input
              id="article-cover"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onCoverPick}
              disabled={busy}
              className="text-sm text-emn-offwhite/80 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-emn-offwhite file:px-4 file:py-1.5 file:text-sm file:font-bold file:text-emn-black"
            />
          </Field>
        </div>
      )}

      {/* Progress + errors */}
      {phase.kind === "uploading" && (
        <div className="flex flex-col gap-2">
          <div
            role="progressbar"
            aria-valuenow={phase.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Upload progress"
            className="h-3 w-full overflow-hidden rounded-full border-2 border-emn-offwhite/40 bg-emn-offwhite/10"
          >
            <div
              className="h-full bg-emn-green transition-[width] duration-200"
              style={{ width: `${phase.percent}%` }}
            />
          </div>
          <p className="text-sm font-bold text-emn-offwhite">
            Uploading… {phase.percent}%
          </p>
        </div>
      )}
      {phase.kind === "saving" && (
        <p className="text-sm font-bold text-emn-offwhite">Saving article…</p>
      )}
      {phase.kind === "error" && (
        <p role="alert" className="rounded-[12px] border-2 border-red-700 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {phase.message}
        </p>
      )}

      {file && (
        <div>
          <Button
            className="text-base font-black"
            color="emn-green"
            outlineColor="emn-offwhite"
            textColor="white"
            disabled={busy || !meta.title.trim() || !meta.author.trim()}
          >
            {busy ? "Working…" : "Upload as draft"}
          </Button>
        </div>
      )}
    </form>
  );
}
