import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <main className="px-3 pb-16 md:px-[18px]">
      <div className="mx-auto mt-6 max-w-[900px] md:mt-14">
        <div className="rounded-[23px] bg-white px-6 py-12 text-center md:px-[72px] md:py-20">
          <h1 className="font-candu text-4xl uppercase leading-extra-tight tracking-tight text-emn-green-dark md:text-6xl">
            Article not found
          </h1>
          <p className="mx-auto mb-8 mt-4 max-w-[600px] font-medium text-emn-black/80 md:text-lg">
            This article doesn&apos;t exist, or it hasn&apos;t been published
            yet.
          </p>
          <Link
            href="/articles"
            className="font-bold text-emn-green-dark underline decoration-emn-green decoration-2 underline-offset-4"
          >
            Browse all research
          </Link>
        </div>
      </div>
    </main>
  );
}
