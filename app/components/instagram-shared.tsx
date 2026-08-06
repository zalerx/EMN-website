// Bits shared by the desktop grid (server) and the mobile carousel (client).
// No "use client" here so it can be imported from either context.

import { cn } from "@/app/lib/utils";

// Brand gradients cycled through placeholder tiles so an un-wired grid still
// looks intentional rather than blank.
export const PLACEHOLDER_GRADIENTS = [
  "from-emn-green to-emn-green-dark",
  "from-emn-green-mid to-emn-black",
  "from-emn-green-dark to-emn-green-mid",
  "from-emn-black to-emn-green-dark",
  "from-emn-green to-emn-green-mid",
  "from-emn-green-dark to-emn-black",
  "from-emn-green-mid to-emn-green-dark",
  "from-emn-black to-emn-green-mid",
  "from-emn-green to-emn-black",
];

/** Collapse whitespace and trim a caption down to a tidy single line. */
export function clip(text: string, max = 80): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/** Branded stand-in shown when a tile has no real thumbnail/video. */
export function PlaceholderArt({ index }: { index: number }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
        PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length],
      )}
    >
      <span className="font-candu text-3xl uppercase tracking-tight text-white/20 md:text-5xl">
        EMN
      </span>
    </div>
  );
}
