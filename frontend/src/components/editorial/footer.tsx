import React from "react";
import Link from "next/link";

interface FooterProps {
  onContactClick?: () => void;
}

export function Footer({ onContactClick }: FooterProps) {
  return (
    <footer className="w-full py-12 px-6 sm:px-12 bg-[#0e0e0e] border-t border-[#353535] flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#becabb]">
      <Link href="/" className="font-sans text-2xl font-normal text-[#e2e2e2] tracking-tighter hover:opacity-80 transition-opacity">
        GlobeTrotter
      </Link>

      <nav className="flex flex-wrap justify-center gap-8 font-normal">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <Link href="/discover" className="hover:text-white transition-colors">
          Discover
        </Link>
        <Link href="/itinerary/new" className="hover:text-white transition-colors">
          Itinerary Builder
        </Link>
        <Link href="/calendar" className="hover:text-white transition-colors">
          Calendar
        </Link>
        <Link href="/profile" className="hover:text-white transition-colors">
          Profile
        </Link>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onContactClick?.();
          }}
          className="hover:text-white transition-colors"
        >
          Contact Private Office
        </a>
      </nav>

      <div className="text-center md:text-right text-neutral-500 font-normal">
        © 2026 GlobeTrotter Luxury Travel Planning. All rights reserved.
      </div>
    </footer>
  );
}
