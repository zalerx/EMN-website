import type { ArticleListItem } from "@/types/article";
import ArticleCard from "./article-card";

export default function ArticleGrid({
  articles,
  coverUrls,
}: {
  articles: ArticleListItem[];
  // Signed cover URLs keyed by article id (private bucket, resolved server-side)
  coverUrls: Record<string, string | null>;
}) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <li key={article.id}>
          <ArticleCard
            article={article}
            coverUrl={coverUrls[article.id] ?? null}
          />
        </li>
      ))}
    </ul>
  );
}
