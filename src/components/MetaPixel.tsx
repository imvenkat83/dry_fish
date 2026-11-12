"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export default function MetaPixelTracker() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Exclude all admin portal routes
    if (pathname?.startsWith("/admin")) return;

    // The initial script execution triggers the first PageView.
    // Trigger subsequent PageView events on client-side route changes.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
}
