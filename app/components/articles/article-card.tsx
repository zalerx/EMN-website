import Link from "next/link";
import Image from "next/image";
import { FileText, Newspaper } from "lucide-react";
import type { ArticleListItem } from "@/types/article";
import { formatDate } from "@/app/lib/utils";

// Green fallback block when an article has no cover: leaf shape + initial,
// echoing the About-page stat shapes.
function CoverFallback({ title }: { title: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-emn-green">
      <svg
        viewBox="0 0 78.07 78.07"
        className="absolute h-3/4 w-3/4 text-emn-green-mid"
        aria-hidden
      >
        <path
          d="m0,78.07v-29.28S0,0,48.79,0h29.28s0,29.28,0,29.28c0,0,0,48.79-48.79,48.79,0,0-29.28,0-29.28,0Z"
          fill="currentColor"
        />
      </svg>
      <span className="relative font-candu text-[64px] uppercase text-emn-offwhite">
        {title.charAt(0)}
      </span>
    </div>
  );
}

export default function ArticleCard({
  article,
  coverUrl,
}: {
  article: ArticleListItem;
  coverUrl: string | null;
}) {
  const isPdf = article.source_type === "pdf";
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[16px] border-2 border-black bg-white transition-transform duration-100 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b-2 border-black">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`Cover for ${article.title}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <CoverFallback title={article.title} />
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold uppercase text-emn-black">
          {isPdf ? (
            <FileText className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Newspaper className="h-3.5 w-3.5" aria-hidden />
          )}
          {isPdf ? "PDF" : "Article"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-candu text-2xl uppercase leading-extra-tight tracking-tight text-emn-black group-hover:text-emn-green-dark">
          {article.title}
        </h3>
        {article.summary && (
          <p className="line-clamp-3 text-sm text-emn-black/70">
            {article.summary}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-3">
          <p className="text-sm font-semibold text-emn-black">
            {article.author}
            <span className="font-normal text-emn-black/60">
              {" · "}
              {article.published_at ? formatDate(article.published_at) : "Draft"}
              {article.reading_minutes
                ? ` · ${article.reading_minutes} min read`
                : ""}
            </span>
          </p>
          {article.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-emn-green/15 px-3 py-1 text-xs font-bold text-emn-green-dark"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Link>
  );
}
