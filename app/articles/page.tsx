import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import Container from "@/app/components/container";
import ArticleGrid from "@/app/components/articles/article-grid";
import {
  ARTICLES_PER_PAGE,
  getSignedFileUrl,
  listPublishedArticles,
  listPublishedTags,
} from "@/app/lib/articles/queries";
import { cn } from "@/app/lib/utils";

export const metadata: Metadata = {
  title: "Articles | The Emerging Markets Network",
  description:
    "Research, analysis and commentary on emerging markets from the EMN community.",
};

function pageHref(params: { q?: string; tag?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.tag) search.set("tag", params.tag);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/articles?${qs}` : "/articles";
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ articles, total }, tags] = await Promise.all([
    listPublishedArticles({ query: q, tag, page }),
    listPublishedTags(),
  ]);

  const coverUrls: Record<string, string | null> = {};
  await Promise.all(
    articles.map(async (article) => {
      coverUrls[article.id] = article.cover_path
        ? await getSignedFileUrl(article.cover_path)
        : null;
    })
  );

  const totalPages = Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE));
  const isFiltered = Boolean(q || tag);

  return (
    <div className="min-h-screen bg-background p-3 md:p-8">
      <Container className="max-w-[1236px]">
        <h1 className="mb-6 font-candu text-5xl leading-extra-tight tracking-tight text-[#231f20] md:text-[5rem]">
          ARTICLES
        </h1>
        <p className="mb-8 max-w-[820px] font-medium text-foreground/80 md:text-xl">
          Research, analysis and commentary on the emerging world, written by
          the EMN community.
        </p>

        {/* Search + tag filter — plain GET form, filtering happens server-side */}
        <form action="/articles" method="get" className="mb-6">
          {tag && <input type="hidden" name="tag" value={tag} />}
          <label htmlFor="article-search" className="sr-only">
            Search articles
          </label>
          <div className="relative max-w-[480px]">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emn-black/50"
              aria-hidden
            />
            <input
              id="article-search"
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by title or summary"
              className="h-12 w-full rounded-full border-2 border-black bg-emn-offwhite pl-12 pr-4 text-base text-black placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-emn-green"
            />
          </div>
        </form>

        {tags.length > 0 && (
          <nav aria-label="Filter by tag" className="mb-10">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href={pageHref({ q })}
                  className={cn(
                    "inline-block rounded-full border-2 border-black px-4 py-1.5 text-sm font-bold transition-colors",
                    !tag
                      ? "bg-emn-black text-white"
                      : "bg-white text-emn-black hover:bg-emn-offwhite"
                  )}
                >
                  All
                </Link>
              </li>
              {tags.map((t) => (
                <li key={t}>
                  <Link
                    href={pageHref({ q, tag: t === tag ? undefined : t })}
                    className={cn(
                      "inline-block rounded-full border-2 border-black px-4 py-1.5 text-sm font-bold transition-colors",
                      t === tag
                        ? "bg-emn-green text-white"
                        : "bg-white text-emn-black hover:bg-emn-offwhite"
                    )}
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {articles.length > 0 ? (
          <ArticleGrid articles={articles} coverUrls={coverUrls} />
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-[16px] border-2 border-dashed border-emn-black/30 px-6 py-16 text-center">
            <p className="font-candu text-3xl uppercase text-emn-black">
              {isFiltered ? "No matches" : "Nothing here yet"}
            </p>
            <p className="max-w-[480px] text-base text-emn-black/70">
              {isFiltered
                ? "No articles match that search. Try a different term or clear the filters."
                : "The committee is busy writing. Check back soon — or follow our socials for the latest."}
            </p>
            {isFiltered && (
              <Link
                href="/articles"
                className="font-bold text-emn-green-dark underline decoration-emn-green decoration-2 underline-offset-4"
              >
                Clear filters
              </Link>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-center gap-6 text-base font-bold text-emn-black"
          >
            {page > 1 ? (
              <Link
                href={pageHref({ q, tag, page: page - 1 })}
                className="underline decoration-emn-green decoration-2 underline-offset-4"
              >
                ← Newer
              </Link>
            ) : (
              <span className="text-emn-black/30">← Newer</span>
            )}
            <span aria-current="page">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={pageHref({ q, tag, page: page + 1 })}
                className="underline decoration-emn-green decoration-2 underline-offset-4"
              >
                Older →
              </Link>
            ) : (
              <span className="text-emn-black/30">Older →</span>
            )}
          </nav>
        )}
      </Container>
    </div>
  );
}
