"use client";

import React, { useEffect, useState, Suspense } from "react";
import { ShoppingBag, Loader2, Package, CheckCircle2, Clock, Ruler, XCircle, AlertTriangle, Image as ImageIcon, MapPin, Check, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productCategory: string | null;
  variationSku: string | null;
  quantity: number;
  price: number;
  size: string;
  color: string;
  customizations: {
    type: string;
    measurements: Record<string, string>;
  } | null;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  shippingAddress: string | null;
  createdAt: string;
  couponCode: string | null;
  discountAmount: number | null;
  couponTargetType: string | null;
  couponTargetValue: string | null;
  items: OrderItem[];
  courierServiceName?: string | null;
  courierId?: string | null;
  trackingNumber?: string | null;
  trackingLink?: string | null;
  estimatedDeliveryDate?: string | null;
  shippingNotes?: string | null;
  cancellationReason?: string | null;
}

const isProductCouponMatch = (item: OrderItem, couponCode: string | null, targetType: string | null, targetValue: string | null) => {
  if (!couponCode || !targetType || !targetValue) return false;
  if (targetType === "all" || targetType === "first_order") return false;
  
  const targetCriteria = targetValue
    .toLowerCase()
    .split(",")
    .map(c => c.trim())
    .filter(Boolean);
    
  const prodIdStr = item.productId.toString();
  const prodCategory = (item.productCategory || "").toLowerCase().trim();
  const varSku = (item.variationSku || "").toLowerCase().trim();
  
  return targetCriteria.some(criterion => 
    criterion === prodIdStr || 
    prodCategory === criterion || 
    prodCategory.includes(criterion) || 
    varSku === criterion
  );
};

const parseAddress = (addrString: string | null) => {
  if (!addrString) return null;

  const getSubstringBetween = (str: string, startKey: string, endKey: string | null) => {
    const startIndex = str.indexOf(startKey);
    if (startIndex === -1) return "";
    const startValIndex = startIndex + startKey.length;
    if (!endKey) {
      return str.slice(startValIndex).trim();
    }
    const endIndex = str.indexOf(endKey);
    if (endIndex === -1 || endIndex < startValIndex) {
      return str.slice(startValIndex).trim();
    }
    
    let res = str.slice(startValIndex, endIndex).trim();
    if (res.endsWith(",")) {
      res = res.slice(0, -1).trim();
    }
    return res;
  };

  const hasKeys = ["Name:", "Street:", "City:", "State:", "Pincode:", "Contact:"].every(k => addrString.includes(k));
  
  if (hasKeys) {
    return {
      name: getSubstringBetween(addrString, "Name:", "Street:"),
      street: getSubstringBetween(addrString, "Street:", "City:"),
      city: getSubstringBetween(addrString, "City:", "State:"),
      state: getSubstringBetween(addrString, "State:", "Pincode:"),
      pincode: getSubstringBetween(addrString, "Pincode:", "Contact:"),
      contact: getSubstringBetween(addrString, "Contact:", null),
    };
  }
  
  return null;
};

const MILESTONES = [
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered"
];

function MyOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [confirmingCancelId, setConfirmingCancelId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const orderId = searchParams.get("orderId");
    if (paymentStatus === "success") {
      useCartStore.getState().clearCart();
      setSuccessBanner(
        orderId
          ? `Payment successful! Order #${orderId} has been placed successfully via PhonePe.`
          : "Payment successful! Your order has been placed successfully via PhonePe."
      );
    }
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/profile/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCancelOrder = async (orderId: number) => {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/profile/orders/${orderId}/cancel`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Order cancelled successfully");
        fetchOrders();
      } else {
        showToast(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      showToast("Something went wrong");
    } finally {
      setIsCancelling(false);
      setConfirmingCancelId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-4" />
        <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
      {successBanner && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-600" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Order Confirmed</h4>
              <p className="text-xs font-medium mt-0.5">{successBanner}</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-black mb-2">My Orders</h1>
          <p className="text-black/40 text-xs font-bold uppercase tracking-widest">Track your orders</p>
        </div>
        <Link href="/" className="p-3 rounded-full bg-brand/5 text-black hover:bg-brand/10 transition-all border border-brand/5">
          <ShoppingBag size={20} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-brand/5 text-center">
          <div className="w-20 h-20 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-black/20" />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">No orders yet</h3>
          <p className="text-black/60 text-sm mb-10 max-w-xs mx-auto">Your customized collection will appear here once you place your first order.</p>
          <Link href="/" className="inline-block bg-brand text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-hover shadow-lg">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const hasBespokeItems = order.items.some(
              (item) =>
                item.customizations &&
                item.customizations.measurements &&
                Object.keys(item.customizations.measurements).length > 0
            );

            return (
              <div key={order.id} className="bg-white rounded-[2rem] border border-brand/5 shadow-lg overflow-hidden hover:shadow-xl transition-all group">
                <div className="p-4 md:p-6 bg-[#8c6239] flex flex-col md:flex-row md:items-center justify-between border-b border-brand/5 gap-4 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white group-hover:scale-110 transition-transform">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-0.5">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Order ID</p>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-full border border-white/5">#AS-{order.id}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white leading-tight">
                        Dry Fish Basket Order
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-4 md:gap-8">
                    <div className="flex flex-col justify-center min-w-[100px]">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Status</p>
                      <div className="flex items-center h-6">
                        <span className={`inline-flex items-center px-3 py-0 h-6 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm border ${
                          order.status?.toLowerCase() === 'delivered' ? 'bg-green-600 text-white border-transparent' : 
                          order.status?.toLowerCase() === 'cancelled' ? 'bg-red-600 text-white border-transparent' : 
                          'bg-[#C5A059] text-[#3b2314] border-transparent font-black'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center min-w-[80px]">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Date</p>
                      <div className="flex items-center h-6">
                        <span className="text-[10px] font-bold text-white">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center text-right min-w-[80px]">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Total</p>
                      <div className="flex items-center justify-end h-6">
                        <span className="text-lg font-black text-white tracking-tighter">₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.status?.toLowerCase() !== "cancelled" && order.status?.toLowerCase() !== "payment_pending" && (
                  <div className="px-6 md:px-24 lg:px-32 pb-8 pt-4">
                    {/* Horizontal Stepper for Desktop */}
                    <div className="hidden md:block relative">
                      {/* Background Line */}
                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-brand/10 -translate-y-1/2 rounded-full" />
                      
                      {/* Active Progress Line */}
                      {(() => {
                        const getMilestoneIndex = (status: string) => {
                          const s = status?.toLowerCase() || "";
                          if (s === "confirmed") return 0;
                          if (s === "processing" || s === "ready to ship") return 1;
                          if (s === "shipped") return 2;
                          if (s === "delivered") return 3;
                          return -1;
                        };
                        const milestoneIndex = getMilestoneIndex(order.status);
                        return (
                          <div 
                            className="absolute top-1/2 left-0 h-[2px] bg-[#C5A059] -translate-y-1/2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(197,160,89,0.4)]" 
                            style={{ 
                              width: `${milestoneIndex === -1 ? 0 : (milestoneIndex / (MILESTONES.length - 1)) * 100}%` 
                            }} 
                          />
                        );
                      })()}

                      {/* Milestone Dots */}
                      <div className="relative flex justify-between">
                        {MILESTONES.map((m, idx) => {
                          const getMilestoneIndex = (status: string) => {
                            const s = status?.toLowerCase() || "";
                            if (s === "confirmed") return 0;
                            if (s === "processing" || s === "ready to ship") return 1;
                            if (s === "shipped") return 2;
                            if (s === "delivered") return 3;
                            return -1;
                          };
                          const milestoneIndex = getMilestoneIndex(order.status);
                          const isCompleted = milestoneIndex >= idx;
                          const isCurrent = order.status?.toLowerCase() === m.toLowerCase();
                          return (
                            <div key={m} className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full border-2 transition-all duration-500 ${
                                isCompleted 
                                  ? "bg-[#C5A059] border-[#C5A059] scale-150" 
                                  : "bg-white border-brand/20"
                              } ${isCurrent ? "animate-pulse ring-4 ring-[#C5A059]/20" : ""}`} />
                              <span className={`absolute mt-6 text-[10px] font-bold uppercase tracking-[0.15em] text-center whitespace-nowrap transition-colors duration-500 ${
                                isCompleted ? "text-black" : "text-black/20"
                              }`}>
                                {m}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Vertical Stepper for Mobile */}
                    <div className="md:hidden space-y-0 pl-2">
                      {MILESTONES.map((m, idx) => {
                        const getMilestoneIndex = (status: string) => {
                          const s = status?.toLowerCase() || "";
                          if (s === "confirmed") return 0;
                          if (s === "processing" || s === "ready to ship") return 1;
                          if (s === "shipped") return 2;
                          if (s === "delivered") return 3;
                          return -1;
                        };
                        const milestoneIndex = getMilestoneIndex(order.status);
                        const isCompleted = milestoneIndex >= idx;
                        const isCurrent = order.status?.toLowerCase() === m.toLowerCase();
                        const isLast = idx === MILESTONES.length - 1;
                        const isLineActive = milestoneIndex > idx;

                        return (
                          <div key={m} className="flex items-start space-x-4 relative pb-6 last:pb-0">
                            {/* Vertical Line Connector */}
                            {!isLast && (
                              <div className={`absolute left-[7px] top-4 bottom-0 w-[1.5px] transition-colors duration-500 ${
                                isLineActive ? "bg-[#C5A059]" : "bg-brand/10"
                              }`} />
                            )}
                            
                            {/* Milestone Circle */}
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-white z-10 transition-all duration-500 ${
                              isCompleted 
                                ? "border-[#C5A059] bg-[#C5A059]" 
                                : "border-brand/20"
                            } ${isCurrent ? "ring-4 ring-[#C5A059]/20 animate-pulse" : ""}`}>
                              <div className={`w-1 h-1 rounded-full ${isCompleted ? "bg-white" : "bg-transparent"}`} />
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-500 -mt-[1px] ${
                              isCurrent ? "text-[#C5A059]" : isCompleted ? "text-black" : "text-black/25"
                            }`}>
                              {m}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {order.status?.toLowerCase() === "cancelled" && order.cancellationReason && (
                  <div className="mx-6 md:mx-8 mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-700 animate-in fade-in">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-0.5">Cancellation Reason</h5>
                      <p className="text-xs font-semibold leading-relaxed">{order.cancellationReason}</p>
                    </div>
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Product Details & Coupon Applied */}
                    <div className="lg:col-span-8 space-y-6">
                      <div className="space-y-6">
                        {order.items.map((item) => {
                          const isBespoke = item.customizations && item.customizations.measurements && Object.keys(item.customizations.measurements).length > 0;
                          const isProductCoupon = isProductCouponMatch(item, order.couponCode, order.couponTargetType, order.couponTargetValue);

                          return (
                            <div key={item.id} className="flex flex-row gap-6 items-start pb-6 border-b border-brand/5 last:border-0 last:pb-0">
                              <div className="w-24 h-32 bg-brand/5 rounded-2xl overflow-hidden flex-shrink-0 border border-brand/5 shadow-sm relative group/img">
                                {item.productImage ? (
                                  <img 
                                    src={item.productImage} 
                                    alt={item.productName} 
                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-black/20">
                                    <ImageIcon size={24} />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center text-black/10 -z-10 bg-brand/5">
                                  <ImageIcon size={24} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col mb-1">
                                  <h5 className="text-base font-bold text-black">{item.productName}</h5>
                                </div>

                                <div className="flex items-center space-x-3 mb-4 mt-2">
                                  <span className="text-xs font-medium text-black/40 uppercase tracking-widest">Size: {item.size}</span>
                                  <div className="w-1.5 h-1.5 rounded-full bg-brand/10"></div>
                                  <span className="text-xs font-medium text-black/40 uppercase tracking-widest">Qty: {item.quantity}</span>
                                </div>
                                
                                {isBespoke && (
                                  <div className="bg-brand/5 rounded-2xl p-4 border border-brand/5 mb-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                      <Ruler size={12} className="text-[#C5A059]" />
                                      <span className="text-[9px] font-black text-black uppercase tracking-widest">Your Custom Fit (Inches)</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      {Object.entries(item.customizations!.measurements).map(([key, val]) => (
                                        <div key={key}>
                                          <p className="text-[8px] font-bold text-black/40 uppercase tracking-tighter mb-0.5">{key}</p>
                                          <p className="text-[10px] font-black text-black">{val}"</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Product-specific Coupon Badge */}
                                {isProductCoupon && (
                                  <div className="flex items-center space-x-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-xl w-fit mt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest">🏷️ Coupon Claimed: {order.couponCode}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right self-center min-w-[80px]">
                                <span className="text-sm font-black text-black">₹{item.price.toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pricing Summary (including coupon) */}
                      <div className="bg-brand/5 border border-brand/10 rounded-2xl p-5 space-y-3 text-black">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-black/55">Actual Price (Subtotal)</span>
                          <span>₹{(order.totalAmount + (order.discountAmount || 0)).toLocaleString()}</span>
                        </div>
                        
                        {order.couponCode && (
                          <div className="flex justify-between items-center text-xs text-green-700 bg-green-50/50 px-3.5 py-2.5 rounded-xl border border-green-100 font-bold">
                            <span className="flex items-center gap-1.5">
                              🏷️ Coupon Applied: <span className="uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] tracking-wider">{order.couponCode}</span>
                              {order.couponTargetType && (order.couponTargetType === "product" || order.couponTargetType === "category") && (
                                <span className="text-[9px] text-green-600/70 font-normal normal-case">(Product-specific)</span>
                              )}
                            </span>
                            <span>-₹{order.discountAmount?.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="border-t border-brand/10 pt-2 flex justify-between items-center text-sm font-black">
                          <span>Paid Total</span>
                          <span className="text-[#C5A059]">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Delivery Address & Cancel Option */}
                    <div className="lg:col-span-4 lg:border-l border-brand/5 lg:pl-8 space-y-6 pt-6 lg:pt-0">
                      <div className="space-y-6">
                        {/* Shipping Details Card */}
                        {["shipped", "delivered"].includes(order.status?.toLowerCase() || "") && (
                          <div className="space-y-2">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-[#C5A059] flex items-center gap-1.5">
                              🚚 Shipping Details
                            </h5>
                             <div className="bg-[#8c6239]/5 border border-[#8c6239]/10 rounded-2xl p-4 space-y-3 text-black">
                               {!order.courierServiceName && !order.trackingNumber ? (
                                 <p className="text-xs text-black/40 italic font-medium">
                                   Tracking details will be updated shortly.
                                 </p>
                               ) : (
                                 <>
                                   {order.courierServiceName && (
                                     <p className="text-xs text-black/80">
                                       <strong className="text-black font-black uppercase tracking-wider text-[10px]">Courier:</strong>{" "}
                                       {order.courierServiceName}
                                     </p>
                                   )}
                                   {order.courierId && (
                                     <p className="text-xs text-black/80">
                                       <strong className="text-black font-black uppercase tracking-wider text-[10px]">Courier ID:</strong>{" "}
                                       {order.courierId}
                                     </p>
                                   )}
                                   {order.trackingNumber && (
                                     <p className="text-xs text-black/80">
                                       <strong className="text-black font-black uppercase tracking-wider text-[10px]">Tracking Number:</strong>{" "}
                                       {order.trackingNumber}
                                     </p>
                                   )}
                                   {order.trackingLink && (
                                     <p className="text-xs">
                                       <strong className="text-black font-black uppercase tracking-wider text-[10px] block mb-1">Track Shipment:</strong>
                                       <a 
                                         href={order.trackingLink} 
                                         target="_blank" 
                                         rel="noopener noreferrer"
                                         className="inline-flex items-center gap-1 text-[#C5A059] hover:underline text-xs font-bold"
                                       >
                                         View Shipment Progress →
                                       </a>
                                     </p>
                                   )}
                                 </>
                               )}
                              {order.estimatedDeliveryDate && (
                                <p className="text-xs text-black/80">
                                  <strong className="text-black font-black uppercase tracking-wider text-[10px]">Estimated Delivery:</strong>{" "}
                                  <span className="text-[#C5A059] font-bold">
                                    Arriving by {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </p>
                              )}
                              {order.shippingNotes && (
                                <div className="border-t border-[#8c6239]/10 pt-2">
                                  <p className="text-[10px] text-black/50 font-bold uppercase tracking-wider mb-1">Notes</p>
                                  <p className="text-[11px] italic text-black/70">{order.shippingNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Shipping Address */}
                        <div className="space-y-2">
                          <h5 className="text-[9px] font-black uppercase tracking-widest text-black/40 flex items-center gap-1.5">
                            <MapPin size={12} className="text-[#C5A059]" /> Delivery Address
                          </h5>
                          <div className="bg-brand/5 border border-brand/5 rounded-2xl p-4">
                            {(() => {
                              const parsedAddr = parseAddress(order.shippingAddress);
                              if (parsedAddr) {
                                return (
                                  <div className="space-y-1.5 text-xs text-black/80 leading-relaxed">
                                    <p><strong className="text-black font-black uppercase tracking-wider text-[10px]">Name:</strong> {parsedAddr.name}</p>
                                    <p><strong className="text-black font-black uppercase tracking-wider text-[10px]">Address:</strong> {parsedAddr.street}</p>
                                    <p><strong className="text-black font-black uppercase tracking-wider text-[10px]">City:</strong> {parsedAddr.city}</p>
                                    <p><strong className="text-black font-black uppercase tracking-wider text-[10px]">State:</strong> {parsedAddr.state}</p>
                                    <p><strong className="text-black font-black uppercase tracking-wider text-[10px]">Pincode:</strong> {parsedAddr.pincode}</p>
                                    <p><strong className="text-black font-black uppercase tracking-wider text-[10px]">Contact:</strong> {parsedAddr.contact}</p>
                                  </div>
                                );
                              }
                              return (
                                <p className="text-xs font-semibold text-black/80 leading-relaxed">
                                  {order.shippingAddress || "No address provided"}
                                </p>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Cancel Order Action */}
                        {(order.status?.toLowerCase() === "pending" || order.status?.toLowerCase() === "confirmed") && (
                          <div className="space-y-2">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-black/40">Manage Order</h5>
                            <div className="bg-brand/5 border border-brand/5 rounded-2xl p-4">
                              {confirmingCancelId === order.id ? (
                                <div className="space-y-3">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Confirm cancellation?</p>
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      disabled={isCancelling}
                                      onClick={() => handleCancelOrder(order.id)}
                                      className="flex-1 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-1"
                                    >
                                      {isCancelling ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                      Yes, Cancel
                                    </button>
                                    <button 
                                      disabled={isCancelling}
                                      onClick={() => setConfirmingCancelId(null)}
                                      className="flex-1 py-2 bg-brand/5 text-black/70 font-bold rounded-xl hover:bg-brand/10 transition-all text-[10px] uppercase tracking-widest border border-brand/10"
                                    >
                                      No, Keep
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setConfirmingCancelId(order.id)}
                                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all font-bold text-[10px] uppercase tracking-widest"
                                >
                                  <XCircle size={14} />
                                  <span>Cancel Order</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {order.status?.toLowerCase() === "cancelled" && (
                          <div className="flex items-center space-x-3 px-6 py-4 rounded-2xl bg-red-50 border border-red-100 text-red-600">
                            <AlertTriangle size={18} />
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest">Order Cancelled</p>
                              <p className="text-[9px] font-medium opacity-70">A refund will be initiated if payment was captured. Amount will be credited within 7 to 9 business days.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#8c6239] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 font-bold text-xs animate-in fade-in slide-in-from-bottom-5 duration-300 border border-[#C5A059]/20">
          <CheckCircle2 size={16} />
          <span className="uppercase tracking-widest">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-4" />
          <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Loading...</p>
        </div>
      }
    >
      <MyOrdersContent />
    </Suspense>
  );
}
