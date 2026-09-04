"use client";

import { useRef, useState, useEffect } from "react";
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
  const startScrollLeftRef = useRef(0);
  const [hasMoved, setHasMoved] = useState(false);

  // Triple the items to ensure continuous smooth wrap
  const displayItems = [...items, ...items, ...items];

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
        if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft -= singleSetWidth;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += singleSetWidth;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging]);

  // Handle Manual Click & Drag
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
    setIsDragging(false);
  };

  // Manual Arrow Scroll
  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section 
      className="w-full py-6 md:py-8 bg-[#FAF6ED] border-b border-brand/10 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseUpOrLeave();
      }}
    >
      {/* Left Arrow Button */}
      <button
        type="button"
        onClick={() => scrollByAmount("left")}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#3b2314] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer border border-brand/10"
        aria-label="Scroll Left"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Right Arrow Button */}
      <button
        type="button"
        onClick={() => scrollByAmount("right")}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#3b2314] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer border border-brand/10"
        aria-label="Scroll Right"
      >
        <ChevronRight size={20} />
      </button>

      {/* Horizontal Scroll & Drag Container */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        className={`w-full flex items-center gap-6 md:gap-8 overflow-x-auto scrollbar-none px-4 select-none cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        style={{
          scrollBehavior: isDragging ? "auto" : "smooth",
          WebkitOverflowScrolling: "touch",
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
              className="group/card flex flex-col items-center shrink-0 w-[180px] sm:w-[220px] md:w-[260px] transition-transform duration-300"
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
