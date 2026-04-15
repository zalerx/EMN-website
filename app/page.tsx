import Link from "next/link";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import CtaSection from "./components/cta";
import SectionContainer from "./components/section-container";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-16 px-4 pb-16 pt-12 md:gap-24 md:px-[18px] md:pb-[21px] md:pt-16">
      {/* Hero */}
      <section className="flex w-full max-w-[821px] flex-col items-center gap-6 text-center">
        <h1 className="font-candu text-[64px] leading-[0.74] tracking-tight md:text-[128px]">
          <span className="block text-emn-green">EMERGING</span>
          <span className="block text-emn-green-mid">MARKETS</span>
          <span className="block text-emn-green-dark">NETWORK</span>
        </h1>
        <p className="max-w-[744px] text-lg text-black md:text-description">
          Explore the dynamic intersection of finance, economics, and politics
          in emerging markets.
        </p>
        <Link
          href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/"
          className="inline-flex h-[55px] w-[313px] max-w-full items-center justify-center rounded-pill bg-emn-green px-4 text-xl font-black text-white"
        >
          Become a Member
        </Link>
      </section>

      {/* Events */}
      <SectionContainer color="green-dark">
        <h2 className="font-candu text-[56px] uppercase text-emn-offwhite md:text-title">
          events
        </h2>
        <p className="text-center text-lg text-emn-offwhite/80">
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
        <Link
          href="/sponsors"
          className="mt-4 inline-flex h-[55px] w-[313px] max-w-full items-center justify-center rounded-pill bg-emn-black px-4 text-xl font-black text-white"
        >
          Become a Sponsor
        </Link>
      </section>

      {/* About */}
      <SectionContainer color="black" className="md:h-[499px]">
        <h2 className="font-candu text-[56px] uppercase text-emn-offwhite md:text-title">
          ABOUT EMN
        </h2>
        <p className="max-w-[820px] text-center text-emn-offwhite/80 md:text-description">
          The Emerging Markets Network (EMN) is a University of Melbourne
          Student Union affiliated club, exploring the economics, politics and
          financial markets of emerging nations.
        </p>
        <Link
          href="/about"
          className="mt-4 inline-flex h-[55px] w-[260px] max-w-full items-center justify-center rounded-pill border-2 border-emn-offwhite px-4 text-xl font-black text-emn-offwhite"
        >
          Learn more
        </Link>
      </SectionContainer>

      {/* Socials */}
      <section className="flex w-full flex-col items-center gap-8 md:gap-[29px]">
        <h2 className="font-candu text-[56px] uppercase text-emn-black md:text-title">
          SOCIALS
        </h2>
        <div className="flex items-center gap-8">
          <Link
            href="https://www.instagram.com/emnunimelb/"
            aria-label="Instagram"
            className="text-emn-black hover:text-emn-green"
          >
            <Instagram className="h-10 w-10" />
          </Link>
          <Link
            href="https://www.facebook.com/emergingmarketsnetwork"
            aria-label="Facebook"
            className="text-emn-black hover:text-emn-green"
          >
            <Facebook className="h-10 w-10" />
          </Link>
          <Link
            href="https://www.linkedin.com/company/emnunimelb/"
            aria-label="LinkedIn"
            className="text-emn-black hover:text-emn-green"
          >
            <Linkedin className="h-10 w-10" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <CtaSection />
    </main>
  );
}
