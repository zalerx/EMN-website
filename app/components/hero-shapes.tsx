/**
 * Seed & leaf shapes for the hero scroll-velocity background.
 *
 * Uses the actual EMN brand shapes from public/Shapes/:
 *   - seed.svg  → circle
 *   - leaf.svg  → curved petal
 *
 * <ShapeRow /> is a flat row of alternating leaves and seeds passed to
 * ScrollVelocity as a single repeating unit.
 */

/**
 * Shapes are sized to ~0.78em — that's roughly the cap-height of Candu, so
 * each shape lines up vertically with the top of the cap and the baseline of
 * the matching text row. Tweak the 0.78 if the visual fit drifts.
 */
const SHAPE_SIZE = "h-[0.78em] aspect-square shrink-0";

/** EMN brand leaf — path from public/Shapes/leaf.svg. */
function Leaf({ rotation = 0 }: { rotation?: number }) {
  return (
    <svg
      viewBox="0 0 78.07 78.07"
      className={SHAPE_SIZE}
      style={rotation ? { transform: `rotate(${rotation}deg)` } : undefined}
    >
      <path
        d="m0,78.07v-29.28S0,0,48.79,0h29.28s0,29.28,0,29.28c0,0,0,48.79-48.79,48.79,0,0-29.28,0-29.28,0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** EMN brand seed — circle from public/Shapes/seed.svg. */
function Seed() {
  return (
    <svg viewBox="0 0 48.8 48.8" className={SHAPE_SIZE}>
      <circle cx="24.4" cy="24.4" r="24.4" fill="currentColor" />
    </svg>
  );
}

/** Alternating leaf / seed strip — one copy for the marquee.
 *  Row container is the full 1em row height; shapes (0.78em) sit centered
 *  inside it.
 *
 *  Pattern is 4 leaf-seed pairs (8 shapes) — must be an EVEN number of
 *  pairs so the alternating L0/L90 rotations tile seamlessly across copy
 *  boundaries. With an odd count, the seed at the boundary would be
 *  flanked by two same-rotation leaves and the gap would look uneven. */
export function ShapeRow() {
  return (
    <div className="flex h-full items-center gap-[0.25em]">
      <Leaf />
      <Seed />
      <Leaf rotation={90} />
      <Seed />
      <Leaf />
      <Seed />
      <Leaf rotation={90} />
      <Seed />
    </div>
  );
}
