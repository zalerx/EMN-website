import Link from "next/link";
import { Instagram, Play } from "lucide-react";

import { getInstagramReels, type InstagramReel } from "@/app/lib/instagram";
import { cn } from "@/app/lib/utils";
import { PlaceholderArt, clip } from "./instagram-shared";
import InstagramReelsCarousel from "./instagram-reels-carousel";

/**
 * The club's latest Instagram reels.
 *
 * - **Desktop** (`md:` and up): a static 3×3 grid of poster thumbnails with a CSS
 *   hover preview. Rendered on the server, ships no JavaScript.
 * - **Mobile**: a horizontal, snap-scrolling carousel where the centred reel
 *   auto-plays. That interactivity lives in the client component below.
 *
 * This is an async Server Component: it fetches on the server (keeping the Meta
 * access token secret) and passes the plain reel data down to both layouts.
 */
export default async function InstagramReels() {
  const reels = await getInstagramReels(9);

  return (
    <div className="w-full max-w-[1036px]">
      {/* Desktop: static 3×3 grid. */}
      <div className="hidden grid-cols-3 gap-4 md:grid">
        {reels.map((reel, i) => (
          <ReelTile key={reel.id} reel={reel} index={i} />
        ))}
      </div>

      {/* Mobile: horizontal auto-playing carousel. */}
      <InstagramReelsCarousel reels={reels} className="md:hidden" />
    </div>
  );
}

function ReelTile({ reel, index }: { reel: InstagramReel; index: number }) {
  const label = reel.caption ? clip(reel.caption) : "Watch on Instagram";

  return (
    <Link
      href={reel.permalink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "group relative block aspect-square overflow-hidden rounded-2xl",
        "border-2 border-emn-black/10 bg-emn-black/5",
        "transition-shadow duration-300 hover:shadow-[0_14px_34px_rgba(0,0,0,0.2)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emn-green focus-visible:ring-offset-2",
      )}
    >
      {reel.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Instagram CDN URLs are signed and short-lived; Next's optimizer would cache them and later serve 404s. We render them directly and refresh via ISR (see app/lib/instagram.ts).
        <img
          src={reel.thumbnailUrl}
          alt={reel.caption ? clip(reel.caption) : "EMN Instagram reel"}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <PlaceholderArt index={index} />
      )}

      {/* Persistent source cue, top-right. */}
      <span className="absolute right-2.5 top-2.5 text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
        <Instagram className="h-5 w-5 md:h-6 md:w-6" />
      </span>

      {/* Hover overlay: darken, reveal a play button and the caption. */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />

        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-white/95 text-emn-black shadow-lg transition-transform duration-300 group-hover:scale-100 md:h-14 md:w-14">
          <Play className="ml-0.5 h-5 w-5 fill-current md:h-6 md:w-6" />
        </span>

        <p className="absolute inset-x-0 bottom-0 line-clamp-2 p-3 text-xs leading-snug text-white/90 md:p-4 md:text-sm">
          {reel.isPlaceholder ? "Follow us on Instagram" : reel.caption ? clip(reel.caption) : ""}
        </p>
      </div>
    </Link>
  );
}
