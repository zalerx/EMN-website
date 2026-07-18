import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import type { Article, ArticleListItem } from "@/types/article";

export const ARTICLES_PER_PAGE = 12;

// Public reads use the anon key so RLS (published-only) stays in the loop
// even if a query here is ever written too loosely. Created lazily so a
// missing env var fails at request time with a clear message, not at import.
let anon: SupabaseClient | null = null;
function supabaseAnonServer(): SupabaseClient {
  if (!anon) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    anon = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return anon;
}

const LIST_COLUMNS =
  "id, slug, title, subtitle, author, summary, tags, cover_path, source_type, storage_path, reading_minutes, status, published_at, created_at, updated_at, created_by";

// PostgREST or() filters are comma/paren-delimited, so free-text search
// input is reduced to characters that cannot alter the filter syntax.
function sanitizeSearch(q: string): string {
  return q.replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
}

export interface PublishedArticlesPage {
  articles: ArticleListItem[];
  total: number;
}

export async function listPublishedArticles({
  query,
  tag,
  page = 1,
}: {
  query?: string;
  tag?: string;
  page?: number;
}): Promise<PublishedArticlesPage> {
  const from = (page - 1) * ARTICLES_PER_PAGE;
  let request = supabaseAnonServer()
    .from("articles")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, from + ARTICLES_PER_PAGE - 1);

  const q = query ? sanitizeSearch(query) : "";
  if (q) {
    request = request.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
  }
  if (tag) {
    request = request.contains("tags", [tag]);
  }

  const { data, error, count } = await request;
  if (error) throw new Error(`Failed to list articles: ${error.message}`);
  return { articles: (data ?? []) as ArticleListItem[], total: count ?? 0 };
}

export async function getPublishedArticleBySlug(
  slug: string
): Promise<Article | null> {
  const { data, error } = await supabaseAnonServer()
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load article: ${error.message}`);
  return data as Article | null;
}

// All published tags, deduplicated, for the index filter bar.
export async function listPublishedTags(): Promise<string[]> {
  const { data, error } = await supabaseAnonServer()
    .from("articles")
    .select("tags")
    .eq("status", "published");
  if (error) throw new Error(`Failed to load tags: ${error.message}`);
  const tags = new Set<string>();
  for (const row of (data ?? []) as { tags: string[] }[]) {
    for (const t of row.tags) tags.add(t);
  }
  return [...tags].sort();
}

export async function getAdjacentArticles(
  publishedAt: string
): Promise<{ prev: ArticleListItem | null; next: ArticleListItem | null }> {
  const client = supabaseAnonServer();
  const [prevRes, nextRes] = await Promise.all([
    client
      .from("articles")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .lt("published_at", publishedAt)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("articles")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .gt("published_at", publishedAt)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  return {
    prev: (prevRes.data as ArticleListItem | null) ?? null,
    next: (nextRes.data as ArticleListItem | null) ?? null,
  };
}

//
// Committee-only reads. These use the service-role client, so callers must
// have already passed a committee check (getCommitteeSession/requireCommittee).
//

export async function getArticleAnyStatusBySlug(
  slug: string
): Promise<Article | null> {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load article: ${error.message}`);
  return data as Article | null;
}

export async function listAllArticles(): Promise<ArticleListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to list articles: ${error.message}`);
  return (data ?? []) as ArticleListItem[];
}

// Short-lived signed URL for a private-bucket object (PDFs, covers,
// markdown originals). One hour: long enough to read an article, short
// enough that a leaked URL goes stale the same afternoon.
export async function getSignedFileUrl(path: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.storage
    .from("articles")
    .createSignedUrl(path, 60 * 60);
  if (error) {
    console.error("[articles] failed to sign storage URL:", error.message);
    return null;
  }
  return data.signedUrl;
}
