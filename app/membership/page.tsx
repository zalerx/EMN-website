"use client";

import { useState, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
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
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-section bg-emn-green-dark p-8 text-center md:p-12">
          <h1 className="font-candu text-[40px] leading-extra-tight text-emn-offwhite md:text-[56px]">
            WELCOME BACK
          </h1>
          <p className="mt-4 text-lg text-emn-offwhite/80">
            You&apos;re signed in as{" "}
            <strong className="text-emn-offwhite">{session.user.email}</strong>.
          </p>
          <Link
            href="/membership/card"
            className="mt-8 inline-flex h-[55px] w-full max-w-[313px] items-center justify-center rounded-pill bg-emn-green px-4 text-lg font-black text-white"
          >
            Open my membership card
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-candu text-center text-[48px] leading-extra-tight tracking-tight text-emn-black md:text-[64px]">
          MEMBERSHIP
        </h1>
        <p className="mt-4 text-center text-base text-emn-black/70 md:text-lg">
          Enter the email you used to sign up with EMN. We&apos;ll send you a
          one-time link to open your digital membership card.
        </p>

        <div className="mt-10">
          {status.kind === "sent" ? (
            <SentState
              email={status.email}
              onReset={() => setStatus({ kind: "idle" })}
            />
          ) : status.kind === "notMember" ? (
            <NotMemberState onReset={() => setStatus({ kind: "idle" })} />
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-emn-black">
                  Student email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@student.unimelb.edu.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status.kind === "loading"}
                  className="w-full rounded-pill border-2 border-emn-black bg-white px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emn-green disabled:opacity-50"
                />
              </label>

              {status.kind === "error" && (
                <p className="text-sm text-red-600">{status.message}</p>
              )}

              <button
                type="submit"
                disabled={status.kind === "loading"}
                className="inline-flex h-[55px] w-full items-center justify-center rounded-pill bg-emn-green px-5 text-lg font-black text-white transition-colors disabled:opacity-50"
              >
                {status.kind === "loading" ? "Sending..." : "Send magic link"}
              </button>
            </form>
          )}
        </div>
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
    <div className="rounded-section bg-emn-green-dark p-8 text-center">
      <h2 className="font-candu text-[32px] leading-extra-tight text-emn-offwhite">
        CHECK YOUR INBOX
      </h2>
      <p className="mt-4 text-base text-emn-offwhite/80">
        We sent a sign-in link to{" "}
        <strong className="text-emn-offwhite">{email}</strong>. Click it from
        this device to open your card. The link expires in 24 hours.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 text-sm font-bold text-emn-offwhite underline decoration-emn-green decoration-2 underline-offset-4"
      >
        Use a different email
      </button>
    </div>
  );
}

function NotMemberState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-section bg-emn-black p-8 text-center">
      <h2 className="font-candu text-[32px] leading-extra-tight text-emn-offwhite">
        NOT A MEMBER YET
      </h2>
      <p className="mt-4 text-base text-emn-offwhite/80">
        We couldn&apos;t find that email in our member list. EMN memberships are
        managed through UMSU — join the club there and we&apos;ll add you to the
        roster within a few days.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 md:flex-row md:justify-center">
        <Link
          href={UMSU_JOIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[48px] w-full items-center justify-center rounded-pill bg-emn-green px-6 text-base font-black text-white md:w-auto"
        >
          Join via UMSU
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-[48px] w-full items-center justify-center rounded-pill border-2 border-emn-offwhite px-6 text-base font-bold text-emn-offwhite md:w-auto"
        >
          Try another email
        </button>
      </div>
    </div>
  );
}
