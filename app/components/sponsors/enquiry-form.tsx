"use client";

import Button from "@/app/components/button";

// Enquiries are delivered here. Kept in sync with the visible contact link
// rendered by the sponsors page.
const SPONSOR_EMAIL = "emergingmarketsnetworksponsors@gmail.com";

const fieldInput =
  "rounded-[16px] border-2 border-emn-offwhite bg-emn-offwhite px-4 py-3 text-[15px] text-emn-black outline-none transition-[border-color,box-shadow] focus:border-emn-green-dark focus:ring-[3px] focus:ring-emn-green-dark/35";
const fieldLabel = "text-[12px] font-bold uppercase tracking-[0.18em]";

export default function EnquiryForm() {
  // No email backend on this site — compose the enquiry into the club's inbox
  // via the visitor's mail client so it reaches SPONSOR_EMAIL.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = (data.get("name") as string)?.trim() ?? "";
    const org = (data.get("org") as string)?.trim() ?? "";
    const email = (data.get("email") as string)?.trim() ?? "";
    const msg = (data.get("msg") as string)?.trim() ?? "";

    const subject = `Sponsorship enquiry — ${org || name || "EMN"}`;
    const body = [
      `Name: ${name}`,
      `Organisation: ${org}`,
      `Work email: ${email}`,
      "",
      msg,
    ].join("\n");

    window.location.href = `mailto:${SPONSOR_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

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
          placeholder="Hiring goals, event types, brand activations…"
          className={`min-h-24 resize-y ${fieldInput}`}
        />
      </div>

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
        >
          Send enquiry →
        </Button>
      </div>
    </form>
  );
}
