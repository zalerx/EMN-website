// Server-only helper for pulling the club's latest Instagram reels.
//
// This module reads a secret access token from the environment and talks to the
// Meta (Instagram) Graph API. It is only ever imported by a Server Component
// (`app/components/instagram-reels.tsx`), so the token never reaches the browser.
//
// If no token is configured (or the API call fails) we return branded
// placeholder tiles instead, so the grid always renders a full 3×3 and the site
// keeps working before the Meta side is wired up. See INSTAGRAM.md for setup.

/** The club's public Instagram profile — used for placeholder / fallback links. */
export const EMN_INSTAGRAM_URL = "https://www.instagram.com/emnunimelb/";

/** A single tile in the reels grid, normalised from the Graph API response. */
export type InstagramReel = {
  id: string;
  /** Where clicking the tile sends the user (the reel, or the profile for placeholders). */
  permalink: string;
  /** Poster image for the reel. Absent on placeholder tiles. */
  thumbnailUrl?: string;
  /** Playable MP4 for the reel — used for mobile autoplay. Absent on images/placeholders. */
  videoUrl?: string;
  caption?: string;
  /** True when this is a branded stand-in rather than a real reel. */
  isPlaceholder?: boolean;
};

/** Raw shape of one media object returned by the Graph API `/media` edge. */
type IgMediaItem = {
  id: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_product_type?: "AD" | "FEED" | "STORY" | "REELS";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
};

// Instagram API with Instagram Login uses graph.instagram.com + a `me` shortcut.
// If you use Instagram Graph API with Facebook Login instead, set
// INSTAGRAM_GRAPH_BASE=https://graph.facebook.com/v21.0 and INSTAGRAM_USER_ID=<ig-user-id>.
const GRAPH_BASE = process.env.INSTAGRAM_GRAPH_BASE ?? "https://graph.instagram.com";
const USER_ID = process.env.INSTAGRAM_USER_ID ?? "me";
const FIELDS = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink";

function isReel(m: IgMediaItem): boolean {
  return m.media_product_type === "REELS" || m.media_type === "VIDEO";
}

function toReel(m: IgMediaItem): InstagramReel {
  const isVideo = m.media_type === "VIDEO";
  return {
    id: m.id,
    permalink: m.permalink,
    // Videos/reels expose a `thumbnail_url` poster; images only a `media_url`.
    thumbnailUrl: m.thumbnail_url ?? m.media_url,
    // For reels, `media_url` is the playable MP4. Images have no video.
    videoUrl: isVideo ? m.media_url : undefined,
    caption: m.caption,
  };
}

function placeholderReels(count: number): InstagramReel[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `placeholder-${i}`,
    permalink: EMN_INSTAGRAM_URL,
    isPlaceholder: true,
  }));
}

/**
 * Fetch the latest reels for the grid.
 *
 * Reels are preferred, then any other recent media is used to fill the grid, and
 * finally branded placeholders pad out any remaining slots so we always return
 * exactly `limit` tiles.
 *
 * The response is cached and refreshed via Next's ISR (`revalidate`). Refreshing
 * matters because Instagram's CDN thumbnail URLs are signed and expire after a
 * while — re-fetching keeps them live without any manual work.
 */
export async function getInstagramReels(limit = 9): Promise<InstagramReel[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return placeholderReels(limit);

  try {
    const url = `${GRAPH_BASE}/${USER_ID}/media?fields=${FIELDS}&limit=25&access_token=${token}`;
    const res = await fetch(url, {
      // Re-pull at most once an hour; keeps thumbnail URLs fresh and the API quiet.
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Instagram Graph API responded ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as { data?: IgMediaItem[] };
    const items = json.data ?? [];

    // Reels first, then any other recent media, so the grid always fills up.
    const reels = items.filter(isReel);
    const rest = items.filter((m) => !isReel(m));
    const mapped = [...reels, ...rest].slice(0, limit).map(toReel);

    // Brand-new account / not enough posts yet: pad to a full grid.
    if (mapped.length < limit) {
      mapped.push(...placeholderReels(limit - mapped.length));
    }

    return mapped;
  } catch (err) {
    // A social embed should never take the page down — degrade to placeholders.
    console.error("[instagram] Falling back to placeholder reels:", err);
    return placeholderReels(limit);
  }
}
