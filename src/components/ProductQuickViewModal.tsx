"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Star, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Copy, 
  Check, 
  Truck, 
  Headphones, 
  ShieldCheck, 
  Flame, 
  ShoppingCart,
  ExternalLink,
  Loader2
} from "lucide-react";
import { getProductImageUrls } from "@/utils/product";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Variation {
  id: number;
  size: string;
  stock: number;
  mrp: number;
  salePrice: number;
}

interface ProductQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function ProductQuickViewModal({ isOpen, onClose, product }: ProductQuickViewProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fullProduct, setFullProduct] = useState<any | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [selectedWeight, setSelectedWeight] = useState("500g");
  const [selectedPackCount, setSelectedPackCount] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch full product details from DB whenever modal opens for a product
  useEffect(() => {
    if (product?.id) {
      setFullProduct(null); // IMMEDIATELY clear previous product state
      setSelectedImageIndex(0);
      setSelectedPackCount(1);
      setIsAddedSuccess(false);
      setIsLoadingDetails(true);

      fetch(`/api/products/${product.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setFullProduct(data);
            if (data.variations && data.variations.length > 0) {
              setSelectedVariation(data.variations[0]);
              setSelectedWeight(data.variations[0].size);
            } else {
              setSelectedVariation(null);
            }
          }
        })
        .catch(() => setFullProduct(null))
        .finally(() => setIsLoadingDetails(false));
    } else {
      setFullProduct(null);
      setIsLoadingDetails(false);
    }
  }, [product?.id]);

  if (!isOpen || !product) return null;

  // Use full product data if loaded, otherwise fallback to prop data
  const currentProduct = fullProduct || product;
  const images = getProductImageUrls(currentProduct.images);
  const displayImages = images.length > 0 ? images : ["/images/placeholder.png"];

  // Pricing calculations based on selected variation or product base/sale price
  const currentPrice = selectedVariation
    ? selectedVariation.salePrice || selectedVariation.mrp
    : currentProduct.salePrice || currentProduct.basePrice;

  const originalPrice = selectedVariation
    ? selectedVariation.mrp
    : currentProduct.salePrice
    ? currentProduct.basePrice
    : Math.round(currentPrice * 1.25);

  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      const res = await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: currentProduct.id,
          quantity: selectedPackCount,
          weight: selectedWeight,
          variationId: selectedVariation?.id,
        }),
      });
      if (res.ok) {
        setIsAddedSuccess(true);
        setTimeout(() => setIsAddedSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Failed to add to cart", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const productDescription = currentProduct.description || "Packed with authentic coastal flavor. Hygienically processed and traditional sun-dried.";
  const productCategory = currentProduct.category || "Dry Fish";
  const variationsList: Variation[] = currentProduct.variations || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#FAF6ED] rounded-3xl shadow-2xl border border-[#8c6239]/20 overflow-hidden flex flex-col md:flex-row z-10 animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 flex items-center justify-center transition-all cursor-pointer shadow-md"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Content */}
        {isLoadingDetails ? (
          <div className="w-full h-full min-h-[420px] flex flex-col items-center justify-center p-12 text-[#8c6239] space-y-3">
            <Loader2 className="animate-spin h-10 w-10 text-[#8c6239]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#3b2314]">
              Loading Product Details...
            </p>
          </div>
        ) : (
          <>
            {/* LEFT COLUMN: Image Gallery */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#8c6239]/15 bg-white">
          {/* Main Product Image Carousel */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-brand/5 border border-black/5 shadow-inner group">
            <img
              src={displayImages[selectedImageIndex] || displayImages[0]}
              alt={currentProduct.name}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-black shadow-md flex items-center justify-center border border-black/10 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-black shadow-md flex items-center justify-center border border-black/10 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Image dots */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center space-x-1.5 z-10">
                {displayImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === selectedImageIndex ? "w-6 bg-[#8c6239]" : "w-2 bg-black/30"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Favorite Wishlist Icon */}
            <button className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 text-black hover:text-red-500 transition-colors shadow-md">
              <Heart size={18} />
            </button>
          </div>

          {/* Thumbnails Row */}
          <div className="flex gap-2.5 overflow-x-auto pt-4 no-scrollbar">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                  selectedImageIndex === idx ? "border-[#8c6239] scale-105 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Real Product Information & Controls */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 overflow-y-auto max-h-[85vh] space-y-4 custom-scrollbar">
          
          {/* Breadcrumb Path */}
          <div className="text-[11px] font-semibold text-gray-500 flex items-center space-x-1">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="hover:underline text-gray-600">{productCategory}</span>
            <span>/</span>
            <span className="text-[#3b2314] truncate font-bold">{currentProduct.name}</span>
          </div>

          {/* Top Trust Badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-[#FFF7E6] text-[#8c6239] px-2 py-1 rounded-md border border-[#8c6239]/20">
              <Truck size={11} /> Fast Shipping
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-[#FFF7E6] text-[#8c6239] px-2 py-1 rounded-md border border-[#8c6239]/20">
              <Headphones size={11} /> Quick Support
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-[#FFF7E6] text-[#8c6239] px-2 py-1 rounded-md border border-[#8c6239]/20">
              <ShieldCheck size={11} /> Branded Pack
            </span>
          </div>

          {/* Product Title & Share */}
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-black text-[#3b2314] tracking-tight leading-snug">
              {currentProduct.name}
            </h2>
            <button className="p-2 text-gray-400 hover:text-[#8c6239] transition-colors rounded-lg border border-gray-200">
              <Share2 size={16} />
            </button>
          </div>

          {/* Ratings & Review Count */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center text-amber-500 font-bold">
              <Star size={14} className="fill-amber-400 text-amber-400 mr-1" />
              <span>{currentProduct.avgRating || 4.5}</span>
              <span className="text-gray-400 font-normal ml-1">({currentProduct.numReviews || 120} reviews)</span>
            </div>
            <span className="px-2 py-0.5 bg-red-500 text-white font-bold text-[10px] uppercase rounded-full flex items-center gap-1 shadow-sm">
              <Flame size={12} /> Bestseller
            </span>
          </div>

          {/* Price Box */}
          <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-[#3b2314]">₹{currentPrice.toLocaleString()}</span>
              {originalPrice > currentPrice && (
                <span className="text-sm font-semibold text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
              )}
              {discountPercent > 0 && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-[10px] rounded-md uppercase">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            <div className="text-[10px] font-bold text-red-600 flex items-center gap-1">
              <Flame size={12} className="animate-bounce" />
              <span>Selling Fast</span>
            </div>
          </div>

          {/* REAL Product Description from Database */}
          <div className="bg-white/80 border border-[#8c6239]/15 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c6239]">
              Product Description
            </h4>
            {isLoadingDetails ? (
              <div className="flex items-center space-x-2 text-xs text-gray-400 py-1">
                <Loader2 className="animate-spin h-3.5 w-3.5" />
                <span>Loading product description...</span>
              </div>
            ) : (
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {productDescription}
              </p>
            )}
          </div>

          {/* Weight / Size Variations */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#3b2314]">Select Weight:</label>
            <div className="flex flex-wrap gap-2">
              {variationsList.length > 0 ? (
                variationsList.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariation(v);
                      setSelectedWeight(v.size);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedVariation?.id === v.id
                        ? "bg-[#3b2314] text-white border-[#3b2314] shadow-sm"
                        : "bg-white text-[#3b2314] border-gray-300 hover:border-[#8c6239]"
                    }`}
                  >
                    {v.size} (₹{v.salePrice || v.mrp})
                  </button>
                ))
              ) : (
                ["500g", "1 kg", "250g"].map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeight(w)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedWeight === w
                        ? "bg-[#3b2314] text-white border-[#3b2314] shadow-sm"
                        : "bg-white text-[#3b2314] border-gray-300 hover:border-[#8c6239]"
                    }`}
                  >
                    {w}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Coupon Code Offers Box */}
          <div className="border border-dashed border-[#8c6239]/40 bg-[#FFFDF6] rounded-2xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3b2314]">Get 5% off first order — use code</span>
              <button
                onClick={() => handleCopyCode("FIRSTORDER")}
                className="px-2.5 py-1 bg-black text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 hover:bg-gray-800 cursor-pointer"
              >
                {copiedCode === "FIRSTORDER" ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedCode === "FIRSTORDER" ? "Copied" : "FIRSTORDER"}</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3b2314]">10% off ₹2000+ — use code</span>
              <button
                onClick={() => handleCopyCode("GOLDEN10")}
                className="px-2.5 py-1 bg-black text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 hover:bg-gray-800 cursor-pointer"
              >
                {copiedCode === "GOLDEN10" ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedCode === "GOLDEN10" ? "Copied" : "GOLDEN10"}</span>
              </button>
            </div>
          </div>

          {/* Add to Cart CTA & Link to Product Page */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center space-x-2 cursor-pointer ${
                isAddedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-[#eab308] hover:bg-[#d9a207] text-[#3b2314]"
              }`}
            >
              <ShoppingCart size={18} />
              <span>
                {isAddingToCart 
                  ? "Adding..." 
                  : isAddedSuccess 
                  ? "✓ Added to Cart!" 
                  : `Add to Cart • ₹${(currentPrice * selectedPackCount).toLocaleString()}`
                }
              </span>
            </button>

            <button
              onClick={() => {
                onClose();
                router.push(`/product/${currentProduct.id}`);
              }}
              className="w-full py-2.5 rounded-xl border border-[#3b2314]/30 hover:border-[#3b2314] text-[#3b2314] font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>View Full Product Page</span>
              <ExternalLink size={14} />
            </button>
            </div>

          </div>
        </>
      )}

    </div>
  </div>
  );
}
