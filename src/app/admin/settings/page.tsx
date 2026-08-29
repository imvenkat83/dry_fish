"use client";

import { useState, useEffect, useMemo } from "react";
import { Save, Loader2, Upload, Sparkles, AlertCircle, Check, Image as ImageIcon, Plus, Trash2, Megaphone, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Offer {
  id: number;
  text: string;
  link: string | null;
  order: number;
}

function parseOfferText(text: string) {
  if (text.includes("|")) {
    const parts = text.split("|");
    return { title: parts[0].trim(), subtitle: parts[1].trim() };
  }
  if (text.includes("!")) {
    const parts = text.split("!");
    const title = parts[0].trim();
    const subtitle = parts.slice(1).join("!").trim();
    return { title, subtitle: subtitle || null };
  }
  return { title: text.trim(), subtitle: null };
}

function isVideoUrl(url: string) {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".avi") ||
    cleanUrl.endsWith(".mkv") ||
    cleanUrl.includes("/video/upload/") ||
    (cleanUrl.includes(".cloudinary.com/") && cleanUrl.includes("/video/"))
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [bannerUrl, setBannerUrl] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [founderCards, setFounderCards] = useState<{ imageUrl: string; text: string }[]>([
    { imageUrl: "", text: "" },
    { imageUrl: "", text: "" },
    { imageUrl: "", text: "" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<"laptop" | "mobile">("laptop");

  const [bannersList, setBannersList] = useState<{ url: string; mobileUrl: string; link: string | null }[]>([]);
  const [navItems, setNavItems] = useState<any[]>([]);
  const [homepageCategoriesList, setHomepageCategoriesList] = useState<any[]>([]);
  const [selectedBannerLink, setSelectedBannerLink] = useState("");
  const [customLinkText, setCustomLinkText] = useState("");

  const [tempDesktopUrl, setTempDesktopUrl] = useState("");
  const [tempMobileUrl, setTempMobileUrl] = useState("");
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);

  const premadeLinks = useMemo(() => {
    const list: { label: string; value: string }[] = [];
    list.push({ label: "Featured Collection Section (Scroll target)", value: "#featured-collections" });
    navItems.forEach((item) => {
      list.push({ label: `Nav Page: ${item.label}`, value: item.href });
    });
    homepageCategoriesList.forEach((item) => {
      list.push({ label: `Category Card: ${item.name}`, value: item.link || `/category/${item.name.toLowerCase().trim().replace(/\s+/g, "-")}` });
    });
    return list;
  }, [navItems, homepageCategoriesList]);

  useEffect(() => {
    if (currentPreviewIndex >= bannersList.length && bannersList.length > 0) {
      setCurrentPreviewIndex(0);
    }
  }, [bannersList.length, currentPreviewIndex]);

  useEffect(() => {
    if (bannersList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPreviewIndex((prev) => (prev + 1) % bannersList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannersList.length]);

  // New offer form state
  const [newOfferText, setNewOfferText] = useState("");
  const [newOfferSubtext, setNewOfferSubtext] = useState("");
  const [newOfferLink, setNewOfferLink] = useState("");

  const handleAddBannerSlide = () => {
    const desktopTrimmed = tempDesktopUrl.trim();
    const mobileTrimmed = tempMobileUrl.trim();

    if (!desktopTrimmed && !mobileTrimmed) {
      setError("Please provide at least a Laptop View or Mobile View image URL.");
      return;
    }

    let finalLink: string | null = null;
    if (selectedBannerLink === "__custom__") {
      finalLink = customLinkText.trim() || null;
    } else if (selectedBannerLink !== "") {
      finalLink = selectedBannerLink;
    }

    setBannersList((prev) => [
      ...prev,
      {
        url: desktopTrimmed || mobileTrimmed,
        mobileUrl: mobileTrimmed || desktopTrimmed,
        link: finalLink,
      },
    ]);

    setTempDesktopUrl("");
    setTempMobileUrl("");
    setSelectedBannerLink("");
    setCustomLinkText("");
    setSuccess("New banner slide added successfully!");
  };

  const handleSingleFileUpload = async (file: File, target: "newDesktop" | "newMobile" | { slideIndex: number; field: "url" | "mobileUrl" }) => {
    const formData = new FormData();
    formData.append("file", file);

    if (typeof target === "object") {
      // Editing existing slide image
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          setBannersList((prev) => {
            const copy = [...prev];
            copy[target.slideIndex] = {
              ...copy[target.slideIndex],
              [target.field]: data.url,
            };
            return copy;
          });
          setSuccess("Image updated successfully!");
        } else {
          setError(data.error || "Failed to upload file.");
        }
      } catch {
        setError("Error uploading file.");
      }
      return;
    }

    if (target === "newDesktop") setIsUploadingDesktop(true);
    if (target === "newMobile") setIsUploadingMobile(true);
    setError("");

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        if (target === "newDesktop") setTempDesktopUrl(data.url);
        if (target === "newMobile") setTempMobileUrl(data.url);
        setSuccess("Image uploaded successfully!");
      } else {
        setError(data.error || "Failed to upload image.");
      }
    } catch {
      setError("An error occurred during file upload.");
    } finally {
      setIsUploadingDesktop(false);
      setIsUploadingMobile(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch Homepage Banner
      const resBanner = await fetch("/api/admin/settings?key=homepage_banner");
      const dataBanner = await resBanner.json();
      if (dataBanner.success && dataBanner.data) {
        const val = dataBanner.data.value;
        setBannerUrl(val);
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            setBannersList(
              parsed.map((item: any) => {
                if (typeof item === "string") return { url: item, mobileUrl: "", link: null };
                return {
                  url: item.url || item.desktopUrl || "",
                  mobileUrl: item.mobileUrl || "",
                  link: item.link || null,
                };
              })
            );
          } else {
            setBannersList([]);
          }
        } catch {
          // Legacy format
          setBannersList(
            val
              .split(",")
              .map((url: string) => ({ url: url.trim(), mobileUrl: "", link: null }))
              .filter((b: any) => b.url)
          );
        }
      }

      // Fetch Offers
      const resOffers = await fetch("/api/admin/offers");
      const dataOffers = await resOffers.json();
      if (dataOffers.success) {
        setOffers(dataOffers.data);
      }

      // Fetch Nav Items
      const resNav = await fetch("/api/admin/nav");
      const dataNav = await resNav.json();
      if (dataNav.success) {
        setNavItems(dataNav.data);
      }

      // Fetch Categories
      const resCat = await fetch("/api/admin/homepage-categories");
      const dataCat = await resCat.json();
      if (dataCat.success) {
        setHomepageCategoriesList(dataCat.data);
      }

      // Fetch Founder Promotion Settings
      const resFounder = await fetch("/api/admin/settings?key=founder_promo");
      const dataFounder = await resFounder.json();
      if (dataFounder.success && dataFounder.data) {
        try {
          const parsed = JSON.parse(dataFounder.data.value);
          if (Array.isArray(parsed) && parsed.length === 3) {
            setFounderCards(parsed);
          }
        } catch {}
      }

      if (resBanner.status === 401 || resOffers.status === 401) {
        router.push("/admin/login");
      }
    } catch (err) {
      setError("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "homepage_banner",
          value: JSON.stringify(bannersList),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Homepage banner settings saved successfully!");
        router.refresh();
      } else {
        setError(data.error || "Failed to save settings.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveFounderPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "founder_promo",
          value: JSON.stringify(founderCards),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Founder promotion section saved successfully!");
        router.refresh();
      } else {
        setError(data.error || "Failed to save settings.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferText.trim()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const combinedText = newOfferSubtext.trim()
      ? `${newOfferText.trim()} | ${newOfferSubtext.trim()}`
      : newOfferText.trim();

    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: combinedText,
          link: newOfferLink || null,
          order: offers.length,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Offer banner added successfully!");
        setNewOfferText("");
        setNewOfferSubtext("");
        setNewOfferLink("");
        fetchData();
        router.refresh();
      } else {
        setError(data.error || "Failed to add offer.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer banner?")) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Offer banner deleted successfully!");
        fetchData();
        router.refresh();
      } else {
        setError(data.error || "Failed to delete offer.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-10 font-serif">
      <div className="mb-10 text-center flex flex-col items-center">
        <h1 className="text-4xl font-serif font-bold text-black">Site Settings</h1>
        <p className="mt-2 text-black/60 font-medium tracking-tight flex items-center justify-center font-sans">
          <Sparkles size={16} className="text-[#C5A059] mr-2" />
          Customize the layout, banners, and options for laptop and mobile view.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center space-x-3 text-green-600 animate-in fade-in font-sans">
          <Check size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-500 animate-in fade-in font-sans">
          <AlertCircle size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Settings Form Column */}
        <div className="space-y-10">
          
          {/* Banner Setting Form (Separate Laptop and Mobile Views) */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/5">
            <h2 className="text-xl font-serif font-bold text-black mb-2 border-b border-brand/5 pb-3">
              Homepage Hero Banner Carousel
            </h2>
            <p className="text-xs text-black/50 mb-6 font-sans">
              Add multiple banner slides to scroll as a carousel. Specify separate images for 💻 <strong>Laptop View</strong> and 📱 <strong>Mobile View</strong>.
            </p>

            <form onSubmit={handleSaveBanner} className="space-y-6">
              {/* Add New Slide Form Card */}
              <div className="bg-brand/5 p-6 rounded-2xl border border-brand/10 space-y-5">
                <h3 className="text-sm font-bold text-[#8c6239] uppercase tracking-wider font-serif">
                  + Add New Banner Carousel Slide
                </h3>

                {/* Section A: Laptop View Image */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-black/60 uppercase tracking-[0.2em] ml-1 font-sans">
                    💻 Laptop View Image / Video URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempDesktopUrl}
                      onChange={(e) => setTempDesktopUrl(e.target.value)}
                      placeholder="Paste Laptop view image URL here"
                      className="w-full bg-white border border-brand/20 focus:border-[#C5A059]/50 rounded-xl px-4 py-3 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/30 font-sans"
                    />
                    <label className="bg-white border border-brand/20 hover:border-[#8c6239] rounded-xl px-4 py-3 text-xs font-bold text-black cursor-pointer select-none flex items-center justify-center shrink-0 shadow-xs font-sans">
                      {isUploadingDesktop ? <Loader2 size={14} className="animate-spin text-[#8c6239]" /> : "Upload"}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleSingleFileUpload(file, "newDesktop");
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Section B: Mobile View Image */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-black/60 uppercase tracking-[0.2em] ml-1 font-sans">
                    📱 Mobile View Image / Video URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempMobileUrl}
                      onChange={(e) => setTempMobileUrl(e.target.value)}
                      placeholder="Paste Mobile view image URL here (optional, falls back to Laptop image if empty)"
                      className="w-full bg-white border border-brand/20 focus:border-[#C5A059]/50 rounded-xl px-4 py-3 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/30 font-sans"
                    />
                    <label className="bg-white border border-brand/20 hover:border-[#8c6239] rounded-xl px-4 py-3 text-xs font-bold text-black cursor-pointer select-none flex items-center justify-center shrink-0 shadow-xs font-sans">
                      {isUploadingMobile ? <Loader2 size={14} className="animate-spin text-[#8c6239]" /> : "Upload"}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleSingleFileUpload(file, "newMobile");
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Section C: Navigation Link */}
                <div className="space-y-2 font-sans">
                  <label className="block text-[10px] font-black text-black/60 uppercase tracking-[0.2em] ml-1">
                    Banner Click Link (Optional)
                  </label>
                  <select
                    value={selectedBannerLink}
                    onChange={(e) => setSelectedBannerLink(e.target.value)}
                    className="w-full bg-white border border-brand/20 rounded-xl px-4 py-3 text-xs font-semibold text-black outline-none focus:border-[#C5A059]/50 transition-all cursor-pointer"
                  >
                    <option value="">No Navigation Link (Optional)</option>
                    {premadeLinks.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    <option value="__custom__">+ Add custom link</option>
                  </select>

                  {selectedBannerLink === "__custom__" && (
                    <input
                      type="text"
                      value={customLinkText}
                      onChange={(e) => setCustomLinkText(e.target.value)}
                      placeholder="e.g. /my-story or /category/dry-fish"
                      className="w-full bg-white border border-brand/20 focus:border-[#C5A059]/50 rounded-xl px-4 py-3 text-xs font-semibold text-black outline-none transition-all mt-2 placeholder:text-black/30"
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddBannerSlide}
                  className="w-full flex items-center justify-center gap-2 bg-[#8c6239] hover:bg-[#734f2d] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-md font-sans cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Banner Carousel Slide</span>
                </button>
              </div>

              {/* Configured Banner Slides List */}
              {bannersList.length > 0 && (
                <div className="space-y-4 font-sans">
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] ml-1">
                    Configured Carousel Slides ({bannersList.length})
                  </label>

                  <div className="space-y-4">
                    {bannersList.map((banner, idx) => (
                      <div key={idx} className="bg-brand/5 border border-brand/10 rounded-2xl p-4 space-y-3 relative group">
                        <div className="flex items-center justify-between border-b border-brand/10 pb-2">
                          <span className="font-bold text-xs text-[#8c6239] uppercase tracking-wider">
                            Slide #{idx + 1}
                          </span>
                          <div className="flex items-center space-x-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setBannersList((prev) => {
                                    const copy = [...prev];
                                    const temp = copy[idx];
                                    copy[idx] = copy[idx - 1];
                                    copy[idx - 1] = temp;
                                    return copy;
                                  });
                                }}
                                className="p-1 bg-white hover:bg-brand/10 border border-brand/10 rounded text-black text-xs cursor-pointer"
                                title="Move Up"
                              >
                                ↑
                              </button>
                            )}
                            {idx < bannersList.length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setBannersList((prev) => {
                                    const copy = [...prev];
                                    const temp = copy[idx];
                                    copy[idx] = copy[idx + 1];
                                    copy[idx + 1] = temp;
                                    return copy;
                                  });
                                }}
                                className="p-1 bg-white hover:bg-brand/10 border border-brand/10 rounded text-black text-xs cursor-pointer"
                                title="Move Down"
                              >
                                ↓
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setBannersList((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs transition-colors cursor-pointer"
                              title="Delete Slide"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Laptop vs Mobile Images Inputs & Previews */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Laptop View */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-black/60 uppercase">💻 Laptop View Image</span>
                            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-white border border-brand/10 flex items-center justify-center">
                              {banner.url ? (
                                isVideoUrl(banner.url) ? (
                                  <video src={banner.url} className="w-full h-full object-cover" muted playsInline />
                                ) : (
                                  <img src={banner.url} alt={`Laptop banner ${idx + 1}`} className="w-full h-full object-cover" />
                                )
                              ) : (
                                <span className="text-[10px] text-black/30 font-bold">No Laptop Image</span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={banner.url}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBannersList((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], url: val };
                                  return copy;
                                });
                              }}
                              placeholder="Laptop Image URL"
                              className="w-full bg-white border border-brand/15 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-black outline-none"
                            />
                          </div>

                          {/* Mobile View */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-black/60 uppercase">📱 Mobile View Image</span>
                            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-white border border-brand/10 flex items-center justify-center">
                              {(banner.mobileUrl || banner.url) ? (
                                isVideoUrl(banner.mobileUrl || banner.url) ? (
                                  <video src={banner.mobileUrl || banner.url} className="w-full h-full object-cover" muted playsInline />
                                ) : (
                                  <img src={banner.mobileUrl || banner.url} alt={`Mobile banner ${idx + 1}`} className="w-full h-full object-cover" />
                                )
                              ) : (
                                <span className="text-[10px] text-black/30 font-bold">No Mobile Image</span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={banner.mobileUrl}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBannersList((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], mobileUrl: val };
                                  return copy;
                                });
                              }}
                              placeholder="Mobile Image URL (optional)"
                              className="w-full bg-white border border-brand/15 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-black outline-none"
                            />
                          </div>
                        </div>

                        {banner.link && (
                          <div className="text-[10px] text-[#C5A059] font-bold truncate pt-1">
                            Link target: {banner.link}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-[#8c6239] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#734f2d] transition-all shadow-lg disabled:opacity-50 font-sans cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>Save All Banner Carousel Settings</span>
              </button>
            </form>
          </div>

          {/* Offer Ticker Settings Form */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/5">
            <h2 className="text-xl font-serif font-bold text-black mb-6 border-b border-brand/5 pb-4">Offer Announcement Carousel</h2>
            
            <form onSubmit={handleAddOffer} className="space-y-4 mb-8 font-sans">
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">Add Offer Banner Text</label>
                <input
                  type="text"
                  value={newOfferText}
                  onChange={(e) => setNewOfferText(e.target.value)}
                  placeholder="e.g. FLAT ₹500 OFF"
                  className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-3.5 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/20"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">Add Offer Banner Subtext (Optional)</label>
                <input
                  type="text"
                  value={newOfferSubtext}
                  onChange={(e) => setNewOfferSubtext(e.target.value)}
                  placeholder="e.g. On First Purchase"
                  className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-3.5 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">Link Target URL (Optional)</label>
                <input
                  type="text"
                  value={newOfferLink}
                  onChange={(e) => setNewOfferLink(e.target.value)}
                  placeholder="e.g. /category/dry-fish"
                  className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-3.5 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-[#C5A059] text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#b39150] transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                <span>Add Offer Slide</span>
              </button>
            </form>

            {/* List of current offers */}
            <div className="font-sans">
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.25em] mb-4 border-b border-brand/5 pb-2">Active Slides ({offers.length})</p>
              
              {offers.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-brand/10 rounded-2xl text-black/30">
                  <Megaphone className="mx-auto mb-2 text-black/20" size={24} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No active offer slides</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {offers.map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between p-4 bg-brand/5 border border-brand/5 rounded-2xl group transition-all hover:bg-brand/10">
                      <div className="flex-1 min-w-0 pr-4">
                        {(() => {
                          const { title, subtitle } = parseOfferText(offer.text);
                          return (
                            <p className="text-xs font-bold text-black truncate">
                              {title}
                              {subtitle && (
                                <span className="text-black/40 font-medium ml-2">
                                  ({subtitle})
                                </span>
                              )}
                            </p>
                          );
                        })()}
                        {offer.link && (
                          <p className="text-[9px] font-black text-[#C5A059] uppercase tracking-wider mt-1 truncate">Link: {offer.link}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        disabled={isSubmitting}
                        className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Founder Promotion Section (3 Cards) */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/5">
            <h2 className="text-xl font-serif font-bold text-black mb-6 border-b border-brand/5 pb-4">Founder Promotion Section (3 Cards)</h2>
            
            <form onSubmit={handleSaveFounderPromo} className="space-y-8 font-sans">
              {founderCards.map((card, idx) => (
                <div key={idx} className="bg-brand/5 p-5 rounded-2xl border border-brand/10 space-y-4">
                  <h3 className="text-sm font-bold text-[#8c6239] uppercase tracking-wider font-serif">Card #{idx + 1}</h3>
                  
                  {/* Image URL Input */}
                  <div>
                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">Card Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={card.imageUrl}
                        onChange={(e) => {
                          const updated = [...founderCards];
                          updated[idx].imageUrl = e.target.value;
                          setFounderCards(updated);
                        }}
                        placeholder="Paste image URL here"
                        className="w-full bg-white border border-brand/20 rounded-xl px-4 py-3 text-xs font-semibold text-black outline-none focus:border-[#C5A059]/50 transition-all placeholder:text-black/20"
                      />
                      <label className="bg-white border border-brand/20 hover:border-[#8c6239] rounded-xl px-4 py-3 text-xs font-bold text-black cursor-pointer select-none flex items-center justify-center shrink-0">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const res = await fetch("/api/admin/upload", {
                                method: "POST",
                                body: formData,
                              });
                              const data = await res.json();
                              if (data.success) {
                                const updated = [...founderCards];
                                updated[idx].imageUrl = data.url;
                                setFounderCards(updated);
                                setSuccess(`Card #${idx + 1} image uploaded!`);
                              } else {
                                setError("Failed to upload image.");
                              }
                            } catch {
                              setError("Error uploading image.");
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Text Description TextArea */}
                  <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                      <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Card Text (HTML / Bold allowed)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...founderCards];
                          updated[idx].text = (updated[idx].text || "") + " <b>bold text</b>";
                          setFounderCards(updated);
                        }}
                        className="text-[9px] font-black uppercase tracking-wider text-[#8c6239] hover:underline cursor-pointer"
                        title="Inserts bold tags"
                      >
                        [+ Add Bold Text]
                      </button>
                    </div>
                    <textarea
                      value={card.text}
                      onChange={(e) => {
                        const updated = [...founderCards];
                        updated[idx].text = e.target.value;
                        setFounderCards(updated);
                      }}
                      placeholder="Enter description text. Use <b>text</b> to make letters bold."
                      rows={3}
                      className="w-full bg-white border border-brand/20 focus:border-[#C5A059]/50 rounded-xl px-4 py-3 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/20 resize-y min-h-[60px]"
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#8c6239] hover:bg-[#734f2d] text-[#FAF6ED] py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 font-sans"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FAF6ED]" />
                ) : (
                  <Save size={14} />
                )}
                <span>Save Founder Promotion Section</span>
              </button>
            </form>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/5 flex flex-col h-fit">
          <div className="flex items-center justify-between mb-6 border-b border-brand/5 pb-4">
            <h2 className="text-xl font-serif font-bold text-black">Banner Preview</h2>
            {/* View Switcher: Laptop vs Mobile */}
            <div className="flex bg-brand/5 p-1 rounded-xl border border-brand/10 font-sans">
              <button
                type="button"
                onClick={() => setPreviewDevice("laptop")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  previewDevice === "laptop" ? "bg-[#8c6239] text-white shadow-xs" : "text-black/60 hover:text-black"
                }`}
              >
                💻 Laptop View
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  previewDevice === "mobile" ? "bg-[#8c6239] text-white shadow-xs" : "text-black/60 hover:text-black"
                }`}
              >
                📱 Mobile View
              </button>
            </div>
          </div>
          
          <div className="rounded-2xl border border-brand/10 overflow-hidden relative flex flex-col p-0 bg-brand/5">

            {/* Offer Carousel Banner Mockup */}
            <div className="h-20 bg-[#F5EBE0] text-[#064e3b] flex items-center justify-center px-4 relative z-10 shadow-sm border-b border-[#064e3b]/10 font-sans">
              {offers.length > 0 ? (
                (() => {
                  const { title, subtitle } = parseOfferText(offers[0].text);
                  return (
                    <div className={`relative flex items-center h-14 bg-[#eab308] text-[#064e3b] px-8 rounded-l-2xl rounded-r-md shadow-md overflow-hidden font-inter ${!subtitle ? "justify-center" : ""}`}>
                      <span className={`font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap ${subtitle ? "pr-3" : ""}`}>
                        {title}
                      </span>
                      
                      {subtitle && (
                        <>
                          <div className="relative h-full flex items-center px-1">
                            <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#F5EBE0] rounded-full"></div>
                            <div className="h-3/5 border-l border-dashed border-white/50"></div>
                            <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#F5EBE0] rounded-full"></div>
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest pl-3 pr-2 opacity-95 whitespace-nowrap">
                            {subtitle}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })()
              ) : (
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40">
                  Offer Banner Announcements
                </p>
              )}
            </div>

            {/* Dynamic Banner Preview Section (Laptop vs Mobile aspect ratio) */}
            {bannersList.length > 0 ? (
              <div
                className={`relative w-full overflow-hidden bg-black flex items-center justify-center transition-all duration-500 mx-auto ${
                  previewDevice === "mobile"
                    ? "max-w-[280px] aspect-[9/16] my-4 rounded-3xl border-4 border-black shadow-xl"
                    : "aspect-[21/9] rounded-b-2xl"
                }`}
              >
                {(() => {
                  const currentSlide = bannersList[currentPreviewIndex];
                  const currentUrl = previewDevice === "mobile" ? (currentSlide?.mobileUrl || currentSlide?.url) : currentSlide?.url;

                  return (
                    <div className="relative w-full h-full">
                      {isVideoUrl(currentUrl) ? (
                        <video
                          key={`${currentPreviewIndex}-${previewDevice}`}
                          src={currentUrl}
                          className="w-full h-full object-cover transition-all duration-500"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          key={`${currentPreviewIndex}-${previewDevice}`}
                          src={currentUrl}
                          alt={`Banner Preview ${currentPreviewIndex + 1}`}
                          className="w-full h-full object-cover transition-all duration-500"
                        />
                      )}

                      {/* Controls overlay */}
                      {bannersList.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPreviewIndex(
                                (prev) => (prev - 1 + bannersList.length) % bannersList.length
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-black shadow-sm flex items-center justify-center z-10 cursor-pointer"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPreviewIndex(
                                (prev) => (prev + 1) % bannersList.length
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-black shadow-sm flex items-center justify-center z-10 cursor-pointer"
                          >
                            <ChevronRight size={14} />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
                            {bannersList.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentPreviewIndex(idx)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  idx === currentPreviewIndex ? "bg-[#C5A059] w-4" : "bg-white/60 w-1.5"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-black/30 border-dashed bg-white space-y-1 font-sans">
                <ImageIcon size={24} />
                <p className="text-[10px] font-bold uppercase tracking-widest">No Banner Carousel Selected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
