
import Button from "./components/button"
import Container from "./components/container"
import WhyJoinEmn from "./components/why-join"
import CtaSection from "./components/cta"

export default function Home() {
  return ( 
    <div className="min-h-screen bg-background mx-auto px-4 md:p-6">
        <Container>
          <h1 className="font-candu mb-6 text-[3rem] md:text-[8rem] leading-extra-tight tracking-tight text-[#231f20]">
            THE EMERGING
            MARKETS
            NETWORK
          </h1>
          <p className="font-medium text-sm md:text-xl text-foreground/80 mb-5">
            Explore the dynamic intersection of finance, economics, and politics in emerging markets.
          </p>
          <Button href="../about" className="font-bold text-[20px] border-black border-2 px-5 py-2 background-[#f1f1f1]">
            Learn More
          </Button>
        </Container>

        <Container >
        <h2 className="font-candu tracking-loose mb-8 inline-flex rounded-tl-3xl rounded-br-3xl bg-[#6cbe45] px-6 py-2 text-3xl  text-white">
          UPCOMING EVENTS
        </h2>
        <p className="font-medium md:text-xl text-foreground/80 mb-5">Join us in our upcoming events:</p>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-lg bg-[#f1f1f1]"
              role="img"
              aria-label="Event placeholder image"
            />
          ))}
        </div>
        </Container>
        
        <WhyJoinEmn/>
        <CtaSection/>
    </div>
  );
}
