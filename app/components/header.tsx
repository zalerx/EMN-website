"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/app/lib/utils";
import Button from "@/app/components/button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/articles", label: "Research" },
  { href: "/sponsors", label: "Sponsors" },
];

// Home only matches exactly; other sections stay active on nested routes
// (e.g. /articles/some-slug).
function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthed = status === "authenticated";
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
            const active = isActive(pathname, href);
            return active ? (
              <Button
                key={href}
                href={href}
                className="text-base"
                innerClassName="px-4 py-[7px]"
                color="white"
                outlineColor="emn-black"
                textColor="emn-black"
              >
                {label}
              </Button>
            ) : (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-[16.5px] px-4 py-[7px] text-base font-bold text-emn-black transition-colors",
                  "border-2 border-transparent hover:border-emn-black/30"
                )}
              >
                {label}
              </Link>
            );
          })}

          {/* Sign in leads to the membership magic-link page; sign out is a
              direct action. While the session is still loading we fall back to
              the "Sign in" state (SSR matches, so no hydration mismatch). */}
          {isAuthed ? (
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-base"
              innerClassName="px-4 py-[7px]"
              color="white"
              outlineColor="emn-black"
              textColor="emn-black"
            >
              Sign out
            </Button>
          ) : (
            <Button
              href="/membership"
              className="text-base"
              innerClassName="px-4 py-[7px]"
              color="emn-green"
              outlineColor="emn-green-dark"
              textColor="white"
            >
              Sign in
            </Button>
          )}
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
                isActive(pathname, href)
                  ? "underline decoration-emn-green decoration-4"
                  : ""
              }
            >
              {label}
            </Link>
          ))}
          {isAuthed ? (
            <button
              onClick={() => {
                toggleMenu();
                signOut({ callbackUrl: "/" });
              }}
            >
              Sign out
            </button>
          ) : (
            <Link href="/membership" onClick={toggleMenu}>
              Sign in
            </Link>
          )}
          <Button
            href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/"
            onClick={toggleMenu}
            className="mt-4 text-base font-black"
            color="emn-green"
            outlineColor="white"
            textColor="white"
          >
            Become a Member
          </Button>
        </div>
      )}
    </header>
  );
}
