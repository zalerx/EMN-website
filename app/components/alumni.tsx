import Container from "./container";
import Image from "next/image";

export default function Alumni() {
    return(
        <Container>
            <h2 className="font-candu tracking-loose mb-8 inline-flex rounded-tl-3xl rounded-br-3xl bg-[#6cbe45] px-6 py-2 text-3xl  text-white">
            ALUMNI DESTINATIONS
            </h2>
            <Image src="/alumni-destination-logos/MorganStanleyLogo.jpg" alt="Morgan Stanley Logo"width={100} height={100}/>
        </Container>
    )
}