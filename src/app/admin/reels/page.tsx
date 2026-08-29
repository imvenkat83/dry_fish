"use client";

import { useState, useEffect } from "react";
import { 
  Video, 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  Eye, 
  Check, 
  AlertCircle, 
  Loader2, 
  X, 
  Tag, 
  Sparkles,
  ShoppingBag
} from "lucide-react";

interface ProductOption {
  id: number;
  name: string;
  basePrice: number;
  salePrice: number | null;
  images: string[];
}

interface ReelItem {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  productId: number | null;
  badgeText: string;
  viewsCount: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  product?: {
    id: number;
    name: string;
    basePrice: number;
    salePrice: number | null;
    images: string[];
  } | null;
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formProductId, setFormProductId] = useState<number | "">("");
  const [formBadgeText, setFormBadgeText] = useState("NEW");
  const [formViewsCount, setFormViewsCount] = useState("2.5M");
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Feedback states
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Reels
      const resReels = await fetch("/api/admin/reels");
      const dataReels = await resReels.json();
      if (dataReels.success) {
        setReels(dataReels.data || []);
      }

      // Fetch Products for Link Dropdown
      const resProducts = await fetch("/api/products");
      const dataProducts = await resProducts.json();
      if (dataProducts.success) {
        setProducts(dataProducts.data || []);
      }
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingReel(null);
    setFormTitle("");
    setFormVideoUrl("");
    setFormThumbnailUrl("");
    setFormProductId("");
    setFormBadgeText("NEW");
    setFormViewsCount("2.5M");
    setFormDisplayOrder(reels.length + 1);
    setFormIsActive(true);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (reel: ReelItem) => {
    setEditingReel(reel);
    setFormTitle(reel.title || "");
    setFormVideoUrl(reel.videoUrl || "");
    setFormThumbnailUrl(reel.thumbnailUrl || "");
    setFormProductId(reel.productId || "");
    setFormBadgeText(reel.badgeText || "NEW");
    setFormViewsCount(reel.viewsCount || "2.5M");
    setFormDisplayOrder(reel.displayOrder || 0);
    setFormIsActive(reel.isActive);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File, type: "video" | "thumb") => {
    if (type === "video") setIsUploadingVideo(true);
    if (type === "thumb") setIsUploadingThumb(true);
    setError("");
    setSuccess(`Uploading ${type}... please wait`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        if (type === "video") setFormVideoUrl(data.url);
        if (type === "thumb") setFormThumbnailUrl(data.url);
        setSuccess(`${type === "video" ? "Video" : "Thumbnail"} uploaded successfully!`);
      } else {
        setSuccess("");
        setError(data.error || "Upload failed.");
      }
    } catch (err) {
      setSuccess("");
      setError("Error uploading file.");
    } finally {
      setIsUploadingVideo(false);
      setIsUploadingThumb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formVideoUrl.trim()) {
      setError("Title and Video URL are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      id: editingReel?.id,
      title: formTitle,
      videoUrl: formVideoUrl,
      thumbnailUrl: formThumbnailUrl || null,
      productId: formProductId === "" ? null : Number(formProductId),
      badgeText: formBadgeText,
      viewsCount: formViewsCount,
      displayOrder: formDisplayOrder,
      isActive: formIsActive,
    };

    try {
      const method = editingReel ? "PUT" : "POST";
      const res = await fetch("/api/admin/reels", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(editingReel ? "Reel updated successfully!" : "Reel added successfully!");
        setIsModalOpen(false);
        fetchData();
      } else {
        setError(data.error || "Operation failed.");
      }
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this video reel?")) return;

    try {
      const res = await fetch(`/api/admin/reels?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReels(reels.filter(r => r.id !== id));
      } else {
        alert(data.error || "Failed to delete reel.");
      }
    } catch (err) {
      alert("Error deleting reel.");
    }
  };

  const handleToggleStatus = async (reel: ReelItem) => {
    try {
      const updatedStatus = !reel.isActive;
      const res = await fetch("/api/admin/reels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reel, isActive: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReels(reels.map(r => r.id === reel.id ? { ...r, isActive: updatedStatus } : r));
      }
    } catch (err) {
      console.error("Toggle error", err);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#8c6239]/15 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#8c6239] text-white rounded-2xl shadow-md">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-black text-[#3b2314] tracking-tight">
                Shoppable Video Reels
              </h1>
              <p className="text-xs text-[#8c6239]/80 font-medium mt-1">
                Manage vertical video reels displayed below customer reviews on your homepage.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-[#8c6239] hover:bg-[#734f2d] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Reel</span>
        </button>
      </div>

      {/* Alert Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
          <Check size={20} className="flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="py-24 text-center text-[#8c6239]/60 flex flex-col items-center">
          <Loader2 className="animate-spin h-8 w-8 mb-3 text-[#8c6239]" />
          <p className="text-sm font-medium">Loading video reels...</p>
        </div>
      ) : reels.length === 0 ? (
        <div className="bg-[#FAF6ED] border border-[#8c6239]/20 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <Video className="mx-auto h-12 w-12 text-[#8c6239]/40 mb-4 animate-bounce" />
          <h3 className="text-lg font-serif font-bold text-[#3b2314] mb-2">No Video Reels Yet</h3>
          <p className="text-xs text-[#8c6239]/70 mb-6 leading-relaxed">
            Create video reels to engage customers and feature specific products right on your store homepage.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-[#8c6239] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#734f2d] transition-all cursor-pointer shadow-md"
          >
            Create First Reel
          </button>
        </div>
      ) : (
        /* Reels Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reels.map((reel) => {
            const linkedProduct = reel.product;
            const productImage = linkedProduct?.images?.[0] || "/images/placeholder.png";

            return (
              <div
                key={reel.id}
                className={`relative bg-[#FAF6ED] border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  reel.isActive ? "border-[#8c6239]/25" : "border-gray-300 opacity-60"
                }`}
              >
                {/* Top Video Preview Header */}
                <div className="relative aspect-[9/16] w-full bg-black overflow-hidden group">
                  <video
                    src={reel.videoUrl}
                    poster={reel.thumbnailUrl || undefined}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-md">
                      {reel.badgeText}
                    </span>
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] tracking-wider rounded-lg shadow-md flex items-center gap-1">
                      <Eye size={12} />
                      <span>{reel.viewsCount}</span>
                    </span>
                  </div>

                  {/* Play Button Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-[#3b2314] flex items-center justify-center shadow-xl backdrop-blur-sm">
                      <Video size={22} className="ml-0.5" />
                    </div>
                  </div>

                  {/* Linked Product Card Overlay Preview */}
                  {linkedProduct && (
                    <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-black/10 shadow-lg flex items-center space-x-3">
                      <img
                        src={productImage}
                        alt={linkedProduct.name}
                        className="w-10 h-10 rounded-xl object-cover border border-black/10 flex-shrink-0 bg-brand/5"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[11px] font-bold text-[#3b2314] truncate leading-snug">
                          {linkedProduct.name}
                        </h4>
                        <div className="text-[10px] font-bold text-[#8c6239] mt-0.5">
                          ₹{linkedProduct.salePrice || linkedProduct.basePrice}
                          {linkedProduct.salePrice && (
                            <span className="line-through text-gray-400 font-normal ml-1">
                              ₹{linkedProduct.basePrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Info & Actions */}
                <div className="p-4 bg-white border-t border-[#8c6239]/10 space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#3b2314] truncate">
                      {reel.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-semibold tracking-wider mt-0.5">
                      Order: {reel.displayOrder} • {reel.isActive ? "Active" : "Hidden"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleStatus(reel)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        reel.isActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {reel.isActive ? "Active" : "Disabled"}
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(reel)}
                        className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Reel"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(reel.id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Reel"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-brand/10 p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200 custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#8c6239] text-white rounded-xl">
                  <Video size={20} />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#3b2314]">
                  {editingReel ? "Edit Video Reel" : "Add New Video Reel"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Reel Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3b2314] mb-2">
                  Reel Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. King fish recipe video"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-sm text-black"
                />
              </div>

              {/* Video File / URL Uploader */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3b2314] mb-2">
                  Video File / Video URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Upload video or paste MP4 / Video URL"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-sm text-black"
                  />
                  <label className="flex items-center justify-center px-4 py-3 bg-[#8c6239] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#734f2d] transition-colors cursor-pointer flex-shrink-0">
                    {isUploadingVideo ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        <Upload size={14} className="mr-1.5" />
                        <span>Upload Video</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "video");
                      }}
                    />
                  </label>
                </div>
                {formVideoUrl && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-emerald-700 font-bold truncate">Video linked: {formVideoUrl}</p>
                  </div>
                )}
              </div>

              {/* Linked Product Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3b2314] mb-2">
                  Linked Product (Shows product overlay on video)
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-sm text-black bg-white"
                >
                  <option value="">-- No Product Linked --</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (₹{prod.salePrice || prod.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover Thumbnail Image (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3b2314] mb-2">
                  Cover Thumbnail Image (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Upload image or paste image URL"
                    value={formThumbnailUrl}
                    onChange={(e) => setFormThumbnailUrl(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-sm text-black"
                  />
                  <label className="flex items-center justify-center px-4 py-3 bg-[#8c6239]/10 text-[#3b2314] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#8c6239]/20 transition-colors cursor-pointer flex-shrink-0">
                    {isUploadingThumb ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        <Upload size={14} className="mr-1.5" />
                        <span>Upload Thumb</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "thumb");
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Badge & Views Count Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3b2314] mb-2">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEW or TRENDING"
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3b2314] mb-2">
                    Views Count Display
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2.9M or 1.5M"
                    value={formViewsCount}
                    onChange={(e) => setFormViewsCount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-sm text-black"
                  />
                </div>
              </div>

              {/* Order & Status Row */}
              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3b2314] mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8c6239] text-sm text-black"
                  />
                </div>

                <div className="pt-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-5 h-5 accent-[#8c6239] rounded"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3b2314]">
                      Active on Homepage
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-[#8c6239] hover:bg-[#734f2d] text-white transition-all shadow-md flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <span>{editingReel ? "Update Reel" : "Save Reel"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
