import { getMarketNumbers } from "@/app/lib/articles/numbers-source";
import TheNumbersClient from "./the-numbers-client";

// Server component: fetches the markets snapshot (published Google Sheet, or the
// baked-in fallback) and hands it to the interactive client table. Data lives on
// the server; only the filter interactivity ships to the browser.
export default async function TheNumbers() {
  const { regions, asAt, defaultRegionId } = await getMarketNumbers();
  return (
    <TheNumbersClient
      regions={regions}
      asAt={asAt}
      defaultRegionId={defaultRegionId}
    />
  );
}
