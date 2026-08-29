"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X, LogOut, AlertCircle, BookOpen, Heart, Trash2, Calendar, Package, MapPin, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileDropdown from "./ProfileDropdown";
import SearchModal from "./SearchModal";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

type NavItem = {
  id: number;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();


  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ fullName: string | null; phoneNumber: string } | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Cart store hydration handling
  const [cartCount, setCartCount] = useState(0);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Wishlist store hooks
  const wishlistItems = useWishlistStore((state) => state.items);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    setCartCount(getTotalItems());

    // Sync cart with backend if user is logged in
    const syncCart = async () => {
      if (user && cartItems.length > 0) {
        try {
          await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: cartItems }),
          });
        } catch (error) {
          console.error("Failed to sync cart", error);
        }
      }
    };

    const timeoutId = setTimeout(syncCart, 1000); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [cartItems, getTotalItems, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Nav Items
        const navRes = await fetch("/api/admin/nav");
        if (navRes.ok) {
          const navData = await navRes.json();
          if (navData.success) {
            setNavItems(navData.data);
          }
        }

        // Fetch Categories
        const catRes = await fetch("/api/admin/homepage-categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.success) {
            setCategories(catData.data);
          }
        }

        // Fetch Session
        const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated) {
            setUser(sessionData.user);
            // Fetch wishlist
            fetchWishlist();
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }

    };

    fetchData();
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        clearCart();
        clearWishlist();
        setUser(null);
        setIsLogoutModalOpen(false);
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Hide Navbar for Admin Portal
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#FAF6ED] border-b border-[#8c6239]/10 shadow-sm font-serif">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center mr-2 sm:mr-4 md:mr-8">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="h-10 sm:h-11 w-auto flex items-center justify-center bg-transparent group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/logo_fin.png"
                    alt="Dry Fish Basket Logo"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <span className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#3b2314] tracking-wide hover:text-[#8c6239] transition-colors translate-y-[0.5px]">
                  Dry Fish Basket
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 ml-4 font-serif">
              <Link href="/" className="text-[#3b2314] hover:text-[#8c6239] text-base font-medium tracking-wide transition-colors">
                Home
              </Link>
              
              {/* Collections Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1 text-[#3b2314] hover:text-[#8c6239] text-base font-medium tracking-wide transition-colors py-2 cursor-pointer"
                >
                  <span>Collections</span>
                  <ChevronDown size={15} className="transition-transform duration-200 group-hover:rotate-180 text-[#8c6239]" />
                </button>

                {/* Dropdown Menu Popup */}
                <div className="absolute top-full left-0 w-60 bg-[#FAF6ED] border border-[#8c6239]/20 shadow-xl rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-left scale-95 group-hover:scale-100">
                  <div className="py-1">
                    {categories.length === 0 ? (
                      <div className="px-4 py-2.5 text-xs text-black/50 italic">No Collections Available</div>
                    ) : (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={cat.link || `/category/${cat.name.toLowerCase().trim().replace(/\s+/g, "-")}`}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#3b2314] hover:text-[#8c6239] hover:bg-[#8c6239]/10 text-sm font-medium transition-all group/item"
                        >
                          {cat.imageUrl && (
                            <img
                              src={cat.imageUrl.split(",")[0]}
                              alt={cat.name}
                              className="w-7 h-7 rounded-lg object-cover border border-[#8c6239]/15 shadow-sm group-hover/item:scale-105 transition-transform"
                            />
                          )}
                          <span className="capitalize">{cat.name}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <Link
                href="/contact"
                className={`hover:text-[#8c6239] text-base font-medium tracking-wide transition-colors ${
                  pathname === "/contact" ? "text-[#8c6239]" : "text-[#3b2314]"
                }`}
              >
                Contact
              </Link>
              <Link href="/my-story" className="text-[#3b2314] hover:text-[#8c6239] text-base font-medium tracking-wide transition-colors">
                About us
              </Link>
              <Link href="/blogs" className="text-[#3b2314] hover:text-[#8c6239] text-base font-medium tracking-wide transition-colors">
                Blog
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4 ml-auto text-[#3b2314]">
              {/* Search Icon triggers modal */}
              <Link
                href="/search"
                aria-label="Search"
                className="hover:text-[#8c6239] transition-colors p-2 cursor-pointer outline-none"
              >
                <Search className="h-5 w-5" />
              </Link>

              <Link
                href={user ? "/wishlist" : `/login?redirect=${encodeURIComponent(pathname)}`}
                aria-label="Wishlist"
                className="hover:text-[#8c6239] transition-colors relative p-2 cursor-pointer"
              >
                <Heart className="h-5 w-5" />
                {user && wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#8c6239] text-white text-[11px] font-sans font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link href={user ? "/cart" : "/login"} aria-label="Cart" className="hover:text-[#8c6239] transition-colors relative p-2">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#8c6239] text-white text-[11px] font-sans font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <ProfileDropdown
                  user={user}
                  onLogout={() => setIsLogoutModalOpen(true)}
                />
              ) : (
                <Link
                  href="/login"
                  aria-label="Login"
                  className="hover:text-[#8c6239] transition-colors relative p-2 cursor-pointer"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-1 sm:space-x-2">
              <Link href="/search" aria-label="Search" className="text-[#3b2314] hover:text-[#8c6239] p-1.5 sm:p-2 transition-colors">
                <Search className="h-5 w-5" />
              </Link>
              <Link
                href={user ? "/wishlist" : `/login?redirect=${encodeURIComponent(pathname)}`}
                aria-label="Wishlist"
                className="text-[#3b2314] hover:text-[#8c6239] transition-colors relative p-1.5 sm:p-2 cursor-pointer"
              >
                <Heart className="h-5 w-5" />
                {user && wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#8c6239] text-white text-[10px] font-sans font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link href={user ? "/cart" : "/login"} aria-label="Cart" className="text-[#3b2314] hover:text-[#8c6239] transition-colors relative p-1.5 sm:p-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 bg-[#8c6239] text-white text-[10px] font-sans font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#3b2314] hover:text-[#8c6239] focus:outline-none p-1.5 sm:p-2 transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 animate-in slide-in-from-top duration-300 font-serif">
            <div className="px-6 pt-8 pb-12 space-y-6 font-serif">

              {/* Navigation Links */}
              <div className="space-y-4">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white hover:text-[#eab308] text-sm font-medium uppercase tracking-widest transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/my-story"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white hover:text-[#eab308] text-sm font-medium uppercase tracking-widest transition-colors py-2"
                >
                  About Us
                </Link>
                <Link
                  href="/blogs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white hover:text-[#eab308] text-sm font-medium uppercase tracking-widest transition-colors py-2"
                >
                  Blog
                </Link>

                {/* Collections Section */}
                <div className="space-y-2 py-2">
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#C5A059]">Collections</h3>
                  <div className="flex flex-col space-y-1 pl-3 border-l border-white/20">
                    {categories.length === 0 ? (
                      <span className="text-white/50 py-2 text-xs font-medium uppercase tracking-wider">
                        No Collections Available
                      </span>
                    ) : (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={cat.link || `/category/${cat.name.toLowerCase().trim().replace(/\s+/g, "-")}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-white hover:text-[#C5A059] transition-colors py-2 text-xs font-medium uppercase tracking-wider flex items-center gap-2"
                        >
                          <span className="capitalize">{cat.name}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block hover:text-[#eab308] text-sm font-medium uppercase tracking-widest transition-colors py-2 ${
                    pathname === "/contact" ? "text-[#eab308]" : "text-white"
                  }`}
                >
                  Contact Us
                </Link>
              </div>

              <div className="border-t border-white/15" />

              {/* Account Section */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white opacity-80">Account</h3>

                {user ? (
                  <div className="space-y-2">
                    {/* User Info Header in Sidebar */}
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFFDF6] flex items-center justify-center text-[#064e3b] text-xs font-black shadow-sm">
                        {user.fullName ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 1) : "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black uppercase tracking-widest text-white truncate">{user.fullName || "User"}</div>
                        <div className="text-[9px] text-white/60 uppercase tracking-widest font-bold mt-0.5">{user.phoneNumber}</div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1 pl-1">
                      <Link
                        href="/account/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-white hover:text-[#eab308] transition-colors py-2.5"
                      >
                        <User className="h-4.5 w-4.5 text-white" />
                        <span className="text-sm font-bold uppercase tracking-wider">Edit Profile</span>
                      </Link>
                      <Link
                        href="/profile/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-white hover:text-[#eab308] transition-colors py-2.5"
                      >
                        <Package className="h-4.5 w-4.5 text-white" />
                        <span className="text-sm font-bold uppercase tracking-wider">My Orders</span>
                      </Link>
                      <Link
                        href="/account/address"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-white hover:text-[#eab308] transition-colors py-2.5"
                      >
                        <MapPin className="h-4.5 w-4.5 text-white" />
                        <span className="text-sm font-bold uppercase tracking-wider">My Addresses</span>
                      </Link>
                    </div>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-red-500/25 text-red-700 hover:text-red-900 hover:bg-red-500/5 transition-all font-bold uppercase tracking-widest text-[10px] cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = "/login";
                      }}
                      className="block w-full px-4 py-4 rounded-xl text-center text-xs font-black uppercase tracking-[0.2em] text-black bg-[#eab308] hover:bg-white hover:text-black shadow-lg relative z-10 transition-all cursor-pointer"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertCircle className="text-red-500 h-6 w-6" />
              </div>
              <h3 className="text-xl font-playfair font-bold text-black mb-2">Log out</h3>
              <p className="text-black/60 text-sm mb-8 leading-relaxed">
                Are you sure you want to log out from Dry Fish Basket? You'll need to verify your phone number to sign in again.
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-red-50 text-red-500 font-bold text-sm tracking-widest uppercase hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoggingOut ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Yes, Logout"
                  )}
                </button>
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  disabled={isLoggingOut}
                  className="w-full px-4 py-3.5 rounded-xl bg-brand text-white font-bold text-sm tracking-widest uppercase hover:bg-brand-hover transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Wishlist Sidebar Drawer Overlay */}
      <AnimatePresence>
        {isWishlistOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWishlistOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-md bg-[#FFFDF6] h-full shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-brand/5 flex items-center justify-between bg-brand/5">
                <div className="flex items-center space-x-2 text-black">
                  <Heart className="h-5 w-5 fill-[#064e3b] text-[#064e3b]" />
                  <span className="font-playfair text-lg font-bold">My Wishlist ({wishlistItems.length})</span>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="p-2 hover:bg-brand/10 rounded-full transition-all text-black cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-20 text-black/35">
                    <Heart className="mx-auto mb-4 opacity-20 text-black animate-pulse" size={48} />
                    <p className="text-xs font-black uppercase tracking-[0.25em] mb-4">Your wishlist is empty</p>
                    <button
                      onClick={() => {
                        setIsWishlistOpen(false);
                        router.push("/");
                      }}
                      className="mt-6 text-xs font-black uppercase tracking-widest bg-[#eab308] text-[#064e3b] px-6 py-3 rounded-xl hover:bg-brand-hover transition shadow-md cursor-pointer"
                    >
                      Explore Collections
                    </button>
                  </div>
                ) : (
                  wishlistItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 bg-brand/5 border border-brand/5 rounded-2xl group transition-all hover:bg-brand/10"
                    >
                      {/* Thumbnail and Info */}
                      <Link
                        href={`/product/${item.productId}`}
                        onClick={() => setIsWishlistOpen(false)}
                        className="flex items-center space-x-4 flex-1 min-w-0 pr-4"
                      >
                        <div className="w-16 h-20 bg-brand-light/30 rounded-xl overflow-hidden flex-shrink-0 border border-brand/5">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-black uppercase tracking-wider truncate mb-0.5">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-[#064e3b] font-bold uppercase tracking-widest mb-1">
                            {item.category}
                          </p>
                          <p className="text-xs font-bold text-[#064e3b]">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                      </Link>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/product/${item.productId}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="px-3 py-2 bg-[#C5A059] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#B38E46] transition shadow-sm"
                        >
                          Shop
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
                          aria-label="Remove"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}



