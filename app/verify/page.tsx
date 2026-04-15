import { verifyStudentId } from "@/app/lib/hmac";
import { supabaseAdmin } from "@/app/lib/supabase-server";

interface VerifyPageProps {
  searchParams: Promise<{ id?: string; sig?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { id, sig } = await searchParams;

  // Missing params
  if (!id || !sig) {
    return <Result valid={false} message="Invalid verification link." />;
  }

  const studentId = Number(id);
  if (Number.isNaN(studentId)) {
    return <Result valid={false} message="Invalid student ID." />;
  }

  // Check HMAC signature
  if (!verifyStudentId(studentId, sig)) {
    return <Result valid={false} message="This membership link is not valid." />;
  }

  // Signature is valid — look up the member name
  const { data: member } = await supabaseAdmin
    .from("members")
    .select("name")
    .eq("id", studentId)
    .maybeSingle();

  if (!member) {
    return (
      <Result valid={false} message="Member not found in our records." />
    );
  }

  return (
    <Result
      valid={true}
      message="Valid EMN Member"
      name={member.name}
      studentId={studentId}
    />
  );
}

function Result({
  valid,
  message,
  name,
  studentId,
}: {
  valid: boolean;
  message: string;
  name?: string;
  studentId?: number;
}) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      {/* Card-shaped container with inner border matching the membership card style */}
      <div className="w-full max-w-lg rounded-[24px] bg-emn-green-dark p-4">
        <div
          className={`flex flex-col items-center rounded-[16px] border-4 border-white/30 px-6 py-12 text-center ${!valid ? "bg-emn-black/20" : ""
            }`}
        >
          {/* Circled tick / cross */}
          <div
            className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full border-[3px] ${valid
                ? "border-emn-offwhite"
                : "border-emn-offwhite/60"
              }`}
          >
            {valid ? (
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                <path
                  d="M2 11L10 19L26 3"
                  stroke="#f1f1f1"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M2 2L20 20M20 2L2 20"
                  stroke="#f1f1f1"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          <h1 className="font-candu text-[36px] font-bold leading-extra-tight text-emn-offwhite md:text-[44px]">
            {valid ? (
              <>
                VALID
                <br />
                EMN MEMBER
              </>
            ) : (
              message.toUpperCase()
            )}
          </h1>

          {valid && name && (
            <div className="mt-8 space-y-1 text-emn-offwhite/80">
              <p className="text-xl font-semibold text-emn-offwhite">
                {name}
              </p>
              {studentId && (
                <p className="text-base font-medium">
                  Student ID: {studentId}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
