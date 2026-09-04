import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: "Return and Refund Policy - Dry Fish Basket",
  description: "Read the official Return and Refund Policy of Dry Fish Basket.",
};

export default function CancellationReturns() {
  return (
    <main className="min-h-screen bg-[#FAF6ED] text-[#3b2314] font-sans selection:bg-[#8c6239]/20 pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-3xl md:text-5xl font-serif font-black text-[#8c6239] mb-4 tracking-wide">
          Returns and Refund Policy
        </h1>
        <p className="text-xs text-black/50 mb-10">Last updated: July 23, 2020</p>

        <div className="space-y-8 text-sm text-black/85 leading-relaxed font-medium bg-white p-8 md:p-12 rounded-3xl border border-[#8c6239]/10 shadow-sm">
          
          <p>Thank you for shopping at Dry Fish Basket.</p>
          <p>If, for any reason, You are not completely satisfied with a purchase We invite You to review our policy on refunds and returns.</p>
          <p>The following terms are applicable for any products that You purchased with Us.</p>

          {/* Section 1: Interpretation and Definitions */}
          <div className="space-y-4 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#8c6239]">
              Interpretation and Definitions
            </h2>
            
            <h3 className="text-base font-bold text-[#3b2314]">Interpretation</h3>
            <p>
              The words of which the initial letter is capitalized have meanings defined under the following conditions.
              The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
            </p>

            <h3 className="text-base font-bold text-[#3b2314] pt-2">Definitions</h3>
            <p>For the purposes of this Return and Refund Policy:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
              </li>
              <li>
                <strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to Dry Fish Basket, H.No 806, Sahabhavana Township, Bandlaguda Nagole, Hyderabad - 500068.
              </li>
              <li>
                <strong>Service</strong> refers to the Website.
              </li>
              <li>
                <strong>Website</strong> refers to Dry Fish Basket, accessible from <a href="https://www.vkdryfishbasket.com" target="_blank" rel="noopener noreferrer" className="text-[#8c6239] hover:underline font-semibold">https://www.vkdryfishbasket.com/</a>
              </li>
              <li>
                <strong>Goods</strong> refer to the items offered for sale on the Service.
              </li>
              <li>
                <strong>Orders</strong> mean a request by You to purchase Goods from Us.
              </li>
            </ul>
          </div>

          {/* Section 2: Your Order Cancellation Rights */}
          <div className="space-y-4 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#8c6239]">
              Your Order Cancellation Rights
            </h2>
            <p>You are entitled to cancel Your Order within 2 hours without giving any reason for doing so.</p>
            <p>The deadline for cancelling an Order is 2 hours from the time on which You have placed the order. No cancellation is possible in case products have been shipped.</p>
            <p className="font-semibold text-red-700">Cancellation fees: 3% on the total transaction value will be deducted for payment gateway.</p>
            <p>In order to exercise Your right of cancellation, You must inform Us of your decision by means of a clear statement. You can inform us of your decision by:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>By email:</strong> <a href="mailto:info@vkdryfishbasket.com" className="text-[#8c6239] hover:underline font-semibold">info@vkdryfishbasket.com</a>
              </li>
              <li>
                <strong>By phone number:</strong> <a href="tel:+919848357279" className="text-[#8c6239] hover:underline font-semibold">+91 98483 57279</a>
              </li>
            </ul>
            <p>We will reimburse You no later than 7 days from the day on which We receive the returned Goods. We will use the same means of payment as You used for the Order, and You will not incur any fees for such reimbursement.</p>
          </div>

          {/* Section 3: Conditions for Returns */}
          <div className="space-y-4 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#8c6239]">
              Conditions for Returns
            </h2>
            <p>In order for the Goods to be eligible for a return, please make sure that:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>The Goods were purchased in the last 7 days</li>
              <li>The Goods are in the original packaging</li>
            </ul>

            <p className="font-bold text-[#3b2314] pt-2">The following Goods cannot be returned:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The supply of Goods made to Your specifications or clearly personalized.</li>
              <li>The supply of Goods which according to their nature are not suitable to be returned, deteriorate rapidly or where the date of expiry is over.</li>
              <li>The supply of Goods which are not suitable for return due to health protection or hygiene reasons and were unsealed after delivery.</li>
              <li>The supply of Goods which are, after delivery, according to their nature, inseparably mixed with other items.</li>
              <li>All food products, as we will be dealing with food products no returns are accepted under any circumstances.</li>
            </ul>
            <p>We reserve the right to refuse returns of any merchandise that does not meet the above return conditions in our sole discretion.</p>
            <p>Only regular priced Goods may be refunded. Unfortunately, Goods on sale cannot be refunded. This exclusion may not apply to You if it is not permitted by applicable law.</p>
          </div>

          {/* Section 4: Returning Goods */}
          <div className="space-y-4 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#8c6239]">
              Returning Goods
            </h2>
            <p>You are responsible for the cost and risk of returning the Goods to Us. You should send the Goods at the following address:</p>
            <div className="bg-[#FAF6ED] p-4 rounded-xl border border-[#8c6239]/15 font-semibold text-[#3b2314]">
              H.No 806, Sahabhavana Township, Bandlaguda Nagole, Hyderabad - 500068
            </div>
            <p>We cannot be held responsible for Goods damaged or lost in return shipment. Therefore, We recommend an insured and trackable mail service. We are unable to issue a refund without actual receipt of the Goods or proof of received return delivery.</p>
          </div>

          {/* Section 5: Gifts */}
          <div className="space-y-4 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#8c6239]">
              Gifts
            </h2>
            <p>If the Goods were marked as a gift when purchased and then shipped directly to you, You&apos;ll receive a gift credit for the value of your return. Once the returned product is received, a gift certificate will be mailed to You.</p>
            <p>If the Goods weren&apos;t marked as a gift when purchased, or the gift giver had the Order shipped to themselves to give it to You later, We will send the refund to the gift giver.</p>
          </div>

          {/* Section 6: Contact us */}
          <div className="space-y-4 border-t border-[#8c6239]/10 pt-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#8c6239]">
              Contact us
            </h2>
            <p>If you have any questions about our Returns and Refunds Policy, please contact us:</p>
            <ul className="space-y-2.5 font-semibold text-[#3b2314]">
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#8c6239]" />
                <span>By email: <a href="mailto:info@vkdryfishbasket.com" className="text-[#8c6239] hover:underline font-bold">info@vkdryfishbasket.com</a></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#8c6239]" />
                <span>By phone number: <a href="tel:+919848357279" className="text-[#8c6239] hover:underline font-bold">+91 98483 57279</a></span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#8c6239] shrink-0 mt-0.5" />
                <span>Address: H.No 806, Sahabhavana Township, Bandlaguda Nagole, Hyderabad - 500068</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </main>
  );
}
