"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Button from "./button";
import CircularText from "./circular-text";

// The 3D logo pulls in `three` (WebGL). Load it lazily and client-only so the
// bundle stays out of the initial payload — it only ever renders on wide
// viewports, so most mobile visitors never download it.
const EmnLogo3D = dynamic(() => import("./emn-logo-3d"), { ssr: false });

const JOIN_URL =
  "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/";

// Distance (px) scrolled over which the hero "crops" from a full-bleed panel
// into an inset, leaf-cornered card. Mirrors `cropScroll` from the source
// design. The wrapper is this much taller than the viewport to give the sticky
// panel room to animate before the rest of the page scrolls up under it.
const CROP_SCROLL = 600;

// Below this width we skip the WebGL logo (matches the source design's gate)
// and stack the headline above the CTA.
const WIDE_BREAKPOINT = 1200;

interface HeroProps {
  /**
   * Grayscale photos that cross-fade behind the panel (multiply-blended over
   * the tint colour). A single image is a static backdrop; pass more to cycle.
   */
  backgroundImages?: string[];
  /** Seconds between background cross-fades (only relevant with 2+ images). */
  bgCycleSecs?: number;
  /**
   * Colour of the tint that multiply-blends over the photos (and fills the
   * panel where no photo covers). Any CSS colour; defaults to EMN green-dark
   * (`#18512d`).
   */
  tintColor?: string;
  /**
   * 0–1 tint strength. It's the opacity of the colour multiply layer, so 0
   * leaves the bare grayscale photo (no tint) and 1 is a full colour multiply
   * (the original look).
   */
  tintLevel?: number;
}

export default function Hero({
  backgroundImages = ["/images/about/group-photo.jpg"],
  bgCycleSecs = 7,
  tintColor = "#18512d",
  tintLevel = 1,
}: HeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  const [bg, setBg] = useState(0);

  // Wide-viewport gate for the 3D logo. Starts false so SSR and first client
  // render agree; the effect corrects it after mount.
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= WIDE_BREAKPOINT);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Drive the crop animation from scroll position via a scoped `--emn-crop`
  // custom property (0 = full-bleed, 1 = fully cropped card).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onScroll = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / CROP_SCROLL));
      root.style.setProperty("--emn-crop", p.toFixed(4));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cross-fade the backdrop when there's more than one image.
  useEffect(() => {
    if (backgroundImages.length < 2) return;
    const id = setInterval(
      () => setBg((b) => (b + 1) % backgroundImages.length),
      bgCycleSecs * 1000,
    );
    return () => clearInterval(id);
  }, [backgroundImages.length, bgCycleSecs]);

  const rootStyle = {
    "--emn-crop": 0,
    height: `calc(100vh + ${CROP_SCROLL}px)`,
  } as CSSProperties;

  // Guard against the active index dangling past the array when the image set
  // shrinks (e.g. while tuning). `% 0` is NaN, so fall back to 0 when empty.
  const activeIndex = backgroundImages.length
    ? bg % backgroundImages.length
    : 0;

  return (
    <div ref={rootRef} style={rootStyle}>
      {/* Crop insets scale with `--emn-crop`. The horizontal inset matches the
          page gutter so the cropped card lines up with the sections below:
          16px on mobile (main's `px-4`), 60px on desktop (the source crop). */}
      <div className="sticky top-0 box-border h-screen min-h-[720px] overflow-hidden px-[calc(var(--emn-crop)*16px)] pb-[calc(var(--emn-crop)*18px)] pt-[calc(var(--emn-crop)*92px)] md:px-[calc(var(--emn-crop)*60px)]">
        <section
          className="relative flex h-full flex-col justify-between overflow-hidden"
          style={{
            backgroundColor: tintColor,
            borderRadius:
              "calc(var(--emn-crop) * 85px) 0 calc(var(--emn-crop) * 85px) 0",
            padding: "clamp(28px, 4.5vh, 56px) 0",
            paddingTop: "calc(96px - var(--emn-crop) * 48px)",
          }}
        >
          {/* Cross-fading grayscale backdrop, multiply-blended over the tint. */}
          <div className="pointer-events-none absolute inset-0">
            {backgroundImages.map((src, i) => (
              <div
                key={src}
                className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
                style={{ opacity: activeIndex === i ? 1 : 0 }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className="object-cover"
                  style={{ filter: "grayscale(1) brightness(1.15)" }}
                />
              </div>
            ))}
            {/* Colour tint — multiplies over the photo. Opacity IS the strength,
                so 0 leaves the bare grayscale photo and 1 is a full multiply. */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                backgroundColor: tintColor,
                opacity: tintLevel,
                mixBlendMode: "multiply",
              }}
            />
          </div>

          {/* Content column, aligned to the navbar. The navbar is a gutter
              (px-3 / md:px-[18px]) wrapping a centered max-w-[1236px] pill, so
              we mirror that exact two-level structure — gutter outside, max-w
              box inside — and keep the headline flush to the inner box edge.
              That lands the title's left edge on the navbar's left edge at
              every width, while the background image stays full-bleed. */}
          <div className="relative flex min-h-0 w-full flex-1 flex-col px-3 md:px-[18px]">
            <div className="mx-auto flex w-full max-w-[1236px] flex-1 flex-col items-center justify-center gap-10 lg:flex-row lg:justify-between">
            <div className="text-center lg:text-left">
              <h1
                className="m-0 font-candu uppercase tracking-[-0.01em] text-emn-offwhite"
                style={{ fontSize: "clamp(2.5rem, min(12vw, 12.5vh), 158px)", lineHeight: 0.86 }}
              >
                <span className="block overflow-hidden pt-[0.06em]">
                  <span className="emn-rise-1 block">Emerging</span>
                </span>
                <span className="block overflow-hidden pt-[0.06em]">
                  <span className="emn-rise-2 block">Markets</span>
                </span>
                <span className="block overflow-hidden pt-[0.06em]">
                  <span className="emn-rise-3 block">Network</span>
                </span>
              </h1>
              <p
                className="emn-fade-up-sub mx-auto mt-6 max-w-[600px] font-semibold text-emn-offwhite/80 lg:mx-0"
                style={{ fontSize: "clamp(20px, 2.8vh, 28px)", lineHeight: 1.25, textWrap: "pretty" }}
              >
                Australia&apos;s inaugural student society focused on the finance,
                economics and politics of the emerging world.
              </p>
            </div>

            <div className="emn-fade-up-cta flex flex-col items-center justify-center gap-2 self-stretch lg:flex-1">
              {wide && (
                <div className="relative flex h-[clamp(280px,42vh,480px)] w-full items-center justify-center">
                  {/* Off-white disc sitting behind the 3D mark. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute aspect-square h-[82.8%] rounded-full"
                    style={{ backgroundColor: "#f1f1f1" }}
                  />
                  {/* Brand keywords slowly ringing the disc, just inside its
                      rim so the black text stays on the off-white. */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <CircularText
                      text="FINANCE • ECONOMICS • POLITICS • "
                      spinDuration={26}
                      onHover="speedUp"
                      className="pointer-events-auto text-emn-black"
                      style={
                        {
                          "--circular-text-size": "clamp(221px, 33.3vh, 380px)",
                          "--circular-text-font-size": "clamp(13px, 2vh, 20px)",
                        } as CSSProperties
                      }
                    />
                  </div>
                  <EmnLogo3D className="pointer-events-none relative block h-full w-full" />
                </div>
              )}
              <Button
                href={JOIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-black md:text-xl"
                innerClassName="flex h-12 w-[220px] max-w-full items-center justify-center px-4 md:h-[55px] md:w-[240px]"
                color="emn-green-mid"
                outlineColor="emn-offwhite"
                textColor="white"
                hoverTextColor="emn-green-mid"
                swapOnHover
              >
                Join Now
              </Button>
            </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
