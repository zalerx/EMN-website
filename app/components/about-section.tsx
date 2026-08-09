import Image from "next/image";

import CountUp from "@/app/components/count-up";
import { cn } from "@/app/lib/utils";

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
  to,
  suffix,
  label,
  shape,
}: {
  to: number;
  suffix?: string;
  label: string;
  shape: StatShape;
}) {
  return (
    <div className="relative flex aspect-square w-full min-w-0 max-w-[120px] items-center justify-center text-emn-offwhite [container-type:inline-size] sm:max-w-[180px] md:max-w-[260px]">
      {shape === "leaf-left" && (
        <Leaf rotation={-90} className="absolute inset-0 h-full w-full" />
      )}
      {shape === "leaf-right" && (
        <Leaf className="absolute inset-0 h-full w-full" />
      )}
      {shape === "seed" && <Seed className="absolute inset-0 h-full w-full" />}
      <div className="relative flex flex-col items-center gap-1 text-center font-candu uppercase text-emn-black md:gap-2">
        <span className="font-sans text-[37cqw] font-bold leading-none">
          <CountUp from={0} to={to} direction="up" duration={1.5} />
          {suffix}
        </span>
        <span className="whitespace-nowrap text-[9cqw] leading-none">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function AboutSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "flex w-full max-w-[1190px] flex-col items-center gap-12 rounded-section bg-emn-black px-6 py-12 md:gap-[60px] md:px-[30px] md:py-[53px]",
        className,
      )}
    >
      <h2 className="text-center font-candu text-[56px] uppercase leading-none text-emn-offwhite md:text-title">
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

      <div className="flex max-w-[896px] flex-col gap-4 text-center md:text-left">
        <p className="text-lg text-emn-offwhite md:text-description">
          EMN is Australia&apos;s inaugural student society dedicated to emerging
          markets.
        </p>
        <p className="text-lg text-emn-offwhite/85 md:text-description">
          We connect students interested in finance, economics and politics with
          the regions driving the next phase of global growth and geopolitical
          influence.
        </p>
        <p className="text-lg text-emn-offwhite/85 md:text-description">
          From industry evenings and case competitions to in-house research, and
          social events, EMN gives you a place to connect with industry
          professionals, build commercial acumen, and gain a global perspective
          from day one.
        </p>
      </div>

      <div className="flex w-full items-center justify-center gap-2 sm:gap-6 md:gap-10">
        <Stat to={8} suffix="+" label="Events/ Year" shape="leaf-left" />
        <Stat to={1} suffix="K+" label="Members" shape="seed" />
        <Stat to={37} suffix="+" label="Nationalities" shape="leaf-right" />
      </div>
    </section>
  );
}
