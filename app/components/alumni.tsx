import Container from "./container";
import Image from "next/image";
import LeafHeading from "./leaf-heading";

export default function Alumni() {
  return (
    <Container>
      <LeafHeading className="mb-8">
        Alumni Destinations
      </LeafHeading>
      <Image
        src="/alumni-destination-logos/MorganStanleyLogo.jpg"
        alt="Morgan Stanley Logo"
        width={100}
        height={100}
      />
    </Container>
  );
}
