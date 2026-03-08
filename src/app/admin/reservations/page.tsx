"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Filter,
  Users,
} from "lucide-react";
import { apiUrl } from "@/utils/api";

type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "fulfilled"
  | "no_show";

interface ReservationRecord {
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
  status: ReservationStatus;
  terms_accepted: number;
  terms_version: string;
  cancellation_link: string;
  cancelled_by: "guest" | "admin" | "0" | "" | null;
  created_at: string;
  updated_at: string;
}

interface ReservationsApiResponse {
  success: boolean;
  count: number;
  reservations: ReservationRecord[];
  message?: string;
}

const STATUS_OPTIONS: ReservationStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "fulfilled",
  "no_show",
];

function statusLabel(status: ReservationStatus): string {
  return status.replace("_", " ");
}

function statusClass(status: ReservationStatus): string {
  switch (status) {
    case "confirmed":
      return "border-green-200 bg-green-50 text-green-700";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";
    case "fulfilled":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "no_show":
      return "border-gray-300 bg-gray-100 text-gray-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toTimestamp(value: string): number {
  if (!value) return 0;
  const date = new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function reservationTimestamp(record: ReservationRecord): number {
  const createdAtTime = toTimestamp(record.created_at);
  if (createdAtTime > 0) return createdAtTime;

  const fallback = toTimestamp(
    `${record.reservation_date} ${record.reservation_time}`,
  );
  if (fallback > 0) return fallback;

  return record.id;
}

function sortReservationsByRecent(
  reservations: ReservationRecord[],
): ReservationRecord[] {
  return [...reservations].sort((a, b) => {
    const timeDiff = reservationTimestamp(b) - reservationTimestamp(a);
    if (timeDiff !== 0) return timeDiff;
    return b.id - a.id;
  });
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingReservationIds, setUpdatingReservationIds] = useState<
    Record<number, boolean>
  >({});
  const [deletingReservationIds, setDeletingReservationIds] = useState<
    Record<number, boolean>
  >({});
  const inFlightUpdateIdsRef = useRef<Set<number>>(new Set());
  const inFlightDeleteIdsRef = useRef<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | ReservationStatus>("all");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "idle";
    text: string;
  }>({ type: "idle", text: "" });

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setMessage({ type: "idle", text: "" });

    try {
      const query =
        filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;

      const response = await fetch(apiUrl(`reservation/get_reservations.php${query}`), {
        cache: "no-store",
      });
      const data = (await response.json()) as ReservationsApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch reservations.");
      }

      setReservations(sortReservationsByRecent(data.reservations || []));
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Unable to fetch reservations.",
      });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const updateStatus = useCallback(
    async (id: number, status: ReservationStatus) => {
      if (inFlightUpdateIdsRef.current.has(id)) {
        return;
      }
      inFlightUpdateIdsRef.current.add(id);
      setUpdatingReservationIds((prev) => ({ ...prev, [id]: true }));

      try {
        const response = await fetch(apiUrl("reservation/update_status.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status, cancelledBy: "admin" }),
        });
        const data = (await response.json()) as { success?: boolean; message?: string };

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to update status.");
        }

        setReservations((prev) =>
          sortReservationsByRecent(
            prev.map((item) => (item.id === id ? { ...item, status } : item)),
          ),
        );
        setMessage({ type: "success", text: `Reservation #${id} updated.` });
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error ? error.message : "Unable to update reservation.",
        });
      } finally {
        inFlightUpdateIdsRef.current.delete(id);
        setUpdatingReservationIds((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [],
  );

  const deleteReservation = useCallback(async (id: number) => {
    if (inFlightDeleteIdsRef.current.has(id)) {
      return;
    }

    inFlightDeleteIdsRef.current.add(id);
    setDeletingReservationIds((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(apiUrl("reservation/delete_reservation.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete reservation.");
      }

      setReservations((prev) => prev.filter((item) => item.id !== id));
      setMessage({
        type: "success",
        text: data.message || `Reservation #${id} deleted.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Unable to delete reservation.",
      });
    } finally {
      inFlightDeleteIdsRef.current.delete(id);
      setDeletingReservationIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }, []);

  const stats = useMemo(
    () => ({
      total: reservations.length,
      pending: reservations.filter((r) => r.status === "pending").length,
      confirmed: reservations.filter((r) => r.status === "confirmed").length,
      cancelled: reservations.filter((r) => r.status === "cancelled").length,
    }),
    [reservations],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reservations</h1>
          <p className="text-sm text-gray-600">
            Manage booking requests and statuses.
          </p>
        </div>
        <button
          onClick={fetchReservations}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 sm:w-auto"
        >
          Refresh
        </button>
      </div>

      {message.text && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-amber-600">Pending</p>
          <p className="mt-1 text-xl font-bold text-amber-700">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-green-600">Confirmed</p>
          <p className="mt-1 text-xl font-bold text-green-700">
            {stats.confirmed}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-red-600">Cancelled</p>
          <p className="mt-1 text-xl font-bold text-red-700">{stats.cancelled}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as "all" | ReservationStatus)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto"
        >
          <option value="all">All</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500 sm:ml-auto">
          Showing {reservations.length} reservation(s)
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reservations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Booking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="align-top">
                    <td className="px-3 py-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {reservation.full_name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        #{reservation.id}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-700">
                      <p>{reservation.email}</p>
                      <p className="mt-1">{reservation.phone}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {formatDate(reservation.reservation_date)}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-gray-500" />
                        {reservation.reservation_time}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        {reservation.guests} guest(s)
                      </div>
                    </td>
                    <td className="max-w-sm px-3 py-3 text-xs text-gray-700">
                      <p>
                        <span className="font-medium">Food:</span>{" "}
                        {reservation.food_preferences || "-"}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium">Allergies:</span>{" "}
                        {reservation.allergies || "-"}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium">Request:</span>{" "}
                        {reservation.notes || "-"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`mb-2 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClass(reservation.status)}`}
                      >
                        {statusLabel(reservation.status)}
                      </span>
                      {(() => {
                        const isCancelled = reservation.status === "cancelled";
                        const isUpdating =
                          updatingReservationIds[reservation.id] === true;

                        if (isCancelled) {
                          return (
                            <div
                              className="block w-full rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700"
                              title="Cancelled reservations cannot be changed."
                            >
                              Locked (cancelled)
                            </div>
                          );
                        }

                        return (
                          <select
                            className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            value={reservation.status}
                            disabled={isUpdating}
                            title={
                              isUpdating
                                ? "Updating reservation status..."
                                : "Update reservation status"
                            }
                            onChange={(event) =>
                              updateStatus(
                                reservation.id,
                                event.target.value as ReservationStatus,
                              )
                            }
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {statusLabel(status)}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                      {reservation.cancelled_by && (
                        <p className="mt-1 text-[11px] text-gray-500">
                          cancelled by{" "}
                          {reservation.cancelled_by === "0"
                            ? "guest"
                            : reservation.cancelled_by}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      {formatDateTime(reservation.created_at)}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => deleteReservation(reservation.id)}
                        disabled={deletingReservationIds[reservation.id] === true}
                        className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingReservationIds[reservation.id] === true
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && reservations.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle2 className="h-4 w-4" />
          Reservation terms consent version is stored per record in backend.
        </div>
      )}
    </div>
  );
}
