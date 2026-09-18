"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag, Clock, CheckCircle2, Truck, Loader2, User, Phone, Ruler, ChevronDown, ChevronUp, Sparkles, Scissors, MapPin, CreditCard, X } from "lucide-react";

interface OrderItem {
  id: number;
  productName: string;
  productImages: string | null;
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
  createdAt: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  couponCode: string | null;
  discountAmount: number | null;
  items: OrderItem[];
  paymentStatus: string;
  phonepeOrderId: string | null;
  phonepePaymentId: string | null;
  paymentGateway?: string | null;
  courierServiceName?: string | null;
  courierId?: string | null;
  trackingNumber?: string | null;
  trackingLink?: string | null;
  estimatedDeliveryDate?: string | null;
  shippingNotes?: string | null;
}

function getProductImage(imagesStr: string | null, color?: string | null) {
  try {
    if (imagesStr) {
      const parsed = JSON.parse(imagesStr);
      if (Array.isArray(parsed)) {
        if (parsed.length > 0) return parsed[0];
      } else if (parsed && typeof parsed === "object") {
        if (color && parsed[color] && parsed[color].length > 0) {
          return parsed[color][0];
        }
        // Fallback to first available color/key
        const keys = Object.keys(parsed);
        for (const key of keys) {
          if (parsed[key] && parsed[key].length > 0) {
            return parsed[key][0];
          }
        }
      }
    }
  } catch (e) {}
  return "/images/placeholder.png";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<Order | null>(null);
  const [shippingForm, setShippingForm] = useState({
    courierServiceName: "",
    courierId: "",
    trackingNumber: "",
    trackingLink: "",
    estimatedDeliveryDate: "",
    shippingNotes: ""
  });
  const [isSubmittingShipping, setIsSubmittingShipping] = useState(false);
  const [toast, setToast] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [paymentForm, setPaymentForm] = useState({ phonepePaymentId: "" });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Cancellation Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const ORDER_STATUSES = [
    "pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled"
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
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

  const updateOrderStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrderId) return;
    setIsSubmittingCancel(true);
    try {
      const res = await fetch(`/api/admin/orders/${cancelOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled", cancellationReason: cancelReason.trim() })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === cancelOrderId ? { ...o, status: "Cancelled" } : o));
        showToast("Order cancelled successfully");
        setShowCancelModal(false);
        setCancelReason("");
        setCancelOrderId(null);
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Failed to cancel order", error);
      showToast("Something went wrong");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const statusCounts = {
    pending: orders.filter(o => o.status?.toLowerCase() === "pending").length,
    confirmed: orders.filter(o => o.status?.toLowerCase() === "confirmed").length,
    processing: orders.filter(o => o.status?.toLowerCase() === "processing").length,
    readyToShip: orders.filter(o => o.status?.toLowerCase() === "ready to ship").length,
    shipped: orders.filter(o => o.status?.toLowerCase() === "shipped").length,
    delivered: orders.filter(o => o.status?.toLowerCase() === "delivered").length,
    cancelled: orders.filter(o => o.status?.toLowerCase() === "cancelled").length,
  };

  const filteredOrders = orders.filter(order => {
    // Search term filter
    const s = searchTerm.toLowerCase();
    const matchesSearch = (
      order.id.toString().includes(s) ||
      (order.customerPhone || "").includes(s) ||
      (order.customerName || "").toLowerCase().includes(s)
    );
    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      const orderStatus = (order.status || "").toLowerCase();
      if (orderStatus !== statusFilter) return false;
    }

    // Date filters
    const orderDate = new Date(order.createdAt);
    if (fromDate) {
      const [y, m, d] = fromDate.split("-").map(Number);
      const from = new Date(y, m - 1, d, 0, 0, 0, 0);
      if (orderDate < from) return false;
    }
    if (toDate) {
      const [y, m, d] = toDate.split("-").map(Number);
      const to = new Date(y, m - 1, d, 23, 59, 59, 999);
      if (orderDate > to) return false;
    }

    return true;
  });

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-amber-50 text-amber-600 border-amber-100";
      case "confirmed": return "bg-blue-50 text-blue-600 border-blue-100";
      case "processing": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "ready to ship": return "bg-pink-50 text-pink-600 border-pink-100";
      case "shipped": return "bg-purple-50 text-purple-600 border-purple-100";
      case "delivered": return "bg-green-50 text-green-600 border-green-100";
      case "cancelled": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-black-accent mb-4" size={40} />
        <p className="text-black/40 font-bold uppercase tracking-widest text-xs">Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 px-8 pt-8 font-inter">
      <div className="mb-10 text-center flex flex-col items-center">
        <h1 className="text-4xl font-playfair font-bold text-black">Order Fulfillment</h1>
        <p className="mt-2 text-black/60 font-medium">Track and manage customer purchases and custom fits.</p>
      </div>

      <div className="mb-10 flex justify-center">
        <div className="relative group min-w-[300px] max-w-md w-full">
          <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-[#C5A059] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by order # or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-brand/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {[
          { label: "Pending", count: statusCounts.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Confirmed", count: statusCounts.confirmed, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Processing", count: statusCounts.processing, icon: Scissors, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Shipped", count: statusCounts.shipped, icon: Truck, color: "text-purple-500", bg: "bg-purple-50" },
          { label: "Delivered", count: statusCounts.delivered, icon: ShoppingBag, color: "text-green-500", bg: "bg-green-50" },
          { label: "Cancelled", count: statusCounts.cancelled, icon: X, color: "text-red-500", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-3xl border border-brand/5 shadow-sm flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl ${s.bg} ${s.color} flex-shrink-0`}>
              <s.icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black text-black/40 uppercase tracking-widest truncate">{s.label}</p>
              <p className="text-base font-bold text-black">{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER ORDERS SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-brand/5 shadow-sm mb-10">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-1.5 h-4 bg-brand rounded-full"></div>
          <h3 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
            Filter Orders
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-brand/10 rounded-2xl py-3 px-4 text-xs font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm appearance-none pr-10"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-black" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-white border border-brand/10 rounded-2xl py-3 px-4 text-xs font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-white border border-[#064e3b]/10 rounded-2xl py-3 px-4 text-xs font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm"
            />
          </div>

          <div>
            <button
              onClick={() => {
                setStatusFilter("all");
                setFromDate("");
                setToDate("");
              }}
              disabled={statusFilter === "all" && !fromDate && !toDate}
              className="w-full bg-transparent border border-red-100 hover:bg-red-50 text-red-400 hover:text-red-500 disabled:opacity-40 disabled:hover:bg-transparent disabled:text-red-300 font-black text-[10px] uppercase tracking-widest rounded-2xl py-3.5 px-6 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>✕ Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-brand/5 text-center">
          <div className="w-20 h-20 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-black/20" />
          </div>
          <h3 className="text-2xl font-playfair font-bold text-black mb-2">{searchTerm ? "No matching orders" : "No orders to display"}</h3>
          <p className="text-black/60 font-medium max-w-sm mx-auto">
            {searchTerm ? "Adjust your search filters to find what you are looking for." : "When customers start placing orders for their custom-fit apparel, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredOrders.map((order) => {
            const hasBespokeItems = order.items.some(item => item.customizations?.type === "Bespoke" || (item.customizations?.measurements && Object.keys(item.customizations.measurements).length > 0));
            
            return (
            <div key={order.id} className={`rounded-[2rem] border overflow-hidden shadow-sm hover:shadow-md transition-all ${hasBespokeItems ? 'bg-[#F9F6EE] border-[#C5A059]/30 ring-1 ring-[#C5A059]/10' : 'bg-white border-brand/5'}`}>
              {/* Order Header */}
              <div 
                className="p-6 flex flex-col md:flex-row justify-between items-center cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
          <div className="flex items-center space-x-6">
            <div className="bg-brand/5 p-4 rounded-2xl">
              <ShoppingBag className="text-black" size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-black">Order #{order.id}</span>
                {hasBespokeItems && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-[#C5A059] text-white rounded-full">
                    <Scissors size={10} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Bespoke Order</span>
                  </div>
                )}
                <div className="relative group">
                  <select 
                    value={order.status}
                    disabled={updatingId === order.id || order.status?.toLowerCase() === "cancelled"}
                    onChange={(e) => {
                      e.stopPropagation();
                      const val = e.target.value;
                      if (val.toLowerCase() === "cancelled") {
                        setCancelOrderId(order.id);
                        setCancelReason("");
                        setShowCancelModal(true);
                      } else {
                        updateOrderStatus(order.id, val);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`appearance-none px-4 py-1.5 pr-10 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border outline-none ${getStatusStyles(order.status)} ${updatingId === order.id ? "opacity-50 animate-pulse" : ""}`}
                  >
                    {ORDER_STATUSES.map(s => {
                      const isDisabled = s.toLowerCase() === "cancelled" && 
                        ["shipped", "delivered"].includes(order.status?.toLowerCase() || "");
                      return (
                        <option key={s} value={s} disabled={isDisabled} className={getStatusStyles(s)}>
                          {s}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                </div>
              </div>
                    <p className="text-xs text-black/40 font-medium mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-10 mt-4 md:mt-0">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">Amount</p>
                    <p className="text-xl font-bold text-black">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-full bg-brand/5 text-black/40">
                    {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrder === order.id && (
                <div className="border-t border-brand/5 p-8 bg-brand/[0.01]">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Customer Info */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
                        <User size={14} className="text-black-accent" /> Customer Details
                      </h4>
                      <div className="bg-white p-5 rounded-2xl border border-brand/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-black/40 uppercase">Name</span>
                          <span className="text-xs font-black text-black">{order.customerName || "Guest User"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-black/40 uppercase">Phone</span>
                          <span className="text-xs font-black text-black flex items-center gap-1">
                            <Phone size={10} /> {order.customerPhone}
                          </span>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="space-y-6 pt-4">
                        <h4 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
                          <MapPin size={14} className="text-black-accent" /> Delivery Address
                        </h4>
                        <div className="bg-white p-5 rounded-2xl border border-brand/5">
                          <p className="text-xs font-bold text-black/70 leading-relaxed">
                            {order.shippingAddress || "No address provided"}
                          </p>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="space-y-6 pt-4">
                        <h4 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
                          <CreditCard size={14} className="text-black-accent" /> Payment Details
                        </h4>
                        <div className="bg-white p-5 rounded-2xl border border-brand/5 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-black/40 uppercase">Payment Status</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                              order.paymentStatus === 'paid' 
                                ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}>
                              {order.paymentStatus || 'pending'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-black/40 uppercase whitespace-nowrap">PhonePe Order ID</span>
                            <span className="text-[10px] font-mono font-bold text-black/70 truncate max-w-[150px]" title={order.phonepeOrderId || "N/A"}>
                              {order.phonepeOrderId || "N/A"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-black/40 uppercase whitespace-nowrap">Payment ID</span>
                            <span className="text-[10px] font-mono font-bold text-black/70 truncate max-w-[150px]" title={order.phonepePaymentId || "N/A"}>
                              {order.phonepePaymentId || "N/A"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-black/40 uppercase">Amount Received</span>
                            <span className="text-xs font-black text-black">
                              {order.paymentStatus === 'paid' ? `₹${order.totalAmount.toLocaleString()}` : '₹0'}
                            </span>
                          </div>

                          {order.paymentStatus !== 'paid' && order.status?.toLowerCase() !== 'cancelled' && (
                            <div className="pt-2 border-t border-brand/5 flex flex-col gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderForPayment(order);
                                  setPaymentForm({ phonepePaymentId: "" });
                                  setShowPaymentModal(true);
                                }}
                                className="w-full bg-[#C5A059] hover:bg-[#C5A059]/90 text-white font-black text-[9px] uppercase tracking-widest rounded-xl py-2 px-4 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                              >
                                <CreditCard size={12} />
                                <span>Update Payment Status</span>
                              </button>
                              
                              <div className="group relative flex items-center justify-center gap-1.5 text-[9px] font-medium text-black/50 hover:text-black/80 cursor-help mt-1 transition-colors">
                                <span>⚠️ Verification Required</span>
                                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-brand text-white text-[9px] font-bold leading-normal p-3 rounded-xl shadow-xl z-20 border border-white/10 text-center">
                                  Check your PhonePe dashboard under Order ID <span className="font-mono text-black-accent">{order.phonepeOrderId}</span> to verify the payment status before updating here.
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                      <h4 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
                        <Ruler size={14} className="text-black-accent" /> Customizations & Items
                      </h4>
                      <div className="space-y-4">
                        {order.items.map((item) => {
                          const imgUrl = getProductImage(item.productImages, item.color);
                          return (
                            <div key={item.id} className="bg-white p-6 rounded-3xl border border-brand/5 shadow-sm">
                              <div className="flex gap-4 items-start mb-6">
                                <div className="w-16 h-20 rounded-xl overflow-hidden border border-brand/5 bg-brand-light/20 flex-shrink-0 relative">
                                  <img 
                                    src={imgUrl} 
                                    alt={item.productName} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = "/images/placeholder.png";
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="text-sm font-black text-black line-clamp-1">{item.productName}</h5>
                                      <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-widest">
                                        {item.size} / {item.color} — Qty: {item.quantity}
                                      </p>
                                    </div>
                                    <span className="text-sm font-bold text-black flex-shrink-0">₹{item.price.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {item.customizations && item.customizations.measurements && Object.keys(item.customizations.measurements).length > 0 && (
                                <div className="bg-[#8c6239]/5 rounded-2xl p-5 border border-[#8c6239]/10">
                                  <div className="flex items-center space-x-2 mb-4">
                                    <Sparkles size={12} className="text-[#C5A059]" />
                                    <span className="text-[10px] font-black text-[#8c6239] uppercase tracking-[0.2em]">Bespoke Measurements (Inches)</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(item.customizations.measurements).map(([key, val]) => (
                                      <div key={key} className="bg-white/80 p-3 rounded-xl border border-[#8c6239]/5">
                                        <p className="text-[8px] font-black text-black/40 uppercase tracking-widest mb-1">{key}</p>
                                        <p className="text-xs font-black text-black">{val}"</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Customization fit info removed */}
                            </div>
                          );
                        })}

                        {/* Order Summary / Pricing Breakdown */}
                        <div className="bg-brand/5 border border-brand/10 rounded-3xl p-6 mt-4 space-y-4 text-black">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                            <ShoppingBag size={12} className="text-black-accent" /> Order Summary
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-black/60">Actual Price (Subtotal)</span>
                              <span className="font-bold text-black">₹{(order.totalAmount + (order.discountAmount || 0)).toLocaleString()}</span>
                            </div>
                            
                            {order.couponCode && (
                              <div className="flex justify-between items-center text-xs text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                                <span className="font-bold flex items-center gap-1">
                                  🏷️ Coupon Applied: <span className="uppercase bg-green-200/50 px-1.5 py-0.5 rounded text-[10px]">{order.couponCode}</span>
                                </span>
                                <span className="font-black">-₹{order.discountAmount?.toLocaleString()}</span>
                              </div>
                            )}

                            <div className="border-t border-brand/10 pt-2 flex justify-between items-center text-sm font-black mt-2">
                              <span>Grand Total</span>
                              <span className="text-black-accent">₹{order.totalAmount.toLocaleString()}</span>
                            </div>

                            {/* Shipping Info Action Button */}
                            <div className="pt-4 border-t border-brand/10 mt-4">
                              <button
                                disabled={order.status?.toLowerCase() !== "processing"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderForShipping(order);
                                  setShippingForm({
                                    courierServiceName: order.courierServiceName || "",
                                    courierId: order.courierId || "",
                                    trackingNumber: order.trackingNumber || "",
                                    trackingLink: order.trackingLink || "",
                                    estimatedDeliveryDate: order.estimatedDeliveryDate 
                                      ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0]
                                      : "",
                                    shippingNotes: order.shippingNotes || ""
                                  });
                                  setShowShippingModal(true);
                                }}
                                className="w-full bg-[#8c6239] hover:bg-[#8c6239]/90 disabled:bg-[#8c6239]/20 disabled:text-black/40 disabled:cursor-not-allowed text-white hover:text-[#C5A059]/90 disabled:text-[#C5A059]/30 font-black text-[10px] uppercase tracking-widest rounded-2xl py-3 px-6 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm border border-[#C5A059]/20"
                              >
                                <Truck size={14} />
                                <span>Add shipping Info</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Details (Admin view) */}
                        {order.courierServiceName && order.trackingNumber && (
                          <div className="bg-[#8c6239]/5 border border-[#8c6239]/10 rounded-3xl p-6 mt-4 space-y-4 text-black">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5 text-[#C5A059]">
                              🚚 Shipping Details
                            </h5>
                             <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="font-semibold text-black/60 uppercase text-[9px] tracking-wider block">Courier Service</span>
                                <span className="font-bold text-black">{order.courierServiceName}</span>
                              </div>
                              {order.courierId && (
                                <div>
                                  <span className="font-semibold text-black/60 uppercase text-[9px] tracking-wider block">Courier ID</span>
                                  <span className="font-bold text-black">{order.courierId}</span>
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-black/60 uppercase text-[9px] tracking-wider block">Tracking Number</span>
                                <span className="font-bold text-black">{order.trackingNumber}</span>
                              </div>
                              {order.trackingLink && (
                                <div>
                                  <span className="font-semibold text-black/60 uppercase text-[9px] tracking-wider block mb-1">Tracking Link</span>
                                  <a 
                                    href={order.trackingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[#C5A059] hover:underline font-bold"
                                  >
                                    Track Package →
                                  </a>
                                </div>
                              )}
                              {order.estimatedDeliveryDate && (
                                <div>
                                  <span className="font-semibold text-black/60 uppercase text-[9px] tracking-wider block">Estimated Delivery</span>
                                  <span className="font-bold text-[#C5A059]">
                                    {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              )}
                              {order.shippingNotes && (
                                <div className="col-span-2 border-t border-[#8c6239]/10 pt-2">
                                  <span className="font-semibold text-black/40 uppercase text-[9px] tracking-wider block mb-1">Shipping Notes</span>
                                  <span className="italic text-black/70">{order.shippingNotes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#8c6239] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 font-bold text-sm border border-[#C5A059]/20 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 size={18} /><span>{toast}</span>
        </div>
      )}

      {/* ─── ADD SHIPPING INFO MODAL ────────────────────────── */}
      {showShippingModal && selectedOrderForShipping && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-brand/40 backdrop-blur-sm" 
            onClick={() => !isSubmittingShipping && setShowShippingModal(false)} 
          />
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-brand/5 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-8 border-b border-brand/5 flex items-center justify-between bg-brand/5">
              <div>
                <h3 className="text-xl font-playfair font-bold text-black flex items-center gap-2">
                  <Truck className="text-[#C5A059]" size={20} />
                  Add Shipping Info
                </h3>
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">
                  Order #AS-{selectedOrderForShipping.id}
                </p>
              </div>
              <button 
                onClick={() => setShowShippingModal(false)}
                disabled={isSubmittingShipping}
                className="p-2 rounded-full hover:bg-brand/5 text-black/40 hover:text-black transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!shippingForm.courierServiceName || !shippingForm.trackingNumber || !shippingForm.estimatedDeliveryDate) {
                showToast("Please fill all required fields");
                return;
              }
              setIsSubmittingShipping(true);
              try {
                const res = await fetch(`/api/admin/orders/${selectedOrderForShipping.id}/shipping`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    courierServiceName: shippingForm.courierServiceName,
                    courierId: shippingForm.courierId || null,
                    trackingNumber: shippingForm.trackingNumber,
                    trackingLink: shippingForm.trackingLink || null,
                    estimatedDeliveryDate: shippingForm.estimatedDeliveryDate,
                    shippingNotes: shippingForm.shippingNotes || null,
                  })
                });
                const data = await res.json();
                if (data.success) {
                  showToast("Shipping info added successfully!");
                  setShowShippingModal(false);
                  fetchOrders();
                } else {
                  showToast(data.error || "Failed to save shipping info");
                }
              } catch (err) {
                console.error(err);
                showToast("Something went wrong");
              } finally {
                setIsSubmittingShipping(false);
              }
            }} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Courier Service Name */}
                <div>
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">
                    Courier Service Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={shippingForm.courierServiceName}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, courierServiceName: e.target.value }))}
                    placeholder="e.g. Blue Dart, Delhivery"
                    className="w-full bg-white border border-brand/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm"
                  />
                </div>

                {/* Courier ID */}
                <div>
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">
                    Courier ID / Code
                  </label>
                  <input 
                    type="text"
                    value={shippingForm.courierId}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, courierId: e.target.value }))}
                    placeholder="e.g. BD_EXP"
                    className="w-full bg-white border border-brand/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm"
                  />
                </div>

                {/* Tracking Number */}
                <div>
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">
                    Tracking Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={shippingForm.trackingNumber}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    placeholder="e.g. 1234567890"
                    className="w-full bg-white border border-brand/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm"
                  />
                </div>

                {/* Tracking Link */}
                <div>
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">
                    Tracking Link
                  </label>
                  <input 
                    type="url"
                    value={shippingForm.trackingLink}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, trackingLink: e.target.value }))}
                    placeholder="e.g. https://track.bluedart.com/..."
                    className="w-full bg-white border border-brand/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm"
                  />
                </div>

                {/* Estimated Delivery Date */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">
                    Estimated Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      required
                      value={shippingForm.estimatedDeliveryDate}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, estimatedDeliveryDate: e.target.value }))}
                      className="w-full bg-white border border-brand/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Shipping Notes */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">
                    Shipping Notes / Dispatch Notes
                  </label>
                  <textarea 
                    rows={3}
                    value={shippingForm.shippingNotes}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, shippingNotes: e.target.value }))}
                    placeholder="e.g. Signature required, deliver after 2 PM..."
                    className="w-full bg-white border border-brand/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t border-brand/5">
                <button
                  type="button"
                  disabled={isSubmittingShipping}
                  onClick={() => setShowShippingModal(false)}
                  className="flex-1 py-3.5 bg-brand/5 text-black/60 hover:text-black disabled:opacity-40 font-black text-[10px] uppercase tracking-widest rounded-2xl cursor-pointer border border-brand/5 hover:bg-brand/10 transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShipping}
                  className="flex-1 py-3.5 bg-brand text-white hover:bg-brand/90 disabled:opacity-40 font-black text-[10px] uppercase tracking-widest rounded-2xl cursor-pointer shadow-lg hover:shadow-xl transition-all text-center flex items-center justify-center gap-2"
                >
                  {isSubmittingShipping ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Confirm & Ship</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── UPDATE PAYMENT STATUS MODAL ────────────────────────── */}
      {showPaymentModal && selectedOrderForPayment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-brand/40 backdrop-blur-sm" 
            onClick={() => !isSubmittingPayment && setShowPaymentModal(false)} 
          />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-brand/5 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-8 border-b border-brand/5 flex items-center justify-between bg-brand/5">
              <div>
                <h3 className="text-xl font-playfair font-bold text-black flex items-center gap-2">
                  <CreditCard className="text-[#C5A059]" size={20} />
                  Update Payment Status
                </h3>
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">
                  Order #AS-{selectedOrderForPayment.id}
                </p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                disabled={isSubmittingPayment}
                className="p-2 rounded-full hover:bg-brand/5 text-black/40 hover:text-black transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!paymentForm.phonepePaymentId) {
                showToast("Please enter the PhonePe Payment ID");
                return;
              }
              setIsSubmittingPayment(true);
              try {
                const res = await fetch(`/api/admin/orders/${selectedOrderForPayment.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    paymentStatus: "paid",
                    phonepePaymentId: paymentForm.phonepePaymentId,
                  })
                });
                const data = await res.json();
                if (data.success) {
                  showToast("Payment status updated successfully!");
                  setShowPaymentModal(false);
                  fetchOrders();
                } else {
                  showToast(data.error || "Failed to update payment status");
                }
              } catch (err) {
                console.error(err);
                showToast("Something went wrong");
              } finally {
                setIsSubmittingPayment(false);
              }
            }} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">PhonePe Order Reference</p>
                  <p className="text-xs font-mono font-bold text-amber-900">{selectedOrderForPayment.phonepeOrderId || "No order ID generated"}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">
                    PhonePe Payment ID <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={paymentForm.phonepePaymentId}
                    onChange={(e) => setPaymentForm({ phonepePaymentId: e.target.value })}
                    placeholder="e.g. T26091812345678"
                    className="w-full bg-white border border-brand/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm"
                  />
                  <p className="text-[9px] text-black/40 font-medium mt-2 leading-relaxed">
                    Verify the payment status on your PhonePe dashboard for order <span className="font-mono font-bold">{selectedOrderForPayment.phonepeOrderId}</span>, copy the Payment ID, and paste it here.
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t border-brand/5">
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3.5 bg-brand/5 text-black/60 hover:text-black disabled:opacity-40 font-black text-[10px] uppercase tracking-widest rounded-2xl cursor-pointer border border-brand/5 hover:bg-brand/10 transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="flex-1 py-3.5 bg-brand text-white hover:bg-brand/90 disabled:opacity-40 font-black text-[10px] uppercase tracking-widest rounded-2xl cursor-pointer shadow-lg hover:shadow-xl transition-all text-center flex items-center justify-center gap-2"
                >
                  {isSubmittingPayment ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Confirm & Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CANCELLATION REASON MODAL ────────────────────────── */}
      {showCancelModal && cancelOrderId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-brand/40 backdrop-blur-sm" 
            onClick={() => !isSubmittingCancel && setShowCancelModal(false)} 
          />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-brand/5 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-8 border-b border-brand/5 flex items-center justify-between bg-brand/5">
              <div>
                <h3 className="text-xl font-playfair font-bold text-black flex items-center gap-2">
                  Cancel Order
                </h3>
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">
                  Order #AS-{cancelOrderId}
                </p>
              </div>
              <button 
                onClick={() => setShowCancelModal(false)}
                disabled={isSubmittingCancel}
                className="p-2 rounded-full hover:bg-brand/5 text-black/40 hover:text-black transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2 ml-1">
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter the reason why this order is being cancelled..."
                  rows={4}
                  className="w-full bg-brand/5 border border-brand/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-black placeholder-brand/30 focus:outline-none focus:border-[#C5A059]/30 focus:ring-4 focus:ring-[#C5A059]/10 transition-all resize-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isSubmittingCancel}
                  className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-black/40 hover:bg-brand/5 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isSubmittingCancel || !cancelReason.trim()}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingCancel && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Cancel Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
