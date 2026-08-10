import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { getCommitteeSession } from "@/app/lib/require-committee";
import { listSponsors } from "@/app/lib/sponsors/queries";
import SponsorCarousel from "@/app/components/sponsors/sponsor-carousel";
import SponsorManager from "@/app/components/sponsors/sponsor-manager";
import EnquiryForm from "@/app/components/sponsors/enquiry-form";
import type { Sponsor } from "@/types/sponsor";

// Visible contact address; the enquiry form composes a mailto to the same
// inbox (see components/sponsors/enquiry-form.tsx).
const SPONSOR_EMAIL = "emergingmarketsnetworksponsors@gmail.com";

const STATS = [
  { n: "1000+", l: "Followers across our social media platforms" },
  { n: "8+", l: "Events per year — pub nights, panels & workshops" },
  { n: "700+", l: "Newsletter subscribers with a 50% open rate" },
  { n: "#1", l: "Australia's inaugural student society for emerging markets" },
];

export default async function Sponsors() {
  // Sponsor list + committee gate. If Supabase isn't configured (no env) the
  // reads throw — fall back to an empty carousel and no manager so the page
  // still renders for public visitors.
  let sponsors: Sponsor[] = [];
  let isCommittee = false;
  try {
    sponsors = await listSponsors();
  } catch (e) {
    console.error("[sponsors] list failed:", e);
  }
  try {
    isCommittee = (await getCommitteeSession()) !== null;
  } catch (e) {
    console.error("[sponsors] session check failed:", e);
  }

  return (
    <main className="px-4 pb-16 md:px-[18px] md:pb-[21px]">
      {/* Hero */}
      <section className="mx-auto mt-12 flex max-w-[1236px] flex-col items-center px-0 text-center md:mt-[72px] md:px-[18px]">
        <h1 className="mb-6 font-candu text-[54px] uppercase leading-[0.9] text-emn-green-dark md:mb-[26px] md:text-[72px] lg:text-[120px]">
          Sponsors
        </h1>
        <p className="mb-[14px] max-w-[760px] text-xl font-bold leading-[1.3] md:text-2xl">
          The firms and platforms shaping emerging-market finance.
        </p>
        <p className="max-w-[680px] text-base leading-[1.5] text-emn-black/85 md:text-lg">
          EMN connects sponsors with a growing community of students interested
          in finance, economics, policy, consulting and global markets. Through
          joint events, social media campaigns and campus activations, we help
          organisations build visibility, share opportunities, and engage future
          talent.
        </p>
      </section>

      {/* Our sponsors */}
      <section className="mx-auto mt-20 max-w-[1236px] px-0 md:mt-[88px] md:px-[18px]">
        <SponsorCarousel sponsors={sponsors} />
        {isCommittee && <SponsorManager sponsors={sponsors} />}
      </section>

      {/* Become a sponsor */}
      <section className="mx-auto mb-16 mt-[90px] max-w-[1272px] rounded-section bg-emn-green-mid p-7">
        <div className="grid grid-cols-1 gap-14 rounded-[85px_0_85px_0] border-4 border-emn-offwhite px-7 py-9 text-emn-offwhite md:px-[60px] md:py-14 lg:grid-cols-2">
          {/* Left: pitch, stats, contact */}
          <div>
            <h2 className="mb-[18px] font-candu text-[46px] uppercase leading-[0.92] lg:text-[72px]">
              Become a
              <br />
              Sponsor
            </h2>
            <p className="mb-7 max-w-[520px] text-xl italic leading-[1.35] md:text-[22px]">
              Put your brand in front of the students heading into the
              region&apos;s top finance, consulting and policy careers.
            </p>

            <div className="mb-7 grid grid-cols-1 gap-[14px] sm:grid-cols-2">
              {STATS.map(({ n, l }) => (
                <div
                  key={l}
                  className="rounded-[16px] border-2 border-emn-offwhite/45 px-[18px] py-4"
                >
                  <div className="font-candu text-[40px] leading-none">{n}</div>
                  <div className="mt-1 text-[13px] leading-[1.3] opacity-85">
                    {l}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-[18px] w-[18px] shrink-0" />
                <Link
                  href={`mailto:${SPONSOR_EMAIL}`}
                  className="font-bold text-emn-offwhite underline decoration-emn-green decoration-2 underline-offset-4 [overflow-wrap:anywhere]"
                >
                  {SPONSOR_EMAIL}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-[18px] w-[18px] shrink-0" />
                <span>
                  Or DM us on{" "}
                  <Link
                    href="https://www.instagram.com/emnunimelb/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emn-offwhite underline decoration-emn-green decoration-2 underline-offset-4"
                  >
                    @emnunimelb
                  </Link>
                </span>
              </div>
            </div>
          </div>

          {/* Right: enquiry form */}
          <EnquiryForm />
        </div>
      </section>
    </main>
  );
}
