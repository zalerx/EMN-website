"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn, formatDate } from "@/app/lib/utils";
import { deleteArticle, setArticleStatus, updateArticle } from "@/app/articles/actions";
import type { ArticleListItem } from "@/types/article";

const inputClasses =
  "w-full rounded-[10px] border-2 border-black bg-white px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emn-green";

interface EditState {
  title: string;
  subtitle: string;
  author: string;
  summary: string;
  tags: string;
}

function Row({ article }: { article: ArticleListItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState>({
    title: article.title,
    subtitle: article.subtitle ?? "",
    author: article.author,
    summary: article.summary ?? "",
    tags: article.tags.join(", "),
  });

  const published = article.status === "published";

  function run(action: () => Promise<{ ok: boolean } & Record<string, unknown>>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(String((result as { error?: string }).error ?? "Action failed."));
        return;
      }
      setEditing(false);
      setConfirmingDelete(false);
      router.refresh();
    });
  }

  return (
    <>
      <tr className={cn("border-t-2 border-emn-black/10", pending ? "opacity-50" : "")}>
        <td className="px-3 py-3">
          <p className="font-bold text-emn-black">{article.title}</p>
          <p className="text-xs text-emn-black/60">/articles/{article.slug}</p>
        </td>
        <td className="px-3 py-3 text-sm uppercase text-emn-black/70">
          {article.source_type === "pdf" ? "PDF" : "MD"}
        </td>
        <td className="px-3 py-3">
          <span
            className={cn(
              "inline-block rounded-full border-2 px-3 py-0.5 text-xs font-bold uppercase",
              published
                ? "border-emn-green-dark bg-emn-green/15 text-emn-green-dark"
                : "border-emn-black/40 bg-emn-offwhite text-emn-black/70"
            )}
          >
            {article.status}
          </span>
        </td>
        <td className="whitespace-nowrap px-3 py-3 text-sm text-emn-black/70">
          {article.published_at ? formatDate(article.published_at) : "—"}
        </td>
        <td className="px-3 py-3">
          <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
            <Link
              href={`/articles/${article.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-emn-black underline decoration-emn-black/30 underline-offset-2 hover:decoration-emn-green"
            >
              View <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(() =>
                  setArticleStatus(article.id, published ? "draft" : "published")
                )
              }
              className="text-emn-green-dark underline decoration-emn-green underline-offset-2"
            >
              {published ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setEditing((v) => !v);
                setConfirmingDelete(false);
              }}
              className="text-emn-black underline decoration-emn-black/30 underline-offset-2"
            >
              {editing ? "Cancel edit" : "Edit"}
            </button>
            {confirmingDelete ? (
              <span className="inline-flex items-center gap-2">
                <span className="text-red-700">Delete permanently?</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => deleteArticle(article.id))}
                  className="text-red-700 underline underline-offset-2"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmingDelete(false)}
                  className="text-emn-black/70 underline underline-offset-2"
                >
                  Keep
                </button>
              </span>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setConfirmingDelete(true);
                  setEditing(false);
                }}
                className="text-red-700 underline decoration-red-700/40 underline-offset-2"
              >
                Delete
              </button>
            )}
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs font-bold text-red-700">
              {error}
            </p>
          )}
        </td>
      </tr>

      {editing && (
        <tr className="border-t border-emn-black/10 bg-emn-offwhite/60">
          <td colSpan={5} className="px-3 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(() =>
                  updateArticle(article.id, {
                    title: edit.title,
                    subtitle: edit.subtitle || undefined,
                    author: edit.author,
                    summary: edit.summary || undefined,
                    tags: edit.tags.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                );
              }}
              className="grid grid-cols-1 gap-3 md:grid-cols-2"
            >
              <div className="flex flex-col gap-1">
                <label htmlFor={`title-${article.id}`} className="text-xs font-bold text-emn-black">
                  Title
                </label>
                <input
                  id={`title-${article.id}`}
                  type="text"
                  required
                  value={edit.title}
                  onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`author-${article.id}`} className="text-xs font-bold text-emn-black">
                  Author
                </label>
                <input
                  id={`author-${article.id}`}
                  type="text"
                  required
                  value={edit.author}
                  onChange={(e) => setEdit({ ...edit, author: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`subtitle-${article.id}`} className="text-xs font-bold text-emn-black">
                  Subtitle
                </label>
                <input
                  id={`subtitle-${article.id}`}
                  type="text"
                  value={edit.subtitle}
                  onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`tags-${article.id}`} className="text-xs font-bold text-emn-black">
                  Tags (comma-separated)
                </label>
                <input
                  id={`tags-${article.id}`}
                  type="text"
                  value={edit.tags}
                  onChange={(e) => setEdit({ ...edit, tags: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor={`summary-${article.id}`} className="text-xs font-bold text-emn-black">
                  Summary
                </label>
                <textarea
                  id={`summary-${article.id}`}
                  rows={2}
                  value={edit.summary}
                  onChange={(e) => setEdit({ ...edit, summary: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full border-2 border-emn-green-dark bg-emn-green px-5 py-1.5 text-sm font-black text-white disabled:opacity-50"
                >
                  {pending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ArticleTable({ articles }: { articles: ArticleListItem[] }) {
  if (articles.length === 0) {
    return (
      <p className="rounded-[16px] border-2 border-dashed border-emn-black/30 px-6 py-10 text-center text-base text-emn-black/70">
        No articles yet — upload the first one with the form.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-emn-black/10 text-xs font-bold uppercase text-emn-black/55">
            <th scope="col" className="px-3 py-3">Article</th>
            <th scope="col" className="px-3 py-3">Type</th>
            <th scope="col" className="px-3 py-3">Status</th>
            <th scope="col" className="px-3 py-3">Published</th>
            <th scope="col" className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <Row key={article.id} article={article} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
