import Container from "../components/container"

export default function Events() {
    return( 
        <div className="min-h-screen bg-background mx-auto md: p-8">
        <Container>
          <h1 className="font-candu mb-6 text-2xl md:text-[5rem] leading-extra-tight tracking-tight text-[#231f20]">
            EVENTS
          </h1>
          <p className="font-medium md:text-xl text-foreground/80 mb-5">
            Stay tuned for our upcoming events!          
            </p>

        </Container>
        </div>
    )
}