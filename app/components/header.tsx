"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/app/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/events", label: "Events" },
  { href: "/sponsors", label: "Sponsors" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="px-3 pt-3 md:px-[18px] md:pt-[21px]">
      <nav className="mx-auto flex max-w-[1236px] items-center justify-between rounded-header bg-white px-5 py-3 shadow-header md:px-[33px] md:py-[18px]">
        <Link href="/" aria-label="EMN home" className="flex items-center">
          <Image
            src="/EMN-logo.svg"
            alt="EMN"
            width={125}
            height={29}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex md:gap-[19px]">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-[16.5px] px-4 py-[7px] text-base font-bold text-emn-black transition-colors",
                  active
                    ? "border-2 border-emn-black"
                    : "border-2 border-transparent hover:border-emn-black/30"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={toggleMenu}
          aria-label="Toggle menu"
          className="md:hidden focus:outline-none"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-emn-black text-xl font-bold text-white">
          <button
            onClick={toggleMenu}
            aria-label="Close menu"
            className="absolute right-4 top-4"
          >
            <X className="h-6 w-6" />
          </button>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={toggleMenu}
              className={
                pathname === href
                  ? "underline decoration-emn-green decoration-4"
                  : ""
              }
            >
              {label}
            </Link>
          ))}
          <Link
            href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/"
            onClick={toggleMenu}
            className="mt-4 rounded-pill border-2 border-white bg-emn-green px-6 py-3 text-base font-black text-white"
          >
            Become a Member
          </Link>
        </div>
      )}
    </header>
  );
}
