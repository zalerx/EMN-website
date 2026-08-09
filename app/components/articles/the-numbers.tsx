"use client";

import { useState } from "react";
import { cn } from "@/app/lib/utils";
import {
  MARKET_NUMBERS,
  NUMBERS_AS_AT,
  NUMBERS_DEFAULT_REGION,
} from "@/app/lib/articles/numbers";

// Direction is encoded by the sign, not by colour alone: a "+"/"−" prefix keeps
// it readable for colourblind users and screen readers.
function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={up ? "text-emn-green-mid" : "text-[#c0392b]"}>
      {up ? "+" : "−"}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

const TH_BASE =
  "bg-emn-green py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white";
const TD_BASE = "border-b-2 border-emn-black/[0.08] py-3 text-[15px]";

export default function TheNumbers() {
  const [active, setActive] = useState(NUMBERS_DEFAULT_REGION);
  const region =
    MARKET_NUMBERS.find((r) => r.id === active) ?? MARKET_NUMBERS[0];

  return (
    <section aria-labelledby="numbers-heading">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2
          id="numbers-heading"
          className="font-candu text-3xl uppercase leading-none text-emn-green-dark md:text-[44px]"
        >
          The Numbers
        </h2>
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-emn-black/50">
          {NUMBERS_AS_AT}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-3">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-emn-black/60">
          Filter
        </span>
        <div className="flex flex-wrap gap-2">
          {MARKET_NUMBERS.map((r) => {
            const on = r.id === active;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(r.id)}
                className={cn(
                  "h-[34px] rounded-[17px_0_17px_0] border-2 border-emn-green-dark px-4 pt-[2px] text-[13px] font-bold transition-colors",
                  on
                    ? "bg-emn-green-dark text-emn-offwhite"
                    : "bg-transparent text-emn-green-dark hover:bg-emn-green-dark/10"
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-[18px] bg-white px-5 pb-3 pt-5 md:px-7 md:pt-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={cn(TH_BASE, "rounded-l-[8px] pl-3.5 pr-3 text-left")}>
                Indicator
              </th>
              <th className={cn(TH_BASE, "px-3 text-right")}>1 Week</th>
              <th className={cn(TH_BASE, "rounded-r-[8px] pl-3 pr-3.5 text-right")}>
                YTD
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={3}
                className="bg-emn-green/[0.12] px-3.5 pb-1.5 pt-2.5 font-candu text-xl uppercase tracking-[0.04em] text-emn-green-dark"
              >
                {region.label}
              </td>
            </tr>
            {region.indicators.map((ind) => (
              <tr key={ind.label}>
                <td className={cn(TD_BASE, "pl-3.5 pr-3 text-left font-bold text-emn-black")}>
                  {ind.label}
                </td>
                <td className={cn(TD_BASE, "px-3 text-right font-black")}>
                  <Change value={ind.week} />
                </td>
                <td className={cn(TD_BASE, "pl-3 pr-3.5 text-right font-black")}>
                  <Change value={ind.ytd} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
