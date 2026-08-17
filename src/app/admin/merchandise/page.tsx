"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  Pencil,
  Save,
  ImageIcon,
  Upload,
} from "lucide-react";
import {
  apiUrl,
  normalizeApiAssetUrl,
  withCacheVersion,
} from "../../../utils/api";
import { preloadImages, waitForNextPaint } from "@/utils/preloadImage";
import { logAdminActivity } from "@/utils/activityLog";

/* ---------------- Types ---------------- */
interface MerchItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  image_url?: string;
  image_version?: string | number;
  category: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

interface MerchForm {
  name: string;
  price: string;
  description: string;
  image: File | null;
  category: string;
}

interface MerchCategory {
  id: number;
  name: string;
}

interface MerchSettings {
  online_purchase_enabled: boolean;
}

interface MerchHeroImage {
  slot: number;
  image_url: string;
  image_version?: string | number;
  updated_at?: string;
}

const MERCH_HERO_SLOTS = [
  { slot: 1, label: "Top image", fallback: "/merchendise/merch1.webp" },
  { slot: 2, label: "Left image", fallback: "/merchendise/coffee.webp" },
  { slot: 3, label: "Bottom image", fallback: "/merchendise/bag1.webp" },
  { slot: 4, label: "Right image", fallback: "/merchendise/cup2.webp" },
];

const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
const MERCH_CONTENT_UPDATED_KEY = "merchandise-content-updated";

function validateImageFile(file: File): string | null {
  if (file.type && !file.type.startsWith("image/")) {
    return "Choose an image file";
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return "The image must be no larger than 10 MB";
  }

  return null;
}

function notifyMerchandiseUpdated() {
  try {
    window.localStorage.setItem(MERCH_CONTENT_UPDATED_KEY, String(Date.now()));
  } catch {
    // Private browsing can block storage. Polling remains available as a fallback.
  }
}

/* ---------------- Toast ---------------- */
const ToastNotification = ({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
  };

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg border shadow-sm ${colors[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={onClose}>
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
};

/* ---------------- Input Wrapper ---------------- */
const InputField = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

/* ---------------- MAIN ---------------- */
export default function AdminMerch() {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [categories, setCategories] = useState<MerchCategory[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [form, setForm] = useState<MerchForm>({
    name: "",
    price: "",
    description: "",
    image: null,
    category: "",
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [settings, setSettings] = useState<MerchSettings>({
    online_purchase_enabled: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [heroImages, setHeroImages] = useState<Record<number, MerchHeroImage>>(
    {},
  );
  const [heroImagesLoading, setHeroImagesLoading] = useState(true);
  const [heroSavingSlot, setHeroSavingSlot] = useState<number | null>(null);

  /* ---------- Toast helpers ---------- */
  const addToast = useCallback((message: string, type: Toast["type"]) =>
    setToasts((p) => [...p, { id: Date.now(), message, type }]), []);

  const removeToast = (id: number) =>
    setToasts((p) => p.filter((t) => t.id !== id));

  /* ---------- Fetch ---------- */
  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch(apiUrl("merch/categories/get_categories.php"));
      if (!r.ok) throw new Error("Failed to fetch categories");
      setCategories(await r.json());
    } catch {
      addToast("Failed to load categories", "error");
    }
  }, [addToast]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await fetch(
        withCacheVersion(apiUrl("merch/get_merch_items.php")),
        {
          cache: "no-store",
        },
      );
      if (!r.ok) throw new Error("Failed to fetch items");
      setItems(await r.json());
    } catch {
      addToast("Failed to load merch items", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const r = await fetch(apiUrl("merch/get_settings.php"), {
        cache: "no-store",
      });
      const data = await r.json();

      if (!r.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch settings");
      }

      setSettings({
        online_purchase_enabled:
          data.settings?.online_purchase_enabled !== false,
      });
    } catch {
      addToast("Failed to load merchandise purchase settings", "error");
    } finally {
      setSettingsLoading(false);
    }
  }, [addToast]);

  const fetchHeroImages = useCallback(async (waitForPreviews = false) => {
    if (!waitForPreviews) setHeroImagesLoading(true);
    try {
      const response = await fetch(apiUrl("merch/hero_images.php"), {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch hero images");
      }

      const nextImages: Record<number, MerchHeroImage> = {};
      const images: MerchHeroImage[] = Array.isArray(data.images)
        ? data.images
        : [];
      for (const image of images) {
        if (image.slot >= 1 && image.slot <= 4 && image.image_url) {
          nextImages[image.slot] = image;
        }
      }

      const previewsReady = waitForPreviews
        ? await preloadImages(
            Object.values(nextImages).map((image) => {
              const imageVersion = Number(image.image_version);
              const parsedVersion = image.updated_at
                ? Date.parse(`${image.updated_at.replace(" ", "T")}Z`)
                : 0;
              return withCacheVersion(
                normalizeApiAssetUrl(image.image_url),
                Number.isFinite(imageVersion) && imageVersion > 0
                  ? imageVersion
                  : Number.isFinite(parsedVersion)
                    ? parsedVersion
                    : Date.now(),
              );
            }),
          )
        : true;

      setHeroImages(nextImages);
      return previewsReady;
    } catch {
      addToast("Failed to load merchandise hero images", "error");
      return false;
    } finally {
      if (!waitForPreviews) setHeroImagesLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
    fetchItems();
    fetchSettings();
    fetchHeroImages();
  }, [fetchCategories, fetchHeroImages, fetchItems, fetchSettings]);

  const uploadHeroImage = async (slot: number, selectedFile: File) => {
    const validationError = validateImageFile(selectedFile);
    if (validationError) {
      addToast(validationError, "warning");
      return;
    }

    if (heroImages[slot]) {
      const slotLabel =
        MERCH_HERO_SLOTS.find((imageSlot) => imageSlot.slot === slot)?.label ??
        "hero image";
      const confirmed = window.confirm(
        `Are you sure you want to replace the current ${slotLabel.toLowerCase()} with "${selectedFile.name}"? The current custom image will be removed.`,
      );

      if (!confirmed) return;
    }

    setHeroSavingSlot(slot);
    try {
      const body = new FormData();
      body.append("slot", String(slot));
      body.append("image", selectedFile, selectedFile.name);
      const response = await fetch(apiUrl("merch/hero_images.php"), {
        method: "POST",
        body,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update the hero image");
      }

      const uploadedImage = data.image as MerchHeroImage | undefined;
      if (!uploadedImage?.image_url || uploadedImage.slot !== slot) {
        throw new Error("The uploaded image was not returned by the server");
      }

      const imageVersion = Number(uploadedImage.image_version);
      const parsedVersion = uploadedImage.updated_at
        ? Date.parse(`${uploadedImage.updated_at.replace(" ", "T")}Z`)
        : Date.now();
      const previewReady = await preloadImages([
        withCacheVersion(
          normalizeApiAssetUrl(uploadedImage.image_url),
          Number.isFinite(imageVersion) && imageVersion > 0
            ? imageVersion
            : Number.isFinite(parsedVersion)
              ? parsedVersion
              : Date.now(),
        ),
      ]);

      setHeroImages((current) => ({ ...current, [slot]: uploadedImage }));
      notifyMerchandiseUpdated();
      await waitForNextPaint();
      addToast(
        previewReady
          ? "Merchandise hero image updated"
          : "Image uploaded, but its preview is still loading. Refresh if needed.",
        previewReady ? "success" : "warning",
      );
      logAdminActivity("Content Management", "Updated merch hero image", `Slot ${slot} hero image replaced`);
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to update hero image",
        "error",
      );
    } finally {
      setHeroSavingSlot(null);
    }
  };

  const resetHeroImage = async (slot: number) => {
    if (!window.confirm("Restore the original image for this hero position?")) {
      return;
    }

    setHeroSavingSlot(slot);
    try {
      const response = await fetch(
        apiUrl(`merch/hero_images.php?slot=${slot}`),
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to restore the original image");
      }

      await fetchHeroImages();
      notifyMerchandiseUpdated();
      addToast("Original merchandise hero image restored", "success");
      logAdminActivity("Content Management", "Reset merch hero image", `Slot ${slot} restored to original`);
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Failed to restore the original image",
        "error",
      );
    } finally {
      setHeroSavingSlot(null);
    }
  };

  const heroPreviewUrl = (slot: number, fallback: string) => {
    const image = heroImages[slot];
    if (!image) return fallback;

    const imageVersion = Number(image.image_version);
    const parsedVersion = image.updated_at
      ? Date.parse(`${image.updated_at.replace(" ", "T")}Z`)
      : 0;
    return withCacheVersion(
      normalizeApiAssetUrl(image.image_url),
      Number.isFinite(imageVersion) && imageVersion > 0
        ? imageVersion
        : Number.isFinite(parsedVersion)
          ? parsedVersion
          : 0,
    );
  };

  const updatePurchaseSetting = async (nextEnabled: boolean) => {
    const confirmed = window.confirm(
      nextEnabled
        ? "Enable online merchandise purchases?"
        : "Disable online merchandise purchases? Customers will be asked to go to the store.",
    );

    if (!confirmed) return;

    const previousSettings = settings;
    setSettingsSaving(true);
    setSettings({ online_purchase_enabled: nextEnabled });

    try {
      const r = await fetch(apiUrl("merch/update_settings.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online_purchase_enabled: nextEnabled }),
      });
      const data = await r.json();

      if (!r.ok || !data.success) {
        throw new Error(data.message || "Failed to update settings");
      }

      setSettings({
        online_purchase_enabled:
          data.settings?.online_purchase_enabled !== false,
      });
      addToast(
        nextEnabled
          ? "Online merchandise purchases enabled"
          : "Online merchandise purchases disabled",
        "success",
      );
      logAdminActivity("Content Management", "Toggled merch purchase", nextEnabled ? "Enabled online merch purchases" : "Disabled online merch purchases");
    } catch {
      setSettings(previousSettings);
      addToast("Failed to save merchandise purchase settings", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  /* ---------- Category CRUD ---------- */
const addCategory = async () => {
    if (!newCategory.trim())
      return addToast("Category name required", "warning");

    const fd = new FormData();
    fd.append("name", newCategory);

    try {
      const response = await fetch(apiUrl("merch/categories/add_category.php"), {
        method: "POST",
        body: fd,
      });

      if (!response.ok) throw new Error("Failed to add category");

      // Optimistically add to state immediately
      const data = await response.json().catch(() => null);
      
      if (data?.id) {
        // If server returns the new category with its ID, use it directly
        setCategories((prev) => [...prev, { id: data.id, name: newCategory.trim() }]);
      } else {
        // Fallback: re-fetch from server
        await fetchCategories();
      }

      setNewCategory("");
      addToast("Category added", "success");
      logAdminActivity("Content Management", "Added merch category", newCategory.trim());
    } catch {
      addToast("Failed to add category", "error");
    }
  };
  const updateCategory = async (id: number) => {
    const fd = new FormData();
    fd.append("id", id.toString());
    fd.append("name", editingCategoryName);

    await fetch(apiUrl("merch/categories/update_category.php"), {
      method: "POST",
      body: fd,
    });

    setEditingCategoryId(null);
    fetchCategories();
    addToast("Category updated", "success");
    logAdminActivity("Content Management", "Updated merch category", editingCategoryName.trim());
  };

  const deleteCategory = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;

    await fetch(apiUrl(`merch/categories/delete_category.php?id=${id}`), {
      method: "DELETE",
    });

    fetchCategories();
    addToast("Category deleted", "success");
    logAdminActivity("Content Management", "Deleted merch category", name);
  };

  /* ---------- Item CRUD ---------- */
  const handleSubmit = async () => {
    if (!form.name || !form.price)
      return addToast("Name & price required", "warning");

    if (form.image) {
      const validationError = validateImageFile(form.image);
      if (validationError) {
        addToast(validationError, "warning");
        return;
      }
    }

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("price", form.price);
    fd.append("description", form.description.trim());
    fd.append("category", form.category);
    if (editId !== null) {
      fd.append("id", editId.toString());
    }

    const url =
      editId !== null
        ? apiUrl("merch/update_item.php")
        : apiUrl("merch/add_item.php");

    setIsSubmitting(true);
    try {
      if (form.image) {
        fd.append("image", form.image, form.image.name);
      }

      const response = await fetch(url, { method: "POST", body: fd });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "Failed to save item");
      }

      setForm({
        name: "",
        price: "",
        description: "",
        image: null,
        category: "",
      });
      setEditId(null);
      await fetchItems();
      notifyMerchandiseUpdated();
      addToast(editId !== null ? "Item updated" : "Item added", "success");
      logAdminActivity("Content Management", editId !== null ? "Updated merch item" : "Added merch item", `${form.name.trim()} ($${form.price})`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save item";
      addToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: MerchItem) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      price: item.price.toString(),
      description: item.description || "",
      image: null,
      category: item.category,
    });
    window.scrollTo({ top: 750, behavior: "smooth" });
  };

  const deleteItem = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    await fetch(apiUrl(`merch/delete_item.php?id=${id}`), { method: "DELETE" });

    fetchItems();
    addToast("Item deleted", "success");
    logAdminActivity("Content Management", "Deleted merch item", name);
  };

  /*  JSX  */
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Toasts */}
      <div className="fixed left-3 right-3 top-3 z-50 space-y-3 sm:left-auto sm:right-6 sm:top-6 sm:w-96">
        {toasts.map((t) => (
          <ToastNotification
            key={t.id}
            toast={t}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>

      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Online Merchandise Purchase
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {settings.online_purchase_enabled
                ? "Customers can add merchandise to cart and checkout online."
                : "Customers will see Go to store instead of Add to Cart."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                settings.online_purchase_enabled
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {settings.online_purchase_enabled ? "Enabled" : "Disabled"}
            </span>
            <button
              type="button"
              onClick={() =>
                updatePurchaseSetting(!settings.online_purchase_enabled)
              }
              disabled={settingsLoading || settingsSaving}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                settings.online_purchase_enabled
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {settingsSaving
                ? "Saving..."
                : settings.online_purchase_enabled
                  ? "Disable Purchase"
                  : "Enable Purchase"}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2">
            <ImageIcon className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Merchandise Hero Images
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Change the four images displayed on the right side of the
              merchandise page.
            </p>
          </div>
        </div>

        {heroImagesLoading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Loading hero images...
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MERCH_HERO_SLOTS.map(({ slot, label, fallback }) => {
              const hasOverride = Boolean(heroImages[slot]);
              const isSaving = heroSavingSlot === slot;

              return (
                <article
                  key={slot}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                >
                  <div className="aspect-4/5 overflow-hidden bg-gray-100">
                    <img
                      src={heroPreviewUrl(slot, fallback)}
                      alt={`${label} preview`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-3 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800">
                        {label}
                      </p>
                      <span className="text-xs text-gray-500">
                        {hasOverride ? "Custom" : "Original"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 ${
                          isSaving
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {isSaving
                          ? "Saving..."
                          : hasOverride
                            ? "Replace"
                            : "Upload"}
                        <input
                          type="file"
                          accept="image/*,.heic,.heif"
                          className="sr-only"
                          disabled={isSaving}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (file) void uploadHeroImage(slot, file);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => resetHeroImage(slot)}
                        disabled={!hasOverride || isSaving}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* CATEGORY MANAGER */}
      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-black">Merch Categories</h2>
          {/* Compact Add Input */}
          <div className="flex w-full flex-col gap-2 sm:max-w-xs sm:flex-row">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 border border-gray-300 text-sm text-gray-900 px-3 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="New category..."
            />
            <button
              onClick={addCategory}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 text-sm transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <hr className="mb-4 border-gray-100" />

        {/* Scrollable Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-2 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-3 py-1.5 transition-colors group"
            >
              {editingCategoryId === c.id ? (
                <input
                  autoFocus
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  className="flex-1 border border-indigo-300 text-sm text-gray-900 rounded px-2 py-0.5 outline-none"
                />
              ) : (
                <span className="text-sm font-medium text-gray-700 truncate">
                  {c.name}
                </span>
              )}

              <div className="flex gap-3 ml-4">
                {editingCategoryId === c.id ? (
                  <button
                    onClick={() => updateCategory(c.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingCategoryId(c.id);
                      setEditingCategoryName(c.name);
                    }}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => deleteCategory(c.id, c.name)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="mb-6 rounded-xl border bg-white p-4 text-gray-600 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {editId ? "Edit Merch Item" : "Add New Merch Item"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <InputField label="Product Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter product name"
            />
          </InputField>

          <InputField label="Price" required>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </InputField>

          <InputField label="Category">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Image">
            <input
              type="file"
              accept="image/*,.heic,.heif"
              onChange={(e) =>
                setForm({ ...form, image: e.target.files?.[0] || null })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 file:mr-4 file:px-2 file:rounded file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </InputField>
        </div>

        <InputField label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Enter product description"
            className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500"
          />
        </InputField>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting}
            className="flex w-full items-center justify-center gap-2 bg-indigo-600 px-3 py-2 font-medium text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? "Saving..." : editId ? "Update Item" : "Add Item"}
          </button>
        </div>
      </div>

      {/* Merch Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Merchandise Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-220">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={normalizeApiAssetUrl(
                              withCacheVersion(
                                item.image_url || `merch/uploads/${item.image}`,
                                Number(item.image_version) || 0,
                              ),
                            )}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {item.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-700">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${item.price}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      {item.description || (
                        <span className="text-gray-400 italic">
                          No description
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item.id, item.name)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {isLoading ? "Loading..." : "No merch items found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
