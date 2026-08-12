import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import RotatingText from "@/app/components/rotating-text";
import { cn } from "@/app/lib/utils";

// Home countries of EMN members, cycled through the rotating pill below.
const MEMBER_COUNTRIES = [
  "Australia",
  "China",
  "India",
  "Malaysia",
  "Vietnam",
  "Indonesia",
  "New Zealand",
  "Singapore",
  "Sri Lanka",
  "France",
  "Thailand",
  "Japan",
  "Philippines",
  "Iran",
  "Taiwan",
  "South Korea",
  "Nigeria",
  "Bangladesh",
  "Cambodia",
  "United States",
  "Canada",
  "Afghanistan",
  "Kenya",
  "Brunei",
  "Hong Kong",
  "United Kingdom",
  "Pakistan",
];

// Green marker highlight for key words in the copy. box-decoration-clone keeps
// the rounded background intact when a phrase wraps onto a second line.
function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="box-decoration-clone rounded bg-emn-green px-1.5 text-emn-black">
      {children}
    </span>
  );
}

export default function AboutSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "flex w-full max-w-[1190px] flex-col items-center gap-8 rounded-section bg-emn-offwhite px-6 py-12 md:gap-[44px] md:px-[30px] md:py-[53px]",
        className,
      )}
    >
      <h2 className="text-center font-candu text-[56px] uppercase leading-none text-emn-black md:text-title">
        ABOUT EMN
      </h2>

      <div className="relative aspect-[1036/363] w-full max-w-[1036px] overflow-hidden rounded-section">
        <Image
          src="/images/about/group-photo.jpg"
          alt="The EMN team"
          fill
          sizes="(min-width: 1024px) 1036px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex max-w-[896px] flex-col gap-4 text-center">
        <p className="text-lg text-emn-black md:text-description">
          We bring together students interested in{" "}
          <Highlight>finance</Highlight>, <Highlight>economics</Highlight> and{" "}
          <Highlight>geopolitics</Highlight> to engage with the economies
          reshaping global growth, capital and power.
        </p>
        <p className="text-lg text-emn-black/85 md:text-description">
          Through industry{" "}
          <Link
            href="/events"
            className="underline decoration-emn-green decoration-2 underline-offset-2"
          >
            events
          </Link>
          , case competitions, in house{" "}
          <Link
            href="/articles"
            className="underline decoration-emn-green decoration-2 underline-offset-2"
          >
            research
          </Link>{" "}
          and social outings, members build commercial judgement, develop a{" "}
          <Highlight>global perspective</Highlight> and connect with like-minded
          peers and industry professionals.
        </p>
      </div>

      <div className="flex w-fit max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-3 rounded-tl-[28px] rounded-br-[28px] border-4 border-emn-black px-6 py-4 text-center text-2xl font-bold text-emn-black md:px-8 md:py-5 md:text-4xl">
        <span>Our members are from:</span>
        {/*
          Reserve a fixed-width slot as wide as the longest country name so the
          rotating pill can grow/shrink without nudging this label. An invisible
          stack of every country (all in one grid cell) establishes that max
          width — so it stays correct if the list changes — and the live pill is
          centered inside it. font-kerning:none matches RotatingText, which lays
          out each character as a separate inline-block (i.e. un-kerned).
        */}
        <span className="grid">
          <span
            aria-hidden="true"
            className="pointer-events-none invisible col-start-1 row-start-1 grid px-4 [font-kerning:none] md:px-5"
          >
            {MEMBER_COUNTRIES.map((country) => (
              <span
                key={country}
                className="col-start-1 row-start-1 whitespace-nowrap"
              >
                {country}
              </span>
            ))}
          </span>
          <RotatingText
            texts={MEMBER_COUNTRIES}
            mainClassName="col-start-1 row-start-1 justify-self-center justify-center overflow-hidden rounded-lg bg-emn-black px-4 py-1.5 text-emn-offwhite md:px-5 md:py-2"
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
        </span>
      </div>
    </section>
  );
}
