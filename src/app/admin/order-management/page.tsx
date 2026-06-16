"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Package,
  Truck,
  Store,
  Clock,
  CheckCheck,
  Ban,
  XCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { apiUrl } from "../../../utils/api";
import { getAdminToken, isAdminAuthenticated } from "@/utils/adminAuth"; // adjust path as needed
// ── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "ready_for_pickup"
  | "completed"
  | "cancelled"
  | "refunded";

interface AdminOrderItem {
  product_id: string | number | null;
  product_name: string;
  category: string | null;
  image: string | null;
  quantity: number;
  unit_price: number;
}

interface AdminOrder {
  id: number;
  user_id: number;
  customer_name: string | null;
  customer_email: string | null;
  stripe_session_id: string;
  fulfillment_method: "delivery" | "pickup";
  status: OrderStatus;
  total_amount: number;
  shipping_name: string | null;
  shipping_address: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_delivery: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: AdminOrderItem[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:          { label: "Pending",           color: "bg-yellow-100 text-yellow-700 border-yellow-200",  icon: <Clock className="h-3 w-3" /> },
  paid:             { label: "Paid",               color: "bg-blue-100 text-blue-700 border-blue-200",        icon: <CheckCircle2 className="h-3 w-3" /> },
  processing:       { label: "Processing",         color: "bg-purple-100 text-purple-700 border-purple-200",  icon: <Package className="h-3 w-3" /> },
  shipped:          { label: "Shipped",            color: "bg-indigo-100 text-indigo-700 border-indigo-200",  icon: <Truck className="h-3 w-3" /> },
  ready_for_pickup: { label: "Ready for Pickup",   color: "bg-amber-100 text-amber-700 border-amber-200",     icon: <Store className="h-3 w-3" /> },
  completed:        { label: "Completed",          color: "bg-green-100 text-green-700 border-green-200",     icon: <CheckCheck className="h-3 w-3" /> },
  cancelled:        { label: "Cancelled",          color: "bg-red-100 text-red-700 border-red-200",           icon: <Ban className="h-3 w-3" /> },
  refunded:         { label: "Refunded",           color: "bg-gray-100 text-gray-600 border-gray-200",        icon: <XCircle className="h-3 w-3" /> },
};

const DELIVERY_NEXT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
  refunded: [],
  pending: ["paid", "cancelled"],
};

const PICKUP_NEXT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["processing", "cancelled"],
  processing: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["completed"],
  completed: [],
  cancelled: [],
  refunded: [],
  pending: ["paid", "cancelled"],
};

const ALL_STATUSES: OrderStatus[] = [
  "pending", "paid", "processing", "shipped",
  "ready_for_pickup", "completed", "cancelled", "refunded",
];

const POLL_INTERVAL_MS = 8000;

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminOrderManagementPage() {
  // Replace the useUserAuth hook with:
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const adminToken = getAdminToken();
    const authed = isAdminAuthenticated();
    setToken(adminToken);
    setIsAuthenticated(authed);
    setAuthLoading(false);
  }, []);

  // rest of component stays the same...

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<"all" | "delivery" | "pickup">("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [trackingDraft, setTrackingDraft] = useState<Record<number, { tracking_number: string; tracking_url: string; estimated_delivery: string }>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  const jsonAuthHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (methodFilter !== "all") params.set("fulfillment_method", methodFilter);

      const res = await fetch(
        apiUrl(`orders/get_all_orders.php${params.toString() ? `?${params.toString()}` : ""}`),
        { headers: authHeaders, cache: "no-store" }
      );
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        setError(payload?.message || "Failed to load orders.");
        return;
      }

      setOrders(Array.isArray(payload.orders) ? payload.orders : []);
    } catch (e) {
      const text = e instanceof Error ? e.message : "Unable to load orders.";
      setError(text);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [authHeaders, token, statusFilter, methodFilter]);

  // Initial + filter-change load
  useEffect(() => {
    if (authLoading || !isAuthenticated || !token) return;
    void fetchOrders(false);
  }, [fetchOrders, authLoading, isAuthenticated, token]);

  // Background polling for live updates
  useEffect(() => {
    if (authLoading || !isAuthenticated || !token) return;
    const interval = window.setInterval(() => {
      void fetchOrders(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [token, authLoading, isAuthenticated, fetchOrders]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const getNextStatuses = (order: AdminOrder): OrderStatus[] => {
    const map = order.fulfillment_method === "pickup" ? PICKUP_NEXT : DELIVERY_NEXT;
    return map[order.status] ?? [];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-5xl rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
          Checking session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900">Sign in required</h1>
          <p className="mt-2 text-sm text-gray-600">Please log in as an admin to manage orders.</p>
        </div>
      </div>
    );
  }


  const updateOrder = async (
    order: AdminOrder,
    updates: Partial<{
      status: OrderStatus;
      tracking_number: string;
      tracking_url: string;
      estimated_delivery: string;
      notes: string;
    }>
  ) => {
    if (updatingId) return;
    setUpdatingId(order.id);

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, ...updates } as AdminOrder : o))
    );

    try {
      const res = await fetch(apiUrl("orders/update_order_status.php"), {
        method: "POST",
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          order_id: order.id,
          status: updates.status ?? order.status,
          ...updates,
        }),
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to update order.");
      }

      setToast({ type: "success", message: `Order #${order.id} updated.` });
      await fetchOrders(true);
    } catch (e) {
      const text = e instanceof Error ? e.message : "Unable to update order.";
      setToast({ type: "error", message: text });
      await fetchOrders(true); // resync to real state
    } finally {
      setUpdatingId(null);
    }
  };

  const setTrackingField = (orderId: number, field: "tracking_number" | "tracking_url" | "estimated_delivery", value: string) => {
    setTrackingDraft((prev) => ({
      ...prev,
      [orderId]: {
        tracking_number: prev[orderId]?.tracking_number ?? "",
        tracking_url: prev[orderId]?.tracking_url ?? "",
        estimated_delivery: prev[orderId]?.estimated_delivery ?? "",
        [field]: value,
      },
    }));
  };

  const markShipped = (order: AdminOrder) => {
    const draft = trackingDraft[order.id];
    updateOrder(order, {
      status: "shipped",
      tracking_number: draft?.tracking_number ?? "",
      tracking_url: draft?.tracking_url ?? "",
      estimated_delivery: draft?.estimated_delivery ?? "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Order Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
                {statusFilter !== "all" || methodFilter !== "all" ? " (filtered)" : ""}
              </p>
            </div>
            <button
              onClick={() => void fetchOrders(false)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
              >
                <option value="all">All statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Fulfillment</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as "all" | "delivery" | "pickup")}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
              >
                <option value="all">All methods</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border px-4 py-2 text-sm shadow-lg ${
            toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
          }`}>
            {toast.message}
          </div>
        )}

        {/* Orders list */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            No orders found.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const nextStatuses = getNextStatuses(order);
              const isUpdating = updatingId === order.id;
              const draft = trackingDraft[order.id];

              return (
                <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">Order #{order.id}</span>
                      <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                      <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {order.fulfillment_method === "pickup" ? <Store className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                        {order.fulfillment_method === "pickup" ? "Pickup" : "Delivery"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-medium text-gray-800">{order.customer_name || "Unknown"}</span>
                    {order.customer_email && <span className="ml-1 text-gray-400">({order.customer_email})</span>}
                    <span className="ml-3 font-medium text-gray-700">${order.total_amount.toFixed(2)} AUD</span>
                  </div>

                  {order.fulfillment_method === "delivery" && order.shipping_address && (
                    <p className="mt-1 text-xs text-gray-500">
                      Ship to: <span className="text-gray-700">{order.shipping_name}</span>, {order.shipping_address}
                    </p>
                  )}

                  {/* Items */}
                  {order.items.length > 0 && (
                    <div className="mt-3 space-y-1 border-t border-gray-100 pt-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span className="font-medium text-gray-700">${(item.quantity * item.unit_price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tracking number display if already shipped */}
                  {order.tracking_number && (
                    <div className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                      Tracking: <span className="font-mono font-semibold">{order.tracking_number}</span>
                      {order.tracking_url && (
                        <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="ml-2 underline">View →</a>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">

                    {/* Shipped action for delivery: needs tracking info */}
                    {order.fulfillment_method === "delivery" && order.status === "processing" && (
                      <div className="flex w-full flex-wrap items-end gap-2">
                        <div className="flex-1 min-w-[140px]">
                          <label className="mb-1 block text-[10px] font-medium text-gray-500">Tracking Number</label>
                          <input
                            type="text"
                            value={draft?.tracking_number ?? ""}
                            onChange={(e) => setTrackingField(order.id, "tracking_number", e.target.value)}
                            placeholder="e.g. AUS123456789"
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs"
                          />
                        </div>
                        <div className="flex-1 min-w-[140px]">
                          <label className="mb-1 block text-[10px] font-medium text-gray-500">Tracking URL</label>
                          <input
                            type="text"
                            value={draft?.tracking_url ?? ""}
                            onChange={(e) => setTrackingField(order.id, "tracking_url", e.target.value)}
                            placeholder="https://..."
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs"
                          />
                        </div>
                        <div className="min-w-[120px]">
                          <label className="mb-1 block text-[10px] font-medium text-gray-500">Est. Delivery</label>
                          <input
                            type="date"
                            value={draft?.estimated_delivery ?? ""}
                            onChange={(e) => setTrackingField(order.id, "estimated_delivery", e.target.value)}
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs"
                          />
                        </div>
                        <button
                          onClick={() => markShipped(order)}
                          disabled={isUpdating}
                          className="flex items-center gap-1 rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                          <Truck className="h-3 w-3" />
                          {isUpdating ? "Updating..." : "Mark Shipped"}
                        </button>
                      </div>
                    )}

                    {/* Ready for pickup action */}
                    {order.fulfillment_method === "pickup" && order.status === "processing" && (
                      <button
                        onClick={() => updateOrder(order, { status: "ready_for_pickup" })}
                        disabled={isUpdating}
                        className="flex items-center gap-1 rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700 disabled:opacity-60"
                      >
                        <Store className="h-3 w-3" />
                        {isUpdating ? "Updating..." : "Mark Ready for Pickup"}
                      </button>
                    )}

                    {/* Generic next-status buttons (covers paid -> processing, shipped/ready -> completed, etc.) */}
                    {nextStatuses
                      .filter((s) => {
                        // Avoid duplicating the specialized shipped/ready buttons above
                        if (order.fulfillment_method === "delivery" && order.status === "processing" && s === "shipped") return false;
                        if (order.fulfillment_method === "pickup" && order.status === "processing" && s === "ready_for_pickup") return false;
                        return true;
                      })
                      .map((s) => {
                        const cfg = STATUS_CONFIG[s];
                        const isDanger = s === "cancelled" || s === "refunded";
                        return (
                          <button
                            key={s}
                            onClick={() => updateOrder(order, { status: s })}
                            disabled={isUpdating}
                            className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                              isDanger
                                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {cfg.icon}
                            {isUpdating ? "Updating..." : `Mark ${cfg.label}`}
                          </button>
                        );
                      })}

                    {nextStatuses.length === 0 && (
                      <span className="text-xs text-gray-400">No further actions available.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}