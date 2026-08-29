"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Offer = {
  id: number;
  text: string;
  link: string | null;
  order: number;
};

function parseOfferText(text: string) {
  if (text.includes("|")) {
    const parts = text.split("|");
    return { title: parts[0].trim(), subtitle: parts[1].trim() };
  }
  if (text.includes("!")) {
    const parts = text.split("!");
    const title = parts[0].trim();
    const subtitle = parts.slice(1).join("!").trim();
    return { title, subtitle: subtitle || null };
  }
  return { title: text.trim(), subtitle: null };
}

export default function AnnouncementBar() {
  const pathname = usePathname();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch("/api/admin/offers");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setOffers(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch announcement bar offers:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOffers();
  }, []);

  const marqueeItems = useMemo(() => {
    if (offers.length === 0) return [];
    // Repeat items to ensure it fills screen width for continuous scrolling
    const repeats = offers.length === 1 ? 12 : offers.length === 2 ? 6 : 4;
    const list = [];
    for (let i = 0; i < repeats; i++) {
      list.push(...offers);
    }
    return list;
  }, [offers]);

  if (isLoading || offers.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#8c6239] text-[#fcd34d] h-10 flex items-center overflow-hidden relative z-50 shadow-sm">
      <div className="w-full flex items-center overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          <div className="flex shrink-0 gap-8 items-center px-4">
            {marqueeItems.map((offer, idx) => {
              const { title, subtitle } = parseOfferText(offer.text);
              const displayText = subtitle ? `${title} — ${subtitle}` : title;
              return (
                <div key={idx} className="flex items-center gap-8 shrink-0">
                  {offer.link ? (
                    <Link
                      href={offer.link}
                      className="hover:text-white transition-colors duration-300 font-inter text-[11px] sm:text-xs font-black tracking-widest uppercase whitespace-nowrap"
                    >
                      {displayText}
                    </Link>
                  ) : (
                    <span className="font-inter text-[11px] sm:text-xs font-black tracking-widest uppercase whitespace-nowrap">
                      {displayText}
                    </span>
                  )}
                  <span className="text-[#fcd34d]/60 text-xs select-none">★</span>
                </div>
              );
            })}
          </div>
          <div className="flex shrink-0 gap-8 items-center px-4" aria-hidden="true">
            {marqueeItems.map((offer, idx) => {
              const { title, subtitle } = parseOfferText(offer.text);
              const displayText = subtitle ? `${title} — ${subtitle}` : title;
              return (
                <div key={`dup-${idx}`} className="flex items-center gap-8 shrink-0">
                  {offer.link ? (
                    <Link
                      href={offer.link}
                      className="hover:text-white transition-colors duration-300 font-inter text-[11px] sm:text-xs font-black tracking-widest uppercase whitespace-nowrap"
                    >
                      {displayText}
                    </Link>
                  ) : (
                    <span className="font-inter text-[11px] sm:text-xs font-black tracking-widest uppercase whitespace-nowrap">
                      {displayText}
                    </span>
                  )}
                  <span className="text-[#fcd34d]/60 text-xs select-none">★</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
