"use client";

import { useState, useEffect, use, useMemo } from "react";
import { Sparkles, ArrowLeft, ShoppingBag, Check, X, Heart, Truck, ClipboardList, Package, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { usePathname } from "next/navigation";
import RefineDrawer from "@/components/RefineDrawer";
import { getProductImageUrls, getFirstProductImageUrl } from "@/utils/product";
import ProductCard from "@/components/ProductCard";


interface Variation {
  id: number;
  size: string;
  color: string;
  stock: number;
  mrp: number;
  salePrice: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  salePrice: number;
  images: string; // JSON string array
  colors: string; // JSON string array
  isFeatured: boolean | number | null;
  isCustomizable: boolean | number | null;
  enabledMeasurements: string | null; // JSON string array
  gender: string | null;
  avgRating?: number | string | null;
  numReviews?: number | string | null;
  tags?: string | null;
  style?: string | null;
  fabricComposition?: string | null;
  weave?: string | null;
  neckStyle?: string | null;
  keyWords?: string | null;
  specifications?: string | null;
  variations: Variation[];
}

const COLOR_MAP: Record<string, string> = {
  white: "#FFFFFF",
  black: "#171717",
  red: "#EF4444",
  blue: "#3B82F6",
  "sky blue": "#0EA5E9",
  navy: "#1E3A8A",
  grey: "#737373",
  gray: "#737373",
  brown: "#78350F",
  maroon: "#5C1D16",
  pink: "#EC4899",
  beige: "#EADED2",
  gold: "#C5A059",
  "forest green": "#8c6239",
  green: "#22C55E",
  yellow: "#EAB308",
};

const getColorDisplayName = (color: string | null | undefined) => {
  if (!color) return "";
  return color.includes("::") ? color.split("::")[0] : color;
};

const getColorHex = (colorName: string) => {
  if (colorName.includes("::")) {
    return colorName.split("::")[1];
  }
  const lower = colorName.toLowerCase();
  return COLOR_MAP[lower] || (colorName.startsWith("#") ? colorName : "#CCCCCC");
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState("");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const pathname = usePathname();
  const isWishlisted = useWishlistStore((state) => state.items.some((item) => item.productId === Number(id)));
  const addItemToWishlist = useWishlistStore((state) => state.addItem);
  const removeItemFromWishlist = useWishlistStore((state) => state.removeItem);
  const isAuthenticated = useWishlistStore((state) => state.isAuthenticated);

  // Parse specifications
  const parsedSpecs = useMemo(() => {
    if (!product?.specifications) return null;
    try {
      return JSON.parse(product.specifications) as Record<string, string>;
    } catch (e) {
      console.error("Failed to parse specifications:", e);
      return null;
    }
  }, [product?.specifications]);

  const hasSpecs = parsedSpecs ? Object.keys(parsedSpecs).length > 0 : false;

  const topBadges = useMemo(() => {
    if (!product?.weave) return [];
    return product.weave.split(",").map(b => b.trim()).filter(Boolean);
  }, [product?.weave]);

  const taglines = product?.neckStyle ? product.neckStyle.trim() : "";
  const soldCount = product?.keyWords ? product.keyWords.trim() : "";

  const specDetailsList = useMemo(() => {
    if (!parsedSpecs) return [];
    return Object.entries(parsedSpecs).filter(([k]) => k.toLowerCase() !== "key words" && k.toLowerCase() !== "key details");
  }, [parsedSpecs]);


  const handleWishlistClick = async () => {
    try {
      const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
      const sessionData = await sessionRes.json();
      if (!sessionData.authenticated) {
        window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
        return;
      }
    } catch (err) {
      window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
      return;
    }

    if (isWishlisted) {
      await removeItemFromWishlist(Number(id));
    } else {
      await addItemToWishlist(Number(id));
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);

          // Set initial color and size if available
          const uniqueColors = Array.from(new Set(data.variations.map((v: Variation) => v.color))) as string[];
          if (uniqueColors.length > 0) {
            const firstColor = uniqueColors[0] as string;
            setSelectedColor(firstColor);

            // Also set first size for that color
            const firstSize = data.variations.find((v: Variation) => v.color === firstColor)?.size;
            if (firstSize) setSelectedSize(firstSize);
          }

          // Set initial main image
          let initialImage = "/images/placeholder.png";
          try {
            const parsed = JSON.parse(data.images || "[]");
            if (Array.isArray(parsed)) {
              if (parsed.length > 0) initialImage = parsed[0];
            } else if (uniqueColors.length > 0 && parsed[uniqueColors[0]] && parsed[uniqueColors[0]].length > 0) {
              initialImage = parsed[uniqueColors[0]][0];
            } else if (parsed["Default"] && parsed["Default"].length > 0) {
              initialImage = parsed["Default"][0];
            } else {
              const keys = Object.keys(parsed);
              if (keys.length > 0 && parsed[keys[0]].length > 0) {
                initialImage = parsed[keys[0]][0];
              }
            }
          } catch {}
          setMainImage(initialImage);

          // Fetch similar products in the same category
          try {
            const allRes = await fetch("/api/products");
            if (allRes.ok) {
              const allData = await allRes.json();
              if (allData.success && Array.isArray(allData.data)) {
                const category = data.category;
                const currentId = data.id;
                const filtered = allData.data
                  .filter((p: any) => p.category === category && p.id !== currentId)
                  .slice(0, 4);
                setSimilarProducts(filtered);
              }
            }
          } catch (err) {
            console.error("Failed to fetch similar products", err);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const colorImages = useMemo(() => {
    if (!product) return [];
    return getProductImageUrls(product.images, product.colors, selectedColor);
  }, [product, selectedColor]);

  // Sync main image when color images update
  useEffect(() => {
    if (colorImages.length > 0) {
      setMainImage(colorImages[0]);
    }
  }, [colorImages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Product Not Found</h1>
          <Link href="/" className="text-black-accent hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const variations = product.variations || [];

  // Get unique colors available for this product
  const availableColors = Array.from(new Set(variations.map(v => v.color))).filter(Boolean);

  // Get sizes available for the selected color
  const sizesForColor = variations.filter(v => v.color === selectedColor);
  const availableSizes = Array.from(new Set(sizesForColor.map(v => v.size)));

  const isSingleSize = availableSizes.length === 1 && (
    availableSizes[0] === "Standard" || 
    availableSizes[0] === "One Size" || 
    availableSizes[0] === "No Size" || 
    availableSizes[0] === "Default"
  );

  // Current selected variation
  const currentVariation = variations.find(
    v => v.color === selectedColor && v.size === selectedSize
  );

  const displayPrice = currentVariation?.salePrice || product.salePrice || product.basePrice;
  const mrp = currentVariation?.mrp || product.basePrice;
  const currentStock = currentVariation?.stock || 0;

  const enabledMeasurementsList = JSON.parse(product.enabledMeasurements || "[]") as string[];

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    if (quantity < currentStock) {
      setQuantity((prev) => prev + 1);
    } else {
      setToast(`Only ${currentStock} items available in stock`);
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handleAddToCart = async () => {
    try {
      const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
      const sessionData = await sessionRes.json();
      if (!sessionData.authenticated) {
        window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
        return;
      }
    } catch (err) {
      window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
      return;
    }

    if (!selectedColor) {
      setToast("Please select a color first");
      return;
    }
    if (!selectedSize) {
      setToast("Please select a size first");
      return;
    }
    if (!currentVariation) {
      setToast("The selected combination is currently unavailable.");
      return;
    }
    if (quantity > currentStock) {
      setToast(`Only ${currentStock} items available in stock`);
      return;
    }

    addItem({
      id: `prod_${product.id}_${selectedColor}_${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: displayPrice,
      image: mainImage,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      customizations: null
    });

    setAdded(true);
    setToast("Item successfully added to bag!");
    setTimeout(() => {
      setAdded(false);
      setToast("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-brand-light text-black font-sans selection:bg-brand-accent/30">
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-6 pb-16">
        <Link href="/" className="inline-flex items-center space-x-3 text-black/60 hover:text-black-accent transition-all mb-6 text-xs font-bold uppercase tracking-widest group">
          <div className="p-2 rounded-full bg-white shadow-sm border border-brand/5 group-hover:border-brand-accent/30 transition-all">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Collections</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Image Gallery (5 cols - reduced from 6) */}
          <div className="lg:col-span-5 flex flex-col-reverse md:flex-row gap-5">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto max-h-[600px] no-scrollbar">
              {colorImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative flex-shrink-0 w-20 h-24 md:w-24 md:h-32 rounded-lg overflow-hidden border-2 transition-all ${mainImage === img ? "border-brand-accent shadow-md scale-105" : "border-transparent hover:border-brand/20"
                    }`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 aspect-square relative rounded-2xl overflow-hidden bg-white shadow-xl group">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-6 right-6">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-brand/5 text-black-accent">
                  <Sparkles size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Details (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-[#FAF6ED] border border-[#8c6239]/15 rounded-3xl p-6 md:p-8 shadow-sm">
            {/* 1. Product Name */}
            <h1 className="text-2xl md:text-3xl font-serif font-black leading-tight text-[#3b2314] mb-3">
              {product.name}
            </h1>

            {/* 2. Price of First/Selected Quantity */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-black text-black">₹{displayPrice.toLocaleString()}</span>
              {mrp > displayPrice && (
                <>
                  <span className="text-lg text-black/40 line-through font-medium">₹{mrp.toLocaleString()}</span>
                  <span className="bg-[#22c55e] text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Save {Math.round(((mrp - displayPrice) / mrp) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* 3. Availability Badge */}
            <div className="mb-6 flex items-center">
              {currentStock > 0 ? (
                <span className="bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8c6239] animate-pulse"></span>
                  In Stock
                </span>
              ) : (
                <span className="bg-rose-50 text-rose-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-rose-200 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Out of Stock
                </span>
              )}
            </div>

            {/* 4. Options to Choose Size */}
            {!isSingleSize && (
              <div className="mb-6">
                <span className="text-xs font-black text-black/45 uppercase tracking-wider block mb-3">
                  Select Weight / Size
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {availableSizes.map((size) => {
                    const variation = variations.find(v => v.color === selectedColor && v.size === size);
                    const isOutOfStock = variation ? variation.stock === 0 : true;

                    return (
                      <button
                        key={size}
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                        className={`px-5 py-2.5 rounded-xl flex items-center justify-center text-xs font-black transition-all border-2 cursor-pointer ${
                          selectedSize === size
                            ? "bg-[#8c6239] text-[#FAF6ED] border-[#8c6239] scale-105 shadow-md"
                            : isOutOfStock
                              ? "bg-brand/5 text-black/20 border-transparent cursor-not-allowed line-through opacity-50"
                              : "bg-white text-black border-[#8c6239]/20 hover:bg-[#8c6239]/5 shadow-sm"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Quantity selector */}
            <div className="mb-8">
              <span className="text-xs font-black text-black/45 uppercase tracking-wider block mb-3">
                Select Quantity
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#8c6239]/20 rounded-xl bg-white p-1">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="w-9 h-9 flex items-center justify-center text-base font-bold text-black/70 hover:bg-[#8c6239]/5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed select-none focus:outline-none cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= currentStock}
                    className="w-9 h-9 flex items-center justify-center text-base font-bold text-black/70 hover:bg-[#8c6239]/5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed select-none focus:outline-none cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {currentStock > 0 && (
                  <span className="text-[10px] text-black/40 font-bold uppercase tracking-wider">
                    {currentStock} Available
                  </span>
                )}
              </div>
            </div>

            {/* 6. Buttons: Add to Cart and Wishlist */}
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full mt-auto">
              <button
                disabled={!!(selectedColor && selectedSize && currentStock === 0)}
                onClick={handleAddToCart}
                className={`w-full sm:flex-1 flex items-center justify-center space-x-3 font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer shadow-md ${
                  selectedColor && selectedSize && currentStock === 0
                    ? "bg-brand/10 text-black/30 cursor-not-allowed"
                    : "bg-[#8c6239] text-[#FAF6ED] hover:bg-[#734f2d] active:scale-[0.98] border border-transparent shadow-[#8c6239]/10"
                }`}
              >
                {added ? (
                  <Check size={18} className="text-white animate-in zoom-in duration-300" />
                ) : (
                  <ShoppingBag size={18} className="transition-all text-white" />
                )}
                <span>
                  {selectedColor && selectedSize && currentStock === 0 ? "Out of Stock" : added ? "Added!" : "Add to cart"}
                </span>
              </button>
              <button
                type="button"
                onClick={handleWishlistClick}
                className="w-full sm:flex-1 flex items-center justify-center space-x-3 font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer shadow-md bg-white text-black border border-[#8c6239]/30 hover:bg-[#8c6239]/5 active:scale-[0.98]"
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500 animate-pulse" : "text-black/70"}`} />
                <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
              </button>
            </div>

            {/* Accordions */}
            <div className="mt-8 space-y-4 border-t border-black/10 pt-6">
              {/* Accordion 1: Product Description */}
              <div className="border-b border-[#8c6239]/10 pb-4">
                <button 
                  type="button"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="w-full flex items-center justify-between text-left text-sm font-black uppercase tracking-wider text-black py-2 cursor-pointer focus:outline-none select-none"
                >
                  <span className="flex items-center gap-2">
                    📄 Product Description
                  </span>
                  <ChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${isDescriptionExpanded ? "rotate-180" : "rotate-0"}`} />
                </button>
                
                {isDescriptionExpanded && product.description && (
                  <div className="pt-4 pb-2 text-sm text-black/85 leading-relaxed transition-all duration-300 animate-in fade-in duration-300">
                    <div className="whitespace-pre-wrap font-medium text-black/85">
                      {product.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Delivery information */}
              <div className="border-b border-[#8c6239]/10 pb-4">
                <button 
                  type="button"
                  onClick={() => setIsDeliveryExpanded(!isDeliveryExpanded)}
                  className="w-full flex items-center justify-between text-left text-sm font-black uppercase tracking-wider text-black py-2 cursor-pointer focus:outline-none select-none animate-in fade-in duration-300"
                >
                  <span className="flex items-center gap-2">
                    🚚 When will I get my order?
                  </span>
                  <ChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${isDeliveryExpanded ? "rotate-180" : "rotate-0"}`} />
                </button>
                
                {isDeliveryExpanded && (
                  <div className="pt-4 pb-2 text-sm text-black/85 leading-relaxed transition-all duration-300 animate-in fade-in duration-300">
                    <p className="font-medium text-black/85">
                      We will work quickly to ship your order as soon as possible. Once your order has shipped, you will receive a tracking ID of your order via whatsapp and email . Delivery times vary depending on your location.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#8c6239] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 font-bold text-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
            <Check size={18} />
            <span>{toast}</span>
          </div>
        )}

        {/* You May Also Like Section */}
        {similarProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#8c6239]/10">
            <h2 className="text-2xl md:text-3xl font-serif font-black text-[#3b2314] text-center mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((p) => {
                const parsedImages = getProductImageUrls(p.images, p.colors);
                const firstImage = getFirstProductImageUrl(p.images, p.colors);
                return (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: p.id.toString(),
                      name: p.name,
                      description: p.description || "",
                      price: p.salePrice || p.basePrice,
                      basePrice: p.basePrice,
                      salePrice: p.salePrice,
                      imageUrl: firstImage,
                      images: parsedImages,
                      categorySlug: p.category || "all",
                      isCustomizable: p.isCustomizable === true || p.isCustomizable === 1,
                      style: p.style,
                      neckStyle: p.neckStyle,
                      keyWords: p.keyWords,
                      avgRating: p.avgRating,
                      numReviews: p.numReviews,
                    }}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Bar for Mobile/Tablet */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-black/10 py-3.5 px-6 shadow-[0_-10px_25px_rgba(0,0,0,0.06)] flex items-center justify-between gap-4 md:hidden">
        <div className="flex-1">
          <select 
            value={selectedSize || ""} 
            onChange={e => setSelectedSize(e.target.value)}
            className="w-full bg-brand/5 border border-black/10 rounded-xl px-3 py-3 text-xs font-black text-black uppercase tracking-wider outline-none cursor-pointer"
          >
            {availableSizes.map(size => {
              const varItem = variations.find(v => v.color === selectedColor && v.size === size);
              const price = varItem?.salePrice || displayPrice;
              return (
                <option key={size} value={size}>
                  {size} - ₹{price.toLocaleString()}
                </option>
              );
            })}
          </select>
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="flex-1 bg-[#8c6239] hover:bg-[#734f2d] text-[#FAF6ED] text-xs font-black uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all shadow-md active:scale-95 text-center cursor-pointer"
        >
          {added ? "Added!" : "Add to cart"}
        </button>
      </div>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand/60 backdrop-blur-md" onClick={() => setIsSizeGuideOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-8 border-b border-brand/5 flex items-center justify-between bg-brand/5">
              <h2 className="text-2xl font-serif font-bold text-black">Size Guide</h2>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-2 hover:bg-brand/10 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="flex justify-center mb-8 bg-brand/5 p-2 rounded-2xl">
                <button
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${product.gender === 'men' ? 'bg-brand text-[#064e3b] shadow-lg' : 'text-black/40 hover:text-black'}`}
                  onClick={() => setProduct(p => p ? { ...p, gender: 'men' } : null)}
                >
                  Men's Guide
                </button>
                <button
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${product.gender === 'women' ? 'bg-brand text-[#064e3b] shadow-lg' : 'text-black/40 hover:text-black'}`}
                  onClick={() => setProduct(p => p ? { ...p, gender: 'women' } : null)}
                >
                  Women's Guide
                </button>
              </div>

              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-brand/5 bg-white">
                <img
                  src={product.gender === 'men' ? "/images/guides/male.jpg" : "/images/guides/female.jpg"}
                  alt={`${product.gender} Size Guide`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x800/f5f0e8/1b3022?text=Size+Guide+Image+Not+Found";
                  }}
                />
              </div>

              <div className="mt-8 space-y-4">
                <h4 className="text-xs font-black text-black uppercase tracking-widest">How to Measure?</h4>
                <p className="text-xs text-black/60 leading-relaxed">
                  For the most accurate fit, we recommend having someone else measure you. Hold the tape measure snug, but not tight, against your body.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-brand/5 rounded-2xl">
                    <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Bust / Chest</p>
                    <p className="text-[10px] text-black/40">Measure around the fullest part of your chest.</p>
                  </div>
                  <div className="p-4 bg-brand/5 rounded-2xl">
                    <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Waist</p>
                    <p className="text-[10px] text-black/40">Measure around your natural waistline.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-brand/5 border-t border-brand/5 flex justify-center">
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="bg-brand text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-hover transition-all shadow-xl"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
