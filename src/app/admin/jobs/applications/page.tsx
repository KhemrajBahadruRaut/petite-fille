"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { apiUrl, normalizeApiAssetUrl } from "../../../../utils/api";
import { logAdminActivity } from "@/utils/activityLog";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  resume_path: string;
  cover_letter: string;
  status: "new" | "reviewed" | "shortlisted" | "rejected";
  created_at: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

interface JobOption {
  id: number;
  title: string;
}

const STATUS_COLORS: Record<Application["status"], string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  reviewed: "bg-amber-100 text-amber-800 border-amber-200",
  shortlisted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_OPTIONS: Application["status"][] = [
  "new",
  "reviewed",
  "shortlisted",
  "rejected",
];

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
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-600" />,
  };

  const colors = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <div
      className={`mb-3 flex items-center gap-3 rounded-lg border p-4 shadow-sm ${colors[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function AdminApplicationsPage() {
  const searchParams = useSearchParams();
  const prefilterJobId = searchParams.get("job_id");

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [filterJobId, setFilterJobId] = useState<string>(
    prefilterJobId || "all",
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), message, type },
    ]);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("jobs/get_applications.php"), {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch applications");
      }

      const apps: Application[] = Array.isArray(data.applications)
        ? data.applications.map(
            (a: Record<string, unknown>) =>
              ({
                id: Number(a.id),
                job_id: Number(a.job_id),
                job_title: `${a.job_title ?? "Unknown Job"}`,
                applicant_name: `${a.applicant_name ?? ""}`,
                applicant_email: `${a.applicant_email ?? ""}`,
                applicant_phone: `${a.applicant_phone ?? ""}`,
                resume_path: `${a.resume_path ?? ""}`,
                cover_letter: `${a.cover_letter ?? ""}`,
                status: (a.status as Application["status"]) || "new",
                created_at: `${a.created_at ?? ""}`,
              }) as Application,
          )
        : [];

      setApplications(apps);
    } catch {
      setApplications([]);
      addToast("Failed to load applications", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("jobs/get_jobs.php"), {
        cache: "no-store",
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setJobs(
          data
            .filter(
              (j: Record<string, unknown>) =>
                Number(j.id) > 0 && j.title,
            )
            .map((j: Record<string, unknown>) => ({
              id: Number(j.id),
              title: `${j.title}`,
            })),
        );
      }
    } catch {
      /* jobs filter will just be empty */
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, [fetchApplications, fetchJobs]);

  const updateStatus = async (
    app: Application,
    newStatus: Application["status"],
  ) => {
    if (app.status === newStatus) return;
    setUpdatingId(app.id);

    try {
      const body = new FormData();
      body.append("id", String(app.id));
      body.append("status", newStatus);

      const response = await fetch(
        apiUrl("jobs/update_application_status.php"),
        { method: "POST", body },
      );
      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to update status");
      }

      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a)),
      );
      addToast(
        `${app.applicant_name}'s status updated to ${newStatus}`,
        "success",
      );
      logAdminActivity(
        "Job Applications",
        `Updated application status to ${newStatus}`,
        `${app.applicant_name} for ${app.job_title}`,
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to update status",
        "error",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteApplication = async (app: Application) => {
    if (
      !window.confirm(
        `Delete application from ${app.applicant_name}? This cannot be undone.`,
      )
    )
      return;

    try {
      const response = await fetch(
        apiUrl(`jobs/delete_application.php?id=${app.id}`),
        { method: "DELETE" },
      );
      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to delete application");
      }

      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      addToast("Application deleted", "success");
      logAdminActivity(
        "Job Applications",
        "Deleted application",
        `${app.applicant_name} for ${app.job_title}`,
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to delete",
        "error",
      );
    }
  };

  const filtered = useMemo(() => {
    let result = applications;

    if (filterJobId !== "all") {
      result = result.filter((a) => a.job_id === Number(filterJobId));
    }

    if (filterStatus !== "all") {
      result = result.filter((a) => a.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.applicant_name.toLowerCase().includes(q) ||
          a.applicant_email.toLowerCase().includes(q) ||
          a.applicant_phone.toLowerCase().includes(q),
      );
    }

    return result;
  }, [applications, filterJobId, filterStatus, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: applications.length };
    for (const s of STATUS_OPTIONS) {
      counts[s] = applications.filter((a) => a.status === s).length;
    }
    return counts;
  }, [applications]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Toasts */}
      <div className="fixed left-3 right-3 top-3 z-50 sm:left-auto sm:right-6 sm:top-6 sm:w-96 sm:max-w-full">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <FileText className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Job Applications
            </h1>
            <p className="text-sm text-gray-500">
              Review and manage candidate applications
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Link
            href="/admin/jobs"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Jobs Management
          </Link>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { key: "all", label: "Total", color: "bg-gray-100 text-gray-800" },
          { key: "new", label: "New", color: "bg-blue-100 text-blue-800" },
          {
            key: "reviewed",
            label: "Reviewed",
            color: "bg-amber-100 text-amber-800",
          },
          {
            key: "shortlisted",
            label: "Shortlisted",
            color: "bg-green-100 text-green-800",
          },
          {
            key: "rejected",
            label: "Rejected",
            color: "bg-red-100 text-red-800",
          },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key === "all" ? "all" : key)}
            className={`rounded-xl border p-3 text-center transition-all ${
              filterStatus === key
                ? "border-blue-400 ring-2 ring-blue-200"
                : "border-gray-200"
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">
              {statusCounts[key] ?? 0}
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <select
          value={filterJobId}
          onChange={(e) => setFilterJobId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="all">All Jobs</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setFilterJobId("all");
            setFilterStatus("all");
            setSearchQuery("");
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Clear Filters
        </button>

        <button
          onClick={fetchApplications}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Applicant
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Job
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Loading applications...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    {applications.length === 0
                      ? "No applications received yet."
                      : "No applications match the current filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <React.Fragment key={app.id}>
                    <tr className="align-top transition-colors hover:bg-gray-50">
                      {/* Applicant */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {app.applicant_name}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {app.applicant_email}
                        </p>
                        {app.applicant_phone && (
                          <p className="mt-0.5 text-sm text-gray-400">
                            {app.applicant_phone}
                          </p>
                        )}
                      </td>

                      {/* Job */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {app.job_title}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="relative inline-block">
                          <select
                            value={app.status}
                            disabled={updatingId === app.id}
                            onChange={(e) =>
                              updateStatus(
                                app,
                                e.target.value as Application["status"],
                              )
                            }
                            className={`appearance-none rounded-full border py-1 pl-3 pr-7 text-xs font-semibold capitalize transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                              STATUS_COLORS[app.status]
                            } ${updatingId === app.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50" />
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {app.created_at
                          ? new Date(app.created_at).toLocaleDateString(
                              "en-AU",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {app.resume_path && (
                            <a
                              href={normalizeApiAssetUrl(app.resume_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                              title="Download Resume"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Resume
                            </a>
                          )}

                          {app.cover_letter && (
                            <button
                              onClick={() =>
                                setExpandedId(
                                  expandedId === app.id ? null : app.id,
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                              title="View Cover Letter"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Letter
                            </button>
                          )}

                          <button
                            onClick={() => deleteApplication(app)}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            title="Delete Application"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Cover Letter */}
                    {expandedId === app.id && app.cover_letter && (
                      <tr>
                        <td
                          colSpan={5}
                          className="bg-gray-50 px-5 py-4 border-t border-gray-100"
                        >
                          <div className="max-w-2xl">
                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                              Cover Letter
                            </p>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                              {app.cover_letter}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Count footer */}
      {!isLoading && filtered.length > 0 && (
        <p className="mt-3 text-right text-xs text-gray-400">
          Showing {filtered.length} of {applications.length} application
          {applications.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
