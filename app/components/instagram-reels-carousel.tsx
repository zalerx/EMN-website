"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Instagram, Play } from "lucide-react";

import { type InstagramReel } from "@/app/lib/instagram";
import { cn } from "@/app/lib/utils";
import { useAnimationEnabled } from "./animation-toggle";
import { PlaceholderArt, clip } from "./instagram-shared";

/**
 * Mobile-only, horizontally scrolling reel carousel.
 *
 * Cards snap to centre; whichever card is most in view becomes "active" and its
 * video auto-plays (muted, looping) while the others pause. Tapping a card opens
 * that reel on Instagram. Autoplay honours the site-wide animation toggle.
 */
export default function InstagramReelsCarousel({
  reels,
  className,
}: {
  reels: InstagramReel[];
  className?: string;
}) {
  const animationsEnabled = useAnimationEnabled();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [activeId, setActiveId] = useState(reels[0]?.id ?? "");

  // Track which card is most in view and mark it active.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.reelId;
          if (id) ratios.set(id, entry.intersectionRatio);
        }
        let bestId = "";
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      { root: scroller, threshold: [0.2, 0.4, 0.6, 0.8, 1] },
    );

    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reels]);

  // Play only the active card's video, and only while the carousel is visible
  // (it's hidden on desktop) and site animations are enabled.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const hidden = !scroller || scroller.offsetParent === null;

    cardRefs.current.forEach((el, id) => {
      const video = el.querySelector("video");
      if (!video) return;

      if (id === activeId && animationsEnabled && !hidden) {
        video.play().catch(() => {
          /* autoplay may be blocked; the poster stays visible */
        });
      } else {
        video.pause();
        // Rewind the off-screen cards so they restart from the top next time.
        if (id !== activeId) {
          try {
            video.currentTime = 0;
          } catch {
            /* not seekable yet — harmless */
          }
        }
      }
    });
  }, [activeId, animationsEnabled]);

  const scrollToCard = (id: string) => {
    cardRefs.current
      .get(id)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const setCardRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* px is calc(50% - halfCardWidth) so the first & last card can centre. */}
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[calc(50%-140px)] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reels.map((reel, i) => (
          <CarouselCard
            key={reel.id}
            reel={reel}
            index={i}
            isActive={reel.id === activeId}
            setRef={setCardRef(reel.id)}
          />
        ))}
      </div>

      {/* Position dots — also jump-to controls. */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {reels.map((reel, i) => {
          const active = reel.id === activeId;
          return (
            <button
              key={reel.id}
              type="button"
              onClick={() => scrollToCard(reel.id)}
              aria-label={`Go to reel ${i + 1}`}
              aria-current={active}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                active ? "w-5 bg-emn-green" : "w-1.5 bg-emn-black/25 hover:bg-emn-black/40",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function CarouselCard({
  reel,
  index,
  isActive,
  setRef,
}: {
  reel: InstagramReel;
  index: number;
  isActive: boolean;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  const label = reel.caption ? clip(reel.caption) : "Watch on Instagram";

  return (
    <div
      ref={setRef}
      data-reel-id={reel.id}
      className={cn(
        "relative aspect-[3/4] w-[280px] shrink-0 snap-center overflow-hidden rounded-3xl",
        "border-2 border-emn-black/10 bg-emn-black/5 transition-all duration-300",
        isActive
          ? "scale-100 opacity-100 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
          : "scale-[0.92] opacity-60",
      )}
    >
      {reel.videoUrl ? (
        <video
          src={reel.videoUrl}
          poster={reel.thumbnailUrl}
          muted
          loop
          playsInline
          // Load bytes only when a card actually plays (saves mobile data).
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : reel.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Instagram CDN URLs are signed and short-lived (see app/lib/instagram.ts).
        <img
          src={reel.thumbnailUrl}
          alt={label}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <PlaceholderArt index={index} />
      )}

      {/* Source cue. */}
      <span className="absolute right-3 top-3 z-10 text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
        <Instagram className="h-6 w-6" />
      </span>

      {/* Paused cue on the off-centre video cards. */}
      {!isActive && reel.videoUrl && (
        <span className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-emn-black shadow-lg">
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </span>
      )}

      {/* Caption. pointer-events-none so taps fall through to the link below. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 pt-10">
        <p className="line-clamp-2 text-sm leading-snug text-white/95">
          {reel.isPlaceholder ? "Follow us on Instagram" : reel.caption ? clip(reel.caption) : ""}
        </p>
      </div>

      {/* Whole-card tap target → opens the reel on Instagram. */}
      <Link
        href={reel.permalink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="absolute inset-0 z-20"
      />
    </div>
  );
}
