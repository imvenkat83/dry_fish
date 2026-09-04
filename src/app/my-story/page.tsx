"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Star, X } from "lucide-react";

export default function MyStory() {
  const [isWhyChooseModalOpen, setIsWhyChooseModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAF6ED] text-[#3b2314] font-sans selection:bg-[#8c6239]/20 pb-20">
      
      {/* 1. Header & Main Intro Section */}
      <section className="max-w-4xl mx-auto px-6 pt-12 pb-10 text-center space-y-6">
        <h1 className="text-3xl md:text-5xl font-serif font-black text-[#8c6239] leading-tight">
          About Us – Dry Fish Basket
        </h1>
        <div className="w-24 h-1 bg-[#8c6239]/20 mx-auto rounded-full"></div>
        <p className="text-xs md:text-sm text-black/75 font-medium leading-relaxed max-w-3xl mx-auto text-justify md:text-center">
          At Dry Fish Basket, we bring you authentic coastal flavours of Andhra Pradesh using traditional, time-honoured methods from the coastal region. Based in Bhimavaram, we work with trusted fishermen who follow sustainable practices to deliver premium, hygienically processed dry fish across India. Every batch is naturally sun-dried, carefully cleaned, and packed in food-grade, moisture-free packaging to preserve purity, freshness, and nutrition.
        </p>
      </section>

      {/* 2. Split Process / Why Choose Us Section */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
          
          {/* Left Column: Authentic Dry Fish & Prawns Varieties */}
          <div className="relative rounded-[2rem] overflow-hidden border border-[#8c6239]/15 shadow-md min-h-[380px] md:min-h-[440px] bg-brand/5 group">
            <img
              src="/images/about_dry_fish_varieties.jpg"
              alt="Authentic Dry Fish and Dry Prawns varieties at Dry Fish Basket"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#8c6239] px-3 py-1 rounded-full text-[#FAF6ED] shadow-sm inline-block">
                Authentic Coastal Heritage
              </span>
              <p className="text-xs font-semibold text-white/95 drop-shadow-md">
                Traditionally sun-dried prawns, fish, and authentic Andhra seafood varieties.
              </p>
            </div>
          </div>

          {/* Right Column: Why Choose Dry Fish Basket text */}
          <div className="bg-[#FAF6ED] border border-[#8c6239]/15 rounded-[2rem] p-8 flex flex-col justify-center space-y-4 shadow-sm text-left">
            <h2 className="text-lg md:text-xl font-serif font-black text-[#8c6239] flex items-center gap-2">
              🔥 Why Choose Dry Fish Basket?
            </h2>
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest block">
              December 9, 2025
            </span>
            <p className="text-xs md:text-sm text-black/75 font-medium leading-relaxed">
              Why Choose Dry Fish Basket? At Dry Fish Basket, we don't just sell seafood; we deliver a piece of our coastal heritage. Here is why thousands of seafood lovers across India trust us:...
            </p>
            <div className="pt-2">
              <button 
                type="button"
                onClick={() => setIsWhyChooseModalOpen(true)}
                className="text-xs font-black uppercase tracking-wider text-[#8c6239] hover:underline cursor-pointer focus:outline-none"
              >
                Read more...
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2.5. Official FSSAI License & Registration Section */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white border border-[#8c6239]/15 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8c6239] bg-[#8c6239]/10 px-4 py-1.5 rounded-full inline-block">
              Government Food Safety Certification
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-black text-[#8c6239]">
              FSSAI Registered &amp; Licensed Store
            </h2>
            <p className="text-xs md:text-sm text-black/70 max-w-2xl mx-auto">
              Dry Fish Basket is officially registered under the <strong>Food Safety and Standards Authority of India (FSSAI)</strong>, ensuring 100% hygienic, safe, and quality-tested processing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Registration Card Image */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-[#8c6239]/20 shadow-lg bg-white max-w-md w-full p-2 group hover:scale-[1.01] transition-transform duration-300">
                <img
                  src="/images/fssai_registration_card.png"
                  alt="FSSAI Registration ID Card - VK-DRY FISH BASKET"
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            </div>

            {/* Registration Details Grid */}
            <div className="lg:col-span-6 space-y-4 text-xs md:text-sm">
              <div className="bg-[#FAF6ED] p-5 rounded-2xl border border-[#8c6239]/10 space-y-3">
                <div className="flex items-center justify-between border-b border-[#8c6239]/10 pb-2">
                  <span className="text-black/60 font-medium">Registration ID:</span>
                  <span className="font-bold text-[#8c6239] font-mono text-sm">23626009000082</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#8c6239]/10 pb-2">
                  <span className="text-black/60 font-medium">Registered Name:</span>
                  <span className="font-bold text-black">VK-DRY FISH BASKET</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#8c6239]/10 pb-2">
                  <span className="text-black/60 font-medium">Fee Paid Upto:</span>
                  <span className="font-bold text-green-700">01-09-2027</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#8c6239]/10 pb-2">
                  <span className="text-black/60 font-medium">Issued On:</span>
                  <span className="font-semibold text-black">02-09-2026</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#8c6239]/10 pb-2">
                  <span className="text-black/60 font-medium">Issuing Authority:</span>
                  <span className="font-semibold text-black">Malkaigiri Municipal Corp.</span>
                </div>
                <div className="flex items-start justify-between pt-1">
                  <span className="text-black/60 font-medium shrink-0">Business Scope (KOB):</span>
                  <span className="font-semibold text-[#8c6239] text-right">Wholesaler, Retailer, General Manufacturing</span>
                </div>
              </div>

              <p className="text-[11px] text-black/50 italic leading-relaxed">
                * This Registration ID card is issued under the provisions laid down under the Food Safety and Standards Act, 2006.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Pop-up Modal */}
      {isWhyChooseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#8c6239]/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsWhyChooseModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-xl max-h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-[#8c6239]/15">
            {/* Header */}
            <div className="p-6 border-b border-[#8c6239]/10 flex items-center justify-between bg-brand/5">
              <h2 className="text-base md:text-lg font-serif font-black text-[#8c6239] flex items-center gap-2">
                🔥 Why Choose Dry Fish Basket?
              </h2>
              <button
                onClick={() => setIsWhyChooseModalOpen(false)}
                className="p-2 text-black hover:bg-[#8c6239]/10 rounded-full transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image Banner */}
            <div className="w-full h-44 overflow-hidden relative border-b border-[#8c6239]/10 shrink-0">
              <img
                src="/images/about_dry_fish_varieties.jpg"
                alt="Dry Fish Basket Varieties"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-5 text-white">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#8c6239] px-3 py-1 rounded-full text-[#FAF6ED] shadow-sm">
                  100% Sun-Dried &bull; Zero Chemicals
                </span>
              </div>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[#3b2314] custom-scrollbar">
              <p className="text-xs md:text-sm font-semibold text-black/80 italic">
                At dryfishbasket.in, we don't just sell seafood; we deliver a piece of our coastal heritage. Here is why thousands of seafood lovers across India trust us:
              </p>

              <div className="space-y-5 text-xs md:text-sm">
                {/* Point 1 */}
                <div className="space-y-1">
                  <h3 className="font-bold text-[#8c6239] text-xs uppercase tracking-wider">🐟 Authentic Taste</h3>
                  <p className="text-black/75 leading-relaxed">
                    Sourced directly from the pristine coastlines, our fish carries the legendary "Andhra Style" flavor that is hard to find in big cities. From <strong>Nethallu (Anchovies)</strong> to <strong>Endu Royyalu (Dry Prawns)</strong>, every bite takes you back to the roots of traditional coastal cooking.
                  </p>
                </div>

                {/* Point 2 */}
                <div className="space-y-2">
                  <h3 className="font-bold text-[#8c6239] text-xs uppercase tracking-wider">💎 Premium Quality, Zero Chemicals</h3>
                  <p className="text-black/75 leading-relaxed">
                    We believe that what is good for the soul should be good for the body.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-black/75">
                    <li><strong>100% Natural:</strong> Naturally sun-dried using traditional methods.</li>
                    <li><strong>No Hidden Nasties:</strong> Zero urea, no artificial colors, and no harmful preservatives.</li>
                    <li><strong>Clean & Hygienic:</strong> Processed in controlled environments to ensure you get sand-free, high-protein seafood.</li>
                  </ul>
                </div>

                {/* Point 3 */}
                <div className="space-y-1">
                  <h3 className="font-bold text-[#8c6239] text-xs uppercase tracking-wider">💰 Direct from Source, Low Prices</h3>
                  <p className="text-black/75 leading-relaxed">
                    By cutting out the middleman and sourcing directly from local fishing communities, we provide <strong>Export Quality</strong> dry fish at <strong>Wholesale Prices</strong>. You get premium seafood without the premium price tag.
                  </p>
                </div>

                {/* Point 4 */}
                <div className="space-y-2">
                  <h3 className="font-bold text-[#8c6239] text-xs uppercase tracking-wider">🚚 Pan-India Doorstep Delivery</h3>
                  <p className="text-black/75 leading-relaxed">
                    Missing the taste of home in Bangalore, Mumbai, Kolkata, or Chennai? We've got you covered!
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-black/75">
                    <li><strong>Odor-Proof Packaging:</strong> Our specialized vacuum-sealing ensures that the aroma stays inside the pack until it reaches your kitchen.</li>
                    <li><strong>Pan-India Reach:</strong> We deliver to every corner of India with real-time tracking so you can plan your next meal with confidence.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-brand/5 border-t border-[#8c6239]/10 flex justify-end">
              <button
                onClick={() => setIsWhyChooseModalOpen(false)}
                className="bg-[#8c6239] hover:bg-[#734f2d] text-[#FAF6ED] px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
