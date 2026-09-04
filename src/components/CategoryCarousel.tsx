"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryItem {
  id: number | string;
  name: string;
  imageUrl?: string;
  link?: string;
}

export default function CategoryCarousel({ items }: { items: CategoryItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const [hasMoved, setHasMoved] = useState(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Triple the items to ensure continuous smooth wrap
  const displayItems = [...items, ...items, ...items];

  // Helper to pause auto-scroll after manual user interaction
  const pauseAutoScrollTemporarily = useCallback((duration = 3000) => {
    setIsHovered(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, duration);
  }, []);

  // Smooth continuous auto-scroll
  useEffect(() => {
    let animationFrameId: number;
    const speed = 0.8; // px per frame

    const autoScroll = () => {
      if (scrollRef.current && !isHovered && !isDragging) {
        const container = scrollRef.current;
        container.scrollLeft += speed;

        // Loop back when reached end of middle set
        const singleSetWidth = container.scrollWidth / 3;
        if (singleSetWidth > 0) {
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += singleSetWidth;
          }
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [isHovered, isDragging]);

  // Handle Desktop Mouse Click & Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    startScrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = startScrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      pauseAutoScrollTemporarily(2000);
      setTimeout(() => setHasMoved(false), 100);
    }
  };

  // Handle Mobile Touch Drag & Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    startXRef.current = e.touches[0].pageX;
    startYRef.current = e.touches[0].pageY;
    startScrollLeftRef.current = scrollRef.current.scrollLeft;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const currentX = e.touches[0].pageX;
    const currentY = e.touches[0].pageY;
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;

    // Detect horizontal swipe vs vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 5) {
        setHasMoved(true);
      }
      scrollRef.current.scrollLeft = startScrollLeftRef.current - diffX * 1.2;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    pauseAutoScrollTemporarily(3000);
    setTimeout(() => setHasMoved(false), 120);
  };

  // Arrow button navigation (Smooth scroll by card width)
  const scrollByDirection = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    pauseAutoScrollTemporarily(3500);
    const scrollAmount = 240;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section 
      className="w-full py-6 md:py-8 bg-[#FAF6ED] border-b border-brand/10 relative group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseUpOrLeave();
      }}
    >
      {/* Left Navigation Arrow */}
      <button
        type="button"
        onClick={() => scrollByDirection("left")}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/95 hover:bg-white text-[#8c6239] shadow-md flex items-center justify-center transition-all border border-[#8c6239]/15 cursor-pointer opacity-90 hover:opacity-100 hover:scale-105 active:scale-95"
        aria-label="Scroll categories left"
      >
        <ChevronLeft size={18} className="md:w-5 md:h-5" />
      </button>

      {/* Right Navigation Arrow */}
      <button
        type="button"
        onClick={() => scrollByDirection("right")}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/95 hover:bg-white text-[#8c6239] shadow-md flex items-center justify-center transition-all border border-[#8c6239]/15 cursor-pointer opacity-90 hover:opacity-100 hover:scale-105 active:scale-95"
        aria-label="Scroll categories right"
      >
        <ChevronRight size={18} className="md:w-5 md:h-5" />
      </button>

      {/* Horizontal Scroll & Touch/Drag Container */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`w-full flex items-center gap-6 md:gap-8 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden px-8 md:px-12 select-none cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        style={{
          scrollBehavior: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          touchAction: "pan-y",
        }}
      >
        {displayItems.map((item, index) => {
          const cardImage =
            item.imageUrl && item.imageUrl.includes(",")
              ? item.imageUrl.split(",")[0]
              : item.imageUrl || "/images/placeholder.png";

          return (
            <Link
              key={`${item.id}-${index}`}
              href={item.link || `/category/${item.name.toLowerCase().trim().replace(/\s+/g, "-")}`}
              onClick={(e) => {
                if (hasMoved) {
                  e.preventDefault();
                }
              }}
              draggable={false}
              className="group/card flex flex-col items-center shrink-0 w-[160px] sm:w-[200px] md:w-[240px] transition-transform duration-300"
            >
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-brand/10 shadow-sm transition-transform duration-500 group-hover/card:scale-[1.03] relative bg-white">
                <img
                  src={cardImage}
                  alt={item.name}
                  draggable={false}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/placeholder.png";
                  }}
                />
              </div>
              <h3 className="mt-3 text-center font-serif text-[#3b2314] font-bold text-sm md:text-base tracking-tight group-hover/card:text-[#8c6239] transition-colors leading-tight">
                {item.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
