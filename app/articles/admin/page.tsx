import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/app/components/container";
import UploadForm from "@/app/components/articles/upload-form";
import ArticleTable from "@/app/components/articles/article-table";
import { getCommitteeSession } from "@/app/lib/require-committee";
import { listAllArticles } from "@/app/lib/articles/queries";

export const metadata: Metadata = {
  title: "Articles admin | The Emerging Markets Network",
  robots: { index: false },
};

export default async function ArticlesAdminPage() {
  // Authoritative page-level gate. Every server action re-checks the role
  // itself, so this redirect is UX, not the only line of defence.
  const session = await getCommitteeSession();
  if (!session) redirect("/articles");

  const articles = await listAllArticles();

  return (
    <div className="min-h-screen bg-background p-3 md:p-8">
      <Container className="max-w-[1236px]">
        <h1 className="mb-2 font-candu text-5xl leading-extra-tight tracking-tight text-[#231f20] md:text-[5rem]">
          ARTICLES ADMIN
        </h1>
        <p className="mb-10 max-w-[820px] font-medium text-foreground/80 md:text-xl">
          Signed in as {session.user.email}. Uploads land as drafts — preview
          them at their URL, then publish from the table.
        </p>

        <section aria-labelledby="upload-heading" className="mb-12">
          <h2
            id="upload-heading"
            className="mb-4 font-candu text-3xl uppercase leading-extra-tight text-emn-black"
          >
            Upload an article
          </h2>
          <UploadForm />
        </section>

        <section aria-labelledby="all-articles-heading">
          <h2
            id="all-articles-heading"
            className="mb-4 font-candu text-3xl uppercase leading-extra-tight text-emn-black"
          >
            All articles
          </h2>
          <ArticleTable articles={articles} />
        </section>
      </Container>
    </div>
  );
}
