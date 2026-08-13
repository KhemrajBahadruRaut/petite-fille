"use client";

import { apiUrl, normalizeApiAssetUrl } from "@/utils/api";
import { toast } from "@/hooks/use-toast";
import { logAdminActivity } from "@/utils/activityLog";
import React, { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OfferItem {
  id: number;
  image: string;
  sort_order: number;
}

const MAX_ITEMS = 4;

// ─── Component ────────────────────────────────────────────────────────────────

const WhatWeOfferEditor = () => {
  const [items, setItems] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Fetch items on mount ──────────────────────────────────────────────────
  const fetchItems = async () => {
    try {
      const res = await fetch(apiUrl("whatweoffer/whatweoffer.php"), {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to load",
        description:
          "Could not load What We Offer items. Please try refreshing.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ─── Upload new image ─────────────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("sort_order", String(items.length));

      const res = await fetch(apiUrl("whatweoffer/whatweoffer.php"), {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Upload failed");

      setItems((prev) => [...prev, data.item]);
      toast({
        title: "Image uploaded",
        description: "New item added to What We Offer section.",
      });
      logAdminActivity(
        "Content Management",
        "Uploaded What We Offer image",
        "New image added to What We Offer section"
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      toast({ variant: "destructive", title: "Upload failed", description: message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ─── Delete item ──────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(apiUrl("whatweoffer/whatweoffer.php"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Delete failed");

      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Image deleted",
        description: "Item removed from What We Offer section.",
      });
      logAdminActivity(
        "Content Management",
        "Deleted What We Offer image",
        `Removed image #${id} from What We Offer section`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Delete failed. Please try again.";
      toast({ variant: "destructive", title: "Delete failed", description: message });
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Move item ────────────────────────────────────────────────────────────
  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[newIndex]] = [
      reordered[newIndex],
      reordered[index],
    ];
    setItems(reordered);

    try {
      const res = await fetch(apiUrl("whatweoffer/whatweoffer.php"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reordered.map((i) => i.id) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Reorder failed");
    } catch {
      toast({
        variant: "destructive",
        title: "Reorder failed",
        description: "Could not save the new order. Please refresh.",
      });
      fetchItems(); // revert to server state
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            What We Offer Section
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the images shown in the &ldquo;What We Offer&rdquo; section.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 rounded-lg border border-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          What We Offer Section
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload up to {MAX_ITEMS} images for the &ldquo;What We Offer&rdquo;
          section on the homepage. These images replace the randomly fetched menu
          images.
        </p>
      </div>

      {/* Image Grid */}
      <div className="space-y-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">
              No images yet. Upload up to {MAX_ITEMS} images below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
              >
                {/* Image */}
                <div className="relative w-full h-48">
                  <img
                    src={normalizeApiAssetUrl(item.image)}
                    alt={`Offer ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {/* Move Up */}
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move left"
                  >
                    <svg
                      className="w-4 h-4 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === items.length - 1}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move right"
                  >
                    <svg
                      className="w-4 h-4 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 disabled:opacity-50 transition-colors"
                    title="Delete"
                  >
                    {deletingId === item.id ? (
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Position badge */}
                <span className="absolute top-2 left-2 text-xs bg-white/90 text-gray-700 px-2 py-0.5 rounded-full font-medium shadow-sm">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        {items.length < MAX_ITEMS && (
          <div className="pt-4 border-t border-gray-100">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-3 text-sm rounded-lg border-2 border-dashed border-gray-300
                         text-gray-500 hover:border-[#E6CFAF] hover:text-gray-700 hover:bg-gray-50
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Uploading…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Image ({items.length}/{MAX_ITEMS})
                </span>
              )}
            </button>
          </div>
        )}

        {items.length >= MAX_ITEMS && (
          <p className="text-xs text-gray-400 text-center pt-3 border-t border-gray-100">
            Maximum of {MAX_ITEMS} images reached. Delete one to upload a new
            one.
          </p>
        )}
      </div>
    </div>
  );
};

export default WhatWeOfferEditor;
