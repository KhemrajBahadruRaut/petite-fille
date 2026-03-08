"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, X, XCircle } from "lucide-react";
import { apiUrl } from "@/utils/api";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useCart } from "@/contexts/CartContexts";

interface UserReservation {
  id: number;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled" | "fulfilled" | "no_show";
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
  const { favorites, removeFromFavorites, isHydrated } = useCart();

  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [reservationsError, setReservationsError] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [pendingReservationActions, setPendingReservationActions] = useState<
    Record<number, "cancel" | "delete">
  >({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [toast, setToast] = useState<ProfileToastState>({
    show: false,
    type: "success",
    message: "",
    onConfirm: null,
  });

  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  const jsonAuthHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

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

  const fetchProfileData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    setError("");
    setReservationsError("");

    try {
      const response = await fetch(apiUrl("reservation/get_user_reservations.php"), {
        headers: authHeaders,
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to load reservations.");
      }

      setReservations(
        Array.isArray(payload?.reservations)
          ? (payload.reservations as UserReservation[])
          : [],
      );
    } catch (fetchError) {
      const text =
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load profile data.";
      setReservations([]);
      setReservationsError(text);
      setError(text);
    } finally {
      setLoadingData(false);
    }
  }, [authHeaders, token]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    void fetchProfileData();
  }, [fetchProfileData, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!toast.show || toast.type === "confirm") return;
    const timer = window.setTimeout(() => {
      setToast({ show: false, type: "success", message: "", onConfirm: null });
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [toast.show, toast.type]);

  const cancelReservation = async (id: number) => {
    if (pendingReservationActions[id]) return;

    const previousReservation = reservations.find(
      (reservation) => reservation.id === id,
    );
    if (!previousReservation) return;

    setError("");
    setMessage("");
    setPendingReservationActions((prev) => ({ ...prev, [id]: "cancel" }));
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id
          ? { ...reservation, status: "cancelled" }
          : reservation,
      ),
    );

    try {
      const response = await fetch(apiUrl("reservation/cancel_user_reservation.php"), {
        method: "POST",
        headers: jsonAuthHeaders,
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
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? previousReservation : reservation,
        ),
      );
      const text =
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel reservation.";
      setError(text);
      showToast("error", text);
    } finally {
      setPendingReservationActions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const deleteReservation = async (id: number) => {
    if (pendingReservationActions[id]) return;

    const previousIndex = reservations.findIndex(
      (reservation) => reservation.id === id,
    );
    const previousReservation =
      previousIndex >= 0 ? reservations[previousIndex] : null;
    if (!previousReservation) return;

    setError("");
    setMessage("");
    setPendingReservationActions((prev) => ({ ...prev, [id]: "delete" }));
    setReservations((prev) =>
      prev.filter((reservation) => reservation.id !== id),
    );

    try {
      const response = await fetch(apiUrl("reservation/delete_user_reservation.php"), {
        method: "POST",
        headers: jsonAuthHeaders,
        body: JSON.stringify({ id }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to delete reservation.");
      }

      const successMessage = payload.message || "Reservation deleted.";
      setMessage(successMessage);
      showToast("success", successMessage);
      await fetchProfileData();
    } catch (deleteError) {
      setReservations((prev) => {
        if (prev.some((reservation) => reservation.id === id)) {
          return prev;
        }
        const restored = [...prev];
        const insertIndex =
          previousIndex >= 0 && previousIndex <= restored.length
            ? previousIndex
            : restored.length;
        restored.splice(insertIndex, 0, previousReservation);
        return restored;
      });
      const text =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete reservation.";
      setError(text);
      showToast("error", text);
    } finally {
      setPendingReservationActions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
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

  const handleReservationDeleteClick = (reservation: UserReservation) => {
    showToast("confirm", `Delete reservation #${reservation.id}?`, () => {
      void deleteReservation(reservation.id);
    });
  };

  const removeFavorite = (favoriteId: string) => {
    const favorite = favorites.find((item) => item.id === favoriteId);
    removeFromFavorites(favoriteId);
    if (favorite) {
      showToast("success", `${favorite.name} removed from favorites.`);
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
            Please login to manage your reservations and favorites.
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
                onClick={() => void fetchProfileData()}
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
                          ? "Please confirm action"
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
                            Confirm
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

        <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">My Reservations</h2>
          {!!reservationsError && (
            <p className="mt-2 text-xs text-red-600">{reservationsError}</p>
          )}
          {loadingData ? (
            <p className="mt-4 text-sm text-gray-500">Loading reservations...</p>
          ) : reservations.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No reservations found.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {reservations.map((reservation) => {
                const pendingAction =
                  pendingReservationActions[reservation.id] || null;
                return (
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
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {reservation.status !== "cancelled" &&
                      reservation.status !== "fulfilled" &&
                      reservation.status !== "no_show" && (
                        <button
                          onClick={() => handleReservationCancelClick(reservation)}
                          disabled={!!pendingAction}
                          className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {pendingAction === "cancel"
                            ? "Cancelling..."
                            : "Cancel Reservation"}
                        </button>
                      )}
                    <button
                      onClick={() => handleReservationDeleteClick(reservation)}
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

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">My Favorites</h2>
          {!isHydrated ? (
            <p className="mt-4 text-sm text-gray-500">Loading favorites...</p>
          ) : favorites.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No favorite items selected yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="min-w-0 rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100"
                      onClick={() => {
                        if (!favorite.image) return;
                        setPreviewImage({
                          src: favorite.image,
                          alt: favorite.alt || favorite.name,
                        });
                      }}
                      aria-label={`Preview ${favorite.name}`}
                    >
                      {favorite.image ? (
                        <img
                          src={favorite.image}
                          alt={favorite.alt || favorite.name}
                          className="h-16 w-16 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {favorite.name}
                      </p>
                      <p className="mt-1 text-xs capitalize text-gray-500">
                        {favorite.category || "food"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-800">
                        ${Number(favorite.price || 0).toFixed(2)}
                      </p>
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

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-800"
            onClick={() => setPreviewImage(null)}
            aria-label="Close image preview"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={previewImage.src}
            alt={previewImage.alt}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
