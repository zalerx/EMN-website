"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { logoUrl } from "@/app/lib/sponsors/logo";
import type { Sponsor, SponsorShape } from "@/types/sponsor";

// Shown when there are no sponsors yet — preserves the original design's look
// of alternating shaped placeholder tiles.
const PLACEHOLDER_SHAPES: SponsorShape[] = ["leaf", "circle", "leaf", "circle"];

function shapeClass(shape: SponsorShape): string {
  return shape === "circle" ? "rounded-full" : "rounded-[62.5%_0_62.5%_0]";
}

const TILE_BASE =
  "relative flex h-[210px] w-[210px] items-center justify-center overflow-hidden bg-white transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_8px_20px_-8px_rgba(24,81,45,0.35)] md:h-[260px] md:w-[260px]";

function SponsorTile({ sponsor }: { sponsor: Sponsor }) {
  const url = logoUrl(sponsor.logo_path);
  // 'cover' fills the tile so the logo reaches the shape's edges (overflow-hidden
  // + border-radius clip it to the leaf/circle); 'contain' pads the tile so the
  // whole logo stays visible inside the shape.
  const contain = sponsor.logo_fit === "contain";
  const tile = (
    <div
      className={`${TILE_BASE} ${contain ? "p-8" : ""} ${shapeClass(sponsor.shape)}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- logo is in a Supabase public bucket; plain <img> avoids next/image remote-domain config
        <img
          src={url}
          alt={sponsor.name}
          className={`h-full w-full ${contain ? "object-contain" : "object-cover"}`}
        />
      ) : (
        <span className="p-6 text-center text-sm font-bold text-emn-black/60">
          {sponsor.name}
        </span>
      )}
    </div>
  );

  if (!sponsor.website) {
    return <div className="group shrink-0 snap-start">{tile}</div>;
  }
  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={sponsor.name}
      className="group shrink-0 snap-start"
    >
      {tile}
    </a>
  );
}

export default function SponsorCarousel({ sponsors }: { sponsors: Sponsor[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: number) =>
    carouselRef.current?.scrollBy({ left: 414 * dir, behavior: "smooth" });

  const hasSponsors = sponsors.length > 0;

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-[18px]">
        <h2 className="font-candu text-[36px] uppercase leading-none text-emn-green-dark md:text-[44px]">
          Our Sponsors
        </h2>
        <span className="inline-flex items-center rounded-[22px_0_22px_0] bg-emn-green px-[22px] pb-[5px] pt-[11px] font-candu text-[22px] leading-none tracking-[0.04em] text-white">
          2026
        </span>
        <div className="ml-auto flex gap-[10px]">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            aria-label="Previous sponsors"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emn-green-dark text-emn-green-dark transition-colors hover:bg-emn-green-dark hover:text-white"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            aria-label="Next sponsors"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emn-green-dark text-emn-green-dark transition-colors hover:bg-emn-green-dark hover:text-white"
          >
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 pb-9 pt-[38px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {hasSponsors
          ? sponsors.map((sponsor) => (
              <SponsorTile key={sponsor.id} sponsor={sponsor} />
            ))
          : PLACEHOLDER_SHAPES.map((shape, i) => (
              <div
                key={i}
                className={`h-[210px] w-[210px] shrink-0 snap-start bg-white transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-1.5 hover:shadow-[0_8px_20px_-8px_rgba(24,81,45,0.35)] md:h-[260px] md:w-[260px] ${shapeClass(shape)}`}
              />
            ))}
      </div>
    </>
  );
}
