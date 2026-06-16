"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  X,
  XCircle,
  Package,
  Truck,
  Store,
  Clock,
  CheckCheck,
  Ban,
} from "lucide-react";
import { apiUrl } from "../../utils/api";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useCart } from "@/contexts/CartContexts";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserGiftCard {
  id: number;
  code: string;
  amount: number;
  status: "active" | "redeemed";
  created_at: string;
  redeemed_at: string | null;
  sender_name?: string;
  sender_email?: string;
  recipient?: string;
  recipient_email?: string;
  message: string | null;
}

interface UserGiftCards {
  received: UserGiftCard[];
  sent: UserGiftCard[];
}

interface UserReservation {
  id: number;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled" | "fulfilled" | "no_show";
}

interface OrderItem {
  product_id: number;
  product_name: string;
  category: string;
  image: string;
  quantity: number;
  unit_price: number;
}

interface UserOrder {
  id: number;
  stripe_session_id: string;
  fulfillment_method: "delivery" | "pickup";
  status: "pending" | "paid" | "processing" | "shipped" | "ready_for_pickup" | "completed" | "cancelled" | "refunded";
  total_amount: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  notes?: string;
}

type ProfileToastType = "success" | "error" | "confirm";

interface ProfileToastState {
  show: boolean;
  type: ProfileToastType;
  message: string;
  onConfirm?: (() => void) | null;
}

// ── Order status helpers ──────────────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<
  UserOrder["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending:           { label: "Pending",            color: "bg-yellow-100 text-yellow-700 border-yellow-200",  icon: <Clock className="h-3 w-3" /> },
  paid:              { label: "Paid",                color: "bg-blue-100 text-blue-700 border-blue-200",        icon: <CheckCircle2 className="h-3 w-3" /> },
  processing:        { label: "Processing",          color: "bg-purple-100 text-purple-700 border-purple-200",  icon: <Package className="h-3 w-3" /> },
  shipped:           { label: "Shipped",             color: "bg-indigo-100 text-indigo-700 border-indigo-200",  icon: <Truck className="h-3 w-3" /> },
  ready_for_pickup:  { label: "Ready for Pickup",   color: "bg-amber-100 text-amber-700 border-amber-200",    icon: <Store className="h-3 w-3" /> },
  completed:         { label: "Completed",           color: "bg-green-100 text-green-700 border-green-200",    icon: <CheckCheck className="h-3 w-3" /> },
  cancelled:         { label: "Cancelled",           color: "bg-red-100 text-red-700 border-red-200",          icon: <Ban className="h-3 w-3" /> },
  refunded:          { label: "Refunded",            color: "bg-gray-100 text-gray-600 border-gray-200",       icon: <XCircle className="h-3 w-3" /> },
};

// Simple progress steps for delivery vs pickup
const DELIVERY_STEPS: UserOrder["status"][] = ["paid", "processing", "shipped", "completed"];
const PICKUP_STEPS:   UserOrder["status"][] = ["paid", "processing", "ready_for_pickup", "completed"];

function OrderProgressBar({ order }: { order: UserOrder }) {
  const steps = order.fulfillment_method === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS;
  const currentIndex = steps.indexOf(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "refunded";

  if (isCancelled) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const cfg = ORDER_STATUS_CONFIG[step];
          const done = currentIndex >= i;
          const active = currentIndex === i;
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs transition-colors ${
                    done
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-gray-200 bg-white text-gray-400"
                  } ${active ? "ring-2 ring-amber-200" : ""}`}
                >
                  {cfg.icon}
                </div>
                <span
                  className={`hidden text-center text-[10px] leading-tight sm:block ${
                    done ? "font-medium text-amber-700" : "text-gray-400"
                  }`}
                  style={{ fontFamily: "arial", maxWidth: 60 }}
                >
                  {cfg.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 rounded transition-colors ${
                    currentIndex > i ? "bg-amber-400" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, logout } = useUserAuth();
  const { favorites, removeFromFavorites, isHydrated } = useCart();

  const [giftCards, setGiftCards] = useState<UserGiftCards>({ received: [], sent: [] });
  const [giftCardsError, setGiftCardsError] = useState("");

  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [reservationsError, setReservationsError] = useState("");

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersError, setOrdersError] = useState("");

  const [loadingData, setLoadingData] = useState(false);
  const [pendingReservationActions, setPendingReservationActions] = useState<
    Record<number, "cancel" | "delete">
  >({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [toast, setToast] = useState<ProfileToastState>({
    show: false,
    type: "success",
    message: "",
    onConfirm: null,
  });

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

  const showToast = (type: ProfileToastType, messageText: string, onConfirm: (() => void) | null = null) => {
    setToast({ show: true, type, message: messageText, onConfirm });
  };

  const closeToast = () => setToast({ show: false, type: "success", message: "", onConfirm: null });

  const confirmToastAction = () => {
    const action = toast.onConfirm;
    closeToast();
    if (action) action();
  };

  const fetchProfileData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    setError("");
    setReservationsError("");
    setGiftCardsError("");
    setOrdersError("");

    try {
      const [resResponse, gcResponse, ordersResponse] = await Promise.all([
        fetch(apiUrl("reservation/get_user_reservations.php"), { headers: authHeaders, cache: "no-store" }),
        fetch(apiUrl("giftCards/get_user_gift_cards.php"), { headers: authHeaders, cache: "no-store" }),
        fetch(apiUrl("orders/get_orders.php"), { headers: authHeaders, cache: "no-store" }),
      ]);

      // Reservations
      const resPayload = await resResponse.json().catch(() => null);
      if (!resResponse.ok || !resPayload?.success) {
        setReservationsError(resPayload?.message || "Failed to load reservations.");
      } else {
        setReservations(Array.isArray(resPayload?.reservations) ? resPayload.reservations : []);
      }

      // Gift cards
      const gcPayload = await gcResponse.json().catch(() => null);
      if (!gcResponse.ok || !gcPayload?.success) {
        setGiftCardsError(gcPayload?.message || "Failed to load gift cards.");
      } else {
        setGiftCards({ received: gcPayload.received ?? [], sent: gcPayload.sent ?? [] });
      }

      // Orders
      const ordersPayload = await ordersResponse.json().catch(() => null);
      if (!ordersResponse.ok || !ordersPayload?.success) {
        setOrdersError(ordersPayload?.message || "Failed to load orders.");
      } else {
        setOrders(Array.isArray(ordersPayload?.orders) ? ordersPayload.orders : []);
      }
    } catch (fetchError) {
      const text = fetchError instanceof Error ? fetchError.message : "Unable to load profile data.";
      setError(text);
    } finally {
      setLoadingData(false);
    }
  }, [authHeaders, token]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    void fetchProfileData();
  }, [fetchProfileData, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!toast.show || toast.type === "confirm") return;
    const timer = window.setTimeout(() => {
      setToast({ show: false, type: "success", message: "", onConfirm: null });
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [toast.show, toast.type]);

// for realtime update 
const ORDERS_POLL_INTERVAL_MS = 8000;

// Lightweight orders-only refetch (doesn't touch reservations/gift cards/loading state)
const fetchOrdersOnly = useCallback(async () => {
  if (!token) return;
  try {
    const res = await fetch(apiUrl("orders/get_orders.php"), { headers: authHeaders, cache: "no-store" });
    const payload = await res.json().catch(() => null);
    if (res.ok && payload?.success) {
      setOrders(Array.isArray(payload.orders) ? payload.orders : []);
    }
  } catch {
    // silent — don't disrupt UI on background poll failure
  }
}, [authHeaders, token]);

useEffect(() => {
  if (isLoading || !isAuthenticated) return;
  const interval = window.setInterval(() => {
    void fetchOrdersOnly();
  }, ORDERS_POLL_INTERVAL_MS);
  return () => window.clearInterval(interval);
}, [isAuthenticated, isLoading, fetchOrdersOnly]);

  // ── Reservation actions ───────────────────────────────────────────────────

  const cancelReservation = async (id: number) => {
    if (pendingReservationActions[id]) return;
    const prev = reservations.find((r) => r.id === id);
    if (!prev) return;
    setError(""); setMessage("");
    setPendingReservationActions((p) => ({ ...p, [id]: "cancel" }));
    setReservations((p) => p.map((r) => r.id === id ? { ...r, status: "cancelled" } : r));
    try {
      const res = await fetch(apiUrl("reservation/cancel_user_reservation.php"), {
        method: "POST", headers: jsonAuthHeaders, body: JSON.stringify({ id }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) throw new Error(payload?.message || "Failed to cancel.");
      showToast("success", payload.message || "Reservation cancelled.");
      await fetchProfileData();
    } catch (e) {
      setReservations((p) => p.map((r) => r.id === id ? prev : r));
      const text = e instanceof Error ? e.message : "Unable to cancel.";
      setError(text); showToast("error", text);
    } finally {
      setPendingReservationActions((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  const deleteReservation = async (id: number) => {
    if (pendingReservationActions[id]) return;
    const prevIdx = reservations.findIndex((r) => r.id === id);
    const prev = prevIdx >= 0 ? reservations[prevIdx] : null;
    if (!prev) return;
    setError(""); setMessage("");
    setPendingReservationActions((p) => ({ ...p, [id]: "delete" }));
    setReservations((p) => p.filter((r) => r.id !== id));
    try {
      const res = await fetch(apiUrl("reservation/delete_user_reservation.php"), {
        method: "POST", headers: jsonAuthHeaders, body: JSON.stringify({ id }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) throw new Error(payload?.message || "Failed to delete.");
      showToast("success", payload.message || "Reservation deleted.");
      await fetchProfileData();
    } catch (e) {
      setReservations((p) => {
        if (p.some((r) => r.id === id)) return p;
        const restored = [...p];
        restored.splice(prevIdx >= 0 && prevIdx <= p.length ? prevIdx : p.length, 0, prev);
        return restored;
      });
      const text = e instanceof Error ? e.message : "Unable to delete.";
      setError(text); showToast("error", text);
    } finally {
      setPendingReservationActions((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  const removeFavorite = (favoriteId: string) => {
    const fav = favorites.find((item) => item.id === favoriteId);
    removeFromFavorites(favoriteId);
    if (fav) showToast("success", `${fav.name} removed from favorites.`);
  };

  // ── Auth guards ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-5xl rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
          Checking session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900">Sign in required</h1>
          <p className="mt-2 text-sm text-gray-600">Please login to manage your reservations and favorites.</p>
          <div className="mt-4">
            <Link href="/auth/login?next=/profile" className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── Profile header ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
              <p className="mt-1 text-sm text-gray-600">{user.name} ({user.email})</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void fetchProfileData()}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Refresh
              </button>
              <button
                onClick={async () => { await logout(); router.push("/auth/login"); }}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* ── Toast ── */}
        <AnimatePresence>
          {toast.show && (
            <>
              {toast.type === "confirm" && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
                  onClick={closeToast}
                />
              )}
              <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl ${
                    toast.type === "success" ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
                    : toast.type === "error"  ? "border-rose-200 bg-rose-50/95 text-rose-900"
                    : "border-amber-200 bg-amber-50/95 text-amber-900"
                  }`}
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    <div className="mt-0.5">
                      {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                      {toast.type === "error"   && <XCircle      className="h-5 w-5 text-rose-600"    />}
                      {toast.type === "confirm" && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {toast.type === "confirm" ? "Please confirm action"
                          : toast.type === "success" ? "Action completed" : "Action failed"}
                      </p>
                      <p className="mt-0.5 text-sm">{toast.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {toast.type === "confirm" ? (
                        <>
                          <button onClick={closeToast} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">Keep</button>
                          <button onClick={confirmToastAction} className="rounded-md border border-red-300 bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">Confirm</button>
                        </>
                      ) : (
                        <button onClick={closeToast} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">Dismiss</button>
                      )}
                    </div>
                  </div>
                  <div className={`h-1 w-full ${toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-rose-500" : "bg-amber-500"}`} />
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ── MY ORDERS ────────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Orders</h2>
            {orders.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {!!ordersError && <p className="mt-2 text-xs text-red-600">{ordersError}</p>}

          {loadingData ? (
            <p className="mt-4 text-sm text-gray-500">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
              <Package className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">No orders yet.</p>
              <Link href="/merchandise" className="mt-1 text-sm font-medium text-amber-600 hover:text-amber-700">
                Browse merchandise →
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {orders.map((order) => {
                const statusCfg = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.pending;
                return (
                  <div key={order.id} className="rounded-xl border border-gray-200 p-4">
                    {/* Order header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          Order #{order.id}
                        </span>
                        <span
                          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusCfg.color}`}
                        >
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500" style={{ fontFamily: "arial" }}>
                        <span className="flex items-center gap-1">
                          {order.fulfillment_method === "pickup" ? (
                            <><Store className="h-3 w-3" /> Pickup</>
                          ) : (
                            <><Truck className="h-3 w-3" /> Delivery</>
                          )}
                        </span>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>•</span>
                        <span className="font-medium text-gray-700">${Number(order.total_amount).toFixed(2)} AUD</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <OrderProgressBar order={order} />

                    {/* Tracking info */}
                    {order.tracking_number && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                        <Truck className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Tracking: <span className="font-mono font-semibold">{order.tracking_number}</span></span>
                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto underline hover:no-underline"
                          >
                            Track →
                          </a>
                        )}
                      </div>
                    )}

                    {/* Estimated delivery */}
                    {order.estimated_delivery && order.status === "shipped" && (
                      <p className="mt-2 text-xs text-gray-500" style={{ fontFamily: "arial" }}>
                        Estimated delivery:{" "}
                        <span className="font-medium text-gray-700">
                          {new Date(order.estimated_delivery).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                      </p>
                    )}

                    {/* Ready for pickup notice */}
                    {order.status === "ready_for_pickup" && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        <Store className="h-3.5 w-3.5 flex-shrink-0" />
                        Your order is ready to collect in-store!
                        {order.notes && <span className="ml-1 text-amber-600">— {order.notes}</span>}
                      </div>
                    )}

                    {/* Items */}
                    {Array.isArray(order.items) && order.items.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.product_name}
                                className="h-10 w-10 flex-shrink-0 rounded-lg border border-gray-100 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-100" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-800" style={{ fontFamily: "arial" }}>
                                {item.product_name}
                              </p>
                              <p className="text-xs text-gray-400" style={{ fontFamily: "arial" }}>
                                Qty {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "arial" }}>
                              ${(item.quantity * Number(item.unit_price)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Reservations ─────────────────────────────────────────────────── */}
        <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">My Reservations</h2>
          {!!reservationsError && <p className="mt-2 text-xs text-red-600">{reservationsError}</p>}
          {loadingData ? (
            <p className="mt-4 text-sm text-gray-500">Loading reservations...</p>
          ) : reservations.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No reservations found.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {reservations.map((reservation) => {
                const pendingAction = pendingReservationActions[reservation.id] || null;
                return (
                  <div key={reservation.id} className="min-w-0 rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900">Reservation #{reservation.id}</p>
                      <span className="rounded-full border border-gray-300 px-2 py-1 text-xs capitalize text-gray-700">
                        {reservation.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-600">
                      <span>{reservation.reservation_date} at {reservation.reservation_time}</span>
                      <span className="text-gray-400">|</span>
                      <span>{reservation.guests} guest(s)</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {reservation.status !== "cancelled" && reservation.status !== "fulfilled" && reservation.status !== "no_show" && (
                        <button
                          onClick={() => showToast("confirm", `Cancel reservation #${reservation.id} on ${reservation.reservation_date} at ${reservation.reservation_time}?`, () => { void cancelReservation(reservation.id); })}
                          disabled={!!pendingAction}
                          className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {pendingAction === "cancel" ? "Cancelling..." : "Cancel Reservation"}
                        </button>
                      )}
                      <button
                        onClick={() => showToast("confirm", `Delete reservation #${reservation.id}?`, () => { void deleteReservation(reservation.id); })}
                        disabled={!!pendingAction}
                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingAction === "delete" ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Gift Cards ───────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">My Gift Cards</h2>
          {!!giftCardsError && <p className="mt-2 text-xs text-red-600">{giftCardsError}</p>}
          {loadingData ? (
            <p className="mt-4 text-sm text-gray-500">Loading gift cards...</p>
          ) : giftCards.received.length === 0 && giftCards.sent.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No gift cards found.</p>
          ) : (
            <div className="mt-4 space-y-6">
              {giftCards.received.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Received</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {giftCards.received.map((card) => (
                      <div key={card.id} className={`rounded-xl border-2 p-4 ${card.status === "active" ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-gray-50 opacity-60"}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-amber-700">${card.amount}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${card.status === "active" ? "border border-green-200 bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>{card.status}</span>
                        </div>
                        <p className="mt-2 font-mono text-sm font-bold tracking-widest text-amber-800">{card.code}</p>
                        {card.sender_name && <p className="mt-1 text-xs text-gray-500">From <span className="font-medium text-gray-700">{card.sender_name}</span></p>}
                        {card.message && <p className="mt-1 line-clamp-2 text-xs italic text-gray-500">&ldquo;{card.message}&rdquo;</p>}
                        <div className="mt-3 space-y-0.5 text-xs text-gray-400">
                          <p>Issued: {new Date(card.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                          {card.redeemed_at && <p>Redeemed: {new Date(card.redeemed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {giftCards.sent.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Sent</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {giftCards.sent.map((card) => (
                      <div key={card.id} className="rounded-xl border-2 border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-700">${card.amount}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${card.status === "active" ? "border border-green-200 bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>{card.status}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <p>To <span className="font-medium text-gray-700">{card.recipient}</span></p>
                          {card.recipient_email && <p className="truncate text-gray-400">{card.recipient_email}</p>}
                        </div>
                        {card.message && <p className="mt-1 line-clamp-2 text-xs italic text-gray-500">&ldquo;{card.message}&rdquo;</p>}
                        <div className="mt-3 space-y-0.5 text-xs text-gray-400">
                          <p>Sent: {new Date(card.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                          {card.redeemed_at && <p className="text-green-600">Redeemed: {new Date(card.redeemed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Favorites ────────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">My Favorites</h2>
          {!isHydrated ? (
            <p className="mt-4 text-sm text-gray-500">Loading favorites...</p>
          ) : favorites.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No favorite items selected yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="min-w-0 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100"
                      onClick={() => { if (favorite.image) setPreviewImage({ src: favorite.image, alt: favorite.alt || favorite.name }); }}
                      aria-label={`Preview ${favorite.name}`}
                    >
                      {favorite.image ? (
                        <img src={favorite.image} alt={favorite.alt || favorite.name} className="h-16 w-16 object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No Image</div>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{favorite.name}</p>
                      <p className="mt-1 text-xs capitalize text-gray-500">{favorite.category || "food"}</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">${Number(favorite.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Image preview modal ── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewImage(null)} role="dialog" aria-modal="true">
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-800" onClick={() => setPreviewImage(null)} aria-label="Close image preview">
            <X className="h-4 w-4" />
          </button>
          <img src={previewImage.src} alt={previewImage.alt} className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}