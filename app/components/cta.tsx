import Button from "./button"

export default function CtaSection() {
  return (
    <section className="bg-[#6cbe45] py-8 my-6  md:py-16 rounded-tl-[3rem] rounded-br-[3rem] md:rounded-tl-[6rem] md:rounded-br-[6rem] md:mx-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center mb:4 md:flex-row md:justify-between">
          <div className="md:mb-0 max-w-xl mb-5">
            <h2 className="font-candu text-[3rem] text-white leading-extra-tight tracking-tight">
              READY TO EXPLORE
              EMERGING MARKETS?
            </h2>
            <p className="font-semibold text-white/90">
              Join EMN today, learn all there is to know about emerging markets and become part of a community that is 
              shaping the future.
            </p>
          </div>

        </div>
        <Button href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/" className="md:mt-8 bg-white text-[black] hover:bg-white/90">
          Become a Member
        </Button>
      </div>
    </section>
  )
}
