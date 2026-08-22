"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { IconLock, IconArrowRight } from "@tabler/icons-react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useAuth();
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex items-center justify-center">
        <div className="font-serif text-2xl animate-pulse text-[#72dc85]">GlobeTrotter</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex flex-col justify-between font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
        <NavigationPill />

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-32 text-center">
          <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-8 bg-[#020202]">
            <IconLock className="w-8 h-8 text-[#72dc85]" stroke={1.5} />
          </div>

          <EditorialHeading className="text-4xl md:text-6xl text-white font-thin mb-4 tracking-tight">
            Private Member Access
          </EditorialHeading>

          <p className="font-sans text-lg text-[#becabb] max-w-md mb-10">
            Please log in or create an account to access your personal dashboard, itinerary builder, and concierge preferences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/login"
              className="bg-[#2d9b4c] text-white px-8 py-4 rounded-[10px] font-sans text-sm hover:bg-[#38a454] transition-colors flex items-center gap-2"
            >
              <span>Login to Account</span>
              <IconArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => login("guest@globetrotter.app")}
              className="bg-transparent border border-white/30 text-white px-8 py-4 rounded-[10px] font-sans text-sm hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              Quick Demo Access
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
