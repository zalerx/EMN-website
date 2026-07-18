"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import Button from "@/app/components/button";

// The PDF's own typography is baked into the file — this component only
// controls the chrome around it. On small viewports the inline embed is
// skipped entirely because iOS Safari renders only the first page of an
// <object>/<iframe> PDF with no way to scroll.
export default function PdfReader({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [isSmallViewport, setIsSmallViewport] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsSmallViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Until the viewport is known (first client render), show the open button
  // rather than flashing a possibly-broken embed.
  if (isSmallViewport !== false) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[16px] border-2 border-dashed border-emn-black/30 px-6 py-12 text-center">
        <p className="text-base text-emn-black/70">
          This article is a PDF — it opens best in a full window on your
          device.
        </p>
        <Button
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-black"
          color="emn-green"
          outlineColor="emn-green-dark"
          textColor="white"
        >
          <span className="inline-flex items-center gap-2">
            Open PDF <ExternalLink className="h-4 w-4" aria-hidden />
          </span>
        </Button>
      </div>
    );
  }

  return (
    <object
      data={src}
      type="application/pdf"
      className="h-[80vh] w-full rounded-[16px] border-2 border-black"
      aria-label={`PDF viewer: ${title}`}
    >
      <iframe
        src={src}
        title={`PDF viewer: ${title}`}
        className="h-[80vh] w-full rounded-[16px] border-2 border-black"
      >
        <p className="p-6 text-base">
          Your browser can&apos;t display PDFs inline.{" "}
          <a
            href={src}
            className="font-semibold text-emn-green underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download the PDF
          </a>{" "}
          instead.
        </p>
      </iframe>
    </object>
  );
}
