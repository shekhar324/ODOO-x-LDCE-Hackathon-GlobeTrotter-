"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Instantiate Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // Stop Lenis from handling scroll when cursor/touch is inside a
    // [data-lenis-prevent] element (modals, custom scrollable panels).
    const preventScroll = (e: WheelEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-lenis-prevent]")) {
        lenis.stop();
        // Re-start lenis shortly after so normal page scroll resumes
        // when user moves outside the prevent zone.
        clearTimeout((preventScroll as unknown as { _tid?: ReturnType<typeof setTimeout> })._tid);
        (preventScroll as unknown as { _tid?: ReturnType<typeof setTimeout> })._tid = setTimeout(
          () => lenis.start(),
          200
        );
      } else {
        lenis.start();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: true });
    window.addEventListener("touchmove", preventScroll, { passive: true });

    // RAF loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Watch for document body height changes (vital for TanStack Query dynamic renders!)
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // On page transitions: scroll to top and force a resize recalculation
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      setTimeout(() => {
        lenisRef.current?.resize();
      }, 100);
    }
  }, [pathname]);

  return <>{children}</>;
}
