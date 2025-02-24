"use client";

import Link from 'next/link';
import Button from './button';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; 

export default function Header() {
  const pathname = usePathname(); 

  return (
    <header className="bg-white text-xs md:text-lg md:space-x-1">
      <nav className="mx-auto flex justify-between items-center p-4">
        <Image src="/EMN-logo.svg" alt="EMN" width={100} height={50} />
        <div className="flex m-auto space-x-2">
          <Link
            href="/"
            className={pathname === '/' ? 'underline decoration-[#6ebf46] decoration-4 ' : ''}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={pathname === '/about' ? 'underline decoration-[#6ebf46] decoration-4' : ''}
          >
            About Us
          </Link>
          <Link
            href="/events"
            className={pathname === '/events' ? 'underline decoration-[#6ebf46] decoration-4' : ''}
          >
            Events
          </Link>
        </div>
        <Button href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/">Become a Member</Button>
      </nav>
    </header>
  );
}