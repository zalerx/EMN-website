import Link from "next/link";
import { Instagram, Facebook, Linkedin } from "lucide-react";

import Button from "./components/button";
import Hero from "./components/hero";
import { AnimationProvider } from "./components/animation-toggle";
import AboutSection from "./components/about-section";
import EmergingMarketsSection from "./components/emerging-markets-section";
import InstagramReels from "./components/instagram-reels";
import SponsorCarousel from "./components/sponsors/sponsor-carousel";
import { listSponsors } from "./lib/sponsors/queries";
import type { Sponsor } from "@/types/sponsor";

// Photos the hero cross-fades through (grayscale + green tint), in display
// order. Upload new hero photos to `public/images/hero/` and add their paths
// here — the cross-fade turns on automatically once there are 2+ entries.
const HERO_IMAGES = [
  "/images/hero/group-photo.jpg",
  "/images/hero/good-candid-group.png",
  "/images/hero/candid.png",
  "/images/hero/o-week.JPG",
  "/images/hero/market-smile-group-pic.JPEG",
  "/images/hero/panel.png",
  "/images/hero/pres-group.png",
  "/images/hero/group2.JPEG",
  "/images/hero/girls-beach.JPG",
  "/images/hero/beach-candid.JPG",
  "/images/hero/star-group.JPG",
  "/images/hero/group.JPG",
  "/images/hero/research-group.JPEG",
  "/images/hero/exec-group.JPG",
  "/images/hero/ops-group.JPEG",
  "/images/hero/smores.jpeg",
];

export default async function Home() {
  // Sponsor list for the carousel. If Supabase isn't configured (no env) the
  // read throws — fall back to an empty carousel (which shows placeholder
  // tiles) so the home page still renders.
  let sponsors: Sponsor[] = [];
  try {
    sponsors = await listSponsors();
  } catch (e) {
    console.error("[home] sponsors list failed:", e);
  }

  return (
    <AnimationProvider>
      <Hero
        tintColor="#18512d"
        backgroundImages={HERO_IMAGES}
        bgCycleSecs={4}
      />

      {/* pt matches the inter-section gap (gap-16 / md:gap-24) minus the hero's
          18px bottom crop inset, so the hero → About gap equals the gap between
          the other sections. */}
      <main className="flex flex-col items-center gap-16 px-4 pb-16 pt-[46px] md:gap-24 md:px-[18px] md:pb-[21px] md:pt-[78px]">
        {/* About */}
        <AboutSection />

        {/* What are emerging markets */}
        <EmergingMarketsSection />

        {/* Socials */}
        <section className="flex w-full max-w-[1190px] flex-col items-center gap-8 md:gap-10">
          <div className="flex flex-col items-center gap-4 md:gap-5">
            <h2 className="font-candu text-[56px] uppercase text-emn-black md:text-title">
              SOCIALS
            </h2>
            <p className="max-w-[680px] text-center text-lg text-emn-black/70 md:text-description">
              Catch our latest events, market commentary and highlights on our
              social media.
            </p>
          </div>

          {/* Latest reels — pulled from Instagram (see INSTAGRAM.md for setup). */}
          <InstagramReels />

          {/* Follow us across platforms */}
          <div className="flex items-center gap-8">
            <Link
              href="https://www.instagram.com/emnunimelb/"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emn-black transition-colors hover:text-emn-green"
            >
              <Instagram className="h-10 w-10" />
            </Link>
            <Link
              href="https://www.facebook.com/emergingmarketsnetwork"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emn-black transition-colors hover:text-emn-green"
            >
              <Facebook className="h-10 w-10" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/emnunimelb/"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emn-black transition-colors hover:text-emn-green"
            >
              <Linkedin className="h-10 w-10" />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full max-w-[1197px] overflow-hidden rounded-section bg-emn-green-mid p-6 md:h-[620px] md:p-[30px]">
          <div className="flex h-full flex-col items-start justify-center rounded-br-[40px] rounded-tl-[40px] border-4 border-emn-offwhite px-6 py-10 md:rounded-br-[85px] md:rounded-tl-[85px] md:p-[69px]">
            <h2 className="font-candu text-[40px] leading-extra-tight text-emn-offwhite md:text-[64px]">
              READY TO EXPLORE
              <br />
              EMERGING MARKETS?
            </h2>
            <p className="mt-6 max-w-[775px] text-lg italic text-white md:text-description">
              Join EMN today, learn all there is to know about emerging markets
              <br className="hidden md:block" /> and become part of a community
              that&apos;s shaping the future.
            </p>
            <Button
              href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/"
              className="mt-8 text-base font-black md:text-xl"
              innerClassName="flex h-12 w-[260px] max-w-full items-center justify-center whitespace-nowrap px-4 md:h-[55px] md:w-[313px]"
              color="emn-offwhite"
              outlineColor="emn-green-dark"
              textColor="emn-green-dark"
            >
              Become a Member
            </Button>
          </div>
        </section>

        {/* Sponsors */}
        <section className="flex w-full max-w-[1190px] flex-col items-center gap-8 md:gap-[29px]">
          <h2 className="font-candu text-[56px] uppercase text-emn-black md:text-title">
            SPONSORS
          </h2>
          <div className="w-full max-w-[1117px]">
            <SponsorCarousel sponsors={sponsors} showHeading={false} />
          </div>
          <Button
            href="/sponsors"
            className="mt-4 text-base font-black md:text-xl"
            innerClassName="flex h-12 w-[260px] max-w-full items-center justify-center px-4 md:h-[55px] md:w-[313px]"
            color="emn-black"
            outlineColor="black"
            textColor="white"
          >
            Become a Sponsor
          </Button>
        </section>
      </main>
    </AnimationProvider>
  );
}
