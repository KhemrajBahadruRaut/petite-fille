"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { apiUrl } from "@/utils/api";
import { useUserAuth } from "@/contexts/UserAuthContext";

interface UserReservation {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  notes: string;
  food_preferences: string;
  allergies: string;
  status: "pending" | "confirmed" | "cancelled" | "fulfilled" | "no_show";
  cancelled_by: "guest" | "admin" | null;
  created_at: string;
}

interface UserOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
}

interface UserOrder {
  id: number;
  status: "placed" | "confirmed" | "preparing" | "completed" | "cancelled";
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  notes: string;
  createdAt: string;
  items: UserOrderItem[];
}

type ProfileToastType = "success" | "error" | "confirm";

interface ProfileToastState {
  show: boolean;
  type: ProfileToastType;
  message: string;
  onConfirm?: (() => void) | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, logout } = useUserAuth();

  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ProfileToastState>({
    show: false,
    type: "success",
    message: "",
    onConfirm: null,
  });

  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  const fetchProfileData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    setError("");

    try {
      const [reservationsResponse, ordersResponse] = await Promise.all([
        fetch(apiUrl("reservation/get_user_reservations.php"), {
          headers: authHeaders,
          cache: "no-store",
        }),
        fetch(apiUrl("orders/get_user_orders.php"), {
          headers: authHeaders,
          cache: "no-store",
        }),
      ]);

      const reservationsPayload = await reservationsResponse.json().catch(() => null);
      const ordersPayload = await ordersResponse.json().catch(() => null);

      if (!reservationsResponse.ok || !reservationsPayload?.success) {
        throw new Error(reservationsPayload?.message || "Failed to load reservations.");
      }
      if (!ordersResponse.ok || !ordersPayload?.success) {
        throw new Error(ordersPayload?.message || "Failed to load orders.");
      }

      setReservations(
        Array.isArray(reservationsPayload.reservations)
          ? (reservationsPayload.reservations as UserReservation[])
          : [],
      );
      setOrders(
        Array.isArray(ordersPayload.orders) ? (ordersPayload.orders as UserOrder[]) : [],
      );
    } catch (fetchError) {
      const text =
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load profile data.";
      setError(text);
    } finally {
      setLoadingData(false);
    }
  }, [authHeaders, token]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    fetchProfileData();
  }, [fetchProfileData, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!toast.show || toast.type === "confirm") return;
    const timer = window.setTimeout(() => {
      setToast({ show: false, type: "success", message: "", onConfirm: null });
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [toast.show, toast.type]);

  const showToast = (
    type: ProfileToastType,
    messageText: string,
    onConfirm: (() => void) | null = null,
  ) => {
    setToast({
      show: true,
      type,
      message: messageText,
      onConfirm,
    });
  };

  const cancelReservation = async (id: number) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(apiUrl("reservation/cancel_user_reservation.php"), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ id }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to cancel reservation.");
      }

      const successMessage = payload.message || "Reservation cancelled.";
      setMessage(successMessage);
      showToast("success", successMessage);
      await fetchProfileData();
    } catch (cancelError) {
      const text =
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel reservation.";
      setError(text);
      showToast("error", text);
    }
  };

  const cancelOrder = async (orderId: number) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(apiUrl("orders/cancel_order.php"), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ orderId }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to cancel order.");
      }

      const successMessage = payload.message || "Order cancelled.";
      setMessage(successMessage);
      showToast("success", successMessage);
      await fetchProfileData();
    } catch (cancelError) {
      const text =
        cancelError instanceof Error ? cancelError.message : "Unable to cancel order.";
      setError(text);
      showToast("error", text);
    }
  };

  const handleReservationCancelClick = (reservation: UserReservation) => {
    showToast(
      "confirm",
      `Cancel reservation #${reservation.id} on ${reservation.reservation_date} at ${reservation.reservation_time}?`,
      () => {
        void cancelReservation(reservation.id);
      },
    );
  };

  const handleOrderCancelClick = (order: UserOrder) => {
    showToast("confirm", `Cancel order #${order.id}?`, () => {
      void cancelOrder(order.id);
    });
  };

  const closeToast = () => {
    setToast({ show: false, type: "success", message: "", onConfirm: null });
  };

  const confirmToastAction = () => {
    const action = toast.onConfirm;
    closeToast();
    if (action) {
      action();
    }
  };

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
          <p className="mt-2 text-sm text-gray-600">
            Please login to manage your reservations and orders.
          </p>
          <div className="mt-4">
            <Link
              href="/auth/login?next=/profile"
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                {user.name} ({user.email})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchProfileData}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Refresh
              </button>
              <button
                onClick={async () => {
                  await logout();
                  router.push("/auth/login");
                }}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <AnimatePresence>
          {toast.show && (
            <>
              {toast.type === "confirm" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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
                    toast.type === "success"
                      ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
                      : toast.type === "error"
                        ? "border-rose-200 bg-rose-50/95 text-rose-900"
                        : "border-amber-200 bg-amber-50/95 text-amber-900"
                  }`}
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    <div className="mt-0.5">
                      {toast.type === "success" && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      )}
                      {toast.type === "error" && (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                      {toast.type === "confirm" && (
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {toast.type === "confirm"
                          ? "Please confirm cancellation"
                          : toast.type === "success"
                            ? "Action completed"
                            : "Action failed"}
                      </p>
                      <p className="mt-0.5 text-sm">{toast.message}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {toast.type === "confirm" ? (
                        <>
                          <button
                            onClick={closeToast}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                          >
                            Keep
                          </button>
                          <button
                            onClick={confirmToastAction}
                            className="rounded-md border border-red-300 bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Confirm Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={closeToast}
                          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    className={`h-1 w-full ${
                      toast.type === "success"
                        ? "bg-emerald-500"
                        : toast.type === "error"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                    }`}
                  />
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 ">
          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">My Reservations</h2>
            {loadingData ? (
              <p className="mt-4 text-sm text-gray-500">Loading reservations...</p>
            ) : reservations.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No reservations found.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="min-w-0 rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900">
                        Reservation #{reservation.id}
                      </p>
                      <span className="rounded-full border border-gray-300 px-2 py-1 text-xs capitalize text-gray-700">
                        {reservation.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-600">
                      <span className="break-words">
                        {reservation.reservation_date} at {reservation.reservation_time}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span>{reservation.guests} guest(s)</span>
                    </div>
                    {reservation.status !== "cancelled" &&
                      reservation.status !== "fulfilled" &&
                      reservation.status !== "no_show" && (
                        <button
                          onClick={() => handleReservationCancelClick(reservation)}
                          className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          Cancel Reservation
                        </button>
                      )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">My Orders</h2>
            {loadingData ? (
              <p className="mt-4 text-sm text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No orders found.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="min-w-0 rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900">
                        Order #{order.id}
                      </p>
                      <span className="rounded-full border border-gray-300 px-2 py-1 text-xs capitalize text-gray-700">
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-600">
                      <span className="break-words">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span>Total ${Number(order.total || 0).toFixed(2)}</span>
                    </div>

                    <div className="mt-2 max-h-24 overflow-y-auto pr-1 text-xs text-gray-600">
                      {order.items?.map((item) => (
                        <p key={`${order.id}-${item.id}`} className="break-words">
                          {item.name} x {item.quantity}
                        </p>
                      ))}
                    </div>

                    {(order.status === "placed" || order.status === "confirmed") && (
                      <button
                        onClick={() => handleOrderCancelClick(order)}
                        className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
