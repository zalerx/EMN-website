import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="w-full max-w-[1197px] overflow-hidden rounded-section bg-emn-green-mid p-6 md:h-[620px] md:p-[30px]">
      <div className="flex h-full flex-col items-start justify-center rounded-br-[40px] rounded-tl-[40px] border-4 border-emn-offwhite px-6 py-10 md:rounded-br-[85px] md:rounded-tl-[85px] md:p-[69px]">
        <h2 className="font-candu text-[40px] leading-extra-tight text-emn-offwhite md:text-[64px]">
          READY TO EXPLORE
          <br />
          EMERGING MARKETS?
        </h2>
        <p className="mt-6 max-w-[775px] text-lg italic text-white md:text-description">
          Join EMN today, learn all there is to know about emerging markets
          <br className="hidden md:block" /> and become part of a community
          that&apos;s shaping the future.
        </p>
        <Link
          href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/"
          className="mt-8 inline-flex h-[55px] w-[313px] max-w-full items-center justify-center whitespace-nowrap rounded-pill bg-emn-offwhite px-4 text-xl font-black text-emn-green-dark"
        >
          Become a Member
        </Link>
      </div>
    </section>
  );
}
