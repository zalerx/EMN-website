// "The Numbers" — the markets snapshot shown at the top of the Research page.
//
// There is no live market-data feed wired into this site, so these figures are
// maintained by hand: a committee member edits this file and redeploys. Update
// NUMBERS_AS_AT whenever you refresh the values so the "as at" stamp stays honest.
//
// Percentages are SIGNED: a positive number renders green (up), a negative
// number renders red (down). Store the real sign — the UI derives the arrow,
// colour and "+"/"−" prefix from it, so direction never depends on colour alone.

export interface NumbersIndicator {
  /** Display name of the index / instrument. */
  label: string;
  /** 1-week change, signed percent (e.g. 1.4 or -0.3). */
  week: number;
  /** Year-to-date change, signed percent. */
  ytd: number;
}

export interface NumbersRegion {
  /** Stable id used by the filter buttons. */
  id: string;
  /** Filter-button + section label. */
  label: string;
  indicators: NumbersIndicator[];
}

/** Human-readable "as at" stamp shown next to THE NUMBERS heading. */
export const NUMBERS_AS_AT = "As at market close · 6 Aug 2026";

/** Which region is selected when the page first loads. */
export const NUMBERS_DEFAULT_REGION = "global";

// Order here is the order the filter pills appear in.
export const MARKET_NUMBERS: NumbersRegion[] = [
  {
    id: "india",
    label: "India",
    indicators: [
      { label: "Nifty 50 Index", week: 1.4, ytd: 11.2 },
      { label: "India 10Y Govt Bond", week: -0.3, ytd: 2.1 },
    ],
  },
  {
    id: "china",
    label: "China",
    indicators: [
      { label: "Shanghai Shenzhen CSI 300 Index", week: -0.8, ytd: 6.4 },
      { label: "China 10Y Govt Bond", week: 0.2, ytd: -1.5 },
    ],
  },
  {
    id: "africa",
    label: "Africa",
    indicators: [
      { label: "S&P Pan Africa BMI", week: 0.6, ytd: 9.8 },
      { label: "S&P Africa Sovereign Bond Index", week: 0.4, ytd: 4.3 },
    ],
  },
  {
    id: "global",
    label: "Global & Commodities",
    indicators: [
      { label: "S&P 500 Index", week: 0.9, ytd: 13.6 },
      { label: "ASX All Ordinaries Index", week: 0.5, ytd: 7.9 },
      { label: "MSCI Emerging Markets Index ETF", week: 1.1, ytd: 10.4 },
      { label: "Gold", week: -0.4, ytd: 18.2 },
      { label: "Crude Oil", week: -1.6, ytd: -5.3 },
      { label: "Bitcoin", week: 3.2, ytd: 24.7 },
    ],
  },
];
