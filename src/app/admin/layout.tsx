"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Shirt,
  Package,
  Users,
  LogOut,
  ChevronRight,
  Sparkles,
  Box,
  BarChart3,
  AlertTriangle,
  X,
  Settings,
  LayoutGrid,
  Calendar,
  Ticket,
  Menu,
  MessageSquare,
  HelpCircle,
  FileText,
  Video
} from "lucide-react";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Inventory", href: "/admin/inventory", icon: Box },
  { name: "Orders", href: "/admin/orders", icon: Package },
  { name: "Navbar Settings", href: "/admin/navigation", icon: Map },
  { name: "Products", href: "/admin/products", icon: Shirt },
  { name: "Category Settings", href: "/admin/categories", icon: LayoutGrid },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Reels Settings", href: "/admin/reels", icon: Video },
  { name: "FAQs Settings", href: "/admin/faqs", icon: HelpCircle },
  { name: "Coupons", href: "/admin/coupons", icon: Ticket },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "About Section", href: "/admin/about", icon: Sparkles },
  { name: "Site Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Don't show sidebar on login/denied pages
  if (pathname === "/admin/login" || pathname === "/admin/denied") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-screen bg-brand-light font-inter overflow-hidden relative">
      {/* Sidebar Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-[#8c6239]/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-60 bg-[#8c6239] text-white flex flex-col shadow-2xl fixed inset-y-0 z-50 transition-transform duration-300 ${
        isMobileSidebarOpen 
          ? "translate-x-0" 
          : isDesktopSidebarOpen 
            ? "md:translate-x-0 -translate-x-full" 
            : "-translate-x-full"
      }`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group" onClick={() => setIsMobileSidebarOpen(false)}>
            <div className="w-9 h-9 flex items-center justify-center bg-transparent group-hover:scale-105 transition-transform">
              <img src="/logo_fin.png" alt="Dry Fish Basket Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-gabriola font-bold text-xl tracking-wide leading-none">Dry Fish Basket</h1>
              <p className="text-[8px] uppercase tracking-[0.2em] text-[#C5A059] font-black mt-1">Admin Panel</p>
            </div>
          </Link>
          <button 
            onClick={() => {
              setIsMobileSidebarOpen(false);
              setIsDesktopSidebarOpen(false);
            }} 
            className="p-2 text-[#C5A059] hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer animate-in fade-in duration-300"
          >
            <LayoutDashboard size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto min-h-0 p-4 space-y-1 mt-4 custom-scrollbar">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${isActive
                    ? "bg-[#C5A059] text-[#8c6239] shadow-lg translate-x-1"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center space-x-4">
                  <Icon size={18} className={isActive ? "text-[#8c6239]" : "text-[#C5A059]/60 group-hover:text-[#C5A059]"} />
                  <span className="text-sm font-bold tracking-tight">{link.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all group"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-grow min-w-0 h-full overflow-hidden flex flex-col relative transition-all duration-300 ${
        isDesktopSidebarOpen ? "md:ml-60 ml-0" : "ml-0"
      }`}>
        {/* Desktop Floating Icon (Only when sidebar is collapsed) */}
        {!isDesktopSidebarOpen && (
          <button
            onClick={() => setIsDesktopSidebarOpen(true)}
            className="hidden md:flex absolute top-4 left-6 z-40 p-1 hover:bg-[#8c6239]/10 rounded-xl transition-all text-white cursor-pointer items-center justify-center animate-in fade-in duration-300"
          >
            <div className="relative w-8 h-8 group">
              {/* Dry Fish Basket Logo Icon */}
              <div className="absolute inset-0 bg-transparent flex items-center justify-center group-hover:scale-0 opacity-100 group-hover:opacity-0 transition-all duration-200">
                <img src="/logo_fin.png" alt="Dry Fish Basket Logo" className="w-full h-full object-contain" />
              </div>
              {/* Dashboard Icon on hover */}
              <div className="absolute inset-0 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-[#8c6239] text-white rounded-full transition-all duration-200">
                <LayoutDashboard size={20} />
              </div>
            </div>
          </button>
        )}

        {/* Mobile Floating Icon (Only when sidebar is closed) */}
        {!isMobileSidebarOpen && (
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex md:hidden absolute top-4 left-6 z-40 p-2 bg-[#8c6239] text-white rounded-xl transition-all shadow-md items-center justify-center animate-in fade-in duration-300 active:scale-95"
          >
            <LayoutDashboard size={20} />
          </button>
        )}

        {/* Header decoration */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#C5A059]/20 to-transparent flex-shrink-0"></div>
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#8c6239]/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#8c6239] mb-2">Confirm Logout</h3>
              <p className="text-[#8c6239]/60 text-sm mb-8">Are you sure you want to exit the admin panel? You will need to login again to access these settings.</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#8c6239]/40 hover:text-[#8c6239] hover:bg-brand-light transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Logout
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 p-2 text-[#8c6239]/20 hover:text-[#8c6239] transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
