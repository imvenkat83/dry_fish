"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Star, X } from "lucide-react";

export default function MyStory() {
  const [isWhyChooseModalOpen, setIsWhyChooseModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAF6ED] text-[#3b2314] font-sans selection:bg-[#8c6239]/20 pb-20">
      
      {/* 1. Header & Main Intro Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-10">
        <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-12">
          {/* Website Logo to the left */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full p-2 bg-white/70 border border-[#8c6239]/20 shadow-md flex items-center justify-center group hover:scale-105 transition-transform duration-300">
              <img
                src="/logo_fin.png"
                alt="Dry Fish Basket Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Intro Text moved to the right */}
          <div className="flex-1 text-center sm:text-left space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-black text-[#8c6239] leading-tight">
              About Us – VK Dry Fish Basket
            </h1>
            <div className="w-20 h-1 bg-[#8c6239]/25 rounded-full mx-auto sm:mx-0"></div>
            <p className="text-xs md:text-sm text-black/75 font-medium leading-relaxed text-justify sm:text-left">
              At Dry Fish Basket, we bring you authentic coastal flavours of Andhra Pradesh using traditional, time-honoured methods from the coastal region. Based in Bhimavaram, we work with trusted fishermen who follow sustainable practices to deliver premium, hygienically processed dry fish across India. Every batch is naturally sun-dried, carefully cleaned, and packed in food-grade, moisture-free packaging to preserve purity, freshness, and nutrition.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Split Process / Why Choose Us Section */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-stretch">
          
          {/* Left Column: Authentic Dry Fish & Prawns Varieties */}
          <div className="relative rounded-[2rem] overflow-hidden border border-[#8c6239]/15 shadow-sm bg-brand/5 group h-72 sm:h-80 md:h-auto min-h-[260px] md:min-h-0">
            <img
              src="/images/about_dry_fish_varieties.jpg"
              alt="Authentic Dry Fish and Dry Prawns varieties at Dry Fish Basket"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#8c6239] px-3 py-1 rounded-full text-[#FAF6ED] shadow-sm inline-block">
                Authentic Coastal Heritage
              </span>
              <p className="text-[11px] sm:text-xs font-semibold text-white/95 drop-shadow-md leading-snug">
                Traditionally sun-dried prawns, fish, and authentic Andhra seafood varieties.
              </p>
            </div>
          </div>

          {/* Right Column: Why Choose Dry Fish Basket text */}
          <div className="bg-[#FAF6ED] border border-[#8c6239]/15 rounded-[2rem] p-6 md:p-7 flex flex-col justify-between space-y-3 shadow-sm text-left">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg md:text-xl font-serif font-black text-[#8c6239] flex items-center gap-2">
                  🔥 Why Choose VK Dry Fish Basket?
                </h2>
                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                  December 9, 2025
                </span>
              </div>

              <p className="text-xs md:text-sm text-black/75 font-medium leading-relaxed">
                At Dry Fish Basket, we don't just sell seafood; we deliver a piece of our coastal heritage. Here is why seafood lovers across India trust us:
              </p>

              <ul className="space-y-2 text-xs text-black/80 font-medium pt-0.5">
                <li className="flex items-start gap-2">
                  <span className="text-sm shrink-0">🐟</span>
                  <span><strong>Authentic Taste:</strong> Sourced directly from Andhra coastlines for legendary flavor (Nethallu, Endu Royyalu, and more).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm shrink-0">💎</span>
                  <span><strong>100% Chemical-Free:</strong> Naturally sun-dried with zero urea, no added colors, and zero artificial preservatives.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm shrink-0">💰</span>
                  <span><strong>Direct from Source:</strong> Direct from Bhimavaram coastal fishermen for export quality at wholesale prices.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm shrink-0">🚚</span>
                  <span><strong>Odor-Proof Delivery:</strong> Specialized vacuum-sealed packaging delivered fresh to your doorstep across India.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-[#8c6239]/10">
              <button 
                type="button"
                onClick={() => setIsWhyChooseModalOpen(true)}
                className="text-xs font-black uppercase tracking-wider text-[#8c6239] hover:underline cursor-pointer focus:outline-none inline-flex items-center gap-1 group"
              >
                <span>Read more...</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2.5. Official FSSAI Certification Section */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-[#FAF6ED] border border-[#8c6239]/20 rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            
            {/* Left Column: Official FSSAI Logo directly on outer card */}
            <div className="w-full md:w-5/12 flex flex-col items-center justify-center text-center space-y-4">
              <img
                src="/images/fssai_logo.svg"
                alt="FSSAI Official Food Safety Logo"
                className="w-56 sm:w-64 md:w-72 h-auto object-contain"
              />
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-green-100/70 border border-green-300/80 text-green-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                <span>Government Certified &bull; Active License</span>
              </div>
            </div>

            {/* Right Column: Highlighted FSSAI ID & Trust Details */}
            <div className="w-full md:w-7/12 space-y-5 text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8c6239] bg-[#8c6239]/10 px-3 py-1 rounded-full inline-block mb-2">
                  Food Safety &amp; Standards Authority of India
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#8c6239]">
                  FSSAI Registered Store
                </h2>
                <p className="text-xs sm:text-sm text-black/70 mt-1 leading-relaxed">
                  Dry Fish Basket operates with complete adherence to national food safety guidelines, ensuring 100% clean, unadulterated, and hygienically processed seafood.
                </p>
              </div>

              {/* Highlighted FSSAI ID Box */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#8c6239]/30 shadow-sm space-y-2">
                <div className="text-[11px] font-black uppercase tracking-widest text-black/50">
                  FSSAI Registration ID
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-[#8c6239] select-all">
                  23626009000082
                </div>
                <div className="text-xs text-black/60 font-medium flex items-center gap-2 pt-2 border-t border-black/5">
                  <span className="font-semibold text-black/80">Registered Entity:</span>
                  <span className="font-bold text-black">VK-DRY FISH BASKET</span>
                </div>
              </div>

              {/* Verified Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white/80 rounded-xl p-3.5 border border-[#8c6239]/10 text-xs">
                  <div className="font-bold text-[#8c6239]">✓ 100% Chemical-Free</div>
                  <div className="text-[11px] text-black/60 mt-0.5 leading-snug">Naturally sun-dried with zero urea, colors, or artificial preservatives</div>
                </div>
                <div className="bg-white/80 rounded-xl p-3.5 border border-[#8c6239]/10 text-xs">
                  <div className="font-bold text-[#8c6239]">✓ Hygienic Processing</div>
                  <div className="text-[11px] text-black/60 mt-0.5 leading-snug">Carefully cleaned, sand-free, and sealed in odor-proof packaging</div>
                </div>
              </div>
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
                🔥 Why Choose VK Dry Fish Basket?
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
