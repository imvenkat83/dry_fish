import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dry Fish Basket - Premium Dry Fish & Coastal Delicacies",
  description: "Hygienically Prepared. Authentic Coastal Taste.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/fav_icon_fin.jpeg", type: "image/jpeg" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];var r=n&&n.type==='reload';var s=sessionStorage.getItem('vk_landing_seen')==='true';if(s||r){document.documentElement.classList.add('landing-dismissed');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-brand-light font-inter text-brand-dark flex flex-col">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
