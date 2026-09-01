"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MapPin, Mail, Globe, ArrowUp, ShieldCheck } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer for Admin Portal
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full flex flex-col font-serif select-none">
      <footer id="contact-us" className="w-full bg-[#8c6239] pt-16 pb-12 px-6 md:px-12 text-[#FFFDF6]/90 font-serif border-t border-[#fcd34d]/20 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Brand & Slogan */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl border border-white/20 p-1">
                <img src="/images/vk_logo_transparent.png" alt="Dry Fish Basket Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#fcd34d] tracking-wide leading-none">
                  Dry Fish Basket
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#FFFDF6]/70 font-sans mt-1">Authentic Coastal Delicacies</p>
              </div>
            </div>

            <p className="text-xs text-[#FFFDF6]/85 leading-relaxed font-sans">
              Traditional taste from the Godavari coastal belt. FSSAI licensed &amp; 100% hygienic processing.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#fcd34d] font-sans font-bold">
              <ShieldCheck size={16} />
              <span>100% Quality Guaranteed</span>
            </div>
          </div>

          {/* Column 2: Contact Details */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#fcd34d] tracking-wide border-b border-[#fcd34d]/20 pb-2">
              Contact Us
            </h3>
            <ul className="space-y-3.5 text-xs font-sans text-[#FFFDF6]/90">
              {/* Phone Numbers */}
              <li className="flex items-start gap-3">
                <div className="p-2 bg-white/10 rounded-xl text-[#fcd34d] shrink-0 mt-0.5">
                  <Phone size={15} />
                </div>
                <div className="flex flex-col space-y-0.5">
                  <a href="tel:+919848160769" className="hover:text-[#fcd34d] transition-colors font-medium">+91 98481 60769</a>
                  <a href="tel:+919848357279" className="hover:text-[#fcd34d] transition-colors font-medium">+91 98483 57279</a>
                </div>
              </li>

              {/* Address */}
              <li className="flex items-start gap-3">
                <div className="p-2 bg-white/10 rounded-xl text-[#fcd34d] shrink-0 mt-0.5">
                  <MapPin size={15} />
                </div>
                <div className="leading-relaxed">
                  <p className="font-medium">H.No 806, Sahabhavana Township,</p>
                  <p>Bandlaguda Nagole,</p>
                  <p className="text-[#fcd34d] font-semibold">Hyderabad - 500068</p>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl text-[#fcd34d] shrink-0">
                  <Mail size={15} />
                </div>
                <a href="mailto:info@vkdryfishbasket.com" className="hover:text-[#fcd34d] transition-colors font-medium break-all">
                  info@vkdryfishbasket.com
                </a>
              </li>

              {/* Website */}
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl text-[#fcd34d] shrink-0">
                  <Globe size={15} />
                </div>
                <a href="https://www.vkdryfishbasket.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#fcd34d] transition-colors font-medium">
                  www.vkdryfishbasket.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#fcd34d] tracking-wide border-b border-[#fcd34d]/20 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs font-sans text-[#FFFDF6]/85">
              <li>
                <Link href="/search" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Search Store
                </Link>
              </li>
              <li>
                <Link href="/category/dry-fish" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Buy Dry Fish Online
                </Link>
              </li>
              <li>
                <Link href="/profile/orders" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/cancellation-returns" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Refund &amp; Return Policy
                </Link>
              </li>
              <li>
                <Link href="/my-story" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Delivery Locations */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#fcd34d] tracking-wide border-b border-[#fcd34d]/20 pb-2">
              Delivery Locations
            </h3>
            <ul className="space-y-2.5 text-xs font-sans text-[#FFFDF6]/85">
              <li>
                <Link href="/location/hyderabad" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Dry Fish in Hyderabad
                </Link>
              </li>
              <li>
                <Link href="/location/mumbai" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Dry Fish in Mumbai
                </Link>
              </li>
              <li>
                <Link href="/location/delhi" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Dry Fish in Delhi
                </Link>
              </li>
              <li>
                <Link href="/location/chennai" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Dry Fish in Chennai
                </Link>
              </li>
              <li>
                <Link href="/location/bangalore" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Dry Fish in Bangalore
                </Link>
              </li>
              <li>
                <Link href="/location/kolkata" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all">
                  Dry Fish in Kolkata
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#fcd34d] hover:translate-x-1 inline-block transition-all font-semibold">
                  Dry Fish Wholesale Inquiry
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </footer>

      {/* Dark Footer Bottom Bar */}
      <div className="w-full bg-[#1e140d] py-5 px-6 md:px-12 text-[#FFFDF6]/60 text-xs font-sans border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Dry Fish Basket. All Rights Reserved.</p>
          
          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/terms-conditions" className="hover:text-[#fcd34d] transition-colors">Terms &amp; Conditions</Link>
            <Link href="/privacy-policy" className="hover:text-[#fcd34d] transition-colors">Privacy Policy</Link>
            
            <button
              onClick={handleBackToTop}
              className="flex items-center gap-1.5 bg-[#8c6239] text-[#fcd34d] hover:bg-[#a07243] px-3 py-1.5 rounded-full font-bold transition-all shadow-md cursor-pointer ml-2"
            >
              <span>Top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
