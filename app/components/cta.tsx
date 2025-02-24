import Button from "./button"

export default function CtaSection() {
  return (
    <section className="bg-[#6cbe45] py-16 rounded-tl-[6rem] rounded-br-[6rem] mx-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="mb-8 max-w-xl md:mb-0">
            <h2 className="font-candu mb-4 text-[3rem] text-white leading-extra-tight tracking-tight">
              READY TO EXPLORE
              EMERGING MARKETS?
            </h2>
            <p className="font-semibold text-white/90">
              Join EMN today, learn all there is to know about emerging markets and become part of a community that&aposs
              shaping the future.
            </p>
          </div>

        </div>
        <Button href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/" className="mt-8 bg-white text-[black] hover:bg-white/90">
          Become a Member
        </Button>
      </div>
    </section>
  )
}
