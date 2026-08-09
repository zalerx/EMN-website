import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Facebook } from "lucide-react";
import NewsletterForm from "@/app/components/newsletter-form";

export default function Footer() {
  return (
    <footer className="flex w-full flex-col items-center gap-8 rounded-t-[40px] bg-white px-6 pb-10 pt-8 md:gap-[43px] md:px-[56px] md:pb-12 md:pt-[31px]">
      {/* UMSU Clubs Affiliated logo */}
      <div className="relative h-[60px] w-[77px] shrink-0">
        <Image
          src="/umsu-affiliated.png"
          alt="UMSU Clubs Affiliated"
          fill
          className="object-contain"
          sizes="77px"
        />
      </div>

      {/* Middle section: internal links + newsletter form */}
      <div className="flex w-full flex-col items-center gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
        {/* Internal links */}
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[15px] text-black">
          <Link href="/">Home</Link>
          <Link href="/events">Events</Link>
          <Link href="/articles">Research</Link>
          <Link href="/membership">Membership</Link>
          <Link href="/sponsors">Sponsors</Link>
        </nav>

        {/* Newsletter form */}
        <NewsletterForm />
      </div>

      {/* Socials */}
      <div className="flex items-center gap-[18px]">
        <Link
          href="https://www.instagram.com/emnunimelb/"
          aria-label="Instagram"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Instagram className="h-[25px] w-[25px] text-black" />
        </Link>
        <Link
          href="https://www.linkedin.com/company/emnunimelb/"
          aria-label="LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="h-[25px] w-[25px] text-black" />
        </Link>
        <Link
          href="https://www.facebook.com/emergingmarketsnetwork"
          aria-label="Facebook"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Facebook className="h-[25px] w-[25px] text-black" />
        </Link>
      </div>
    </footer>
  );
}
