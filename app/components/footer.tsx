import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Facebook, Youtube } from "lucide-react";

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
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[15px] text-black md:w-[497px] md:justify-between">
          <Link href="/about">About Us</Link>
          <Link href="/events">Events</Link>
          <Link href="/articles">Research</Link>
          <Link href="/resources">Resources</Link>
          <Link href="#">Tradle</Link>
          <Link href="/sponsors">Sponsors</Link>
        </nav>

        {/* Newsletter form */}
        <form
          id="newsletter"
          className="flex w-full scroll-mt-24 flex-col gap-1 md:w-[375px]"
        >
          <label className="text-[13px] font-bold text-black">
            Sign up to our newsletter:
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="Email address"
              className="h-[31px] w-full rounded-[16px] border-2 border-black bg-emn-offwhite pl-4 pr-[124px] text-[13px] text-black placeholder:text-black focus:outline-none focus:ring-2 focus:ring-emn-green"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-[31px] w-[116px] rounded-[16px] border-2 border-black bg-emn-black text-[13px] font-bold text-emn-offwhite"
            >
              Subscribe
            </button>
          </div>
        </form>
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
        <Link href="#" aria-label="YouTube">
          <Youtube className="h-[25px] w-[25px] text-black" />
        </Link>
      </div>
    </footer>
  );
}
