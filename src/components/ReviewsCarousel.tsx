"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export interface ReviewItem {
  id: number | string;
  userName: string;
  rating?: number;
  comment: string;
  designation?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  createdAt?: string | null;
}

interface ReviewsCarouselProps {
  reviews: ReviewItem[];
}

export default function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const [hasMoved, setHasMoved] = useState(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollPosRef = useRef<number | null>(null);

  // Normalize base items to ensure ample width before tripling
  const baseItems = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    const minCards = 6;
    if (reviews.length >= minCards) return reviews;
    const repeats = Math.ceil(minCards / reviews.length);
    const result: ReviewItem[] = [];
    for (let i = 0; i < repeats; i++) {
      result.push(...reviews);
    }
    return result;
  }, [reviews]);

  // Triple items for seamless infinite wrap
  const displayItems = useMemo(() => {
    if (baseItems.length === 0) return [];
    return [...baseItems, ...baseItems, ...baseItems];
  }, [baseItems]);

  // Helper to pause auto-scroll temporarily after manual interaction
  const pauseAutoScrollTemporarily = useCallback((duration = 3500) => {
    setIsHovered(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, duration);
  }, []);

  // Initialize scroll position to the middle set
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || displayItems.length === 0) return;

    // Allow DOM to layout cards before measuring
    const timer = setTimeout(() => {
      if (!container) return;
      const singleSetWidth = container.scrollWidth / 3;
      if (singleSetWidth > 0 && container.scrollLeft === 0) {
        container.scrollLeft = singleSetWidth;
        scrollPosRef.current = singleSetWidth;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [displayItems.length]);

  // Smooth continuous auto-scroll TOWARDS LEFT
  useEffect(() => {
    let animationFrameId: number;
    const speed = 0.65; // pixels per frame (smooth and readable)

    const autoScroll = () => {
      const container = scrollRef.current;
      if (container && !isHovered && !isDragging) {
        const singleSetWidth = container.scrollWidth / 3;

        if (singleSetWidth > 0) {
          if (scrollPosRef.current === null) {
            scrollPosRef.current = container.scrollLeft || singleSetWidth;
          }

          // Move towards left (scrollLeft increases, visual cards drift leftwards)
          scrollPosRef.current += speed;

          // Infinite wrap when reaching the right boundary
          if (scrollPosRef.current >= singleSetWidth * 2) {
            scrollPosRef.current -= singleSetWidth;
          } else if (scrollPosRef.current <= 5) {
            scrollPosRef.current += singleSetWidth;
          }

          container.scrollLeft = scrollPosRef.current;
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

  // Synchronize scrollPosRef when manual scroll occurs
  const handleScroll = () => {
    if (scrollRef.current && (isDragging || isHovered)) {
      scrollPosRef.current = scrollRef.current.scrollLeft;
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    startScrollLeftRef.current = scrollRef.current.scrollLeft;
    scrollPosRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    const newScroll = startScrollLeftRef.current - walk;
    scrollRef.current.scrollLeft = newScroll;
    scrollPosRef.current = newScroll;
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      pauseAutoScrollTemporarily(2500);
      setTimeout(() => setHasMoved(false), 100);
    }
  };

  // Touch Swipe Handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    startXRef.current = e.touches[0].pageX;
    startYRef.current = e.touches[0].pageY;
    startScrollLeftRef.current = scrollRef.current.scrollLeft;
    scrollPosRef.current = scrollRef.current.scrollLeft;
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
      const newScroll = startScrollLeftRef.current - diffX * 1.2;
      scrollRef.current.scrollLeft = newScroll;
      scrollPosRef.current = newScroll;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    pauseAutoScrollTemporarily(3000);
    setTimeout(() => setHasMoved(false), 120);
  };

  // Arrow Button Navigation
  const scrollByDirection = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    pauseAutoScrollTemporarily(4000);
    const scrollAmount = 300;
    const newScroll =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
    scrollPosRef.current = newScroll;
  };

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div
      className="relative group w-full select-none"
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
        className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#3b2314] shadow-xl flex items-center justify-center border border-black/10 z-30 transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Previous Reviews"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Right Navigation Arrow */}
      <button
        type="button"
        onClick={() => scrollByDirection("right")}
        className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#3b2314] shadow-xl flex items-center justify-center border border-black/10 z-30 transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Next Reviews"
      >
        <ChevronRight size={22} />
      </button>

      {/* Continuous Auto-Scrolling Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-3 scrollbar-none [&::-webkit-scrollbar]:hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          scrollBehavior: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          touchAction: "pan-y",
        }}
      >
        {displayItems.map((review, index) => (
          <div
            key={`${review.id}-${index}`}
            className="flex-shrink-0 w-[230px] sm:w-[260px] md:w-[280px] bg-[#FAF6ED] border border-[#3b2314]/25 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all text-center min-h-[350px]"
          >
            <div className="flex flex-col items-center flex-1">
              {/* Circular Customer Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#8c6239]/25 shadow-md bg-white shrink-0 mb-3 p-0.5">
                {review.imageUrl ? (
                  <img
                    src={review.imageUrl}
                    alt={review.userName}
                    className="w-full h-full object-cover rounded-full pointer-events-none select-none"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/placeholder.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#8c6239]/10 text-[#3b2314] rounded-full select-none">
                    <span className="font-serif text-2xl font-bold uppercase">
                      {review.userName ? review.userName.charAt(0) : "U"}
                    </span>
                  </div>
                )}
              </div>

              {/* Rating Stars */}
              <div className="flex items-center justify-center gap-1 mb-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < (review.rating || 5)
                        ? "fill-[#3b2314] text-[#3b2314]"
                        : "text-black/15"
                    }
                  />
                ))}
              </div>

              {/* Review Comment */}
              <div className="flex-1 flex flex-col justify-center my-1.5 px-1">
                <p className="text-xs sm:text-[13px] font-semibold text-black/90 leading-snug italic">
                  "{review.comment}"
                </p>
              </div>

              {/* Reviewer Name / Designation */}
              <p className="text-[11px] sm:text-xs font-black text-black uppercase tracking-wide mt-2 mb-2.5">
                - {review.designation || review.userName}
              </p>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-2 w-full">
              <Link
                href={review.buttonLink || "/all"}
                onClick={(e) => {
                  if (hasMoved) {
                    e.preventDefault();
                  }
                }}
                className="block w-full py-2 bg-[#eab308] hover:bg-[#d9a207] text-black text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95 text-center font-inter"
              >
                {review.buttonText || "EXPLORE COLLECTION"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
