import Image from "next/image";
import { Award } from "lucide-react";

import SectionContainer from "@/app/components/section-container";

function Leaf({
  rotation = 0,
  className,
}: {
  rotation?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 78.07 78.07"
      className={className}
      style={rotation ? { transform: `rotate(${rotation}deg)` } : undefined}
      aria-hidden
    >
      <path
        d="m0,78.07v-29.28S0,0,48.79,0h29.28s0,29.28,0,29.28c0,0,0,48.79-48.79,48.79,0,0-29.28,0-29.28,0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Seed({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48.8 48.8" className={className} aria-hidden>
      <circle cx="24.4" cy="24.4" r="24.4" fill="currentColor" />
    </svg>
  );
}

type StatShape = "leaf-left" | "seed" | "leaf-right";

function Stat({
  value,
  label,
  shape,
  shapeColor,
}: {
  value: string;
  label: string;
  shape: StatShape;
  shapeColor: string;
}) {
  return (
    <div className="relative flex aspect-square w-[120px] shrink-0 items-center justify-center sm:w-[200px] md:w-[280px]">
      <div className={`absolute inset-0 ${shapeColor}`}>
        {shape === "leaf-left" && (
          <Leaf rotation={-90} className="h-full w-full" />
        )}
        {shape === "leaf-right" && <Leaf className="h-full w-full" />}
        {shape === "seed" && <Seed className="h-full w-full" />}
      </div>
      <div className="relative flex flex-col items-center gap-1 text-center font-candu uppercase text-emn-offwhite md:gap-2">
        <span className="text-[40px] leading-none sm:text-[64px] md:text-[96px]">
          {value}
        </span>
        <span className="text-[10px] leading-none sm:text-sm md:text-[24px]">
          {label}
        </span>
      </div>
    </div>
  );
}

function ChartGroup({
  label,
  advanced,
  emerging,
}: {
  label: string;
  advanced: number;
  emerging: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3 md:gap-4">
      <div className="flex h-[160px] items-end gap-2 md:h-[220px] md:gap-3">
        <div
          className="w-10 bg-[#d9d9d9] sm:w-14 md:w-[70px]"
          style={{ height: `${advanced}%` }}
        />
        <div
          className="w-10 bg-emn-green sm:w-14 md:w-[70px]"
          style={{ height: `${emerging}%` }}
        />
      </div>
      <p className="text-center text-sm font-bold text-white md:text-description">
        {label}
      </p>
    </div>
  );
}

function Standout({
  title,
  country,
  blurb,
}: {
  title: string;
  country: string;
  blurb: string;
}) {
  return (
    <div className="flex items-start gap-4 md:gap-5">
      <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full bg-emn-green/15 text-emn-green md:h-[130px] md:w-[130px]">
        <Award className="h-10 w-10 md:h-16 md:w-16" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col text-white">
        <p className="text-lg md:text-description">{title}</p>
        <p className="text-lg font-bold md:text-description">{country}</p>
        <p className="mt-2 text-sm md:text-base">{blurb}</p>
      </div>
    </div>
  );
}

function MissionCard({
  src,
  alt,
  caption,
  captionAlign,
}: {
  src: string;
  alt: string;
  caption: string;
  captionAlign: "top" | "center" | "bottom";
}) {
  const captionPosition = {
    top: "items-start pt-8",
    center: "items-center",
    bottom: "items-end pb-8",
  }[captionAlign];

  return (
    <div className="relative aspect-[334/497] w-full overflow-hidden rounded-section">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 33vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div
        className={`absolute inset-0 flex justify-center px-6 ${captionPosition}`}
      >
        <p className="text-center font-candu text-2xl uppercase leading-tight text-white md:text-heading">
          {caption}
        </p>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <main className="flex flex-col items-center gap-16 px-4 pb-16 pt-10 md:gap-24 md:px-[18px] md:pb-[21px] md:pt-16">
      {/* Who We Are */}
      <section className="flex w-full max-w-[1190px] flex-col items-center gap-10">
        <h1 className="text-center font-candu text-[56px] uppercase leading-none text-emn-black md:text-title">
          ABOUT US
        </h1>
        <p className="max-w-[1190px] text-base text-emn-black md:text-description">
          EMN is Australia&apos;s inaugural student society focused on emerging
          markets, connecting students with the financial, economic, and political
          forces shaping the developing world through education and professional
          initiatives.
        </p>

        <div className="flex w-full items-center justify-center gap-2 sm:gap-6 md:gap-10">
          <Stat
            value="8+"
            label="Events/ Year"
            shape="leaf-left"
            shapeColor="text-emn-green"
          />
          <Stat
            value="1K+"
            label="Members"
            shape="seed"
            shapeColor="text-emn-green-mid"
          />
          <Stat
            value="37+"
            label="Nationalities"
            shape="leaf-right"
            shapeColor="text-emn-green-dark"
          />
        </div>

        <div className="relative aspect-[1172/518] w-full overflow-hidden rounded-[40px] border border-black">
          <Image
            src="/images/about/group-photo.jpg"
            alt="The EMN team"
            fill
            sizes="(min-width: 1024px) 1172px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Emerging Markets */}
      <SectionContainer color="green-dark">
        <h2 className="text-center font-candu text-[48px] uppercase leading-none text-emn-offwhite md:text-title">
          EMERGING MARKETS
        </h2>
        <p className="max-w-[1055px] text-base text-white md:text-description">
          (n.) developing nations/regions characterized by rapid growth in GDP,
          trade volume, and increased foreign direct investment
        </p>

        <div className="flex w-full flex-col items-center gap-8">
          <div className="flex items-end justify-center gap-8 md:gap-20">
            <ChartGroup label="2017-2024 Average" advanced={44} emerging={90} />
            <ChartGroup label="2025 Estimate" advanced={39} emerging={100} />
            <ChartGroup label="2026 Projection" advanced={41} emerging={95} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2">
              <span className="block h-5 w-5 bg-[#d9d9d9]" />
              <span className="text-sm font-bold text-white md:text-base">
                Advanced Economies
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="block h-5 w-5 bg-emn-green" />
              <span className="text-sm font-bold text-white md:text-base">
                Emerging Markets
              </span>
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <Standout
            title="The Stable Giant"
            country="India"
            blurb="mainly due to massive domestic consumption & export of digital services"
          />
          <Standout
            title="Africa's Growth Engine"
            country="Ethiopia"
            blurb="mainly due to favorable environment for exports (like coffee) following the floating of the Birr & a surge in global gold prices"
          />
        </div>
      </SectionContainer>

      {/* Our Mission */}
      <SectionContainer color="black">
        <h2 className="text-center font-candu text-[48px] uppercase leading-none text-emn-offwhite md:text-title">
          MISSION
        </h2>
        <p className="max-w-[1055px] text-base text-white md:text-description">
          to foster a <span className="font-bold">community</span> at the
          intersection of various disciplines, promoting a deeper{" "}
          <span className="font-bold">understanding</span> of the developing
          world through{" "}
          <span className="font-bold">social and educational activities</span>.
          Our topics of interest encompass, and stretch far beyond:
        </p>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <MissionCard
            src="/images/about/china.png"
            alt="China's financial markets"
            caption="China's Financial Markets"
            captionAlign="bottom"
          />
          <MissionCard
            src="/images/about/apac.png"
            alt="Economic development in the APAC region"
            caption="Economic Development in the APAC Region"
            captionAlign="center"
          />
          <MissionCard
            src="/images/about/brics.png"
            alt="BRICS geopolitics"
            caption="BRICS Geopolitics"
            captionAlign="center"
          />
        </div>
      </SectionContainer>
    </main>
  );
}
