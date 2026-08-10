"use client";

import { useState, type FormEvent } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "sent"; email: string }
  | { kind: "notMember" }
  | { kind: "error"; message: string };

const UMSU_JOIN_URL =
  "https://umsu.unimelb.edu.au/clubs/join-a-club/";

export default function MembershipPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setStatus({ kind: "loading" });

    const result = await signIn("email", {
      email: trimmed,
      redirect: false,
    });

    if (!result) {
      setStatus({
        kind: "error",
        message: "Something went wrong. Please try again.",
      });
      return;
    }
    if (result.error === "EmailSignin") {
      setStatus({ kind: "notMember" });
      return;
    }
    if (result.error) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setStatus({ kind: "sent", email: trimmed });
  }

  // Already logged in → send them to their card.
  if (sessionStatus === "authenticated" && session?.user) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center px-4 py-10">
        <h1 className="font-candu text-[46px] text-emn-black md:text-title">
          MEMBERSHIP
        </h1>
        <div className="relative mt-20 w-full max-w-[681px]">
          <div className="absolute -top-[34px] left-6 md:left-[46px] z-10 inline-flex items-center justify-center rounded-br-pill rounded-tl-pill border-4 border-emn-black bg-emn-offwhite px-5 md:px-[30px] pb-[6px] pt-[12px]">
            <span className="font-candu text-[24px] md:text-heading uppercase text-emn-black">
              WELCOME BACK
            </span>
          </div>
          <div className="flex flex-col items-center gap-[25px] rounded-[16px] border-4 border-emn-black px-10 pb-10 pt-[59px]">
            <div className="flex w-full flex-col gap-[31px]">
              <div className="flex w-full items-start justify-between text-base font-semibold">
                <p className="text-black">You&apos;re signed in as:</p>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/membership" })}
                  className="italic text-emn-black"
                >
                  [sign out]
                </button>
              </div>
              <p className="w-full text-center text-description text-black">
                {session.user.email}
              </p>
            </div>
            <Link
              href="/membership/card"
              className="inline-flex h-[55px] w-[313px] max-w-full items-center justify-center rounded-pill bg-emn-black text-xl font-black text-white"
            >
              View Membership Card
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[70vh] flex-col items-center px-4 py-10">
      <h1 className="font-candu text-[46px] text-emn-black md:text-title">
        MEMBERSHIP
      </h1>

      <div className="relative mt-20 w-full max-w-[681px]">
        {/* Leaf heading badge */}
        <div className="absolute -top-[34px] left-6 md:left-[46px] z-10 inline-flex items-center justify-center rounded-br-pill rounded-tl-pill border-4 border-emn-black bg-emn-offwhite px-5 md:px-[30px] pb-[6px] pt-[12px]">
          <span className="font-candu text-mheading md:text-heading uppercase text-emn-black">
            VERIFY YOUR EMAIL
          </span>
        </div>

        {/* Form card */}
        <div className="flex flex-col items-center gap-[25px] rounded-[16px] border-4 border-emn-black px-6 pb-10 pt-[59px] md:px-10">
          {status.kind === "sent" ? (
            <SentState
              email={status.email}
              onReset={() => setStatus({ kind: "idle" })}
            />
          ) : status.kind === "notMember" ? (
            <NotMemberState onReset={() => setStatus({ kind: "idle" })} />
          ) : (
            <>
              <p className="w-full text-base font-semibold text-black">
                Enter the email you used to sign up with EMN and we&apos;ll send
                you a one-time link to open your digital membership card.
              </p>

              <form
                onSubmit={onSubmit}
                className="flex w-full flex-col items-center gap-[25px] px-0 md:px-[60px]"
              >
                <label className="w-full">
                  <span className="mb-2 block text-base font-semibold text-black">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status.kind === "loading"}
                    className="h-[45px] w-full rounded-[15px] border-[3px] border-emn-black bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-emn-green disabled:opacity-50"
                  />
                </label>

                {status.kind === "error" && (
                  <p className="w-full text-sm text-red-600">
                    {status.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status.kind === "loading"}
                  className="inline-flex h-[55px] w-[313px] max-w-full items-center justify-center rounded-pill bg-emn-black text-xl font-black text-white transition-colors disabled:opacity-50"
                >
                  {status.kind === "loading" ? "Sending..." : "Send link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Help section */}
      <div className="mt-10 w-full max-w-[681px] rounded-[16px] border-4 border-emn-black px-6 py-6 md:px-10">
        <h2 className="font-candu text-mheading uppercase text-emn-black">
          Having trouble?
        </h2>
        <p className="mt-3 text-base font-semibold text-black">
          This is the email you used when signing up with UMSU and may not
          necessarily be your student email. If you&apos;re having trouble
          finding your membership, send us an email and we&apos;ll help you
          out.
        </p>
        <a
          href="mailto:emergingmarketsnetworkuom@gmail.com"
          className="mt-3 inline-block text-base font-bold text-emn-black underline decoration-emn-green decoration-2 underline-offset-4"
        >
          emergingmarketsnetworkuom@gmail.com
        </a>
      </div>
    </main>
  );
}

function SentState({
  email,
  onReset,
}: {
  email: string;
  onReset: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-4 text-center">
      <p className="text-base font-semibold text-black">
        We sent a sign-in link to <strong>{email}</strong>. Click it from this
        device to open your card. The link expires in 24 hours.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-sm font-bold text-emn-black underline decoration-emn-green decoration-2 underline-offset-4"
      >
        Use a different email
      </button>
    </div>
  );
}

function NotMemberState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex w-full flex-col items-center gap-4 text-center">
      <p className="text-base font-semibold text-black">
        We couldn&apos;t find that email in our member list. EMN memberships are
        managed through UMSU — join the club there and we&apos;ll add you to the
        roster within a few days.
      </p>
      <div className="flex flex-col items-center gap-3 md:flex-row">
        <Link
          href={UMSU_JOIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[55px] w-[313px] max-w-full items-center justify-center rounded-pill bg-emn-black text-xl font-black text-white"
        >
          Join via UMSU
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-bold text-emn-black underline decoration-emn-green decoration-2 underline-offset-4"
        >
          Try another email
        </button>
      </div>
    </div>
  );
}
