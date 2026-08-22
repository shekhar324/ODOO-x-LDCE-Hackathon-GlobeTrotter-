"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconArrowRight, IconUser, IconLogout, IconLogin } from "@tabler/icons-react";
import { useAuth } from "@/context/auth-context";

interface NavigationPillProps {
  onContactClick?: () => void;
}

export function NavigationPill({ onContactClick }: NavigationPillProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();

  const authNavItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Discover", href: "/discover" },
    { label: "Builder", href: "/build" },
    { label: "Community", href: "/community" },
  ];

  const publicNavItems = [
    { label: "Discover", href: "/discover" },
    { label: "Public Trips", href: "/#trips" },
    { label: "Journal", href: "/#discover" },
  ];

  const navItems = isAuthenticated ? authNavItems : publicNavItems;

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-[94%] max-w-[1200px] z-50 mt-4 mx-auto">
      <nav
        aria-label="Main Navigation"
        className="flex justify-between items-center px-6 sm:px-8 py-3.5 bg-[#c3eeb4] text-[#002200] rounded-full transition-transform duration-200"
      >
        <Link
          href="/"
          className="font-sans text-xl sm:text-2xl font-normal tracking-tighter text-[#002200] hover:opacity-80 transition-opacity"
        >
          GlobeTrotter
        </Link>

        <div className="hidden md:flex gap-6 lg:gap-8 items-center text-sm font-normal text-[#2b4f24]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  isActive
                    ? "text-[#002200] font-semibold border-b-2 border-[#002200] pb-0.5"
                    : "hover:text-[#002200]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {onContactClick && (
            <a
              href="#concierge"
              onClick={(e) => {
                e.preventDefault();
                onContactClick();
              }}
              className="hover:text-[#002200] transition-colors cursor-pointer"
            >
              Concierge
            </a>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className={`p-2 rounded-full border border-[#2b4f24]/30 hover:bg-[#002200]/10 transition-colors ${
                  pathname === "/profile" ? "bg-[#002200] text-[#c3eeb4]" : "text-[#002200]"
                }`}
                title="Profile & Archives"
              >
                <IconUser className="w-4 h-4" />
              </Link>

              <button
                onClick={async () => { await signOut(); router.push("/"); }}
                className="p-2 rounded-full border border-[#2b4f24]/30 hover:bg-[#002200]/10 text-[#002200] transition-colors"
                title="Sign Out"
              >
                <IconLogout className="w-4 h-4" />
              </button>

              <button
                onClick={onContactClick}
                className="bg-[#020202] text-white px-5 py-2.5 rounded-full text-xs font-normal hover:bg-neutral-800 transition-opacity flex items-center gap-2 cursor-pointer"
              >
                <span>Get in touch</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="bg-[#020202] text-white px-5 py-2.5 rounded-full text-xs font-normal hover:bg-neutral-800 transition-opacity flex items-center gap-2 cursor-pointer"
            >
              <IconLogin className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
