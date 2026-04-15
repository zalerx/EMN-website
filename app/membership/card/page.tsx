import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { authOptions } from "@/app/lib/auth";
import { signStudentId } from "@/app/lib/hmac";
import { generateStyledQR } from "@/app/lib/qr-styled";

// Sponsor data — add real logos here as they come in.
// shape: "seed" (circle) | "leaf" (rounded-tl + rounded-br)
const SPONSORS: { name: string; logo?: string; shape: "seed" | "leaf" }[] = [
  { name: "Karomi Cafe", logo: undefined, shape: "seed" },
  { name: "Sponsor 2", logo: undefined, shape: "leaf" },
  { name: "Sponsor 3", logo: undefined, shape: "seed" },
  { name: "Sponsor 4", logo: undefined, shape: "leaf" },
];

const SHAPE_CLASSES = {
  seed: "rounded-full",
  leaf: "rounded-tl-[50%] rounded-br-[50%] rounded-tr-[10%] rounded-bl-[10%]",
} as const;

export default async function CardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.studentId || !session.user.name) {
    redirect("/membership");
  }

  const { studentId, name } = session.user;
  // Name is stored as "Lastname, FirstName" in Supabase
  const firstName = name.includes(",")
    ? name.split(",")[1].trim()
    : name.split(" ")[0];

  // Build the signed verification URL
  const sig = signStudentId(studentId);
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify?id=${studentId}&sig=${sig}`;

  // Generate styled QR — circles + leaf-shaped eyes, white on transparent
  const qrDataUrl = generateStyledQR(verifyUrl, {
    size: 200,
    fgColor: "#ffffff",
    bgColor: "transparent",
  });

  return (
    <main className="flex min-h-[70vh] flex-col items-center px-4 py-16">
      {/* Title */}
      <h1 className="font-candu text-[56px] text-emn-black md:text-title">
        MEMBERSHIP
      </h1>

      {/* Greeting */}
      <div className="mt-8 w-full max-w-[907px] text-base font-semibold text-black">
        <p>
          Hi, {firstName}! Thanks for being an EMN member — we&apos;re glad to
          have you. Here&apos;s your digital membership card:
        </p>
      </div>

      {/* Card — landscape layout */}
      <div className="mt-6 w-full max-w-[907px] rounded-[24px] bg-emn-green-dark p-6 md:p-10">
        <div className="flex flex-col rounded-br-[60px] rounded-tl-[60px] border-4 border-white p-6 md:flex-row md:items-stretch md:rounded-br-[85px] md:rounded-tl-[85px] md:p-10">
          {/* Left column: title + member details */}
          <div className="flex flex-1 flex-col justify-between">
            <h2 className="font-candu text-[36px] font-bold leading-extra-tight text-white md:text-[64px]">
              MEMBERSHIP
              <br />
              CARD
            </h2>

            <div className="mt-8 space-y-3 md:mt-0">
              <div>
                <p className="text-sm font-bold italic text-white">
                  Student ID
                </p>
                <p className="text-base text-white/90">{studentId}</p>
              </div>
              <div>
                <p className="text-sm font-bold italic text-white">Name</p>
                <p className="text-base text-white/90">{name}</p>
              </div>
            </div>
          </div>

          {/* Right column: QR code + logo */}
          <div className="mt-8 flex flex-col items-center justify-between md:mt-0 md:items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="Membership QR code"
              width={200}
              height={200}
            />
            <Image
              src="/EMN-logo.svg"
              alt="EMN"
              width={120}
              height={28}
              className="mt-6 brightness-0 invert md:mt-0"
            />
          </div>
        </div>
      </div>

      {/* Dev helper — uncomment to test verify link without scanning
      <a
        href={verifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-sm text-emn-black/50 underline underline-offset-4"
      >
        Test verification link
      </a>
      */}

      {/* Participating Sponsors */}
      <div className="relative mt-20 w-full max-w-[916px]">
        {/* Leaf heading badge */}
        <div className="absolute -top-[34px] left-[46px] z-10 inline-flex items-center justify-center rounded-br-pill rounded-tl-pill border-4 border-emn-black bg-emn-offwhite px-[30px] pb-[6px] pt-[12px]">
          <span className="font-candu text-heading uppercase text-emn-black">
            Participating sponsors
          </span>
        </div>

        {/* Sponsors grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-[16px] border-4 border-emn-black px-10 pb-10 pt-[59px] md:justify-start md:gap-[25px]">
          {SPONSORS.map((sponsor, i) => (
            <div
              key={i}
              className={`flex size-[140px] items-center justify-center overflow-hidden bg-white md:size-[183px] ${SHAPE_CLASSES[sponsor.shape]}`}
            >
              {sponsor.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-emn-black/30">
                  {sponsor.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
