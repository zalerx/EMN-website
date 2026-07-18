import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import Container from "@/app/components/container";
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

  return (
    <div className="min-h-screen bg-background p-3 md:p-8">
      <Container className="max-w-[1000px]">
        {isDraftPreview && (
          <p className="mb-6 rounded-[12px] border-2 border-emn-green-dark bg-emn-green/15 px-4 py-3 text-sm font-bold text-emn-green-dark">
            Draft preview — only committee members can see this page. Publish
            it from the admin dashboard to make it public.
          </p>
        )}

        <Link
          href="/articles"
          className="mb-8 inline-flex items-center gap-2 text-base font-bold text-emn-black hover:text-emn-green-dark"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          All articles
        </Link>

        <header className="mb-10">
          <h1 className="font-candu text-4xl uppercase leading-extra-tight tracking-tight text-[#231f20] md:text-6xl">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="mt-3 text-lg font-medium text-emn-black/70 md:text-2xl">
              {article.subtitle}
            </p>
          )}
          <p className="mt-5 text-base font-semibold text-emn-black">
            {article.author}
            <span className="font-normal text-emn-black/60">
              {article.published_at ? ` · ${formatDate(article.published_at)}` : ""}
              {article.reading_minutes
                ? ` · ${article.reading_minutes} min read`
                : ""}
            </span>
          </p>
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
          <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-[16px] border-2 border-black">
            <Image
              src={coverUrl}
              alt={`Cover for ${article.title}`}
              fill
              sizes="(min-width: 1024px) 936px, 100vw"
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
          <p className="rounded-[12px] border-2 border-dashed border-emn-black/30 px-4 py-8 text-center text-base text-emn-black/70">
            This article&apos;s file is unavailable right now. Please try again
            later.
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
      </Container>
    </div>
  );
}
