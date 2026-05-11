import Image from "next/image";

import { cn } from "@/app/lib/utils";
import Button from "./button";

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
}: {
  value: string;
  label: string;
  shape: StatShape;
}) {
  return (
    <div className="relative flex aspect-square w-[120px] shrink-0 items-center justify-center text-emn-offwhite sm:w-[180px] md:w-[260px]">
      {shape === "leaf-left" && (
        <Leaf rotation={-90} className="absolute inset-0 h-full w-full" />
      )}
      {shape === "leaf-right" && (
        <Leaf className="absolute inset-0 h-full w-full" />
      )}
      {shape === "seed" && <Seed className="absolute inset-0 h-full w-full" />}
      <div className="relative flex flex-col items-center gap-1 text-center font-candu uppercase text-emn-black md:gap-2">
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

      <p className="max-w-[896px] text-center text-base text-emn-offwhite md:text-left md:text-description">
        We are Australia&apos;s inaugural student society focused on emerging
        markets, connecting students with the financial, economic, and political
        forces shaping the developing world through educational and professional
        initiatives.
      </p>

      <div className="flex w-full items-center justify-center gap-2 sm:gap-6 md:gap-10">
        <Stat value="8+" label="Events/ Year" shape="leaf-left" />
        <Stat value="1K+" label="Members" shape="seed" />
        <Stat value="37+" label="Nationalities" shape="leaf-right" />
      </div>

      <Button
        href="/about"
        className="text-base font-black md:text-xl"
        innerClassName="flex h-12 w-[220px] max-w-full items-center justify-center px-4 md:h-[55px] md:w-[260px]"
        color="emn-black"
        outlineColor="emn-offwhite"
        textColor="emn-offwhite"
      >
        Learn more
      </Button>
    </section>
  );
}
