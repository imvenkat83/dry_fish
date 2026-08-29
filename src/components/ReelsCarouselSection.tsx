"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Eye, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { getProductImageUrls } from "@/utils/product";
import ProductQuickViewModal from "./ProductQuickViewModal";

interface ReelData {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  badgeText: string;
  viewsCount: string;
  displayOrder: number;
  product: {
    id: number;
    name: string;
    description?: string;
    basePrice: number;
    salePrice: number | null;
    avgRating?: number;
    numReviews?: number;
    images?: any;
    category?: string;
  } | null;
}

export default function ReelsCarouselSection() {
  const [reels, setReels] = useState<ReelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchReels() {
      try {
        const res = await fetch("/api/reels");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setReels(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch reels", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReels();
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleOpenProductModal = (product: any) => {
    if (product) {
      setSelectedProductForModal(product);
      setIsModalOpen(true);
    }
  };

  if (isLoading || reels.length === 0) return null;

  return (
    <section className="w-full mx-auto my-14 pt-4 font-sans">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-8 px-4">
        <div className="flex items-center space-x-2 text-[#8c6239] text-xs font-black uppercase tracking-[0.2em] mb-2">
          <Sparkles size={14} className="animate-spin text-[#8c6239]" />
          <span>Watch & Shop Real Customer Recipes</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-[#3b2314] tracking-tight">
          Trending Coastal Reels
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative group px-2 sm:px-4">
        {/* Scroll Control Arrows */}
        {reels.length > 3 && (
          <>
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl flex items-center justify-center border border-black/10 z-30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Previous Reels"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl flex items-center justify-center border border-black/10 z-30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Next Reels"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Reels Horizontal Scroll Row */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar py-3 px-2 scroll-smooth"
        >
          {reels.map((reel) => {
            const product = reel.product;
            const productImages = getProductImageUrls(product?.images);
            const productImage = productImages.length > 0 ? productImages[0] : "/images/placeholder.png";

            return (
              <div
                key={reel.id}
                className="snap-start flex-shrink-0 w-[220px] sm:w-[250px] md:w-[270px] aspect-[9/16] relative rounded-3xl overflow-hidden shadow-lg border-2 border-[#3b2314]/25 bg-black group/reel cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                onClick={() => product && handleOpenProductModal(product)}
              >
                {/* Auto-playing Muted Video */}
                <video
                  src={reel.videoUrl}
                  poster={reel.thumbnailUrl || undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover group-hover/reel:scale-105 transition-transform duration-700"
                />

                {/* Video Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                  <span className="px-2.5 py-1 bg-[#2563eb] text-white font-black text-[9px] uppercase tracking-widest rounded-md shadow-md">
                    {reel.badgeText || "NEW"}
                  </span>
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] tracking-wider rounded-md shadow-md flex items-center gap-1">
                    <Eye size={12} />
                    <span>{reel.viewsCount || "2.5M"}</span>
                  </span>
                </div>

                {/* Center Translucent Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 group-hover/reel:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center border border-white/30 backdrop-blur-sm shadow-xl group-hover/reel:scale-110 transition-transform">
                    <Play size={20} className="fill-white ml-1" />
                  </div>
                </div>

                {/* Bottom Linked Product Overlay Card */}
                {product && (
                  <div className="absolute bottom-3 inset-x-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-black/10 shadow-2xl flex items-center justify-between space-x-2 transition-transform duration-300 group-hover/reel:scale-[1.02]">
                    {/* Left: Product Thumbnail */}
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-11 h-11 rounded-xl object-cover border border-black/10 flex-shrink-0 bg-brand/5"
                    />

                    {/* Center: Product Info */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[11px] font-black text-[#3b2314] truncate leading-tight">
                        {product.name}
                      </h4>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-0.5 my-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < Math.floor(product.avgRating || 4.5) ? "fill-black text-black" : "text-black/20"}
                          />
                        ))}
                        <span className="text-[8px] font-bold text-gray-500 ml-1">
                          {product.numReviews || 992} REVIEWS
                        </span>
                      </div>

                      {/* Prices */}
                      <div className="flex items-baseline space-x-1.5 text-xs">
                        <span className="font-bold text-gray-400 line-through text-[10px]">
                          ₹{product.basePrice}
                        </span>
                        <span className="font-black text-[#3b2314]">
                          ₹{product.salePrice || product.basePrice}
                        </span>
                      </div>
                    </div>

                    {/* Right: Eye Quick View Icon */}
                    <div className="w-8 h-8 rounded-full bg-brand/10 text-[#3b2314] flex items-center justify-center flex-shrink-0 group-hover/reel:bg-[#8c6239] group-hover/reel:text-white transition-colors">
                      <Eye size={16} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProductForModal}
      />
    </section>
  );
}
