"use client";

import { useState } from 'react';
import Link from 'next/link';
import Button from './button';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react'; // Import icons for menu and close

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white text-xs md:text-lg md:space-x-1">
      <nav className="mx-auto flex justify-between items-center p-4">
        <Image src="/EMN-logo.svg" alt="EMN" width={100} height={50} />
        <div className="flex items-center space-x-2 md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        <div className="hidden md:flex md:flex-row md:items-center md:space-x-2">
          <Link
            href="/"
            className={pathname === '/' ? 'underline decoration-[#6ebf46] decoration-4' : ''}
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
        <Button href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/" className="hidden md:block">
          Become a Member
        </Button>
      </nav>
      {isMenuOpen && (
        <div className="text-xl text-white font-bold fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#231e20]">
          <button onClick={toggleMenu} className="absolute top-4 right-4 focus:outline-none">
            <X className="h-6 w-6" />
          </button>
          <div className="flex flex-col items-center space-y-4">
            <Link
              href="/"
              className={pathname === '/' ? 'underline decoration-[#6ebf46] decoration-4' : ''}
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={pathname === '/about' ? 'underline decoration-[#6ebf46] decoration-4' : ''}
              onClick={toggleMenu}
            >
              About Us
            </Link>
            <Link
              href="/events"
              className={pathname === '/events' ? 'underline decoration-[#6ebf46] decoration-4' : ''}
              onClick={toggleMenu}
            >
              Events
            </Link>

            <Button href="https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7894/" className="bg-[#f1f1f1] text-black mt-8 text-lg hover:white">
              Become a Member
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}