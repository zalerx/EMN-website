import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import MarkdownBody from "@/app/components/articles/markdown-body";
import PdfReader from "@/app/components/articles/pdf-reader";
import { getCommitteeSession } from "@/app/lib/require-committee";
import {
  getAdjacentArticles,
  getArticleAnyStatusBySlug,
  getPublishedArticleBySlug,
  getSignedFileUrl,
} from "@/app/lib/articles/queries";
import { formatDate } from "@/app/lib/utils";
import type { Article } from "@/types/article";

// ISR: published pages are cached for an hour; publish/unpublish actions
// call revalidatePath so edits appear immediately anyway.
export const revalidate = 3600;

// Signed URLs must outlive the ISR window, or a cached page could serve an
// expired link in its final minutes.
const SIGNED_URL_TTL = 2 * 60 * 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return {};
  const coverUrl = article.cover_path
    ? await getSignedFileUrl(article.cover_path, SIGNED_URL_TTL)
    : null;
  const description =
    article.summary ?? article.subtitle ?? `An EMN article by ${article.author}.`;
  return {
    title: `${article.title} | The Emerging Markets Network`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      ...(coverUrl ? { images: [{ url: coverUrl }] } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article: Article | null = await getPublishedArticleBySlug(slug);
  let isDraftPreview = false;

  // Draft preview: only consulted when the published lookup misses, so
  // published pages never touch the session and stay ISR-cacheable.
  if (!article) {
    const session = await getCommitteeSession();
    if (session) {
      article = await getArticleAnyStatusBySlug(slug);
      isDraftPreview = article !== null && article.status !== "published";
    }
  }
  if (!article) notFound();

  const [coverUrl, fileUrl, adjacent] = await Promise.all([
    article.cover_path
      ? getSignedFileUrl(article.cover_path, SIGNED_URL_TTL)
      : Promise.resolve(null),
    article.source_type === "pdf" && article.storage_path
      ? getSignedFileUrl(article.storage_path, SIGNED_URL_TTL)
      : Promise.resolve(null),
    article.published_at
      ? getAdjacentArticles(article.published_at)
      : Promise.resolve({ prev: null, next: null }),
  ]);

  const meta = [
    article.author,
    article.published_at ? formatDate(article.published_at) : null,
    article.reading_minutes ? `${article.reading_minutes} min read` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="px-3 pb-16 md:px-[18px]">
      <div className="mx-auto mt-6 max-w-[900px] md:mt-14">
        {isDraftPreview && (
          <p className="mb-5 rounded-[16px] border-2 border-emn-green-dark bg-emn-green/15 px-4 py-3 text-sm font-bold text-emn-green-dark">
            Draft preview — only committee members can see this page. Publish
            it from the admin dashboard to make it public.
          </p>
        )}

        <article className="rounded-[23px] bg-white px-6 py-8 md:px-[72px] md:py-16">
          {/* Top bar — back link left, reading meta right */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 md:mb-10">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-[28px] border-2 border-emn-black px-5 py-2 text-sm font-bold text-emn-black transition-colors hover:bg-emn-black hover:text-emn-offwhite"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All articles
            </Link>
            {meta && (
              <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-emn-black/55">
                {meta}
              </span>
            )}
          </div>

          <header className="mb-8 md:mb-10">
            <h1 className="font-candu text-4xl uppercase leading-extra-tight tracking-tight text-emn-green-dark md:text-6xl">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="mt-3 text-lg font-medium text-emn-black/70 md:text-2xl">
                {article.subtitle}
              </p>
            )}
            {article.tags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/articles?tag=${encodeURIComponent(tag)}`}
                      className="inline-block rounded-full bg-emn-green/15 px-3 py-1 text-xs font-bold text-emn-green-dark hover:bg-emn-green/30"
                    >
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </header>

          {coverUrl && article.source_type === "markdown" && (
            <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-[16px]">
              <Image
                src={coverUrl}
                alt={`Cover for ${article.title}`}
                fill
                sizes="(min-width: 900px) 756px, 100vw"
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          {article.source_type === "markdown" && article.content_md ? (
            <MarkdownBody content={article.content_md} />
          ) : fileUrl ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <a
                  href={fileUrl}
                  download
                  className="inline-flex items-center gap-2 text-sm font-bold text-emn-green-dark underline decoration-emn-green decoration-2 underline-offset-4"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Download PDF
                </a>
              </div>
              <PdfReader src={fileUrl} title={article.title} />
            </div>
          ) : (
            <p className="rounded-[16px] border-2 border-dashed border-emn-black/30 px-4 py-8 text-center text-base text-emn-black/70">
              This article&apos;s file is unavailable right now. Please try
              again later.
            </p>
          )}

          {(adjacent.prev || adjacent.next) && (
            <nav
              aria-label="More articles"
              className="mt-14 flex flex-col gap-4 border-t-2 border-emn-black/10 pt-8 sm:flex-row sm:justify-between"
            >
              {adjacent.next ? (
                <Link
                  href={`/articles/${adjacent.next.slug}`}
                  className="group max-w-[45%] text-left"
                >
                  <span className="text-sm font-bold text-emn-black/50">
                    ← Newer
                  </span>
                  <span className="block font-candu text-xl uppercase leading-extra-tight text-emn-black group-hover:text-emn-green-dark">
                    {adjacent.next.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {adjacent.prev && (
                <Link
                  href={`/articles/${adjacent.prev.slug}`}
                  className="group max-w-[45%] text-right"
                >
                  <span className="text-sm font-bold text-emn-black/50">
                    Older →
                  </span>
                  <span className="block font-candu text-xl uppercase leading-extra-tight text-emn-black group-hover:text-emn-green-dark">
                    {adjacent.prev.title}
                  </span>
                </Link>
              )}
            </nav>
          )}
        </article>
      </div>
    </main>
  );
}
