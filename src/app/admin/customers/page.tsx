"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Phone, 
  Calendar, 
  Loader2, 
  ArrowLeft, 
  Package, 
  ShoppingCart, 
  Heart, 
  MapPin, 
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from "lucide-react";

type Customer = {
  id: number;
  fullName: string | null;
  phoneNumber: string;
  role: string;
  createdAt: string;
};

type OrderItem = {
  id: number;
  productId: number | null;
  productName: string | null;
  productImages: string | null;
  quantity: number;
  price: number;
  size: string;
  color: string | null;
  customizations: any;
};

type Order = {
  id: number;
  totalAmount: number;
  status: string | null;
  createdAt: string;
  shippingAddress: string | null;
  couponCode: string | null;
  discountAmount: number | null;
  paymentStatus: string | null;
  phonepeOrderId: string | null;
  phonepePaymentId: string | null;
  paymentGateway: string | null;
  courierServiceName: string | null;
  courierId: string | null;
  trackingNumber: string | null;
  trackingLink: string | null;
  estimatedDeliveryDate: string | null;
  shippingNotes: string | null;
  items: OrderItem[];
};

type CartItem = {
  id: number;
  productId: number | null;
  productName: string | null;
  productImages: string | null;
  baseSize: string;
  customSpecifications: any;
  quantity: number;
  price: number;
};

type WishlistItem = {
  id: number;
  productId: number | null;
  productName: string | null;
  productImages: string | null;
  salePrice: number | null;
  basePrice: number;
};

type CustomerDetails = {
  success: boolean;
  customer: Customer;
  orders: Order[];
  cart: CartItem[];
  wishlist: WishlistItem[];
};

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Customer detail states
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "cart" | "wishlist">("orders");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/admin/customers");
        const data = await res.json();
        if (data.success) {
          setCustomers(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch customers");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleCustomerClick = async (customerId: number) => {
    setSelectedCustomerId(customerId);
    setIsDetailsLoading(true);
    setDetails(null);
    setDetailsError("");
    setActiveTab("orders");

    try {
      const res = await fetch(`/api/admin/customers/${customerId}`);
      const data = await res.json();
      if (data.success) {
        setDetails(data);
      } else {
        setDetailsError(data.error || "Failed to load customer details.");
      }
    } catch (err) {
      setDetailsError("Error fetching customer details.");
      console.error(err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phoneNumber.includes(searchTerm)
  );

  function getProductImage(imagesStr: string | null) {
    try {
      if (imagesStr) {
        const parsed = JSON.parse(imagesStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        } else if (parsed && typeof parsed === "object") {
          const keys = Object.keys(parsed);
          if (keys.length > 0 && parsed[keys[0]].length > 0) {
            return parsed[keys[0]][0];
          }
        }
      }
    } catch (e) {}
    return "/images/placeholder.png";
  }

  function renderCustomizations(customs: any) {
    if (!customs || typeof customs !== "object" || Object.keys(customs).length === 0) return null;
    
    // Check if there are actual non-empty attributes to render
    const hasRenderableContent = Object.entries(customs).some(([_, val]) => {
      if (val && typeof val === "object") {
        return Object.keys(val).length > 0;
      }
      return val !== null && val !== undefined && val !== "";
    });

    if (!hasRenderableContent) return null;

    return (
      <div className="mt-2 p-3 bg-brand/5 rounded-xl border border-brand/5 text-[11px] font-semibold text-black/70 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#C5A059] mb-1">Bespoke Measurements</p>
        {Object.entries(customs).map(([key, val]: [string, any]) => {
          if (val && typeof val === "object") {
            if (Object.keys(val).length === 0) return null;
            return (
              <div key={key} className="mt-1 pl-2 border-l border-[#C5A059]/20 space-y-1">
                <span className="capitalize text-[10px] font-black tracking-wider text-[#C5A059] block mb-0.5">{key}:</span>
                {Object.entries(val).map(([subKey, subVal]: [string, any]) => (
                  <div key={subKey} className="flex justify-between pl-2 text-[10px]">
                    <span className="capitalize">{subKey.replace(/([A-Z])/g, " $1")}:</span>
                    <span className="font-bold text-black">{typeof subVal === "object" ? JSON.stringify(subVal) : String(subVal)}</span>
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div key={key} className="flex justify-between">
              <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
              <span className="font-bold text-black">{String(val)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-10">
      {/* 1. Details view */}
      {selectedCustomerId !== null ? (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button 
            onClick={() => setSelectedCustomerId(null)}
            className="flex items-center space-x-2 text-black/60 hover:text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Client List</span>
          </button>

          {isDetailsLoading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-brand/5 shadow-sm">
              <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin mb-4" />
              <p className="text-black/40 font-bold uppercase tracking-widest text-xs">Retrieving profile data...</p>
            </div>
          ) : detailsError ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-brand/5 shadow-sm p-10">
              <p className="text-red-500 font-bold mb-4">{detailsError}</p>
              <button 
                onClick={() => handleCustomerClick(selectedCustomerId)}
                className="px-6 py-3 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-widest"
              >
                Retry
              </button>
            </div>
          ) : details && (
            <div className="space-y-8">
              {/* Profile Card Header */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-[#C5A059]/10 rounded-3xl flex items-center justify-center text-[#C5A059] font-black text-3xl">
                    {details.customer.fullName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-black leading-none mb-2">
                      {details.customer.fullName || "Guest User"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-black/50">
                      <span className="flex items-center space-x-1">
                        <Phone size={12} className="text-[#C5A059]" />
                        <span className="tracking-wider text-black/70">+91 {details.customer.phoneNumber}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar size={12} className="text-[#C5A059]" />
                        <span>Joined {new Date(details.customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                    details.customer.role === "admin" ? "bg-[#8c6239] text-[#C5A059]" : "bg-brand/5 text-black/60"
                  }`}>
                    {details.customer.role}
                  </span>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/5">
                {/* Tab Navigation */}
                <div className="flex border-b border-brand/10 pb-4 mb-8 space-x-8">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`flex items-center space-x-2 pb-2 text-xs font-black uppercase tracking-widest transition-all relative ${
                      activeTab === "orders" ? "text-black" : "text-black/30 hover:text-black/55"
                    }`}
                  >
                    <Package size={16} />
                    <span>Orders ({details.orders.length})</span>
                    {activeTab === "orders" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C5A059] rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("cart")}
                    className={`flex items-center space-x-2 pb-2 text-xs font-black uppercase tracking-widest transition-all relative ${
                      activeTab === "cart" ? "text-black" : "text-black/30 hover:text-black/55"
                    }`}
                  >
                    <ShoppingCart size={16} />
                    <span>Cart List ({details.cart.length})</span>
                    {activeTab === "cart" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C5A059] rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("wishlist")}
                    className={`flex items-center space-x-2 pb-2 text-xs font-black uppercase tracking-widest transition-all relative ${
                      activeTab === "wishlist" ? "text-black" : "text-black/30 hover:text-black/55"
                    }`}
                  >
                    <Heart size={16} />
                    <span>Wishlisted ({details.wishlist.length})</span>
                    {activeTab === "wishlist" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C5A059] rounded-full" />
                    )}
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "orders" && (
                  <div className="space-y-6">
                    {details.orders.length === 0 ? (
                      <div className="text-center py-16 bg-brand-light/30 border border-dashed border-brand/10 rounded-3xl flex flex-col items-center">
                        <Package className="w-8 h-8 text-black/20 mb-3" />
                        <p className="text-xs font-bold text-black/40 uppercase tracking-widest">No orders placed by this client</p>
                      </div>
                    ) : (
                      details.orders.map((order) => (
                        <div key={order.id} className="border border-brand/10 rounded-[2rem] p-6 space-y-6 bg-brand-light/20">
                          {/* Order Meta Header */}
                          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-brand/5 pb-4">
                            <div>
                              <p className="text-xs font-black text-black/40 uppercase tracking-widest">Order ID: #00{order.id}</p>
                              <p className="text-xs font-semibold text-black/60 mt-1">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-3 items-center">
                              <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-[#C5A059]/10 text-[#C5A059]'
                              }`}>
                                {order.status}
                              </span>
                              <span className="text-base font-black text-black">₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="divide-y divide-brand/5">
                            {order.items.map((item) => (
                              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center space-x-4">
                                  <div className="w-14 h-14 bg-white border border-brand/5 rounded-xl overflow-hidden flex-shrink-0">
                                    <img 
                                      src={getProductImage(item.productImages)} 
                                      alt={item.productName || "Product"} 
                                      className="w-full h-full object-cover"
                                      onError={e => e.currentTarget.src = "/images/placeholder.png"}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-black text-sm">{item.productName || "Product"}</p>
                                    <div className="flex space-x-4 text-[10px] font-bold text-black/40 uppercase tracking-wider mt-1">
                                      <span>Size: {item.size}</span>
                                      {item.color && <span>Color: {item.color}</span>}
                                      <span>Qty: {item.quantity}</span>
                                    </div>
                                    {renderCustomizations(item.customizations)}
                                  </div>
                                </div>
                                <div className="text-right w-full md:w-auto font-black text-black text-sm">
                                  ₹{item.price.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Details */}
                          {order.shippingAddress && (
                            <div className="border-t border-brand/5 pt-4 flex items-start space-x-3 text-xs font-semibold text-black/60">
                              <MapPin size={16} className="text-[#C5A059] flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">Shipping Address</p>
                                <p>{order.shippingAddress}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "cart" && (
                  <div className="space-y-6">
                    {details.cart.length === 0 ? (
                      <div className="text-center py-16 bg-brand-light/30 border border-dashed border-brand/10 rounded-3xl flex flex-col items-center">
                        <ShoppingCart className="w-8 h-8 text-black/20 mb-3" />
                        <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Cart is empty</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {details.cart.map((item) => (
                          <div key={item.id} className="border border-brand/5 bg-brand-light/20 rounded-3xl p-5 flex space-x-4">
                            <div className="w-20 h-20 bg-white border border-brand/5 rounded-2xl overflow-hidden flex-shrink-0">
                              <img 
                                src={getProductImage(item.productImages)} 
                                alt={item.productName || "Product"} 
                                className="w-full h-full object-cover"
                                onError={e => e.currentTarget.src = "/images/placeholder.png"}
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-black text-sm truncate">{item.productName || "Product"}</h4>
                                <div className="flex space-x-3 text-[9px] font-black text-black/40 uppercase tracking-wider mt-1">
                                  <span>Base: {item.baseSize}</span>
                                  <span>Qty: {item.quantity}</span>
                                </div>
                                {renderCustomizations(item.customSpecifications)}
                              </div>
                              <div className="flex justify-between items-baseline mt-3 border-t border-brand/5 pt-2">
                                <span className="text-[9px] font-black text-black/30 uppercase tracking-wider">Price</span>
                                <span className="font-black text-sm text-[#C5A059]">₹{item.price.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "wishlist" && (
                  <div>
                    {details.wishlist.length === 0 ? (
                      <div className="text-center py-16 bg-brand-light/30 border border-dashed border-brand/10 rounded-3xl flex flex-col items-center">
                        <Heart className="w-8 h-8 text-black/20 mb-3" />
                        <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Wishlist is empty</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {details.wishlist.map((item) => (
                          <div key={item.id} className="border border-brand/5 bg-brand-light/20 rounded-3xl p-4 flex flex-col items-center text-center">
                            <div className="w-full aspect-[4/5] bg-white rounded-2xl overflow-hidden shadow-sm border border-brand/5 relative mb-3">
                              <img 
                                src={getProductImage(item.productImages)} 
                                alt={item.productName || "Product"} 
                                className="w-full h-full object-cover"
                                onError={e => e.currentTarget.src = "/images/placeholder.png"}
                              />
                            </div>
                            <h4 className="font-bold text-black text-xs w-full truncate leading-tight mb-1">{item.productName || "Product"}</h4>
                            <span className="font-black text-xs text-[#C5A059]">
                              ₹{(item.salePrice || item.basePrice).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 2. List view */
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-10 text-center flex flex-col items-center">
            <h1 className="text-4xl font-playfair font-bold text-black">Customer Management</h1>
            <p className="mt-2 text-black/60 font-medium">View and manage your registered boutique clientele.</p>
          </div>

          <div className="mb-10 flex justify-center">
            <div className="relative group min-w-[300px] max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-[#C5A059] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-brand/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#C5A059]/5 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-brand/5 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand/5 border-b border-brand/10">
                  <th className="px-4 md:px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Customer Details</th>
                  <th className="px-4 md:px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Phone Number</th>
                  <th className="px-4 md:px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Role</th>
                  <th className="px-4 md:px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Joined On</th>
                  <th className="px-4 md:px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/5">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-brand/5 transition-all group">
                    <td className="px-4 md:px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#C5A059]/10 rounded-xl flex items-center justify-center text-[#C5A059] font-black text-sm">
                          {customer.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-black">{customer.fullName || "Guest User"}</p>
                          <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-0.5">ID: #00{customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6">
                      <button 
                        onClick={() => handleCustomerClick(customer.id)}
                        className="flex items-center space-x-2 text-black/60 hover:text-[#C5A059] transition-colors focus:outline-none text-left"
                      >
                        <Phone size={14} className="text-[#C5A059]" />
                        <span className="font-bold text-sm tracking-widest hover:underline">+91 {customer.phoneNumber}</span>
                      </button>
                    </td>
                    <td className="px-4 md:px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        customer.role === "admin" ? "bg-[#8c6239] text-[#C5A059]" : "bg-brand/5 text-black/60"
                      }`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-6 text-sm text-black/40 font-bold tracking-tight">
                      {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 md:px-8 py-6 text-right">
                      <button 
                        onClick={() => handleCustomerClick(customer.id)}
                        className="p-2 bg-brand-light border border-brand/5 rounded-xl hover:bg-[#C5A059]/10 hover:text-white transition-all text-black"
                        title="View Details"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCustomers.length === 0 && (
              <div className="py-32 text-center">
                <div className="w-16 h-16 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={32} className="text-black/20" />
                </div>
                <p className="text-black/40 font-bold uppercase tracking-widest text-xs">No customers found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
