import React from "react";

export const metadata = {
  title: "Shipping Policy / Delivery Policy - Dry Fish Basket",
  description: "Read the official Shipping and Delivery Policy of Dry Fish Basket.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAF6ED] text-[#3b2314] font-sans selection:bg-[#8c6239]/20 pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-3xl md:text-5xl font-serif font-black text-[#8c6239] mb-10 tracking-wide">
          Shipping Policy
        </h1>

        <div className="space-y-8 text-sm text-black/85 leading-relaxed font-medium bg-white p-8 md:p-12 rounded-3xl border border-[#8c6239]/10 shadow-sm">
          
          {/* Section 1: Shipment processing time */}
          <div className="space-y-3">
            <h2 className="text-xl font-serif font-bold text-[#8c6239]">
              Shipment processing time
            </h2>
            <p>All orders within India will be delivered within 3-7 business days.</p>
            <p>All International shipments will be delivered as per the destination, please reach out to our customer support for additional details.</p>
            <p>All sweets, snacks, pickles, and special food items require 1 day preparation so that the orders will be delayed by 1 day.</p>
          </div>

          {/* Section 2: Shipment confirmation and order tracking */}
          <div className="space-y-3 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl font-serif font-bold text-[#8c6239]">
              Shipment confirmation and order tracking
            </h2>
            <p>We use multiple services based on your delivery location, once after our shipment has started you will receive emails and mobile notification about shipment tracking.</p>
          </div>

          {/* Section 3: Customs, duties, and taxes */}
          <div className="space-y-3 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl font-serif font-bold text-[#8c6239]">
              Customs, duties, and taxes
            </h2>
            <p>All custom duties and taxes should be paid by the customer. We do not take any responsibility for the same.</p>
          </div>

          {/* Section 4: Damages */}
          <div className="space-y-3 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl font-serif font-bold text-[#8c6239]">
              Damages
            </h2>
            <p>Any damages during the shipment is not our concern, however every shipment has been insured by the specified amount which customers can pay while check out and will be able to claim the insured amount. All damages should be reported with photo or video proof within 24 hours of delivery.</p>
          </div>

          {/* Section 5: International Shipping Policy */}
          <div className="space-y-3 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl font-serif font-bold text-[#8c6239]">
              International Shipping Policy
            </h2>
            <p>At Dry Fish Basket we do not import or export any goods from India to any other countries. You may place the order online for international countries through our partners but Dry Fish Basket is not liable for shipment of your goods. You may contact the vendor directly on <a href="mailto:info@vkdryfishbasket.com" className="text-[#8c6239] hover:underline font-semibold">info@vkdryfishbasket.com</a> further to any queries all the import and export duties should be borne by you only.</p>
          </div>

          {/* Section 6: Incorrect Address or Contact Information */}
          <div className="space-y-3 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl font-serif font-bold text-[#8c6239]">
              Incorrect Address or Contact Information
            </h2>
            <p>The customer is solely responsible for providing a complete, accurate, and deliverable shipping address along with a valid contact number at the time of placing the order.</p>
            <p>If the customer provides an incorrect, incomplete, invalid, or unreachable contact number, or an incorrect, incomplete, or undeliverable shipping address, and the shipment cannot be successfully delivered, no further delivery attempts shall be made by Dry Fish Basket or its logistics partners.</p>
            <p>In such cases, the shipment will be returned to the designated warehouse or return facility. The customer may request re-dispatch of the same shipment to a corrected address only after payment of all applicable re-shipping, handling, storage, and administrative charges as determined by Dry Fish Basket.</p>
            <p>No refund, replacement, exchange, cancellation, credit note, or compensation shall be provided for orders returned due to incorrect or incomplete customer-provided information. Any products that are perishable, food-related, or have limited shelf life may become ineligible for re-dispatch at the sole discretion of Dry Fish Basket.</p>
            <p>Dry Fish Basket shall not be held liable for any loss, damage, delay, deterioration of product quality, or additional expenses arising from incorrect customer-provided contact details or shipping information.</p>
          </div>

        </div>
      </div>
    </main>
  );
}
