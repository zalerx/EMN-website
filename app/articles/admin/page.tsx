import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import UploadForm from "@/app/components/articles/upload-form";
import ArticleTable from "@/app/components/articles/article-table";
import { getCommitteeSession } from "@/app/lib/require-committee";
import { listAllArticles } from "@/app/lib/articles/queries";

export const metadata: Metadata = {
  title: "Research admin | The Emerging Markets Network",
  robots: { index: false },
};

export default async function ArticlesAdminPage() {
  // Authoritative page-level gate. Every server action re-checks the role
  // itself, so this redirect is UX, not the only line of defence.
  const session = await getCommitteeSession();
  if (!session) redirect("/articles");

  const articles = await listAllArticles();

  return (
    <main className="min-h-screen px-3 pb-16 md:px-[18px]">
      <div className="mx-auto max-w-[1236px] px-3 pt-10 md:px-[18px] md:pt-16">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-sm font-bold text-emn-black/70 hover:text-emn-green-dark"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Research
        </Link>

        <h1 className="mt-4 font-candu text-5xl uppercase leading-[0.9] tracking-tight text-emn-green-dark md:text-[5rem]">
          Research Admin
        </h1>
        <p className="mt-3 max-w-[820px] font-medium text-emn-black/80 md:text-xl">
          Signed in as {session.user.email}.
        </p>

        <div className="mt-10 flex flex-col gap-6">
          {/* Upload — dark-green card */}
          <section
            aria-labelledby="upload-heading"
            className="rounded-[30px] bg-emn-green-dark p-7 text-emn-offwhite md:p-9"
          >
            <h2
              id="upload-heading"
              className="font-candu text-3xl uppercase leading-none md:text-[40px]"
            >
              Upload Article
            </h2>
            <p className="mt-2 text-sm text-emn-offwhite/85">
              Markdown files render with EMN typography; PDFs display in an
              embedded reader.
            </p>
            <div className="mt-6">
              <UploadForm />
            </div>
          </section>

          {/* Manage — white card */}
          <section
            aria-labelledby="all-articles-heading"
            className="rounded-[30px] bg-white p-7 md:p-9"
          >
            <h2
              id="all-articles-heading"
              className="mb-6 font-candu text-3xl uppercase leading-none text-emn-black md:text-[40px]"
            >
              Published
            </h2>
            <ArticleTable articles={articles} />
          </section>
        </div>
      </div>
    </main>
  );
}
