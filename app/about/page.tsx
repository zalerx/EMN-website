import Container from "../components/container"

export default function About() {
    return( 
        <div className="min-h-screen bg-background mx-auto md: p-8">
        <Container>
          <h1 className="font-candu mb-6 text-2xl md:text-[5rem] leading-extra-tight tracking-tight text-[#231f20]">
            ABOUT EMN
          </h1>
          <p className="font-medium md:text-xl text-foreground/80 mb-5">
          The Emerging Markets Network (EMN) is a University of Melbourne Student Union affiliated club. Aiming to explore the economics, politics and financial markets of emerging nations. 
          </p>

        </Container>
        </div>
    )
}