"use client";
import React, { useEffect, useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  Shirt,
  Pencil,
  Save,
} from "lucide-react";

/* ---------------- Types ---------------- */
interface MerchItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
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
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* ---------- Toast helpers ---------- */
  const addToast = (message: string, type: Toast["type"]) =>
    setToasts((p) => [...p, { id: Date.now(), message, type }]);

  const removeToast = (id: number) =>
    setToasts((p) => p.filter((t) => t.id !== id));

  /* ---------- Fetch ---------- */
  const fetchCategories = async () => {
    try {
      const r = await fetch(
        "http://localhost/petite-backend/merch/categories/get_categories.php",
      );
      setCategories(await r.json());
    } catch {
      addToast("Failed to load categories", "error");
    }
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const r = await fetch(
        "http://localhost/petite-backend/merch/get_merch_items.php",
      );
      setItems(await r.json());
    } catch {
      addToast("Failed to load merch items", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  /* ---------- Category CRUD ---------- */
  const addCategory = async () => {
    if (!newCategory.trim())
      return addToast("Category name required", "warning");

    const fd = new FormData();
    fd.append("name", newCategory);

    await fetch(
      "http://localhost/petite-backend/merch/categories/add_category.php",
      { method: "POST", body: fd },
    );

    setNewCategory("");
    fetchCategories();
    addToast("Category added", "success");
  };

  const updateCategory = async (id: number) => {
    const fd = new FormData();
    fd.append("id", id.toString());
    fd.append("name", editingCategoryName);

    await fetch(
      "http://localhost/petite-backend/merch/categories/update_category.php",
      { method: "POST", body: fd },
    );

    setEditingCategoryId(null);
    fetchCategories();
    addToast("Category updated", "success");
  };

  const deleteCategory = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;

    await fetch(
      `http://localhost/petite-backend/merch/categories/delete_category.php?id=${id}`,
      { method: "DELETE" },
    );

    fetchCategories();
    addToast("Category deleted", "success");
  };

  /* ---------- Item CRUD ---------- */
  const handleSubmit = async () => {
    if (!form.name || !form.price)
      return addToast("Name & price required", "warning");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v as any));
    if (editId) fd.append("id", editId.toString());

    const url = editId
      ? "http://localhost/petite-backend/merch/update_item.php"
      : "http://localhost/petite-backend/merch/add_item.php";

    await fetch(url, { method: "POST", body: fd });

    setForm({
      name: "",
      price: "",
      description: "",
      image: null,
      category: "",
    });
    setEditId(null);
    fetchItems();
    addToast(editId ? "Item updated" : "Item added", "success");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    await fetch(
      `http://localhost/petite-backend/merch/delete_item.php?id=${id}`,
      { method: "DELETE" },
    );

    fetchItems();
    addToast("Item deleted", "success");
  };

  /* ---------------- JSX ---------------- */
  return (
    <div className="bg-gray-50">
      {/* Toasts */}
      <div className="fixed top-6 right-6 z-50 w-96 space-y-3">
        {toasts.map((t) => (
          <ToastNotification
            key={t.id}
            toast={t}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>

      {/* CATEGORY MANAGER */}
      <div className="bg-white border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-black">Merch Categories</h2>
          {/* Compact Add Input */}
          <div className="flex gap-2 w-full max-w-xs">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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
      <div className="bg-white  text-gray-600 shadow-sm p-6">
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
              accept="image/*"
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
            disabled={isLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 font-medium transition"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? "Saving..." : editId ? "Update Item" : "Add Item"}
          </button>
        </div>
      </div>

      {/* Merch Table */}
      <div className="bg-white border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Merchandise Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
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
                            src={`http://localhost/petite-backend/merch/uploads/${item.image}`}
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
                      <div className="flex gap-3">
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
