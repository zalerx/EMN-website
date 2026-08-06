"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button from "@/app/components/button";

export default function ArticlesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[articles] route error:", error);
  }, [error]);

  return (
    <main className="px-3 pb-16 md:px-[18px]">
      <div className="mx-auto mt-6 max-w-[900px] md:mt-14">
        <div className="rounded-[23px] bg-white px-6 py-12 text-center md:px-[72px] md:py-20">
          <h1 className="font-candu text-4xl uppercase leading-extra-tight tracking-tight text-emn-green-dark md:text-6xl">
            Something broke
          </h1>
          <p className="mx-auto mb-8 mt-4 max-w-[600px] font-medium text-emn-black/80 md:text-lg">
            We couldn&apos;t load research right now. It&apos;s us, not you — try
            again in a moment.
          </p>
          <div className="flex items-center justify-center gap-6">
            <Button
              onClick={reset}
              className="text-base font-black"
              color="emn-green"
              outlineColor="emn-green-dark"
              textColor="white"
            >
              Try again
            </Button>
            <Link
              href="/"
              className="font-bold text-emn-black underline decoration-emn-green decoration-2 underline-offset-4"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
