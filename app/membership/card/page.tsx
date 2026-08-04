import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { authOptions } from "@/app/lib/auth";
import { signStudentId } from "@/app/lib/hmac";
import { generateStyledQR } from "@/app/lib/qr-styled";

export default async function CardPage() {
  // DEV ONLY — bypass auth to preview styling without signing in.
  // Uncomment the two lines below (and comment out the strict session check)
  // to enable. Requires NEXT_PUBLIC_DEV_BYPASS_AUTH=1 in .env.local.
  // const bypass = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "1";
  const session = await getServerSession(authOptions);

  // if (!bypass && (!session?.user?.studentId || !session.user.name)) {
  //   redirect("/membership");
  // }
  // const studentId = session?.user?.studentId ?? 1234567;
  // const name = session?.user?.name ?? "Doe, John";

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
      <h1 className="font-candu text-[46px] text-emn-black md:text-title">
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
          <div className="flex flex-1 flex-col pt-[12px] justify-between">
            <h2 className="font-candu text-[34px] font-bold leading-extra-tight text-white md:text-[64px]">
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

    </main>
  );
}
