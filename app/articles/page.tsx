import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import Button from "@/app/components/button";
import ArticleGrid from "@/app/components/articles/article-grid";
import TheNumbers from "@/app/components/articles/the-numbers";
import { getCommitteeSession } from "@/app/lib/require-committee";
import {
  ARTICLES_PER_PAGE,
  getSignedFileUrl,
  listPublishedArticles,
  listPublishedTags,
} from "@/app/lib/articles/queries";
import { cn } from "@/app/lib/utils";

export const metadata: Metadata = {
  title: "Research | The Emerging Markets Network",
  description:
    "In-house research and commentary from the EMN committee — on the economies, markets and politics shaping the emerging world.",
};

function pageHref(params: { q?: string; tag?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.tag) search.set("tag", params.tag);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/articles?${qs}` : "/articles";
}

function tagPill(active: boolean) {
  return cn(
    "inline-block rounded-[18px] border-2 border-emn-green-dark px-4 py-1.5 text-[13px] font-bold uppercase tracking-[0.02em] transition-colors",
    active
      ? "bg-emn-green-dark text-emn-offwhite"
      : "bg-transparent text-emn-green-dark hover:bg-emn-green/15"
  );
}

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ articles, total }, tags, committee] = await Promise.all([
    listPublishedArticles({ query: q, tag, page }),
    listPublishedTags(),
    getCommitteeSession(),
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
    <main className="px-3 pb-16 md:px-[18px]">
      {/* Page head */}
      <section className="mx-auto flex max-w-[720px] flex-col items-center gap-5 px-3 pt-10 text-center md:pt-16">
        <h1 className="font-candu text-6xl uppercase leading-[0.9] text-emn-green-dark md:text-8xl lg:text-[120px]">
          Research
        </h1>
        <p className="text-base font-medium text-emn-black/85 md:text-xl">
          In-house research and commentary from the EMN committee — on the
          economies, markets and politics shaping the emerging world.
        </p>
      </section>

      {/* The Numbers */}
      <div className="mx-auto mt-16 max-w-[1236px] px-3 md:px-[18px]">
        <TheNumbers />
      </div>

      {/* Articles */}
      <div className="mx-auto mt-16 max-w-[1236px] px-3 md:px-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-candu text-3xl uppercase leading-none text-emn-green-dark md:text-[44px]">
            Articles
          </h2>
          {committee && (
            <Link
              href="/articles/admin"
              className="inline-flex items-center rounded-[24px] bg-emn-green-dark px-6 py-2.5 text-sm font-bold text-emn-offwhite transition-opacity hover:opacity-90"
            >
              Committee admin →
            </Link>
          )}
        </div>

        {/* Search + tag filter — plain GET form, filtering happens server-side */}
        <div className="mt-6 flex flex-col gap-4">
          <form action="/articles" method="get">
            {tag && <input type="hidden" name="tag" value={tag} />}
            <label htmlFor="article-search" className="sr-only">
              Search articles
            </label>
            <div className="relative w-full max-w-[420px]">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-emn-green-dark"
                aria-hidden
              />
              <input
                id="article-search"
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search articles…"
                className="h-11 w-full rounded-[22px] border-none bg-white pl-11 pr-4 text-[15px] text-emn-black shadow-[1px_4px_14px_rgba(0,0,0,0.08)] transition-shadow placeholder:text-emn-black/50 focus:shadow-[1px_4px_14px_rgba(0,0,0,0.14)] focus:outline-none"
              />
            </div>
          </form>

          {tags.length > 0 && (
            <nav aria-label="Filter by tag">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link href={pageHref({ q })} className={tagPill(!tag)}>
                    All
                  </Link>
                </li>
                {tags.map((t) => (
                  <li key={t}>
                    <Link
                      href={pageHref({ q, tag: t === tag ? undefined : t })}
                      className={tagPill(t === tag)}
                    >
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {/* Grid */}
        <div className="mt-12">
          {articles.length > 0 ? (
            <ArticleGrid articles={articles} coverUrls={coverUrls} />
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-[18px] border-2 border-dashed border-emn-green-dark/30 px-6 py-16 text-center">
              <p className="font-candu text-3xl uppercase text-emn-green-dark">
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
        </div>

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
      </div>

      {/* Newsletter CTA */}
      <div className="mx-auto mt-16 max-w-[1236px] px-3 md:px-[18px]">
        <section className="flex flex-col items-start justify-between gap-8 rounded-[30px] bg-emn-green-dark px-8 py-10 text-emn-offwhite md:flex-row md:items-center md:px-[60px] md:py-14">
          <div>
            <h2 className="font-candu text-3xl uppercase leading-[0.95] md:text-[44px]">
              EMN Newsletter
            </h2>
            <p className="mt-3 max-w-[620px] text-base text-emn-offwhite/85 md:text-lg">
              Keep up to date with the latest economic, financial, and political
              headlines through our EMN Newsletter.
            </p>
          </div>
          <Button
            href="#newsletter"
            className="shrink-0 text-xl font-black"
            innerClassName="flex h-[55px] items-center justify-center px-9"
            color="emn-green"
            outlineColor="emn-offwhite"
            textColor="white"
          >
            Subscribe
          </Button>
        </section>
      </div>
    </main>
  );
}
