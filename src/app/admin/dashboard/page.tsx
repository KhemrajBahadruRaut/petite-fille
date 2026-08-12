"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock3, RefreshCw, Users, Activity, Filter } from "lucide-react";
import { apiUrl } from "../../../utils/api";

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
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: ReservationStatus;
  cancelled_by: "guest" | "admin" | "0" | "" | null;
  created_at: string;
}

interface ReservationsApiResponse {
  success?: boolean;
  reservations?: ReservationRecord[];
  message?: string;
}

interface AdminRealtimeStats {
  pendingReservations: number;
  latestReservationId: number;
  userCancelledReservations: number;
  latestUserCancelledReservationId: number;
  newContacts: number;
  latestContactId: number;
}

interface AdminRealtimeResponse {
  success?: boolean;
  stats?: AdminRealtimeStats;
  message?: string;
}

interface ActivityLogEntry {
  id: number;
  admin_email: string;
  section: string;
  action: string;
  details: string;
  created_at: string;
}

interface ActivityLogResponse {
  success?: boolean;
  logs?: ActivityLogEntry[];
  total?: number;
  message?: string;
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

function formatLogDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString + (dateString.includes("T") ? "" : "Z"));
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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

function sortReservationsByRecent(
  reservations: ReservationRecord[],
): ReservationRecord[] {
  return [...reservations].sort((a, b) => {
    const timeDiff = toTimestamp(b.created_at) - toTimestamp(a.created_at);
    if (timeDiff !== 0) return timeDiff;
    return b.id - a.id;
  });
}

function statusBadgeClass(status: ReservationStatus): string {
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

const SECTION_BADGE_COLORS: Record<string, string> = {
  "Content Management": "bg-purple-100 text-purple-700 border-purple-200",
  Orders: "bg-blue-100 text-blue-700 border-blue-200",
  Contacts: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Gift Cards": "bg-amber-100 text-amber-700 border-amber-200",
  Reservations: "bg-green-100 text-green-700 border-green-200",
  Settings: "bg-gray-100 text-gray-600 border-gray-200",
};

function sectionBadgeClass(section: string): string {
  return (
    SECTION_BADGE_COLORS[section] ??
    "bg-slate-100 text-slate-600 border-slate-200"
  );
}

const SECTION_FILTER_OPTIONS = [
  "All Sections",
  "Content Management",
  "Orders",
  "Contacts",
  "Gift Cards",
  "Reservations",
  "Settings",
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<AdminRealtimeStats | null>(
    null,
  );

  // Activity log state
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState("All Sections");

  const fetchActivityLogs = useCallback(async () => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (activityFilter !== "All Sections") {
        params.set("section", activityFilter);
      }
      const response = await fetch(
        apiUrl(`admin/get_activity_log.php?${params.toString()}`),
        { cache: "no-store" },
      );
      const payload =
        (await response.json().catch(() => null)) as ActivityLogResponse | null;

      if (
        response.ok &&
        payload?.success &&
        Array.isArray(payload.logs)
      ) {
        setActivityLogs(payload.logs);
      }
    } catch {
      // Silent — activity log fetch failure shouldn't block the dashboard.
    } finally {
      setActivityLoading(false);
    }
  }, [activityFilter]);

  const fetchDashboardData = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const [statsResponse, reservationsResponse] = await Promise.all([
        fetch(apiUrl("admin/get_realtime_alerts.php"), { cache: "no-store" }),
        fetch(apiUrl("reservation/get_reservations.php"), { cache: "no-store" }),
      ]);

      const statsPayload =
        (await statsResponse.json().catch(() => null)) as
          | AdminRealtimeResponse
          | null;
      const reservationsPayload =
        (await reservationsResponse.json().catch(() => null)) as
          | ReservationsApiResponse
          | null;

      if (!statsResponse.ok || !statsPayload?.success || !statsPayload.stats) {
        throw new Error(statsPayload?.message || "Failed to load dashboard stats.");
      }

      if (
        !reservationsResponse.ok ||
        !reservationsPayload?.success ||
        !Array.isArray(reservationsPayload.reservations)
      ) {
        throw new Error(
          reservationsPayload?.message || "Failed to load reservations.",
        );
      }

      setRealtimeStats(statsPayload.stats);
      setReservations(sortReservationsByRecent(reservationsPayload.reservations));
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData(false);
  }, [fetchDashboardData]);

  useEffect(() => {
    void fetchActivityLogs();
  }, [fetchActivityLogs]);

  const summary = useMemo(() => {
    const totalReservations = reservations.length;
    const pending = realtimeStats?.pendingReservations ?? 0;
    const confirmed = reservations.filter((item) => item.status === "confirmed")
      .length;
    const cancelled = reservations.filter((item) => item.status === "cancelled")
      .length;
    const userCancelled =
      realtimeStats?.userCancelledReservations ??
      reservations.filter(
        (item) =>
          item.status === "cancelled" &&
          (item.cancelled_by === "guest" || item.cancelled_by === "0"),
      ).length;
    const newContacts = realtimeStats?.newContacts ?? 0;

    return {
      totalReservations,
      pending,
      confirmed,
      cancelled,
      userCancelled,
      newContacts,
    };
  }, [realtimeStats, reservations]);

  const latestReservations = useMemo(() => reservations.slice(0, 8), [reservations]);

  const handleRefreshAll = () => {
    void fetchDashboardData(true);
    void fetchActivityLogs();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Reservation overview and recent activity.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefreshAll}
          disabled={loading || refreshing}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading || refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Reservations</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {summary.totalReservations}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-amber-600">Pending Reservations</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {summary.pending}
          </p>
        </div>
        <div className="rounded-xl border border-green-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-green-600">Confirmed</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {summary.confirmed}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-red-600">Cancelled</p>
          <p className="mt-1 text-2xl font-bold text-red-700">
            {summary.cancelled}
          </p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-rose-600">Cancelled By Users</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">
            {summary.userCancelled}
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-blue-600">New Contacts</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">
            {summary.newContacts}
          </p>
        </div>
      </div>

      {/* ── Activity Log ── */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Activity Log
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {SECTION_FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activityLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading activity log...</div>
        ) : activityLogs.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No activity logged yet. Changes made in admin sections will appear here.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-wrap items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {/* Dot */}
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-400" />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${sectionBadgeClass(log.section)}`}
                    >
                      {log.section}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {log.action}
                    </span>
                  </div>
                  {log.details && (
                    <p className="mt-0.5 text-xs text-gray-500 truncate max-w-xl">
                      {log.details}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                    <span className="font-medium text-gray-500">
                      {log.admin_email}
                    </span>
                    <span>{formatLogDate(log.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Latest Reservations ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Latest Reservations</h2>
          <Link
            href="/admin/reservations"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Manage all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading dashboard...</div>
        ) : latestReservations.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No reservations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Booking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {latestReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {reservation.full_name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">#{reservation.id}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
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
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium capitalize ${statusBadgeClass(reservation.status)}`}
                      >
                        {reservation.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {reservation.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
