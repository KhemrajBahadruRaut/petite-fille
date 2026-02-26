"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { apiUrl } from "@/utils/api";

type JobType = "Full-time" | "Part-time" | "Contract";

interface JobRecord {
  id: number;
  title: string;
  type: JobType;
  experience: string;
  salary: string;
  location: string;
  description: string;
  requirements: string[];
  postedDaysAgo: number;
}

interface JobForm {
  title: string;
  type: JobType;
  experience: string;
  salary: string;
  location: string;
  description: string;
  requirements: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

const INITIAL_FORM: JobForm = {
  title: "",
  type: "Full-time",
  experience: "",
  salary: "",
  location: "",
  description: "",
  requirements: "",
};

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
    <div className={`mb-3 flex items-center gap-3 rounded-lg border p-4 shadow-sm ${colors[toast.type]}`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
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
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {children}
  </div>
);

function normalizeJobType(value: unknown): JobType {
  return value === "Part-time" || value === "Contract" ? value : "Full-time";
}

function normalizeRequirements(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => `${item ?? ""}`.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value || "[]");
      if (Array.isArray(parsed)) {
        return parsed.map((item) => `${item ?? ""}`.trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(/\r\n|\r|\n/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeJob(raw: unknown): JobRecord | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = Number(record.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    title: `${record.title ?? ""}`.trim(),
    type: normalizeJobType(record.type),
    experience: `${record.experience ?? ""}`.trim(),
    salary: `${record.salary ?? ""}`.trim(),
    location: `${record.location ?? ""}`.trim(),
    description: `${record.description ?? ""}`.trim(),
    requirements: normalizeRequirements(record.requirements),
    postedDaysAgo: Number.isFinite(Number(record.postedDaysAgo))
      ? Math.max(0, Number(record.postedDaysAgo))
      : 0,
  };
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [form, setForm] = useState<JobForm>(INITIAL_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, type }]);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl("jobs/get_jobs.php"), { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const payload = await response.json();
      const records = Array.isArray(payload)
        ? payload
            .map((item) => normalizeJob(item))
            .filter((item): item is JobRecord => item !== null)
        : [];

      setJobs(records);
    } catch {
      setJobs([]);
      addToast("Failed to load job listings", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditId(null);
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      addToast("Job title is required", "warning");
      return false;
    }

    if (!form.description.trim()) {
      addToast("Job description is required", "warning");
      return false;
    }

    return true;
  };

  const submitJob = async () => {
    if (!validateForm()) return;

    const body = new FormData();
    body.append("title", form.title.trim());
    body.append("type", form.type);
    body.append("experience", form.experience.trim());
    body.append("salary", form.salary.trim());
    body.append("location", form.location.trim());
    body.append("description", form.description.trim());
    body.append("requirements", form.requirements.trim());

    if (editId !== null) {
      body.append("id", String(editId));
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        apiUrl(editId !== null ? "jobs/update_job.php" : "jobs/add_job.php"),
        { method: "POST", body },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.status !== "success") {
        throw new Error(payload?.message || "Failed to save job");
      }

      addToast(editId !== null ? "Job updated successfully" : "Job added successfully", "success");
      resetForm();
      await fetchJobs();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save job";
      addToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (job: JobRecord) => {
    setEditId(job.id);
    setForm({
      title: job.title,
      type: job.type,
      experience: job.experience,
      salary: job.salary,
      location: job.location,
      description: job.description,
      requirements: job.requirements.join("\n"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteJob = async (job: JobRecord) => {
    const shouldDelete = window.confirm(`Delete "${job.title}"?`);
    if (!shouldDelete) return;

    try {
      const response = await fetch(apiUrl(`jobs/delete_job.php?id=${job.id}`), {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.status !== "success") {
        throw new Error(payload?.message || "Failed to delete job");
      }

      addToast("Job deleted successfully", "success");
      await fetchJobs();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete job";
      addToast(message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="fixed right-6 top-6 z-50 w-96 max-w-full">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <BriefcaseBusiness className="h-6 w-6 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
        </div>
        <p className="text-gray-600">Create and update careers listings from admin.</p>
      </div>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          {editId !== null ? "Edit Job Listing" : "Add New Job Listing"}
        </h2>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InputField label="Job Title" required>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Senior Frontend Developer"
            />
          </InputField>

          <InputField label="Type">
            <select
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, type: normalizeJobType(event.target.value) }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </InputField>

          <InputField label="Experience">
            <input
              type="text"
              value={form.experience}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, experience: event.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 3+ years"
            />
          </InputField>

          <InputField label="Salary">
            <input
              type="text"
              value={form.salary}
              onChange={(event) => setForm((prev) => ({ ...prev, salary: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. $3K - $4K"
            />
          </InputField>

          <InputField label="Location">
            <input
              type="text"
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Kathmandu, Nepal"
            />
          </InputField>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InputField label="Description" required>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write a short job description"
            />
          </InputField>

          <InputField label="Requirements (one per line)">
            <textarea
              rows={4}
              value={form.requirements}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, requirements: event.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={"Requirement 1\nRequirement 2\nRequirement 3"}
            />
          </InputField>
        </div>

        <div className="flex items-center justify-end gap-3">
          {editId !== null && (
            <button
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={submitJob}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? "Saving..." : editId !== null ? "Update Job" : "Add Job"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Job Listings</h2>
          <button
            onClick={fetchJobs}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Posted
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading job listings...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    There are no listings for now.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="align-top transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="mt-1 max-w-sm text-xs text-gray-500 line-clamp-2">
                        {job.description || "No description"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{job.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {job.experience || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{job.salary || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{job.location || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {job.postedDaysAgo}d ago
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(job)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteJob(job)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
