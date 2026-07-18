"use client";

import { useEffect } from "react";
import Link from "next/link";
import Container from "@/app/components/container";
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
    <div className="min-h-screen bg-background p-3 md:p-8">
      <Container className="max-w-[1000px]">
        <h1 className="mb-6 font-candu text-5xl uppercase leading-extra-tight tracking-tight text-[#231f20] md:text-[5rem]">
          Something broke
        </h1>
        <p className="mb-8 max-w-[600px] font-medium text-foreground/80 md:text-xl">
          We couldn&apos;t load articles right now. It&apos;s us, not you — try
          again in a moment.
        </p>
        <div className="flex items-center gap-6">
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
      </Container>
    </div>
  );
}
