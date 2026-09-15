"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  ImageIcon, 
  ExternalLink,
  Upload
} from "lucide-react";
import { useRouter } from "next/navigation";

interface HomepageCategory {
  id: number;
  name: string;
  imageUrl: string;
  promoText: string;
  actionText: string;
  link: string | null;
  order: number;
  filterTypes?: string | null;
  isActive?: boolean | number;
}

export default function CategorySettingsPage() {
  const router = useRouter();
  
  // State
  const [categories, setCategories] = useState<HomepageCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [promoText, setPromoText] = useState("");
  const [actionText, setActionText] = useState("Shop Now");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState(0);
  const [filterTypes, setFilterTypes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/homepage-categories?all=true");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.error || "Failed to load categories.");
      }
      
      if (res.status === 401) {
        router.push("/admin/login");
      }
    } catch (err) {
      setError("Failed to fetch homepage categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setImageUrl("");
    setBannerImageUrl("");
    setPromoText("");
    setActionText("Shop Now");
    setLink("");
    setOrder(categories.length);
    setFilterTypes("");
    setIsActive(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.url);
        setSuccess("Image uploaded to Cloudinary!");
      } else {
        setError(data.error || "Upload failed.");
      }
    } catch (err) {
      setError("Error uploading image.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setBannerImageUrl(data.url);
        setSuccess("Banner image uploaded to Cloudinary!");
      } else {
        setError(data.error || "Banner upload failed.");
      }
    } catch (err) {
      setError("Error uploading banner image.");
    } finally {
      setIsUploadingBanner(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imageUrl.trim()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const defaultLink = `/category/${name.toLowerCase().trim().replace(/\s+/g, "-")}`;
    const combinedImages = `${imageUrl.trim()},${imageUrl.trim()}`;
    const payload = {
      id: editingId,
      name: name.trim(),
      imageUrl: combinedImages,
      promoText: name.trim(), // Defaulting to category name
      actionText: "Shop Now", // Default button text
      link: defaultLink,
      order: Number(order) || 0,
      filterTypes: null,
      isActive: isActive,
    };

    try {
      const url = "/api/admin/homepage-categories";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(editingId ? "Category card updated successfully!" : "Category card created successfully!");
        resetForm();
        fetchData();
        router.refresh();
      } else {
        setError(data.error || "Failed to save category card.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (item: HomepageCategory) => {
    setEditingId(item.id);
    setName(item.name);
    if (item.imageUrl && item.imageUrl.includes(",")) {
      const parts = item.imageUrl.split(",");
      setImageUrl(parts[0] || "");
      setBannerImageUrl(parts[1] || "");
    } else {
      setImageUrl(item.imageUrl || "");
      setBannerImageUrl(item.imageUrl || "");
    }
    setPromoText(item.promoText);
    setActionText(item.actionText);
    setLink(item.link || "");
    setOrder(item.order);
    setFilterTypes(item.filterTypes || "");
    setIsActive(item.isActive !== false);
  };

  const handleToggleActive = async (item: HomepageCategory) => {
    const newStatus = !(item.isActive !== false);
    try {
      const res = await fetch("/api/admin/homepage-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isActive: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Category "${item.name}" ${newStatus ? "enabled" : "disabled"}`);
        fetchData();
        router.refresh();
      } else {
        setError(data.error || "Failed to update category status");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category card?")) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/homepage-categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess("Category card deleted successfully!");
        fetchData();
        router.refresh();
      } else {
        setError(data.error || "Failed to delete category card.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReorder = async (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const listCopy = [...categories];
    // Swap items
    const temp = listCopy[currentIndex];
    listCopy[currentIndex] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    // Reassign order properties sequentially
    const updatedList = listCopy.map((item, index) => ({
      ...item,
      order: index,
    }));

    setCategories(updatedList);

    try {
      const res = await fetch("/api/admin/homepage-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList.map(item => ({ id: item.id, order: item.order }))),
      });
      const data = await res.json();
      if (!data.success) {
        setError("Failed to save new order.");
        fetchData(); // Rollback UI
      }
    } catch (err) {
      setError("Failed to save reorder state.");
      fetchData();
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
    <div className="p-10">
      <div className="mb-10 text-center flex flex-col items-center">
        <h1 className="text-4xl font-playfair font-bold text-black">Category Banner Settings</h1>
        <p className="mt-2 text-black/60 font-medium tracking-tight flex items-center justify-center">
          <Sparkles size={16} className="text-[#C5A059] mr-2" />
          Add and manage promo category grid blocks positioned on your storefront home page.
        </p>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center space-x-3 text-green-600 animate-in fade-in">
          <Check size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-500 animate-in fade-in">
          <AlertCircle size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Editor Form - 5 Cols */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/5 h-fit">
          <h2 className="text-xl font-playfair font-bold text-black mb-6 border-b border-brand/5 pb-4">
            {editingId ? "Edit Category Card" : "Add New Category Card"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">
                Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ethnic Wear"
                className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-3.5 text-sm font-semibold text-black outline-none transition-all placeholder:text-black/20"
                required
              />
            </div>

             <div>
              <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">
                Category Card Image (First Image)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste direct URL OR upload local image below..."
                className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-3.5 text-sm font-semibold text-black outline-none transition-all placeholder:text-black/20"
                required
              />
              <div className="relative border-2 border-dashed border-brand/10 hover:border-[#C5A059]/40 bg-brand-light/50 hover:bg-white rounded-2xl h-20 transition-all flex flex-col items-center justify-center cursor-pointer mt-3">
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingImage}
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {isUploadingImage ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-5 h-5 text-[#C5A059] animate-spin mb-1" />
                    <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">Uploading card image...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-2">
                    <Upload className="w-4 h-4 text-[#C5A059] mb-1" />
                    <p className="text-xs font-bold text-black/60">Click or Drag Files here</p>
                  </div>
                )}
              </div>
            </div>


            <div>
              <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">
                Display Status
              </label>
              <button 
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full py-3 px-5 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-between cursor-pointer ${
                  isActive 
                    ? "border-green-100 bg-green-50 text-green-700" 
                    : "border-gray-200 bg-gray-50 text-gray-400"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span>{isActive ? "Displayed (Enabled)" : "Hidden (Disabled)"}</span>
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${isActive ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  {isActive ? "ENABLE" : "DISABLE"}
                </span>
              </button>
            </div>

            {(() => {
              const isFormValid = name.trim().length > 0 && imageUrl.trim().length > 0;
              
              return (
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                      isFormValid && !isSubmitting
                        ? "bg-[#8c6239] text-white hover:bg-[#6e4b2a] shadow-xl hover:scale-[1.01] active:scale-[0.98] cursor-pointer ring-2 ring-[#8c6239]/20"
                        : "bg-[#8c6239]/30 text-white/50 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    <span>{editingId ? "Save Changes" : "Create Card"}</span>
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-4 border border-brand/10 text-black/60 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand/5 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              );
            })()}
          </form>
        </div>

        {/* Existing Grid List - 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/5">
            <h2 className="text-xl font-playfair font-bold text-black mb-6 border-b border-brand/5 pb-4">
              Category Cards ({categories.length})
            </h2>

            {categories.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-brand/10 rounded-[2rem] bg-brand-light flex flex-col items-center">
                <ImageIcon className="w-10 h-10 text-black/20 mb-4" />
                <p className="text-sm font-bold text-black">No Category Cards Added Yet</p>
                <p className="text-xs text-black/40 mt-1">Fill out the editor form on the left to add your first category banner block.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {categories.map((item, index) => {
                  const isCatActive = item.isActive !== false;
                  return (
                    <div 
                      key={item.id} 
                      className={`relative border rounded-3xl p-5 flex flex-col justify-between group hover:shadow-md transition-all duration-300 ${
                        isCatActive 
                          ? "border-brand/10 bg-white" 
                          : "border-red-100 bg-red-50/20 opacity-75"
                      }`}
                    >
                      {/* Visual Card Header */}
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full overflow-hidden shadow-sm border-[3px] border-[#064e3b]/20 relative flex-shrink-0">
                          <img 
                            src={item.imageUrl && item.imageUrl.includes(",") ? item.imageUrl.split(",")[0] : item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                            onError={e => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/images/placeholder.png";
                            }}
                          />
                        </div>
                        
                        {/* Info & Title */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-playfair font-bold text-black text-base sm:text-lg truncate leading-tight">{item.name}</h3>
                            <button
                              onClick={() => handleToggleActive(item)}
                              className={`px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer border flex items-center space-x-1 shrink-0 ${
                                isCatActive 
                                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                                  : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                              }`}
                              title={isCatActive ? "Click to Disable" : "Click to Enable"}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isCatActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <span>{isCatActive ? "ENABLED" : "DISABLED"}</span>
                            </button>
                          </div>
                          <span className="text-[10px] text-black/40 uppercase tracking-widest font-black block mt-1 truncate">
                            Link: <span className="text-black/60 font-semibold lowercase tracking-normal">{item.link || "none"}</span>
                          </span>
                        </div>
                      </div>

                      {/* Footer Controls Row */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand/5">
                        {/* Reorder Buttons */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleReorder(index, "up")}
                            disabled={index === 0}
                            className="p-2 bg-brand/5 text-black hover:text-[#C5A059] hover:bg-brand/10 rounded-xl transition-all disabled:opacity-20 flex items-center justify-center w-8 h-8 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleReorder(index, "down")}
                            disabled={index === categories.length - 1}
                            className="p-2 bg-brand/5 text-black hover:text-[#C5A059] hover:bg-brand/10 rounded-xl transition-all disabled:opacity-20 flex items-center justify-center w-8 h-8 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        {/* Action Buttons: Edit & Delete */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-2 bg-brand/5 text-black hover:bg-[#8c6239] hover:text-white rounded-xl transition-all flex items-center justify-center w-8 h-8 cursor-pointer"
                            title="Edit Card"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center w-8 h-8 cursor-pointer"
                            title="Delete Card"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
