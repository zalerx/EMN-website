import Link from "next/link";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import EventCard from "./components/event-card";
import CtaSection from "./components/cta";

const PUB_NIGHT_IMAGE =
  "https://www.figma.com/api/mcp/asset/e3ea98ba-1b93-4650-8568-f2aef9b3c43a";

const EVENTS = [
  {
    title: "Pub Night",
    date: "MARCH 6 2025, 6:00PM",
    description:
      "The Emerging Markets Network and Global Affairs Society are hosting a pub night at The Clyde Hotel with free drinks and food",
    imageSrc: PUB_NIGHT_IMAGE,
  },
  {
    title: "Pub Night",
    date: "MARCH 6 2025, 6:00PM",
    description:
      "The Emerging Markets Network and Global Affairs Society are hosting a pub night at The Clyde Hotel with free drinks and food",
    imageSrc: PUB_NIGHT_IMAGE,
  },
];

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
      <section className="flex w-full max-w-[1190px] flex-col items-center gap-10 rounded-section bg-emn-green-dark p-6 md:gap-[45px] md:p-[30px]">
        <h2 className="font-candu text-[56px] uppercase text-emn-offwhite md:text-title">
          events
        </h2>
        <div className="flex flex-col items-center justify-center gap-12 md:flex-row md:gap-[102px]">
          {EVENTS.map((event, i) => (
            <EventCard key={i} {...event} />
          ))}
        </div>
      </section>

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
      <section className="flex w-full max-w-[1190px] flex-col items-center gap-8 rounded-section bg-emn-black p-6 md:h-[499px] md:p-[30px]">
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
      </section>

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
