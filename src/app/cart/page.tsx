"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, CreditCard, ShieldCheck, CheckCircle2, Scissors, Sparkles, MapPin, AlertTriangle, ChevronDown, X, Ticket } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function CartContent() {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart, setQuantity, updateItemVariant } = useCartStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [productDetailsMap, setProductDetailsMap] = useState<Record<number, { variations: any[] }>>({});
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"agreement" | "address" | "details" | "processing">("agreement");
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: ""
  });
  const [orderId, setOrderId] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL params for return callback payment errors
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "payment_failed") {
      setCheckoutError("Payment was cancelled or failed on PhonePe. Please try again.");
    } else if (err === "status_verification_failed") {
      setCheckoutError("Could not verify payment status with PhonePe. If money was debited, please check your orders page.");
    } else if (err === "missing_order_id" || err === "order_not_found") {
      setCheckoutError("Order reference error. Please check your cart or order history.");
    } else if (err === "internal_server_error") {
      setCheckoutError("An error occurred during payment processing. Please try again.");
    } else if (err) {
      setCheckoutError(`Checkout notice: ${err}`);
    }
  }, [searchParams]);

  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showPromoSection, setShowPromoSection] = useState(false);

  // Fetch Available Coupons based on cart items
  useEffect(() => {
    async function fetchAvailableCoupons() {
      if (items.length === 0) {
        setAvailableCoupons([]);
        return;
      }
      try {
        const res = await fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              size: item.size,
              color: item.color
            }))
          })
        });
        const data = await res.json();
        if (data.success) {
          setAvailableCoupons(data.data);
        }
      } catch (err) {
        console.error("Error fetching applicable coupons:", err);
      }
    }
    fetchAvailableCoupons();
  }, [items]);

  // Apply Coupon Handler
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: couponInput.trim().toUpperCase(),
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color
          }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.discountAmount);
        setCouponSuccess(`Coupon "${data.coupon.code}" applied! Saved ₹${data.discountAmount.toLocaleString()}`);
        setCouponInput("");
      } else {
        setCouponError(data.error || "Failed to validate coupon.");
      }
    } catch (err) {
      setCouponError("Unable to apply coupon. Please try again.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Remove Coupon Handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponSuccess("");
    setCouponError("");
    setCouponInput("");
  };

  // Revalidate coupon dynamically on cart item updates
  useEffect(() => {
    if (!appliedCoupon) return;

    const revalidateCoupon = async () => {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            couponCode: appliedCoupon.code,
            items: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              size: item.size,
              color: item.color
            }))
          })
        });
        const data = await res.json();
        if (data.success) {
          setDiscountAmount(data.discountAmount);
          setCouponSuccess(`Coupon "${data.coupon.code}" applied! Saved ₹${data.discountAmount.toLocaleString()}`);
        } else {
          setAppliedCoupon(null);
          setDiscountAmount(0);
          setCouponSuccess("");
          setCouponError(`Coupon removed: ${data.error}`);
        }
      } catch (err) {
        console.error("Error revalidating coupon:", err);
      }
    };

    revalidateCoupon();
  }, [items, appliedCoupon?.code]);

  // Size/Qty Popups
  const [activeSizeItemId, setActiveSizeItemId] = useState<string | null>(null);
  const [activeQtyItemId, setActiveQtyItemId] = useState<string | null>(null);
  const [tempSize, setTempSize] = useState<string>("");
  const [tempQty, setTempQty] = useState<number>(1);

  const openSizeModal = (item: any) => {
    setActiveSizeItemId(item.id);
    setTempSize(item.size);
  };

  const openQtyModal = (item: any) => {
    setActiveQtyItemId(item.id);
    setTempQty(item.quantity);
  };

  // Handle hydration to avoid mismatch with SSR
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const serializedProductIds = JSON.stringify(Array.from(new Set(items.map(item => item.productId))).sort());

  useEffect(() => {
    async function fetchAllProductDetails() {
      if (items.length === 0) {
        setLoadingDetails(false);
        return;
      }

      const uniqueProductIds = Array.from(new Set(items.map(item => item.productId)));
      const details: Record<number, any> = {};

      try {
        await Promise.all(
          uniqueProductIds.map(async (productId) => {
            const res = await fetch(`/api/products/${productId}`);
            if (res.ok) {
              const data = await res.json();
              details[productId] = data;
            }
          })
        );
        setProductDetailsMap(details);
      } catch (err) {
        console.error("Error fetching product variations in cart:", err);
      } finally {
        setLoadingDetails(false);
      }
    }

    fetchAllProductDetails();
  }, [serializedProductIds]);

  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-brand/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="text-black/20" size={40} />
        </div>
        <h1 className="text-3xl font-playfair font-bold text-black mb-4">Your cart is empty</h1>
        <p className="text-black/60 mb-10 text-center max-w-md leading-relaxed">
          Looks like you haven't added any premium seafood items yet. Explore our latest collections and shop for authentic delicacies.
        </p>
        <Link
          href="/"
          className="bg-brand text-white px-10 py-4 rounded-2xl font-bold tracking-widest uppercase text-sm hover:bg-brand-hover transition-all shadow-xl active:scale-95"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = 0;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleCheckout = async () => {
    setIsCheckoutModalOpen(true);
    setPaymentStep("agreement");

    // Attempt to fetch saved addresses
    setFetchingAddress(true);
    try {
      const res = await fetch("/api/profile/address");
      const data = await res.json();
      if (data.success && data.addresses && data.addresses.length > 0) {
        setSavedAddresses(data.addresses);
        setSelectedAddressIndex(0);
        setShowNewAddressForm(false);
      } else {
        setSavedAddresses([]);
        setShowNewAddressForm(true);
      }
    } catch (e) {
      console.error("Failed to load saved addresses", e);
      setShowNewAddressForm(true);
    } finally {
      setFetchingAddress(false);
    }
  };

  const processPhonePePayment = async () => {
    setIsProcessingPayment(true);
    setPaymentStep("processing");

    try {
      const shippingAddr = showNewAddressForm
        ? `Name: ${address.fullName}, Street: ${address.street}, City: ${address.city}, State: ${address.state}, Pincode: ${address.pincode}, Contact: ${address.phone}`
        : savedAddresses[selectedAddressIndex || 0];

      const res = await fetch("/api/checkout/phonepe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: shippingAddr,
          couponCode: appliedCoupon?.code || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Payment initialization failed: " + data.error);
        setPaymentStep("details");
        setIsProcessingPayment(false);
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error("Error starting checkout:", error);
      alert("Something went wrong initializing PhonePe payment.");
      setPaymentStep("details");
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
      {checkoutError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-700 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Payment Status Notice</h4>
              <p className="text-xs font-medium mt-0.5">{checkoutError}</p>
            </div>
          </div>
          <button
            onClick={() => setCheckoutError(null)}
            className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-500"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex items-center space-x-4 mb-10">
        <h1 className="text-4xl font-playfair font-bold text-black">Shopping Cart</h1>
        <span className="bg-brand/5 text-black/60 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          {getTotalItems()} Items
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-6 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-4 no-scrollbar">
          {items.map((item) => {
            const isBespoke = item.customizations?.type === "Bespoke";
            const productVariationsList = productDetailsMap[item.productId]?.variations || [];
            const itemColor = (item.color || "").toLowerCase();
            const colorMatchedVariations = productVariationsList.filter(
              (v: any) => !v.color || v.color.toLowerCase() === itemColor
            );
            const activeVariations = colorMatchedVariations.length > 0 ? colorMatchedVariations : productVariationsList;
            const availableSizes = activeVariations.length > 0
              ? Array.from(new Set(activeVariations.map((v: any) => v.size)))
              : [item.size];
            const currentVariation = activeVariations.find(
              (v: any) => v.size.toLowerCase() === item.size.toLowerCase()
            );
            const maxStock = currentVariation ? currentVariation.stock : 10;
            const stockLimit = Math.max(item.quantity, maxStock, 1);

            return (
              <div
                key={item.id}
                className={`rounded-3xl p-6 shadow-sm border flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 hover:shadow-md transition-all duration-300 ${isBespoke
                  ? 'bg-[#F9F6EE] border-[#C5A059]/30 ring-1 ring-[#C5A059]/10'
                  : 'bg-white border-brand/5'
                  }`}
              >
                {/* Product Image */}
                <div className="w-32 h-32 bg-brand/5 rounded-2xl overflow-hidden flex-shrink-0 border border-brand/5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Item Info */}
                <div className="flex-1 flex flex-col h-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-black leading-tight uppercase">{item.name.toUpperCase()}</h3>
                        {isBespoke && (
                          <div className="flex items-center space-x-1 px-2 py-0.5 bg-[#C5A059] text-white rounded-full">
                            <Scissors size={10} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Bespoke</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 ${isBespoke
                          ? 'text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20'
                          : 'text-black/40 bg-brand/5'
                          }`}>
                          {isBespoke && <Sparkles size={10} />}
                          Customized: {item.customizations?.type || "Standard"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 text-xl font-bold text-black">
                      ₹{item.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex flex-col sm:flex-row items-center justify-between border-t border-brand/5">
                    {/* Size & Quantity Buttons */}
                    <div className="flex flex-wrap gap-3 items-center">
                      {!isBespoke && availableSizes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => openSizeModal(item)}
                          className="bg-brand/5 hover:bg-brand/10 text-black text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-colors outline-none border border-brand/10 flex items-center space-x-1"
                        >
                          <span>Size: {item.size}</span>
                          <ChevronDown size={14} className="text-black/50" />
                        </button>
                      )}

                      {isBespoke && (
                        <span className="text-xs font-bold text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 px-4 py-2.5 rounded-xl">
                          Size: Custom
                        </span>
                      )}

                      <div className="flex items-center border border-brand/20 bg-brand/5 rounded-xl overflow-hidden h-9">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              setQuantity(item.id, item.quantity - 1);
                            }
                          }}
                          className="px-3 h-full hover:bg-brand/10 transition-colors flex items-center justify-center text-black/50 hover:text-black cursor-pointer"
                        >
                          <Minus size={12} className="stroke-[3]" />
                        </button>
                        <span className="px-3 text-xs font-black text-black select-none text-center min-w-[2.5rem]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setQuantity(item.id, item.quantity + 1);
                          }}
                          className="px-3 h-full hover:bg-brand/10 transition-colors flex items-center justify-center text-black/50 hover:text-black cursor-pointer"
                        >
                          <Plus size={12} className="stroke-[3]" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-4 sm:mt-0 flex items-center space-x-2 text-red-400 hover:text-red-500 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                        <Trash2 size={16} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Price Summary */}
        <div className="lg:col-span-4">
          <div className="bg-[#8c6239] rounded-3xl p-6 shadow-2xl text-white sticky top-28">
            <h2 className="text-lg font-bold mb-6 tracking-tight uppercase border-b border-white/5 pb-4">Price Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-white/50">
                <span className="text-[10px] font-bold tracking-widest uppercase">Subtotal</span>
                <span className="text-sm font-bold tracking-widest">₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-400">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Discount</span>
                  <span className="text-sm font-bold tracking-widest">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-white/50 pb-3 border-b border-white/10">
                <span className="text-[10px] font-bold tracking-widest uppercase">Shipping</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFFDF6]">Free</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-black tracking-widest uppercase">Total Amount</span>
                <span className="text-lg font-black text-[#FFFDF6] tracking-widest">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Toggle Coupon Section Link/Button */}
            {!appliedCoupon && !showPromoSection && (
              <button
                onClick={() => setShowPromoSection(true)}
                className="w-full mt-4 py-3 border border-dashed border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#C5A059] hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ticket size={14} className="text-[#C5A059]" /> Apply Coupons / Offers
              </button>
            )}

            {/* Coupon Code Panel */}
            {(showPromoSection || appliedCoupon) && (
              <div className="border-t border-b border-white/10 py-4 my-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white/50 flex items-center gap-1.5">
                    <Ticket size={12} className="text-[#C5A059]" /> Promo Code
                  </span>
                  <div className="flex gap-3">
                    {appliedCoupon && (
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 flex items-center gap-0.5"
                      >
                        Remove
                      </button>
                    )}
                    {!appliedCoupon && (
                      <button
                        onClick={() => setShowPromoSection(false)}
                        className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-0.5"
                      >
                        Hide
                      </button>
                    )}
                  </div>
                </div>

                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError("");
                        setCouponSuccess("");
                      }}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#C5A059] flex-1 placeholder:text-white/20 uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponInput.trim()}
                      className="bg-[#C5A059] hover:bg-[#C5A059]/90 disabled:opacity-50 text-[#8c6239] font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center justify-center min-w-[70px]"
                    >
                      {isValidatingCoupon ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white/5 border border-white/15 px-3 py-2.5 rounded-xl">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-[#FFFDF6] font-mono tracking-wider">{appliedCoupon.code}</span>
                      <span className="text-[9px] text-[#C5A059] font-medium max-w-[180px] truncate">{appliedCoupon.description}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                      <CheckCircle2 size={14} className="text-green-400" /> Applied
                    </div>
                  </div>
                )}

                {couponError && (
                  <p className="text-red-400 text-[10px] font-bold flex items-center gap-1 animate-in fade-in duration-200">
                    <AlertTriangle size={10} /> {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <p className="text-green-400 text-[10px] font-bold flex items-center gap-1 animate-in fade-in duration-200">
                    <CheckCircle2 size={10} /> {couponSuccess}
                  </p>
                )}

                {/* List of Available Offers */}
                {!appliedCoupon && availableCoupons.length > 0 && (() => {
                  const sortedCoupons = [...availableCoupons].sort((a, b) => {
                    if (a.applicable && !b.applicable) return -1;
                    if (!a.applicable && b.applicable) return 1;
                    return 0;
                  });

                  return (
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Available Offers:</p>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 dark-scrollbar">
                        {sortedCoupons.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              if (!c.applicable) return;
                              setCouponInput(c.code);
                              // Auto-apply immediately
                              setIsValidatingCoupon(true);
                              setCouponError("");
                              setCouponSuccess("");
                              fetch("/api/coupons/validate", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  couponCode: c.code,
                                  items: items.map(item => ({
                                    productId: item.productId,
                                    quantity: item.quantity,
                                    price: item.price,
                                    size: item.size,
                                    color: item.color
                                  }))
                                })
                              })
                                .then(res => res.json())
                                .then(data => {
                                  if (data.success) {
                                    setAppliedCoupon(data.coupon);
                                    setDiscountAmount(data.discountAmount);
                                    setCouponSuccess(`Coupon "${data.coupon.code}" applied! Saved ₹${data.discountAmount.toLocaleString()}`);
                                    setCouponInput("");
                                  } else {
                                    setCouponError(data.error || "Failed to validate coupon.");
                                  }
                                })
                                .catch(() => setCouponError("Unable to apply coupon."))
                                .finally(() => setIsValidatingCoupon(false));
                            }}
                            className={`p-2.5 rounded-xl border transition-all text-left group flex items-center justify-between ${c.applicable
                              ? "bg-white/5 border-white/5 hover:border-[#C5A059]/40 hover:bg-white/10 cursor-pointer"
                              : "bg-white/[0.02] border-white/5 opacity-55 cursor-not-allowed"
                              }`}
                          >
                            <div className="flex-grow min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-[#FFFDF6] font-mono tracking-wider">{c.code}</span>
                                {c.applicable ? (
                                  <span className="text-[8px] font-black uppercase text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                                    Save ₹{c.discountAmount.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-black uppercase text-white/30 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                    Locked
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-white/50 mt-1 leading-tight">{c.description}</p>
                              {!c.applicable && c.error && (
                                <p className="text-[8.5px] text-amber-400/80 font-bold mt-1 flex items-center gap-1">
                                  <AlertTriangle size={8} /> {c.error}
                                </p>
                              )}
                            </div>
                            {c.applicable && (
                              <span className="text-[8px] font-black uppercase text-[#C5A059] group-hover:underline flex-shrink-0">
                                Apply
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="w-full bg-[#FFFDF6] text-[#8c6239] py-4 rounded-2xl font-bold tracking-[0.2em] uppercase text-[10px] hover:bg-[#FFFDF6]/90 transition-all shadow-xl flex items-center justify-center group active:scale-[0.98]"
            >
              Proceed to Checkout
              <ArrowRight size={14} className="ml-3 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-6 flex items-center justify-center space-x-3 opacity-30">
              <div className="text-[8px] uppercase tracking-[0.3em] font-black">Prepaid Only</div>
              <div className="h-1 w-1 rounded-full bg-white"></div>
              <div className="text-[8px] uppercase tracking-[0.3em] font-black">Safe Checkout</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dummy Payment Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {paymentStep === "agreement" && (
              <div className="animate-in slide-in-from-right-5 duration-300 py-2">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-500 mx-auto">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-playfair font-bold text-black text-center mb-4">Store Policy Agreement</h3>

                <div className="space-y-4 bg-brand/5 p-6 rounded-3xl border border-brand/5 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 flex-shrink-0" />
                    <p className="text-xs font-bold text-black/70 leading-relaxed">
                      Orders cannot be cancelled once the <span className="text-black font-black">packaging or dispatch process begins</span>.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 flex-shrink-0" />
                    <p className="text-xs font-bold text-black/70 leading-relaxed">
                      Amounts paid are <span className="text-black font-black">non-refundable for all items</span>.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 flex-shrink-0" />
                    <p className="text-xs font-bold text-black/70 leading-relaxed">
                      There is <span className="text-black font-black">no exchange or return option</span> for any purchase.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => setPaymentStep("address")}
                    className="w-full py-4 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-hover shadow-xl transition-all active:scale-95"
                  >
                    I Agree & Proceed
                  </button>
                  <button
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-black transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}

            {paymentStep === "address" && (
              <div className="animate-in slide-in-from-right-5 duration-300">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-3 bg-brand/5 rounded-2xl text-black">
                    {fetchingAddress ? <Loader2 size={24} className="animate-spin" /> : <MapPin size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black">Delivery Address</h3>
                    <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">
                      {fetchingAddress ? "Looking for your saved address..." : "Where should we send your order?"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {!showNewAddressForm && savedAddresses.length > 0 ? (
                    <div className="space-y-4">
                      <div className="max-h-60 overflow-y-auto no-scrollbar space-y-3 pr-2">
                        {savedAddresses.map((addr, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedAddressIndex(idx)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressIndex === idx
                              ? 'border-[#C5A059] bg-[#C5A059]/5'
                              : 'border-brand/10 hover:border-brand/30'
                              }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-black whitespace-pre-wrap break-words min-w-0">{addr}</p>
                              {selectedAddressIndex === idx && <CheckCircle2 size={18} className="text-[#C5A059] flex-shrink-0 mt-1" />}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowNewAddressForm(true)}
                        className="w-full py-4 border-2 border-dashed border-brand/20 rounded-xl text-xs font-bold text-black hover:bg-brand/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Add New Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {savedAddresses.length > 0 && (
                        <button
                          onClick={() => setShowNewAddressForm(false)}
                          className="text-xs font-bold text-black hover:underline self-start mb-2 flex items-center gap-2"
                        >
                          &larr; Back to saved addresses
                        </button>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={address.fullName}
                          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                          className="w-full bg-brand/5 border border-brand/5 rounded-xl py-3 px-4 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Street / Apartment / Landmark</label>
                        <input
                          type="text"
                          required
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          className="w-full bg-brand/5 border border-brand/5 rounded-xl py-3 px-4 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
                          placeholder="123 Boutique Lane, Suite 4B"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">City</label>
                          <input
                            type="text"
                            required
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            className="w-full bg-brand/5 border border-brand/5 rounded-xl py-3 px-4 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
                            placeholder="Mumbai"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">State</label>
                          <input
                            type="text"
                            required
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            className="w-full bg-brand/5 border border-brand/5 rounded-xl py-3 px-4 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
                            placeholder="Maharashtra"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Pincode</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={address.pincode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setAddress({ ...address, pincode: val });
                            }}
                            className="w-full bg-brand/5 border border-brand/5 rounded-xl py-3 px-4 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
                            placeholder="6 Digits"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Contact Phone</label>
                          <input
                            type="text"
                            required
                            maxLength={10}
                            value={address.phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setAddress({ ...address, phone: val });
                            }}
                            className="w-full bg-brand/5 border border-brand/5 rounded-xl py-3 px-4 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
                            placeholder="10 Digits"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setIsCheckoutModalOpen(false)}
                      className="flex-1 py-4 border-2 border-brand/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black/40 hover:bg-brand/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={
                        showNewAddressForm
                          ? (!address.fullName || !address.street || !address.city || address.pincode.length !== 6 || address.phone.length !== 10)
                          : selectedAddressIndex === null
                      }
                      onClick={() => setPaymentStep("details")}
                      className="flex-[2] py-4 bg-brand text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-hover shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === "details" && (
              <div className="animate-in slide-in-from-right-5 duration-300">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-brand/5 rounded-2xl text-black">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black">Secure Payment Gateway</h3>
                    <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Select Payment Gateway</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* PhonePe PG Card Selection */}
                  <div className="border border-brand/20 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer ring-2 ring-brand/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#5f259f]/10 text-[#5f259f] rounded-xl flex items-center justify-center font-bold text-lg">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-black">PhonePe Gateway</span>
                          <span className="text-[9px] bg-green-100 text-green-700 font-extrabold px-2 py-0.5 rounded-full uppercase">Primary</span>
                        </div>
                        <p className="text-[10px] text-black/50 font-medium mt-0.5">UPI, Credit/Debit Cards, NetBanking & Wallets</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-[#5f259f] flex items-center justify-center bg-[#5f259f]">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>

                  <div className="bg-brand/5 p-6 rounded-3xl border border-brand/5 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-black/60">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-xs font-bold text-green-600">
                        <span>Discount Applied ({appliedCoupon?.code})</span>
                        <span>- ₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs font-bold text-black/60">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>

                    <div className="border-t border-brand/10 pt-4 flex justify-between items-center">
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">Grand Total</span>
                      <span className="text-xl font-black text-black tracking-widest">₹{total.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                      <ShieldCheck size={14} />
                      <span>256-Bit Bank Level Encryption</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      disabled={isProcessingPayment}
                      onClick={() => setIsCheckoutModalOpen(false)}
                      className="flex-1 py-4 border-2 border-brand/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black/40 hover:bg-brand/5 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isProcessingPayment}
                      onClick={processPhonePePayment}
                      className="flex-[2] py-4 bg-[#5f259f] hover:bg-[#4a1c7d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-white" />
                          <span>Redirecting...</span>
                        </>
                      ) : (
                        <span>Pay via PhonePe</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === "processing" && (
              <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                <div className="relative mb-10">
                  <div className="w-24 h-24 border-4 border-brand-accent/20 rounded-full"></div>
                  <div className="absolute inset-0 w-24 h-24 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck size={32} className="text-black-accent animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-playfair font-bold text-black mb-2">Processing Payment</h3>
                <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Verifying with your bank...</p>
              </div>
            )}


          </div>
        </div>
      )}

      {/* Size Edit Modal */}
      {activeSizeItemId !== null && (() => {
        const item = items.find(i => i.id === activeSizeItemId);
        if (!item) return null;

        const productVariationsList = productDetailsMap[item.productId]?.variations || [];
        const itemColor = (item.color || "").toLowerCase();
        const colorMatchedVariations = productVariationsList.filter(
          (v: any) => !v.color || v.color.toLowerCase() === itemColor
        );
        const activeVariations = colorMatchedVariations.length > 0 ? colorMatchedVariations : productVariationsList;
        const availableSizes = activeVariations.length > 0
          ? Array.from(new Set(activeVariations.map((v: any) => v.size)))
          : [item.size];

        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setActiveSizeItemId(null)} />
            <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-brand/5 animate-in zoom-in-95 duration-200 flex flex-col">
              {/* Close Button */}
              <button
                onClick={() => setActiveSizeItemId(null)}
                className="absolute top-4 right-4 p-1.5 text-black/40 hover:text-black hover:bg-brand/5 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              {/* Product Info Block */}
              <div className="flex space-x-4 mb-6">
                <div className="w-20 h-20 bg-brand/5 rounded-xl overflow-hidden flex-shrink-0 border border-brand/5">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-black mt-0.5 leading-snug line-clamp-2 uppercase">{item.name}</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm font-bold text-black">₹{item.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-brand/5 pt-4 mb-6">
                <h4 className="text-xs font-black text-black uppercase tracking-wider mb-4">Select Size</h4>
                <div className="flex flex-wrap gap-2.5">
                  {availableSizes.map((sz) => {
                    const isSelected = tempSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setTempSize(sz)}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${isSelected
                          ? "border-brand text-black bg-brand/5 shadow-sm scale-105"
                          : "border-brand/10 text-black/60 hover:border-brand/30 hover:text-black bg-white"
                          }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Done Button */}
              <button
                type="button"
                onClick={() => {
                  const variation = activeVariations.find((v: any) => v.size === tempSize);
                  const price = variation ? (variation.salePrice || variation.mrp || item.price) : item.price;
                  updateItemVariant(item.id, tempSize, price);
                  setActiveSizeItemId(null);
                }}
                className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-brand/10"
              >
                DONE
              </button>
            </div>
          </div>
        );
      })()}

      {/* Quantity Edit Modal */}
      {activeQtyItemId !== null && (() => {
        const item = items.find(i => i.id === activeQtyItemId);
        if (!item) return null;

        const productVariationsList = productDetailsMap[item.productId]?.variations || [];
        const itemColor = (item.color || "").toLowerCase();
        const colorMatchedVariations = productVariationsList.filter(
          (v: any) => !v.color || v.color.toLowerCase() === itemColor
        );
        const activeVariations = colorMatchedVariations.length > 0 ? colorMatchedVariations : productVariationsList;
        const currentVariation = activeVariations.find(
          (v: any) => v.size.toLowerCase() === item.size.toLowerCase()
        );
        const maxStock = currentVariation ? currentVariation.stock : 10;
        const stockLimit = Math.max(item.quantity, maxStock, 1);
        const displayLimit = Math.max(10, stockLimit); // Always show at least 10, or more if stock is higher

        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setActiveQtyItemId(null)} />
            <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-brand/5 animate-in zoom-in-95 duration-200 flex flex-col">
              {/* Close Button */}
              <button
                onClick={() => setActiveQtyItemId(null)}
                className="absolute top-6 right-6 p-1 text-black/40 hover:text-black hover:bg-brand/5 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <h3 className="text-base font-bold text-black mb-6">Select Quantity</h3>

              <div className="grid grid-cols-5 gap-3.5 mb-8">
                {Array.from({ length: displayLimit }, (_, i) => i + 1).map((qty) => {
                  const isSelected = tempQty === qty;
                  const isOutOfStock = qty > stockLimit;

                  return (
                    <button
                      key={qty}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setTempQty(qty)}
                      className={`w-11 h-11 rounded-full text-xs font-bold border flex items-center justify-center transition-all ${isSelected
                        ? "border-brand text-black bg-brand/5 shadow-sm scale-110"
                        : isOutOfStock
                          ? "border-brand/5 text-black/10 cursor-not-allowed bg-brand/[0.02]"
                          : "border-brand/10 text-black/60 hover:border-brand/30 hover:text-black bg-white"
                        }`}
                    >
                      {qty}
                    </button>
                  );
                })}
              </div>

              {/* Done Button */}
              <button
                type="button"
                onClick={() => {
                  setQuantity(item.id, tempQty);
                  setActiveQtyItemId(null);
                }}
                className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-brand/10"
              >
                DONE
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}
