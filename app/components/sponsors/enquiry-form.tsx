"use client";

import { useState, useTransition } from "react";
import Button from "@/app/components/button";
import { sendSponsorEnquiry } from "@/app/sponsors/actions";

const fieldInput =
  "rounded-[16px] border-2 border-emn-offwhite bg-emn-offwhite px-4 py-3 text-[15px] text-emn-black outline-none transition-[border-color,box-shadow] focus:border-emn-green-dark focus:ring-[3px] focus:ring-emn-green-dark/35 disabled:opacity-60";
const fieldLabel = "text-[12px] font-bold uppercase tracking-[0.18em]";

export default function EnquiryForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The enquiry is emailed to the club inbox by a server action (SMTP), so it
  // actually sends — no dependency on the visitor having a mail client set up.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload = {
      name: (data.get("name") as string)?.trim() ?? "",
      org: (data.get("org") as string)?.trim() ?? "",
      email: (data.get("email") as string)?.trim() ?? "",
      msg: (data.get("msg") as string)?.trim() ?? "",
    };
    const form = e.currentTarget;

    setError(null);
    startTransition(async () => {
      const result = await sendSponsorEnquiry(payload);
      if (result.ok) {
        setSent(true);
        form.reset();
      } else {
        setError(result.error);
      }
    });
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-2 rounded-[16px] border-2 border-emn-green-dark bg-emn-offwhite px-5 py-6 text-emn-black">
        <p className="text-base font-black">Thanks — your enquiry is on its way.</p>
        <p className="text-[14px] opacity-80">
          We reply within 3 business days.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-1 self-start text-[13px] font-bold uppercase tracking-[0.18em] text-emn-green-dark underline underline-offset-4"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-[6px]">
          <label htmlFor="name" className={fieldLabel}>
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={pending}
            placeholder="e.g. Alex Tan"
            className={fieldInput}
          />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label htmlFor="org" className={fieldLabel}>
            Organisation
          </label>
          <input
            id="org"
            name="org"
            type="text"
            required
            disabled={pending}
            placeholder="Firm or team"
            className={fieldInput}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="email" className={fieldLabel}>
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={pending}
          placeholder="alex@firm.com"
          className={fieldInput}
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="msg" className={fieldLabel}>
          Tell us what you&apos;re after
        </label>
        <textarea
          id="msg"
          name="msg"
          disabled={pending}
          placeholder="Hiring goals, event types, brand activations…"
          className={`min-h-24 resize-y ${fieldInput}`}
        />
      </div>

      {error && (
        <p role="alert" className="text-[13px] font-bold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-1.5 flex items-center justify-between gap-4">
        <span className="text-[12px] opacity-85">
          We reply within 3 business days.
        </span>
        <Button
          className="text-base font-black md:text-xl"
          innerClassName="flex h-[55px] items-center justify-center whitespace-nowrap px-8"
          color="emn-offwhite"
          outlineColor="emn-green-dark"
          textColor="emn-green-dark"
          disabled={pending}
        >
          {pending ? "Sending…" : "Send enquiry →"}
        </Button>
      </div>
    </form>
  );
}
