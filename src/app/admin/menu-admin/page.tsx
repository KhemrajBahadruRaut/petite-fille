"use client";
import React, { useEffect, useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  Utensils,
  Pencil,
  Save,
} from "lucide-react";
import { apiUrl } from "../../../utils/api";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  hide_item?: number | string | boolean;
  hide_image?: number | string | boolean;
  image_path?: string;
  category: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

interface MenuForm {
  name: string;
  price: string;
  description: string;
  image: File | null;
  category: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ToastNotification = ({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
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
      className={`flex items-center gap-3 p-4 rounded-lg border ${colors[toast.type]} shadow-sm mb-3 transition-all duration-300 ease-in-out`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

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

export default function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [pendingItemVisibility, setPendingItemVisibility] = useState<
    Record<number, boolean>
  >({});
  const [pendingImageVisibility, setPendingImageVisibility] = useState<
    Record<number, boolean>
  >({});
  const [pendingAllImageVisibility, setPendingAllImageVisibility] = useState<
    "hide" | "show" | null
  >(null);

  const [form, setForm] = useState<MenuForm>({
    name: "",
    price: "",
    description: "",
    image: null,
    category: "",
  });

  /** Toast helpers */
  const addToast = (message: string, type: "success" | "error" | "warning") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  /** Fetch items */
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        apiUrl(`menu/get_menu_item.php?include_hidden=1&t=${Date.now()}`),
        {
          cache: "no-store",
        },
      );
      const data = await res.json();
      interface CategoryData {
        items: MenuItem[];
        name: string;
      }
      const allItems = data.flatMap((cat: CategoryData) =>
        (cat.items || []).map((item: MenuItem) => ({
          ...item,
          category: cat.name,
        })),
      );
      setItems(allItems);
    } catch {
      addToast("Failed to fetch menu items", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /** Fetch categories */
  const fetchCategories = async () => {
    try {
      const res = await fetch(apiUrl("menu/get_categories.php"));
      const data = await res.json();
      setCategories(data);
    } catch {
      addToast("Failed to load categories", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  /** Form validation */
  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      addToast("Item name is required", "warning");
      return false;
    }
    if (
      !form.price ||
      isNaN(parseFloat(form.price)) ||
      parseFloat(form.price) <= 0
    ) {
      addToast("Valid price is required", "warning");
      return false;
    }
    if (!form.category) {
      addToast("Category is required", "warning");
      return false;
    }
    return true;
  };

  /** Add or Update item */
  const submitItem = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("category_id", form.category);
    if (form.image) formData.append("image", form.image);

    setIsLoading(true);

    try {
      const url = editingItemId
        ? apiUrl(`menu/update_menu_item.php?id=${editingItemId}`)
        : apiUrl("menu/add_menu_item.php");

      const res = await fetch(url, { method: "POST", body: formData });

      if (res.ok) {
        addToast(
          editingItemId
            ? "Item updated successfully"
            : `${form.name} added successfully`,
          "success",
        );
        setForm({
          name: "",
          price: "",
          description: "",
          image: null,
          category: "",
        });
        setEditingItemId(null);
        fetchItems();
      } else {
        throw new Error("Failed to save item");
      }
    } catch (error) {
      console.error(error);
      addToast("Error saving item. Try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /** Delete item */
  const deleteItem = async (id: number, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;
    try {
      const formData = new FormData();
      formData.append("id", id.toString());

      const res = await fetch(apiUrl("menu/delete_menu_item.php"), {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        addToast(`${itemName} deleted successfully`, "success");
        fetchItems();
      } else {
        addToast(data?.message || "Failed to delete item", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Error deleting item. Try again.", "error");
    }
  };

  /** Hide/show item on the public menu */
  const toggleItemVisibility = async (
    item: MenuItem,
    nextHidden: boolean,
  ) => {
    const confirmed = window.confirm(
      nextHidden
        ? `Hide "${item.name}" from the website menu?`
        : `Show "${item.name}" on the website menu?`,
    );
    if (!confirmed || pendingItemVisibility[item.id]) return;

    const formData = new FormData();
    formData.append("id", item.id.toString());
    formData.append("hide_item", nextHidden ? "1" : "0");

    setPendingItemVisibility((prev) => ({ ...prev, [item.id]: true }));
    setItems((prev) =>
      prev.map((current) =>
        current.id === item.id
          ? { ...current, hide_item: nextHidden ? 1 : 0 }
          : current,
      ),
    );

    try {
      const res = await fetch(apiUrl("menu/toggle_menu_item_visibility.php"), {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        addToast(
          nextHidden
            ? `${item.name} hidden from menu`
            : `${item.name} shown on menu`,
          "success",
        );
        fetchItems();
      } else {
        throw new Error(data?.message || "Failed to update image visibility");
      }
    } catch (error) {
      console.error(error);
      setItems((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? { ...current, hide_item: nextHidden ? 0 : 1 }
            : current,
        ),
      );
      addToast("Error updating item visibility. Try again.", "error");
    } finally {
      setPendingItemVisibility((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  /** Hide/show item image on the public menu */
  const toggleItemImageVisibility = async (
    item: MenuItem,
    nextHidden: boolean,
  ) => {
    const confirmed = window.confirm(
      nextHidden
        ? `Hide the picture for "${item.name}" on the website menu?`
        : `Show the picture for "${item.name}" on the website menu?`,
    );
    if (!confirmed || pendingImageVisibility[item.id]) return;

    const formData = new FormData();
    formData.append("id", item.id.toString());
    formData.append("hide_image", nextHidden ? "1" : "0");

    setPendingImageVisibility((prev) => ({ ...prev, [item.id]: true }));
    setItems((prev) =>
      prev.map((current) =>
        current.id === item.id
          ? { ...current, hide_image: nextHidden ? 1 : 0 }
          : current,
      ),
    );

    try {
      const res = await fetch(apiUrl("menu/toggle_menu_item_image.php"), {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        addToast(
          nextHidden
            ? `${item.name} picture hidden from menu`
            : `${item.name} picture shown on menu`,
          "success",
        );
        fetchItems();
      } else {
        throw new Error(data?.message || "Failed to update image visibility");
      }
    } catch (error) {
      console.error(error);
      setItems((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? { ...current, hide_image: nextHidden ? 0 : 1 }
            : current,
        ),
      );
      addToast("Error updating image visibility. Try again.", "error");
    } finally {
      setPendingImageVisibility((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  /** Hide/show every main menu item image on the public menu */
  const toggleAllMainImagesVisibility = async (nextHidden: boolean) => {
    const affectedItems = mainItemsWithImages;
    if (affectedItems.length === 0) {
      addToast("No main menu images found to update.", "warning");
      return;
    }
    if (nextHidden && allMainImagesHidden) {
      addToast("All main menu images are already hidden.", "warning");
      return;
    }
    if (!nextHidden && allMainImagesShown) {
      addToast("All main menu images are already shown.", "warning");
      return;
    }

    const confirmed = window.confirm(
      nextHidden
        ? `Hide all ${affectedItems.length} main menu pictures on the website menu?`
        : `Show all ${affectedItems.length} main menu pictures on the website menu?`,
    );
    if (!confirmed || pendingAllImageVisibility) return;

    const previousValues = new Map(
      affectedItems.map((item) => [item.id, item.hide_image]),
    );
    const affectedIds = new Set(affectedItems.map((item) => item.id));
    const action = nextHidden ? "hide" : "show";

    setPendingAllImageVisibility(action);
    setItems((prev) =>
      prev.map((item) =>
        affectedIds.has(item.id)
          ? { ...item, hide_image: nextHidden ? 1 : 0 }
          : item,
      ),
    );

    const formData = new FormData();
    formData.append("hide_image", nextHidden ? "1" : "0");

    try {
      const res = await fetch(apiUrl("menu/toggle_menu_images.php"), {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        addToast(
          nextHidden
            ? "All main menu pictures hidden from menu"
            : "All main menu pictures shown on menu",
          "success",
        );
        fetchItems();
      } else {
        throw new Error(data?.message || "Failed to update menu images");
      }
    } catch (error) {
      console.error(error);
      setItems((prev) =>
        prev.map((item) =>
          previousValues.has(item.id)
            ? { ...item, hide_image: previousValues.get(item.id) }
            : item,
        ),
      );
      addToast("Error updating all image visibility. Try again.", "error");
    } finally {
      setPendingAllImageVisibility(null);
    }
  };

  /** Edit item */
  const editItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setForm({
      name: item.name,
      price: item.price.toString(),
      description: item.description || "",
      image: null,
      category:
        categories.find((c) => c.name === item.category)?.id.toString() || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Category add */
 const addCategory = async () => {
  if (!newCategory.trim()) {
    addToast("Category name required", "warning");
    return;
  }

  // Optimistic update — add to UI immediately
  const tempCategory: Category = {
    id: Date.now(),       // temporary ID
    name: newCategory.trim(),
    slug: newCategory.trim().toLowerCase().replace(/\s+/g, "-"),
  };
  setCategories((prev) => [...prev, tempCategory]);
  setNewCategory("");

  const formData = new FormData();
  formData.append("name", tempCategory.name);

  try {
    const res = await fetch(apiUrl("menu/add_category.php"), {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      addToast("Category added", "success");
      fetchCategories(); // sync real ID from server
    } else {
      // Rollback on failure
      setCategories((prev) => prev.filter((c) => c.id !== tempCategory.id));
      addToast("Failed to add category", "error");
    }
  } catch {
    setCategories((prev) => prev.filter((c) => c.id !== tempCategory.id));
    addToast("Failed to add category", "error");
  }
};

  /** Update category */
  const updateCategory = async (id: number) => {
    if (!editingCategoryName.trim()) {
      addToast("Category name required", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("id", id.toString());
    formData.append("name", editingCategoryName.trim());

    try {
      const res = await fetch(apiUrl("menu/update_category.php"), {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        addToast("Category updated", "success");
        setEditingCategoryId(null);
        setEditingCategoryName("");
        fetchCategories();
      } else {
        addToast("Failed to update category", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Error updating category", "error");
    }
  };

  /** Delete category */
 const deleteCategory = async (id: number, name: string) => {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  // Optimistic removal
  setCategories((prev) => prev.filter((c) => c.id !== id));

  try {
    const res = await fetch(apiUrl(`menu/delete_category.php?id=${id}`), {
      method: "DELETE",
    });
    const data = await res.json();

    if (res.ok && data.success) {
      addToast("Category deleted", "success");
      fetchCategories(); // re-sync
    } else {
      addToast(data.message || data.error || "Failed to delete category", "error");
      fetchCategories(); // restore on failure
    }
  } catch {
    addToast("Error deleting category", "error");
    fetchCategories();
  }
};

  /** Split items */
  const mainItems = items.filter(
    (i) => (i.category || "").toLowerCase() !== "sides",
  );
  const mainItemsWithImages = mainItems.filter(
    (item) => item.image_path || item.image,
  );
  const allMainImagesHidden =
    mainItemsWithImages.length > 0 &&
    mainItemsWithImages.every(
      (item) =>
        item.hide_image === true ||
        item.hide_image === 1 ||
        item.hide_image === "1",
    );
  const allMainImagesShown =
    mainItemsWithImages.length > 0 &&
    mainItemsWithImages.every(
      (item) =>
        item.hide_image !== true &&
        item.hide_image !== 1 &&
        item.hide_image !== "1",
    );
  const sideItems = items.filter(
    (i) => (i.category || "").toLowerCase() === "sides",
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Toasts */}
      <div className="fixed left-3 right-3 top-3 z-50 sm:left-auto sm:right-6 sm:top-6 sm:w-96 sm:max-w-full">
        {toasts.map((t) => (
          <ToastNotification
            key={t.id}
            toast={t}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Utensils className="w-6 h-6 text-amber-700" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Menu Management</h1>
        </div>
        <p className="text-gray-600">
          Manage your restaurant menu items and categories
        </p>
      </div>

      {/* Categories */}
      <div className="mb-8 rounded-xl border bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Manage Categories
        </h2>
        <div className="mb-4 flex flex-col gap-3 text-gray-500 sm:flex-row">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            className="flex-1 border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors px-3"
          />
          <button
            onClick={addCategory}
            className="rounded-lg bg-amber-600 px-4 py-2 text-white sm:w-auto"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm group"
            >
              {editingCategoryId === cat.id ? (
                <input
                  autoFocus
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  className="bg-white border border-amber-300 rounded px-2 py-0.5 text-sm text-gray-900 outline-none w-24"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") updateCategory(cat.id);
                    if (e.key === "Escape") setEditingCategoryId(null);
                  }}
                />
              ) : (
                <span>{cat.name}</span>
              )}
              <div className="flex gap-1 transition-opacity">
                {editingCategoryId === cat.id ? (
                  <button
                    onClick={() => updateCategory(cat.id)}
                    className="text-green-600 hover:text-green-800 p-0.5"
                    title="Save"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingCategoryId(cat.id);
                      setEditingCategoryName(cat.name);
                    }}
                    className="text-amber-600 hover:text-amber-800 p.5"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => deleteCategory(cat.id, cat.name)}
                  className="text-red-500 hover:text-red-700 p-0.5"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Item Form */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 text-gray-500 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {editingItemId ? "Edit Menu Item" : "Add New Menu Item"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <InputField label="Item Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
              placeholder="Enter item name"
            />
          </InputField>

          <InputField label="Price" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </InputField>

          <InputField label="Category" required>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </InputField>

          {form.category.toLowerCase() !== "sides" && (
            <InputField label="Image">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, image: e.target.files?.[0] || null })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
            </InputField>
          )}
        </div>

        {form.category.toLowerCase() !== "sides" && (
          <InputField label="Description">
            <textarea
              placeholder="Enter item description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            />
          </InputField>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={submitItem}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-amber-700 disabled:bg-amber-400 sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            {isLoading
              ? "Saving..."
              : editingItemId
                ? "Update Item"
                : "Add Item"}
          </button>
        </div>
      </div>

      {/* Main Menu Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Main Menu Items
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage breakfast, lunch, pastry, and coffee items
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleAllMainImagesVisibility(false)}
              disabled={
                pendingAllImageVisibility !== null ||
                mainItemsWithImages.length === 0 ||
                allMainImagesShown
              }
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-50 hover:text-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Eye className="h-4 w-4" />
              {pendingAllImageVisibility === "show"
                ? "Updating..."
                : "Show All Images"}
            </button>
            <button
              type="button"
              onClick={() => toggleAllMainImagesVisibility(true)}
              disabled={
                pendingAllImageVisibility !== null ||
                mainItemsWithImages.length === 0 ||
                allMainImagesHidden
              }
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50 hover:text-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <EyeOff className="h-4 w-4" />
              {pendingAllImageVisibility === "hide"
                ? "Updating..."
                : "Hide All Images"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-245">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mainItems.length > 0 ? (
                mainItems.map((item) => {
                  const imagePath = item.image_path || item.image;
                  const isItemHidden =
                    item.hide_item === true ||
                    item.hide_item === 1 ||
                    item.hide_item === "1";
                  const isImageHidden =
                    item.hide_image === true ||
                    item.hide_image === 1 ||
                    item.hide_image === "1";

                  return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isItemHidden ? "bg-gray-50 opacity-70" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {imagePath && (
                          <img
                            src={apiUrl(imagePath)}
                            alt={item.name}
                            className={`w-12 h-12 rounded-lg object-cover border border-gray-200 ${
                              isImageHidden ? "opacity-40 grayscale" : ""
                            }`}
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">ID: {item.id}</div>
                          {isImageHidden && (
                            <div className="text-xs font-medium text-sky-700">
                              Image hidden
                            </div>
                          )}
                          {isItemHidden && (
                            <div className="text-xs font-medium text-amber-700">
                              Item hidden
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      ${parseFloat((item.price || 0).toString()).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      {item.description || (
                        <span className="text-gray-400 italic">No description</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => editItem(item)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        {imagePath && (
                          <button
                            onClick={() =>
                              toggleItemImageVisibility(item, !isImageHidden)
                            }
                            disabled={!!pendingImageVisibility[item.id]}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              isImageHidden
                                ? "text-sky-700 hover:bg-sky-50 hover:text-sky-800"
                                : "text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {pendingImageVisibility[item.id] ? (
                              "Updating..."
                            ) : isImageHidden ? (
                              <>
                                <Eye className="w-4 h-4" /> Show Image
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" /> Hide Image
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => toggleItemVisibility(item, !isItemHidden)}
                          disabled={!!pendingItemVisibility[item.id]}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isItemHidden
                              ? "text-green-700 hover:bg-green-50 hover:text-green-800"
                              : "text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {pendingItemVisibility[item.id] ? (
                            "Updating..."
                          ) : isItemHidden ? (
                            <>
                              <Eye className="w-4 h-4" /> Show Item
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" /> Hide Item
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id, item.name)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {isLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                      </div>
                    ) : (
                      "No menu items found"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sides Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900">Sides & Add-ons</h2>
          <p className="text-sm text-gray-600 mt-1">Manage side dishes and additional items</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-180">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sideItems.length > 0 ? (
                sideItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">ID: {item.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      ${parseFloat(item.price.toString()).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => editItem(item)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item.id, item.name)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    {isLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                      </div>
                    ) : (
                      "No sides found"
                    )}
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
