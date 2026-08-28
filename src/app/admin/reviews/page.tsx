"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Star, Check, AlertCircle, MessageSquare, Upload, Edit3, X, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  designation: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  createdAt?: string | null;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  // Form State
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [designation, setDesignation] = useState("Verified Buyer");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("EXPLORE COLLECTION");
  const [buttonLink, setButtonLink] = useState("/all");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      } else {
        setError(data.error || "Failed to load reviews");
      }
    } catch (err) {
      setError("An unexpected error occurred while loading reviews.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
        setSuccess("Image uploaded successfully!");
      } else {
        setError(data.error || "Failed to upload image.");
      }
    } catch (err) {
      setError("Error uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setUserName(review.userName);
    setRating(review.rating);
    setComment(review.comment);
    setDesignation(review.designation || "");
    setImageUrl(review.imageUrl || "");
    setButtonText(review.buttonText || "EXPLORE COLLECTION");
    setButtonLink(review.buttonLink || "/all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingReviewId(null);
    setUserName("");
    setRating(5);
    setComment("");
    setDesignation("Verified Buyer");
    setImageUrl("");
    setButtonText("EXPLORE COLLECTION");
    setButtonLink("/all");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = editingReviewId
      ? {
          id: editingReviewId,
          userName,
          rating,
          comment,
          designation,
          imageUrl,
          buttonText,
          buttonLink,
        }
      : {
          userName,
          rating,
          comment,
          designation,
          imageUrl,
          buttonText,
          buttonLink,
        };

    try {
      const res = await fetch("/api/admin/reviews", {
        method: editingReviewId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(editingReviewId ? "Review updated successfully!" : "Review added successfully!");
        resetForm();
        fetchReviews();
        router.refresh();
      } else {
        setError(data.error || "Failed to save review.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Review deleted successfully!");
        fetchReviews();
        router.refresh();
      } else {
        setError(data.error || "Failed to delete review.");
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3b2314]">Customer Review Cards</h1>
        <p className="mt-2 text-black/60 font-medium text-xs md:text-sm tracking-tight flex items-center justify-center">
          <MessageSquare size={16} className="text-[#8c6239] mr-2" />
          Manage testmonial cards shown on the website homepage.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-3 text-green-700 animate-in fade-in">
          <Check size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-600 animate-in fade-in">
          <AlertCircle size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
              <h2 className="text-lg font-serif font-bold text-[#3b2314]">
                {editingReviewId ? "Edit Customer Review Card" : "Add New Review Card"}
              </h2>
              {editingReviewId && (
                <button
                  onClick={resetForm}
                  className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                >
                  <X size={14} /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reviewer Image */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">
                  Customer / Reviewer Photo
                </label>
                <div className="space-y-3">
                  {imageUrl && (
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-black/10 shadow-sm bg-[#FAF6ED]">
                      <img src={imageUrl} alt="Review Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center space-x-2 bg-brand/5 hover:bg-brand/10 text-[#3b2314] px-4 py-3 rounded-2xl border border-black/10 text-xs font-bold cursor-pointer transition-colors">
                      {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      <span>{isUploading ? "Uploading Image..." : "Upload Image"}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste image URL (e.g. https://...)"
                    className="w-full bg-brand/5 border border-transparent focus:border-[#8c6239]/50 rounded-2xl px-4 py-3 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/30"
                  />
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">
                  Customer / Reviewer Name *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Actress Priyanka / Adv. Tamilvendan"
                  className="w-full bg-brand/5 border border-transparent focus:border-[#8c6239]/50 rounded-2xl px-4 py-3 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/30"
                  required
                />
              </div>

              {/* Subtext / Designation */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">
                  Designation / Subtitle
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Actress Priyanka or Radha Rani Youtuber"
                  className="w-full bg-brand/5 border border-transparent focus:border-[#8c6239]/50 rounded-2xl px-4 py-3 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/30"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">
                  Rating Star (1 to 5)
                </label>
                <div className="flex items-center gap-1.5 ml-1 my-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={star <= rating ? "fill-[#eab308] text-[#eab308]" : "text-black/15"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">
                  Review Text / Quote *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder='e.g. "Authentic taste and amazing quality. Reminds me of my grandma’s homemade dried fish!"'
                  rows={4}
                  className="w-full bg-brand/5 border border-transparent focus:border-[#8c6239]/50 rounded-2xl px-4 py-3 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/30 resize-none leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-[#8c6239] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#734f2d] transition-all shadow-md disabled:opacity-50 mt-4 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingReviewId ? (
                  <Check size={16} />
                ) : (
                  <Plus size={16} />
                )}
                <span>{editingReviewId ? "Update Review Card" : "Add Review Card"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5">
            <h2 className="text-lg font-serif font-bold text-[#3b2314] mb-6 border-b border-black/5 pb-4">
              Configured Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-brand/10 rounded-3xl text-black/30">
                <MessageSquare className="mx-auto mb-4 text-black/20 animate-bounce" size={40} />
                <p className="text-xs font-bold uppercase tracking-widest">No customer reviews configured yet</p>
                <p className="text-xs mt-2 text-black/40">Use the form on the left to add your first customer review card.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-[#FAF6ED] border border-[#8c6239]/20 rounded-2xl flex flex-col justify-between relative group hover:border-[#8c6239] transition-all shadow-sm"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-brand/5 border border-black/5">
                        {review.imageUrl ? (
                          <img src={review.imageUrl} alt={review.userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-black/30">
                            <ImageIcon size={32} />
                            <span className="text-[10px] font-bold mt-1 uppercase">No photo uploaded</span>
                          </div>
                        )}
                      </div>

                      {/* Stars */}
                      <div className="flex items-center justify-center gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? "fill-[#eab308] text-[#eab308]" : "text-black/15"}
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-xs font-medium text-black/85 text-center italic leading-snug mb-3">
                        "{review.comment}"
                      </p>

                      {/* Reviewer Name */}
                      <p className="text-xs font-black text-black text-center uppercase tracking-wide">
                        - {review.userName}
                      </p>

                      {review.designation && review.designation !== review.userName && (
                        <p className="text-[10px] font-bold text-[#8c6239] text-center uppercase tracking-wider mt-0.5">
                          {review.designation}
                        </p>
                      )}
                    </div>

                    {/* Button & Actions */}
                    <div className="mt-4 pt-3 border-t border-black/10 flex flex-col space-y-2">
                      <div className="w-full py-2 bg-[#eab308] text-black text-[10px] font-black uppercase tracking-wider rounded-lg text-center shadow-xs">
                        {review.buttonText || "EXPLORE COLLECTION"}
                      </div>
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={() => handleEdit(review)}
                          className="p-2 bg-brand/10 text-[#8c6239] rounded-xl hover:bg-brand/20 transition-colors"
                          title="Edit Review"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

