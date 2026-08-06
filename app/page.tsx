import Link from "next/link";
import { Instagram, Facebook, Linkedin } from "lucide-react";

import SectionContainer from "./components/section-container";
import Button from "./components/button";
import RotatingText from "./components/rotating-text";
import ScrollVelocity from "./components/scroll-velocity";
import { AnimationProvider } from "./components/animation-toggle";
import { ShapeRow } from "./components/hero-shapes";
import AboutSection from "./components/about-section";
import EmergingMarketsSection from "./components/emerging-markets-section";
import InstagramReels from "./components/instagram-reels";

export default function Home() {
  return (
    <AnimationProvider>
      {/* Hero — scrolling seed/leaf shapes behind colored text.
          Mobile: shapes hidden, h1 falls back to normal flow.
          Desktop: shapes visible, h1 absolutely overlays them. */}
      <div className="w-full pt-12 pb-12 md:pt-16">
        <div className="relative w-full">
          <div className="hidden text-emn-black md:block">
            <ScrollVelocity
              texts={[
                <ShapeRow key="r1" />,
                <ShapeRow key="r2" />,
                <ShapeRow key="r3" />,
              ]}
              velocity={30}
              className="block h-[1em] font-candu text-[64px] md:text-[128px]"
              scrollerClassName="scroller gap-4 md:gap-8"
              numCopies={8}
            />
          </div>
          <h1 className="pointer-events-none flex flex-col items-center justify-center font-candu leading-none tracking-tight text-[56px] md:absolute md:inset-0 md:text-[128px]">
            <span className="block bg-emn-offwhite px-5 text-emn-green">EMERGING</span>
            <span className="block bg-emn-offwhite px-5 text-emn-green-mid">MARKETS</span>
            <span className="block bg-emn-offwhite px-5 text-emn-green-dark">NETWORK</span>
          </h1>
        </div>
      </div>

      <main className="flex flex-col items-center gap-16 px-4 pb-16 md:gap-24 md:px-[18px] md:pb-[21px]">
        {/* Hero content */}
        <section className="flex w-full flex-col items-center gap-6 text-center">
          <p className="flex max-w-[744px] flex-wrap items-center justify-center gap-x-2 text-base font-semibold text-black md:gap-x-3 md:text-3xl">
            <span>Australia&apos;s inaugural student society focused on the</span>
            <RotatingText
              texts={["finance", "economics", "politics"]}
              mainClassName="px-3 py-1 md:px-4 md:py-2 bg-emn-black text-white overflow-hidden rounded-lg"
              animatePresenceMode="popLayout"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-1"
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              rotationInterval={2000}
            />
            <span>of the emerging world.</span>
          </p>
          <Button
            href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/"
            className="text-base font-black md:text-xl"
            innerClassName="flex h-12 w-[260px] max-w-full items-center justify-center px-4 md:h-[55px] md:w-[313px]"
            color="emn-green"
            outlineColor="emn-green-dark"
            textColor="white"
          >
            Become a Member
          </Button>
        </section>

        {/* Events */}
        <SectionContainer color="green-dark">
          <h2 className="text-center font-candu text-[56px] uppercase text-emn-offwhite md:text-title">
            events
          </h2>
          <p className="max-w-[820px] text-center text-lg text-emn-offwhite/80 md:text-description">
            Events showcase coming soon. In the meantime, check out our{" "}
            <Link
              href="https://www.instagram.com/emnunimelb/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emn-offwhite underline decoration-emn-green decoration-2 underline-offset-4"
            >
              Instagram
            </Link>{" "}
            for the latest updates.
          </p>
        </SectionContainer>

        {/* Sponsors */}
        <section className="flex w-full max-w-[1190px] flex-col items-center gap-8 md:gap-[29px]">
          <h2 className="font-candu text-[56px] uppercase text-emn-black md:text-title">
            SPONSORS
          </h2>
          <div className="flex w-full max-w-[1117px] flex-col items-center gap-12 rounded-[16px] border-4 border-black p-6 md:p-10">
            <p className="text-center text-base text-emn-black/70">
              Sponsor showcase coming soon.
            </p>
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
      </main>
    </AnimationProvider>
  );
}
