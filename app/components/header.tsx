"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Instagram, Linkedin, Facebook } from "lucide-react";
import { cn } from "@/app/lib/utils";
import Button from "@/app/components/button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/articles", label: "Research" },
  { href: "/sponsors", label: "Sponsors" },
];

// Social links shown at the bottom of the mobile menu (mirrors the footer).
const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/emnunimelb/",
    label: "Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.linkedin.com/company/emnunimelb/",
    label: "LinkedIn",
    Icon: Linkedin,
  },
  {
    href: "https://www.facebook.com/emergingmarketsnetwork",
    label: "Facebook",
    Icon: Facebook,
  },
];

// Home only matches exactly; other sections stay active on nested routes
// (e.g. /articles/some-slug).
function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

// The hero crops from full-bleed into an inset card over `CROP_SCROLL` px of
// scrolling (see hero.tsx). We reveal the navbar once that crop is ~80% done,
// so the bar slides in just before the hero finishes settling into its card.
const HERO_CROP_SCROLL = 600;
const NAV_REVEAL_SCROLL = HERO_CROP_SCROLL * 0.8;

// Distance (px) from the top of the viewport within which moving the pointer
// "peeks" the navbar into view, even before the hero has cropped away.
const NAV_HOVER_ZONE = 96;

// Mobile menu reveal timing. The black background clips out of the hamburger as
// a growing circle; content staggers in just behind the leading edge.
const MENU_EASE = "cubic-bezier(0.16, 1, 0.3, 1)"; // easeOutExpo — snappy start
const MENU_OPEN_MS = 500;
const MENU_CLOSE_MS = 400;

export default function Header() {
  // `isMenuOpen` is the intent (drives the open/close transition); `menuMounted`
  // keeps the overlay in the DOM long enough to play the close animation before
  // it unmounts. `reveal` stores the circle origin + radius measured on open.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [reveal, setReveal] = useState<{ x: number; y: number; r: number } | null>(
    null
  );
  const [reduceMotion, setReduceMotion] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const openMenu = () => {
    // Measure the hamburger so the circle grows from its exact center, and size
    // the radius to reach the farthest viewport corner (bottom-left from the
    // top-right button) so the fill fully covers the screen.
    const rect = menuButtonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 32;
    const y = rect ? rect.top + rect.height / 2 : 32;
    const r =
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      ) + 8;
    setReveal({ x, y, r });
    setMenuMounted(true);
    // Paint the collapsed circle first, then flip to open so the radius actually
    // transitions instead of snapping straight to the expanded state.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setIsMenuOpen(true))
    );
  };

  const closeMenu = () => setIsMenuOpen(false);

  // On the home page the hero fills the viewport, so the navbar stays hidden on
  // load and slides in once the hero has fully cropped (then floats over the
  // page as a fixed bar). Every other page keeps the navbar in normal flow.
  const isHome = pathname === "/";
  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY >= NAV_REVEAL_SCROLL);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Peek the navbar when the pointer hovers near the top of the viewport, even
  // while the hero is still full-bleed. Tracking pointer Y (rather than the
  // header's own hover) avoids flicker as the mouse crosses onto the revealed
  // bar. `setPeeked` no-ops when the boolean is unchanged, so this stays cheap.
  useEffect(() => {
    if (!isHome) {
      setPeeked(false);
      return;
    }
    const onMove = (e: MouseEvent) => setPeeked(e.clientY <= NAV_HOVER_ZONE);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [isHome]);

  // Honour users who ask for less motion — the menu still opens, just instantly.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Once closed, wait for the collapse transition to finish, then unmount. If
  // the menu is reopened first, the cleanup clears the pending unmount.
  useEffect(() => {
    if (isMenuOpen || !menuMounted) return;
    const t = setTimeout(
      () => setMenuMounted(false),
      reduceMotion ? 0 : MENU_CLOSE_MS
    );
    return () => clearTimeout(t);
  }, [isMenuOpen, menuMounted, reduceMotion]);

  // While the overlay is up: lock body scroll and close on Escape.
  useEffect(() => {
    if (!menuMounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuMounted]);

  // Per-item stagger: content fades/slides in just behind the expanding circle.
  const menuItemStyle = (index: number) => ({
    transition: reduceMotion
      ? "none"
      : `opacity 300ms ease, transform 340ms ${MENU_EASE}`,
    transitionDelay: isMenuOpen && !reduceMotion ? `${120 + index * 45}ms` : "0ms",
    opacity: isMenuOpen ? 1 : 0,
    transform: isMenuOpen ? "translateY(0)" : "translateY(14px)",
  });

  const hidden = isHome && !scrolled && !peeked && !isMenuOpen;

  // Collapsed to a zero-radius circle at the button; expands to `reveal.r` (far
  // corner) when open. Falls back to the top-right corner before first measure.
  const menuClip = reveal
    ? `circle(${isMenuOpen ? reveal.r : 0}px at ${reveal.x}px ${reveal.y}px)`
    : "circle(0px at 100% 0%)";

  // Right-aligned sign in / sign out control, shared by desktop layout.
  const authButton = isAuthed ? (
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
  );

  return (
    <header
      className={cn(
        "z-50 px-3 pt-3 transition-all duration-300 md:px-[18px] md:pt-[21px]",
        isHome && "fixed inset-x-0 top-0",
        // The hide-on-home reveal is driven by scroll + pointer hover ("peek"),
        // both desktop interactions. Touch devices never fire the hover, so we
        // only apply the hidden state at md+ and keep the navbar visible on
        // mobile without requiring a scroll.
        hidden && "md:pointer-events-none md:-translate-y-full md:opacity-0"
      )}
    >
      <nav className="relative mx-auto flex max-w-[1236px] items-center justify-between rounded-header bg-white px-5 py-3 shadow-header md:px-[33px] md:py-[18px]">
        <Link href="/" aria-label="EMN home" className="flex items-center">
          <Image
            src="/EMN-logo.svg"
            alt="EMN"
            width={125}
            height={29}
            priority
          />
        </Link>

        {/* Center-aligned nav links (desktop). Absolutely centered so they sit
            in the middle of the bar regardless of the logo / auth widths. */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 md:flex md:gap-[19px]">
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
        </div>

        {/* Right-aligned sign in / out (desktop). While the session is still
            loading we fall back to the "Sign in" state (SSR matches, so no
            hydration mismatch). */}
        <div className="hidden md:block">{authButton}</div>

        {/* Mobile toggle */}
        <button
          ref={menuButtonRef}
          onClick={isMenuOpen ? closeMenu : openMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          className="md:hidden focus:outline-none"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {menuMounted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-hidden={!isMenuOpen}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-emn-black text-xl font-bold text-white"
          style={{
            clipPath: menuClip,
            WebkitClipPath: menuClip,
            transition: reduceMotion
              ? "none"
              : `clip-path ${
                  isMenuOpen ? MENU_OPEN_MS : MENU_CLOSE_MS
                }ms ${MENU_EASE}`,
            willChange: "clip-path",
            pointerEvents: isMenuOpen ? "auto" : "none",
          }}
        >
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            className="absolute right-4 top-4"
            style={menuItemStyle(0)}
          >
            <X className="h-6 w-6" />
          </button>
          {NAV_LINKS.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              aria-current={isActive(pathname, href) ? "page" : undefined}
              style={menuItemStyle(i)}
            >
              {label}
            </Link>
          ))}
          <div style={menuItemStyle(NAV_LINKS.length)}>
            {isAuthed ? (
              <Button
                onClick={() => {
                  closeMenu();
                  signOut({ callbackUrl: "/" });
                }}
                className="mt-4 text-base"
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
                onClick={closeMenu}
                className="mt-4 text-base"
                innerClassName="px-4 py-[7px]"
                color="emn-green"
                outlineColor="emn-green-dark"
                textColor="white"
              >
                Sign in
              </Button>
            )}
          </div>

          {/* Social links pinned to the bottom of the fullscreen menu */}
          <div
            className="absolute bottom-10 flex items-center gap-[18px]"
            style={menuItemStyle(NAV_LINKS.length + 1)}
          >
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
              >
                <Icon className="h-[25px] w-[25px] text-white" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
