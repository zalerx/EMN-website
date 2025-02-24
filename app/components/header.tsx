import Link from 'next/link';
import Button from './button';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white text-xs md:text-lg md:space-x-1">
      <nav className=" mx-auto flex justify-between items-center p-4">
      <Image src="/EMN-logo.svg" alt="EMN" width={100} height={50} />
        <div className="flex m-auto space-x-2">
          <Link href="/" className="">Home</Link>
          <Link href="/about" className="">About Us</Link>
          <Link href="/events" className="">Events</Link>
        </div>
        <Button>Become a Member</Button>
      </nav>
    </header>
  );
}