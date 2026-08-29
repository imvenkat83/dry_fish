"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <footer id="contact-us" className="w-full bg-[#8c6239] pt-14 pb-12 px-6 md:px-12 text-[#FFFDF6]/90 font-serif">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Info and Address */}
          <div className="md:col-span-2 flex flex-col pr-0 md:pr-10">
            <h3 className="text-2xl font-serif font-bold text-[#fcd34d] mb-4 tracking-wide">
              Dry Fish Basket
            </h3>
            <p className="text-sm text-[#FFFDF6]/85 leading-relaxed mb-3 font-serif">
              Traditional taste from the Godavari coastal belt. FSSAI licensed &amp; hygienic processing.
            </p>
            <p className="text-sm text-[#FFFDF6]/85 italic leading-relaxed mb-5 font-serif">
              Now delivering to Hyderabad, Bangalore, Chennai, Mumbai, Pune, Delhi &amp; across India.
            </p>
            <div className="text-sm text-[#FFFDF6]/90 space-y-1 font-serif">
              <p className="font-bold text-[#fcd34d] tracking-wide mb-1">Address:</p>
              <p>Bhimavaram</p>
              <p>ANDHRAPRADESH - 534204</p>
              <p className="pt-3">
                call : <a href="tel:+919676344465" className="hover:text-[#fcd34d] hover:underline transition-colors">+91-9676344465</a>
              </p>
              <p>
                <a href="mailto:info@vkdryfishbasket.com" className="hover:text-[#fcd34d] hover:underline transition-colors">info@vkdryfishbasket.com</a>
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col">
            <h3 className="text-lg font-serif font-bold text-[#fcd34d] mb-4 tracking-wide">
              Quick links
            </h3>
            <ul className="space-y-2.5 text-sm font-normal text-[#FFFDF6]/85 font-serif">
              <li>
                <Link href="/search" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/category/dry-fish" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Buy Dry Fish Online
                </Link>
              </li>
              <li>
                <Link href="/profile/orders" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/cancellation-returns" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Refund & Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Delivery Locations */}
          <div className="flex flex-col">
            <h3 className="text-lg font-serif font-bold text-[#fcd34d] mb-4 tracking-wide">
              Our Dry Fish Delivery Locations
            </h3>
            <ul className="space-y-2.5 text-sm font-normal text-[#FFFDF6]/85 font-serif">
              <li>
                <Link href="/location/mumbai" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Dry Fish in Mumbai
                </Link>
              </li>
              <li>
                <Link href="/location/hyderabad" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Dry Fish in Hyderabad
                </Link>
              </li>
              <li>
                <Link href="/location/delhi" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Dry Fish in Delhi
                </Link>
              </li>
              <li>
                <Link href="/location/chennai" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Dry Fish in Chennai
                </Link>
              </li>
              <li>
                <Link href="/location/bangalore" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Dry Fish in Bangalore
                </Link>
              </li>
              <li>
                <Link href="/location/kolkata" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Dry Fish in Kolkata
                </Link>
              </li>
              <li>
                <Link href="/all" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Dry Fish Price
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#fcd34d] hover:underline transition-colors">
                  Dry Fish Wholesale
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </footer>

      {/* Dark Footer Bottom Bar */}
      <div className="w-full bg-[#252525] py-4 px-6 md:px-12 text-[#FFFDF6]/50 text-[11px] font-medium border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p>&copy; 2026 Dry Fish Basket</p>
          <div className="flex gap-4">
            <Link href="/terms-conditions" className="hover:underline hover:text-white transition-colors">Terms and Conditions</Link>
            <Link href="/privacy-policy" className="hover:underline hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
