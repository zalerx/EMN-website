"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/app/lib/newsletter/actions";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const submitting = status.state === "submitting";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setStatus({ state: "submitting" });
    const result = await subscribeToNewsletter(email);

    if (result.ok) {
      setEmail("");
      setStatus({ state: "success", message: "Thanks — you're subscribed!" });
    } else {
      setStatus({ state: "error", message: result.error });
    }
  }

  return (
    <form
      id="newsletter"
      onSubmit={handleSubmit}
      className="flex w-full scroll-mt-24 flex-col gap-1 md:w-[375px]"
    >
      <label htmlFor="newsletter-email" className="text-[13px] font-bold text-black">
        Sign up to our newsletter:
      </label>
      <div className="relative">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          placeholder="Email address"
          className="h-[31px] w-full rounded-[16px] border-2 border-black bg-emn-offwhite pl-4 pr-[124px] text-[13px] text-black placeholder:text-black focus:outline-none focus:ring-2 focus:ring-emn-green disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={submitting}
          className="absolute right-0 top-0 h-[31px] w-[116px] rounded-[16px] border-2 border-black bg-emn-black text-[13px] font-bold text-emn-offwhite disabled:opacity-70"
        >
          {submitting ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {(status.state === "success" || status.state === "error") && (
        <p
          role="status"
          aria-live="polite"
          className={`text-[12px] ${
            status.state === "success" ? "text-emn-green" : "text-red-600"
          }`}
        >
          {status.message}
        </p>
      )}
    </form>
  );
}
