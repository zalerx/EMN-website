import Link from "next/link";
import Image from "next/image";
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
      className="group relative flex h-full flex-col rounded-[18px] border-4 border-emn-green-dark bg-emn-offwhite transition-transform duration-100 hover:-translate-y-1"
    >
      {/* Protruding kind badge — overlaps the cover's top-left corner. */}
      <span className="absolute -top-5 left-6 z-10 inline-flex rounded-br-[28px] rounded-tl-[28px] border-4 border-emn-green-dark bg-emn-offwhite px-5 pb-1 pt-2 font-candu text-lg uppercase leading-none text-emn-green-dark">
        {isPdf ? "PDF" : "Article"}
      </span>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-[14px]">
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
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-6">
        <h3 className="font-candu text-[26px] uppercase leading-none tracking-tight text-emn-green-dark">
          {article.title}
        </h3>
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-emn-black/55">
          {article.author}
          {" · "}
          {article.published_at ? formatDate(article.published_at) : "Draft"}
          {article.reading_minutes ? ` · ${article.reading_minutes} min` : ""}
        </p>
        {article.summary && (
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-emn-black/80">
            {article.summary}
          </p>
        )}
        {article.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-xl bg-emn-green/[0.18] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.04em] text-emn-green-dark"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
        <span className="mt-auto pt-1 text-sm font-bold text-emn-green-dark group-hover:underline">
          Read →
        </span>
      </div>
    </Link>
  );
}
