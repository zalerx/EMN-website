import Link from "next/link";
import Container from "@/app/components/container";

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-background p-3 md:p-8">
      <Container className="max-w-[1000px]">
        <h1 className="mb-6 font-candu text-5xl uppercase leading-extra-tight tracking-tight text-[#231f20] md:text-[5rem]">
          Article not found
        </h1>
        <p className="mb-8 max-w-[600px] font-medium text-foreground/80 md:text-xl">
          This article doesn&apos;t exist, or it hasn&apos;t been published yet.
        </p>
        <Link
          href="/articles"
          className="font-bold text-emn-green-dark underline decoration-emn-green decoration-2 underline-offset-4"
        >
          Browse all articles
        </Link>
      </Container>
    </div>
  );
}
