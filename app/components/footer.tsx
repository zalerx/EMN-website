import Link from "next/link"
import { Instagram, Facebook, Linkedin } from "lucide-react"
import Button from "./button"
import Input from "./input"

export default function Footer() {
  return (
    <footer className="border-t-2 border-black">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="flex gap-8">
            <Link href="/about" className="text-sm text-foreground/70">
              About Us
            </Link>
            <Link href="/events" className="text-sm text-foreground/70">
              Events
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-foreground/70">Sign up to our newsletter:</p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Email address" className="w-auto" />
              <Button className="bg-[#6cbe45] text-white hover:bg-[#6cbe45]/90">Subscribe</Button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="https://www.instagram.com/emnunimelb/" className="text-foreground/70 hover:text-[#6cbe45]">
            <Instagram className="h-5 w-5" />
          </Link>
          <Link href="https://www.facebook.com/emergingmarketsnetwork" className="text-foreground/70 hover:text-[#6cbe45]">
            <Facebook className="h-5 w-5" />
          </Link>
          <Link href="https://www.linkedin.com/company/emnunimelb/posts/?feedView=all" className="text-foreground/70 hover:text-[#6cbe45]">
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}

