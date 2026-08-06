"use server";

import { revalidatePath } from "next/cache";
import matter from "gray-matter";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import { requireCommittee } from "@/app/lib/require-committee";
import { makeUniqueSlug, slugify } from "@/app/lib/articles/slug";
import type { Article, ArticleStatus } from "@/types/article";

// Uniform result shape so client components can branch without try/catch.
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const MAX_FILE_BYTES = 25 * 1024 * 1024;

const UPLOAD_FOLDERS: Record<string, string> = {
  "application/pdf": "pdf",
  "text/markdown": "md",
  "text/x-markdown": "md",
  "image/png": "covers",
  "image/jpeg": "covers",
  "image/webp": "covers",
};

function fail(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

function readingMinutes(markdownBody: string): number {
  const words = markdownBody.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function uniqueSlug(base: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("slug")
    .like("slug", `${base}%`);
  if (error) throw new Error(error.message);
  return makeUniqueSlug(
    base,
    ((data ?? []) as { slug: string }[]).map((r) => r.slug)
  );
}

function revalidateArticle(slug?: string) {
  revalidatePath("/articles");
  if (slug) revalidatePath(`/articles/${slug}`);
}

//
// Upload pipeline step 2: mint a signed upload URL so the file goes straight
// from the browser to Supabase Storage. Vercel functions cap request bodies
// around 4.5 MB, so the bytes must never route through the app server.
//
export async function createSignedUploadUrl(
  filename: string,
  contentType: string
): Promise<ActionResult<{ path: string; signedUrl: string; token: string }>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to upload files.");
  }

  const folder =
    UPLOAD_FOLDERS[contentType] ??
    (filename.toLowerCase().endsWith(".md") ? "md" : null);
  if (!folder) {
    return fail(
      "Unsupported file type. Upload a PDF, a Markdown (.md) file, or a PNG/JPEG/WebP cover image."
    );
  }

  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const path = `${folder}/${Date.now()}-${safeName || "upload"}`;

  const { data, error } = await supabaseAdmin.storage
    .from("articles")
    .createSignedUploadUrl(path);
  if (error || !data) {
    return fail(`Could not create an upload URL: ${error?.message ?? "unknown error"}`);
  }
  return {
    ok: true,
    data: { path: data.path, signedUrl: data.signedUrl, token: data.token },
  };
}

//
// Frontmatter prefill for the admin form. Parsing happens server-side so
// gray-matter (and its Buffer dependency) stays out of the client bundle.
//
export interface FrontmatterMeta {
  title?: string;
  author?: string;
  date?: string;
  summary?: string;
  tags: string[];
  body: string;
}

export async function extractFrontmatter(
  text: string
): Promise<ActionResult<FrontmatterMeta>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to do that.");
  }
  if (text.length > MAX_FILE_BYTES) return fail("File is too large.");

  try {
    const parsed = matter(text);
    const fm = parsed.data as Record<string, unknown>;
    const tags = Array.isArray(fm.tags)
      ? fm.tags.map(String)
      : typeof fm.tags === "string"
        ? fm.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    return {
      ok: true,
      data: {
        title: typeof fm.title === "string" ? fm.title : undefined,
        author: typeof fm.author === "string" ? fm.author : undefined,
        date:
          fm.date instanceof Date
            ? fm.date.toISOString()
            : typeof fm.date === "string"
              ? fm.date
              : undefined,
        summary: typeof fm.summary === "string" ? fm.summary : undefined,
        tags,
        body: parsed.content.trim(),
      },
    };
  } catch {
    return fail("That file's frontmatter is not valid YAML.");
  }
}

export interface CreateArticleInput {
  title: string;
  subtitle?: string;
  author: string;
  summary?: string;
  tags: string[];
  slug?: string;
  sourceType: "markdown" | "pdf";
  storagePath: string;
  coverPath?: string | null;
  // Raw markdown file text (frontmatter included); null for PDFs
  markdownText?: string | null;
}

export async function createArticle(
  input: CreateArticleInput
): Promise<ActionResult<{ slug: string }>> {
  let email: string;
  try {
    const session = await requireCommittee();
    email = session.user.email!;
  } catch {
    return fail("You need committee access to create articles.");
  }

  const title = input.title.trim();
  const author = input.author.trim();
  if (!title) return fail("Title is required.");
  if (!author) return fail("Author is required.");
  if (!input.storagePath) return fail("File upload did not complete.");

  let contentMd: string | null = null;
  if (input.sourceType === "markdown") {
    if (!input.markdownText) return fail("Markdown content is missing.");
    contentMd = matter(input.markdownText).content.trim();
    if (!contentMd) return fail("That markdown file has no content.");
  }

  try {
    const base = slugify(input.slug?.trim() || title);
    const slug = await uniqueSlug(base);
    const { error } = await supabaseAdmin.from("articles").insert({
      slug,
      title,
      subtitle: input.subtitle?.trim() || null,
      author,
      summary: input.summary?.trim() || null,
      tags: input.tags.map((t) => t.trim()).filter(Boolean),
      cover_path: input.coverPath ?? null,
      source_type: input.sourceType,
      storage_path: input.storagePath,
      content_md: contentMd,
      reading_minutes: contentMd ? readingMinutes(contentMd) : null,
      status: "draft",
      created_by: email,
    });
    if (error) return fail(`Could not save the article: ${error.message}`);
    revalidateArticle(slug);
    return { ok: true, data: { slug } };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not save the article.");
  }
}

export interface UpdateArticleInput {
  title: string;
  subtitle?: string;
  author: string;
  summary?: string;
  tags: string[];
  slug?: string;
}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput
): Promise<ActionResult<{ slug: string }>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to edit articles.");
  }

  const { data: existing, error: loadError } = await supabaseAdmin
    .from("articles")
    .select("id, slug, status, published_at")
    .eq("id", id)
    .maybeSingle();
  if (loadError || !existing) return fail("Article not found.");
  const current = existing as Pick<Article, "id" | "slug" | "status" | "published_at">;

  const title = input.title.trim();
  const author = input.author.trim();
  if (!title) return fail("Title is required.");
  if (!author) return fail("Author is required.");

  // Slug is editable before first publish, frozen after — published URLs
  // may already be shared and must not break.
  let slug = current.slug;
  const requestedSlug = input.slug ? slugify(input.slug) : "";
  const slugChanged = requestedSlug && requestedSlug !== current.slug;
  if (slugChanged) {
    if (current.status === "published" || current.published_at) {
      return fail("The slug is frozen once an article has been published.");
    }
    slug = await uniqueSlug(requestedSlug);
  }

  const { error } = await supabaseAdmin
    .from("articles")
    .update({
      slug,
      title,
      subtitle: input.subtitle?.trim() || null,
      author,
      summary: input.summary?.trim() || null,
      tags: input.tags.map((t) => t.trim()).filter(Boolean),
    })
    .eq("id", id);
  if (error) return fail(`Could not update the article: ${error.message}`);

  revalidateArticle(current.slug);
  if (slug !== current.slug) revalidateArticle(slug);
  return { ok: true, data: { slug } };
}

export async function setArticleStatus(
  id: string,
  status: ArticleStatus
): Promise<ActionResult<{ slug: string; status: ArticleStatus }>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to publish articles.");
  }

  const { data: existing, error: loadError } = await supabaseAdmin
    .from("articles")
    .select("slug, published_at")
    .eq("id", id)
    .maybeSingle();
  if (loadError || !existing) return fail("Article not found.");
  const current = existing as Pick<Article, "slug" | "published_at">;

  const update: { status: ArticleStatus; published_at?: string } = { status };
  // First publish stamps published_at; re-publishing keeps the original date.
  if (status === "published" && !current.published_at) {
    update.published_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from("articles")
    .update(update)
    .eq("id", id);
  if (error) return fail(`Could not change status: ${error.message}`);

  revalidateArticle(current.slug);
  return { ok: true, data: { slug: current.slug, status } };
}

export async function deleteArticle(
  id: string
): Promise<ActionResult<undefined>> {
  try {
    await requireCommittee();
  } catch {
    return fail("You need committee access to delete articles.");
  }

  const { data: existing, error: loadError } = await supabaseAdmin
    .from("articles")
    .select("slug, storage_path, cover_path")
    .eq("id", id)
    .maybeSingle();
  if (loadError || !existing) return fail("Article not found.");
  const current = existing as Pick<Article, "slug" | "storage_path" | "cover_path">;

  // Best-effort storage cleanup first; an orphaned file is recoverable,
  // an orphaned row pointing at a deleted file is not.
  const paths = [current.storage_path, current.cover_path].filter(
    (p): p is string => Boolean(p)
  );
  if (paths.length > 0) {
    const { error: storageError } = await supabaseAdmin.storage
      .from("articles")
      .remove(paths);
    if (storageError) {
      console.error("[articles] storage cleanup failed:", storageError.message);
    }
  }

  const { error } = await supabaseAdmin.from("articles").delete().eq("id", id);
  if (error) return fail(`Could not delete the article: ${error.message}`);

  revalidateArticle(current.slug);
  return { ok: true, data: undefined };
}
