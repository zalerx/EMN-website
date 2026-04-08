"use client";

import { useState, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import Container from "../components/container";
import Button from "../components/button";

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
      setStatus({ kind: "error", message: "Something went wrong. Please try again." });
      return;
    }
    if (result.error === "EmailSignin") {
      // Either NOT_A_MEMBER or an SMTP failure — both surface as EmailSignin.
      // We optimistically treat it as "not a member" since that's the common case.
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
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Container className="max-w-xl">
          <h1 className="font-candu mb-6 text-3xl md:text-5xl leading-extra-tight tracking-tight text-[#231f20]">
            WELCOME BACK
          </h1>
          <p className="mb-6 text-lg text-foreground/80">
            You&apos;re signed in as <strong>{session.user.email}</strong>.
          </p>
          <Button href="/membership/card" className="bg-[#6ebf46]">
            Open my membership card
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Container className="max-w-xl">
        <h1 className="font-candu mb-4 text-3xl md:text-5xl leading-extra-tight tracking-tight text-[#231f20]">
          MEMBERSHIP CARD
        </h1>
        <p className="mb-8 text-base md:text-lg text-foreground/80">
          Enter the email you used to sign up with EMN. We&apos;ll send you a
          one-time link to open your digital membership card.
        </p>

        {status.kind === "sent" ? (
          <SentState email={status.email} onReset={() => setStatus({ kind: "idle" })} />
        ) : status.kind === "notMember" ? (
          <NotMemberState onReset={() => setStatus({ kind: "idle" })} />
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#231f20]">
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
                className="w-full rounded-full border-2 border-black bg-white px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6ebf46] disabled:opacity-50"
              />
            </label>

            {status.kind === "error" && (
              <p className="text-sm text-red-600">{status.message}</p>
            )}

            <button
              type="submit"
              disabled={status.kind === "loading"}
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-black bg-[#6ebf46] px-5 py-3 text-base font-bold transition-colors disabled:opacity-50 md:w-auto"
            >
              {status.kind === "loading" ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </Container>
    </div>
  );
}

function SentState({ email, onReset }: { email: string; onReset: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-black bg-[#f1f1f1] p-6">
      <h2 className="font-candu mb-2 text-2xl text-[#231f20]">CHECK YOUR INBOX</h2>
      <p className="mb-4 text-base text-foreground/80">
        We sent a sign-in link to <strong>{email}</strong>. Click it from this
        device to open your card. The link expires in 24 hours.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-sm font-semibold underline decoration-[#6ebf46] decoration-2 underline-offset-4"
      >
        Use a different email
      </button>
    </div>
  );
}

function NotMemberState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-black bg-[#f1f1f1] p-6">
      <h2 className="font-candu mb-2 text-2xl text-[#231f20]">NOT A MEMBER YET</h2>
      <p className="mb-4 text-base text-foreground/80">
        We couldn&apos;t find that email in our member list. EMN memberships are
        managed through UMSU — join the club there and we&apos;ll add you to the
        roster within a few days.
      </p>
      <div className="flex flex-col gap-3 md:flex-row">
        <Link
          href={UMSU_JOIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border-2 border-black bg-[#6ebf46] px-5 py-2 text-sm font-bold md:text-base"
        >
          Join via UMSU
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-5 py-2 text-sm font-bold md:text-base"
        >
          Try another email
        </button>
      </div>
    </div>
  );
}
