"use client";
import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Trash2, Plus, Shirt, Pencil } from "lucide-react";

// ---------------- Types ----------------
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

const categories = [
  { value: "mug", label: "Mug" },
  { value: "candle", label: "Candle" },
  { value: "tote", label: "Tote Bag" },
  { value: "tshirt", label: "T-Shirt" },
  { value: "cap", label: "Cap" },
  { value: "hoodie", label: "Hoodie" },
  { value: "other", label: "Other" },
];

// ---------------- Toast Component ----------------
const ToastNotification = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
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
      className={`flex items-center gap-3 p-4 rounded-lg border ${colors[toast.type]} shadow-sm mb-3`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ---------------- Input Wrapper ----------------
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

// ---------------- Main Component ----------------
export default function AdminMerch() {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [form, setForm] = useState<MerchForm>({
    name: "",
    price: "",
    description: "",
    image: null,
    category: "mug",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ---------- Toasts ----------
  const addToast = (message: string, type: "success" | "error" | "warning") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ---------- Fetch ----------
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost/petite-backend/merch/get_merch_items.php");
      if (!res.ok) throw new Error("Failed to fetch merch items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load merch items", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ---------- Validate ----------
  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      addToast("Product name is required", "warning");
      return false;
    }
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      addToast("Valid price is required", "warning");
      return false;
    }
    return true;
  };

  // ---------- Add or Update ----------
  const handleSubmit = async () => {
    if (!validateForm()) return;
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("category", form.category);
    if (form.image) formData.append("image", form.image);
    if (editId) formData.append("id", editId.toString());

    setIsLoading(true);
    try {
      const url = editId
        ? "http://localhost/petite-backend/merch/update_item.php"
        : "http://localhost/petite-backend/merch/add_item.php";

      const res = await fetch(url, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to save item");

      addToast(editId ? "Item updated successfully" : "Item added successfully", "success");
      setForm({ name: "", price: "", description: "", image: null, category: "mug" });
      setEditId(null);
      fetchItems();
    } catch (err) {
      console.error(err);
      addToast("Error saving item", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Delete ----------
  const deleteItem = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(
        `http://localhost/petite-backend/merch/delete_item.php?id=${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete");
      addToast(`${name} deleted`, "success");
      fetchItems();
    } catch (err) {
      console.error(err);
      addToast("Error deleting item", "error");
    }
  };

  // ---------- Edit ----------
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

  // ---------------- JSX ----------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toasts */}
      <div className="fixed top-6 right-6 z-50 w-96 max-w-full">
        {toasts.map((t) => (
          <ToastNotification key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Shirt className="w-6 h-6 text-indigo-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Merch Management</h1>
        </div>
        <p className="text-gray-600">Add, edit, and delete your merchandise products</p>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white  text-gray-600 rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {editId ? "Edit Merch Item" : "Add New Merch Item"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <InputField label="Product Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter product name"
            />
          </InputField>

          <InputField label="Price" required>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </InputField>

          <InputField label="Category">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-1 file:px-4 file:rounded file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </InputField>
        </div>

        <InputField label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Enter product description"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
        </InputField>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? "Saving..." : editId ? "Update Item" : "Add Item"}
          </button>
        </div>
      </div>

      {/* Merch Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Merchandise Items</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
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
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">ID: {item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-700">{item.category}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${item.price}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      {item.description || <span className="text-gray-400 italic">No description</span>}
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
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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