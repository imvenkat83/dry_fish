"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import ProductCard from "@/components/ProductCard";
import ReelsCarouselSection from "@/components/ReelsCarouselSection";
import CategoryCarousel from "@/components/CategoryCarousel";
import { getFirstProductImageUrl, getProductImageUrls } from "@/utils/product";
import { ChevronLeft, ChevronRight, Sun, Leaf, FlaskConical, Package, Star, Sparkles, Volume2, VolumeX } from "lucide-react";

type NavItem = {
  id: number;
  label: string;
  href: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
};

import { motion, AnimatePresence } from "framer-motion";

function isVideoUrl(url: string) {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".avi") ||
    cleanUrl.endsWith(".mkv") ||
    cleanUrl.includes("/video/upload/") ||
    (cleanUrl.includes(".cloudinary.com/") && cleanUrl.includes("/video/"))
  );
}

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

export default function Home() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [bannerUrl, setBannerUrl] = useState("");
  const [offers, setOffers] = useState<any[]>([]);
  const [homepageCatCards, setHomepageCatCards] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [founderPromoList, setFounderPromoList] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  useEffect(() => {
    async function loadAllPageData() {
      try {
        await Promise.allSettled([
          fetch("/api/admin/nav").then(res => res.json()).then(data => { if (data.success) setNavItems(data.data); }),
          fetch("/api/admin/settings?key=homepage_banner").then(res => res.json()).then(data => { if (data.success && data.data) setBannerUrl(data.data.value); }),
          fetch("/api/admin/offers").then(res => res.json()).then(data => { if (data.success) setOffers(data.data); }),
          fetch("/api/admin/reviews").then(res => res.json()).then(data => { if (data.success) setReviews(data.data || []); }),
          fetch("/api/products/latest").then(res => res.json()).then(data => { if (data.success) setLatestProducts(data.data || []); }),
          fetch("/api/admin/homepage-categories").then(res => res.json()).then(data => { if (data.success) setHomepageCatCards(data.data); }),
          fetch("/api/admin/faqs").then(res => res.json()).then(data => { if (data.success) setFaqs(data.data || []); }),
          fetch("/api/admin/settings?key=founder_promo").then(res => res.json()).then(data => {
            if (data.success && data.data) {
              try {
                const parsed = JSON.parse(data.data.value);
                if (Array.isArray(parsed)) setFounderPromoList(parsed);
              } catch {}
            }
          }),
        ]);
      } catch (err) {
        console.error("Failed to load initial page data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllPageData();
  }, []);

  const banners = useMemo(() => {
    if (!bannerUrl) return [];
    try {
      const parsed = JSON.parse(bannerUrl);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          if (typeof item === "string") return { url: item, mobileUrl: "", link: null };
          return {
            url: item.url || "",
            mobileUrl: item.mobileUrl || "",
            link: item.link || null,
          };
        });
      }
    } catch (e) {
      // Fallback to legacy
    }
    return bannerUrl.split(",").map((url) => ({ url: url.trim(), mobileUrl: "", link: null })).filter(b => b.url);
  }, [bannerUrl]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const categoryMarqueeItems = useMemo(() => {
    if (homepageCatCards.length === 0) return [];
    const repeats = homepageCatCards.length <= 3 ? 6 : 3;
    const list = [];
    for (let i = 0; i < repeats; i++) {
      list.push(...homepageCatCards);
    }
    return list;
  }, [homepageCatCards]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAF6ED] flex flex-col items-center justify-center p-6 text-center select-none font-serif">
        <div className="relative">
          <div className="w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center bg-transparent p-1 animate-pulse">
            <img src="/images/vk_logo_transparent.png" alt="Dry Fish Basket Logo" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-2 right-2 p-3 bg-[#8c6239] text-[#fcd34d] rounded-full shadow-lg animate-spin">
            <Sparkles size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light text-black font-sans selection:bg-brand-accent/30">

      {/* Static Home Video Banner */}
      <div className="w-full relative overflow-hidden border-b border-brand/10 group mt-0 bg-[#FAF6ED]">
        <div className="relative w-full h-auto aspect-video md:h-[calc(100vh-4rem)] md:max-h-[800px] overflow-hidden bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/videos/home-banner.mp4" type="video/mp4" />
            <source src="/videos/WhatsApp%20Video%202026-09-04%20at%202.00.20%20PM.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleSound}
            className="absolute bottom-4 right-4 z-20 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-lg cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-white/10 select-none"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span className="text-[11px] uppercase tracking-wider">{isMuted ? "Unmute" : "Mute"}</span>
          </button>
        </div>
      </div>

      {/* 2.5. Categories Section (Auto-scrolls, pauses on hover, supports manual scroll, drag, & arrow buttons) */}
      {!isLoading && categoryMarqueeItems.length > 0 && (
        <CategoryCarousel items={categoryMarqueeItems} />
      )}

      {/* 3. Main Content Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <ProductGrid />

        {/* 2.5 Brand Feature Banner (Banner 2) */}
        <section className="w-full mx-auto my-10 rounded-3xl overflow-hidden shadow-sm border border-[#8c6239]/15 bg-[#FAF6ED] transition-all hover:shadow-md">
          <div className="w-full relative">
            <img
              src="/images/banner_2.png"
              alt="Brand Quality & Heritage Features"
              className="w-full h-auto object-contain block"
            />
          </div>
        </section>

        {/* 2.6 Latest Arrivals Section */}
        {latestProducts.length > 0 && (
          <section className="w-full mx-auto my-12 pt-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-start mb-8 pb-2"
            >
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#3b2314]">
                Latest Arrivals
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {latestProducts.slice(0, 8).map((product: any) => {
                const parsedImages = getProductImageUrls(product.images, product.colors);
                const firstImage = getFirstProductImageUrl(product.images, product.colors);

                return (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id.toString(),
                      name: product.name,
                      description: product.description || "",
                      price: product.salePrice || product.basePrice,
                      basePrice: product.basePrice,
                      salePrice: product.salePrice,
                      imageUrl: firstImage,
                      images: parsedImages,
                      categorySlug: product.category || "all",
                      isCustomizable: product.isCustomizable === true || product.isCustomizable === 1,
                      style: product.style,
                      neckStyle: product.neckStyle,
                      keyWords: product.keyWords,
                      avgRating: product.avgRating,
                      numReviews: product.numReviews,
                      totalStock: product.totalStock,
                    }}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Founder Promotion Section */}
        {founderPromoList.length > 0 && (
          <section className="w-full mx-auto my-8 border-t border-[#8c6239]/10 pt-8 animate-in fade-in duration-500">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-black text-[#3b2314]">Our Mission &amp; Purpose</h2>
              <p className="text-xs text-black/50 font-bold tracking-tight mt-2 uppercase tracking-[0.15em]">Delivering authentic dry fish traditions</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {founderPromoList.map((card, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  {card.imageUrl && (
                    <div className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-sm border border-[#8c6239]/10">
                      <img
                        src={card.imageUrl}
                        alt={`Founder promotion feature ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/placeholder.png";
                        }}
                      />
                    </div>
                  )}
                  {card.text && (
                    <p
                      className="text-xs md:text-sm text-[#3b2314] leading-relaxed font-semibold px-2"
                      dangerouslySetInnerHTML={{ __html: card.text }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}



        {/* 2.75. See What Our Customers Say About Us (Customer Reviews Section) */}
        {reviews.length > 0 && (
          <section className="w-full mx-auto my-12 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center mb-8"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-[#3b2314] tracking-tight">
                See What Our Customers Say About Us
              </h2>
            </motion.div>

            <div className="relative group px-1">
              {reviews.length > 4 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const container = document.getElementById("reviews-scroll-container");
                      if (container) container.scrollBy({ left: -340, behavior: "smooth" });
                    }}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-black shadow-xl flex items-center justify-center border border-black/10 z-20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Previous Reviews"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const container = document.getElementById("reviews-scroll-container");
                      if (container) container.scrollBy({ left: 340, behavior: "smooth" });
                    }}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-black shadow-xl flex items-center justify-center border border-black/10 z-20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Next Reviews"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              <div
                id="reviews-scroll-container"
                className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar py-2 scroll-smooth"
              >
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="snap-start flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] lg:w-[calc(25%-1.125rem)] bg-[#FAF6ED] border border-[#3b2314]/25 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    {/* Top Photo */}
                    <div className="w-full aspect-[4/3] overflow-hidden bg-brand/5 border-b border-[#3b2314]/15">
                      {review.imageUrl ? (
                        <img
                          src={review.imageUrl}
                          alt={review.userName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/placeholder.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#8c6239]/10 text-[#3b2314]">
                          <span className="font-serif text-3xl font-bold uppercase">{review.userName.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-center space-y-3">
                      <div>
                        {/* Rating Stars */}
                        <div className="flex items-center justify-center gap-1 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={15}
                              className={i < (review.rating || 5) ? "fill-black text-black" : "text-black/15"}
                            />
                          ))}
                        </div>

                        {/* Review Comment */}
                        <p className="text-xs sm:text-sm font-semibold text-black/90 leading-relaxed italic mb-4">
                          "{review.comment}"
                        </p>

                        {/* Reviewer Name / Designation */}
                        <p className="text-xs sm:text-sm font-black text-black uppercase tracking-wide">
                          - {review.designation || review.userName}
                        </p>
                      </div>

                      {/* Bottom Action Button */}
                      <div className="pt-2">
                        <Link
                          href={review.buttonLink || "/all"}
                          className="block w-full py-2.5 bg-[#eab308] hover:bg-[#d9a207] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95"
                        >
                          {review.buttonText || "EXPLORE COLLECTION"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 2.8. Shoppable Video Reels Section (Below Customer Reviews) */}
        <ReelsCarouselSection />

        {/* 5. FAQs Section */}
        {faqs.length > 0 && (
          <section className="w-full mx-auto my-16 border-t border-brand-dark/10 pt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-black text-[#3b2314]">Frequently asked questions</h2>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, idx) => (
                <FAQItem key={faq.id || idx} faq={faq} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function FAQItem({ faq }: { faq: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#3b2314]/10 py-4 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-black/85 hover:text-[#8c6239] transition-colors focus:outline-none py-2 group cursor-pointer"
      >
        <span className="text-xs md:text-sm font-semibold tracking-wide">{faq.question}</span>
        <svg 
          className={`w-3.5 h-3.5 text-black/50 group-hover:text-[#8c6239] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Accordion Answer Content */}
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <p className="text-xs md:text-sm text-black/60 font-medium leading-relaxed pb-2 pr-6">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

