export type ArticleStatus = "draft" | "published";
export type ArticleSourceType = "markdown" | "pdf";

// Mirrors public.articles (supabase/migrations/20260718000000_articles.sql).
// Timestamps are ISO strings as returned by supabase-js.
export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  author: string;
  summary: string | null;
  tags: string[];
  cover_path: string | null;
  source_type: ArticleSourceType;
  storage_path: string | null;
  content_md: string | null;
  reading_minutes: number | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Card/list projection — everything the index and admin table need,
// without dragging content_md over the wire.
export type ArticleListItem = Omit<Article, "content_md">;

// Fields a committee member supplies when creating or editing an article.
export type ArticleInput = Pick<
  Article,
  "title" | "subtitle" | "author" | "summary" | "tags"
> & {
  slug?: string;
  cover_path?: string | null;
  content_md?: string | null;
  storage_path?: string | null;
  reading_minutes?: number | null;
};

export type MemberRole = "member" | "committee" | "admin";
