"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  CheckCircle,
  ImageIcon,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  apiUrl,
  normalizeApiAssetUrl,
  withCacheVersion,
} from "../../../utils/api";
import { optimizeImageUpload } from "@/utils/optimizeImageUpload";
import { preloadImages, waitForNextPaint } from "@/utils/preloadImage";

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

interface CareerCarouselImage {
  id: number;
  image_url: string;
  sort_order: number;
  updated_at?: string;
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
  const [carouselImages, setCarouselImages] = useState<CareerCarouselImage[]>(
    [],
  );
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [carouselUploading, setCarouselUploading] = useState(false);
  const [carouselBusyId, setCarouselBusyId] = useState<number | null>(null);
  const [carouselReordering, setCarouselReordering] = useState(false);

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

  const fetchCarouselImages = useCallback(async (waitForPreviews = false) => {
    if (!waitForPreviews) setCarouselLoading(true);
    try {
      const response = await fetch(apiUrl("jobs/carousel_images.php"), {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch carousel images");
      }

      const images: CareerCarouselImage[] = Array.isArray(data.images)
        ? data.images
            .map((image: CareerCarouselImage) => ({
              ...image,
              id: Number(image.id),
              sort_order: Number(image.sort_order),
            }))
            .filter((image: CareerCarouselImage) => image.id > 0 && image.image_url)
        : [];

      const previewsReady = waitForPreviews
        ? await preloadImages(
            images.map((image) => {
              const parsedVersion = image.updated_at
                ? Date.parse(`${image.updated_at.replace(" ", "T")}Z`)
                : 0;
              return withCacheVersion(
                normalizeApiAssetUrl(image.image_url),
                Number.isFinite(parsedVersion) ? parsedVersion : Date.now(),
              );
            }),
          )
        : true;

      setCarouselImages(images);
      return previewsReady;
    } catch {
      setCarouselImages([]);
      addToast("Failed to load careers carousel images", "error");
      return false;
    } finally {
      if (!waitForPreviews) setCarouselLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchJobs();
    fetchCarouselImages();
  }, [fetchCarouselImages, fetchJobs]);

  const uploadCarouselImages = async (selectedFiles: File[]) => {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const invalidFile = selectedFiles.find(
      (file) =>
        !allowedTypes.has(file.type) || file.size > 25 * 1024 * 1024,
    );
    if (invalidFile) {
      addToast(
        "Choose JPG, PNG, or WebP images no larger than 25 MB each",
        "warning",
      );
      return;
    }

    setCarouselUploading(true);
    let uploadedCount = 0;

    try {
      for (const selectedFile of selectedFiles) {
        const optimized = await optimizeImageUpload(selectedFile, 1600, 0.82);
        if (optimized.file.size > 10 * 1024 * 1024) {
          throw new Error(
            `${selectedFile.name} is still larger than the 10 MB upload limit`,
          );
        }

        const body = new FormData();
        body.append("image", optimized.file, optimized.file.name);
        const response = await fetch(apiUrl("jobs/carousel_images.php"), {
          method: "POST",
          body,
        });
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || `Failed to upload ${selectedFile.name}`,
          );
        }
        uploadedCount += 1;
      }

      const previewsReady = await fetchCarouselImages(true);
      await waitForNextPaint();
      addToast(
        previewsReady
          ? `${uploadedCount} careers carousel image${
              uploadedCount === 1 ? "" : "s"
            } added`
          : `${uploadedCount} image${
              uploadedCount === 1 ? " was" : "s were"
            } uploaded, but the preview is still loading. Refresh if needed.`,
        previewsReady ? "success" : "warning",
      );
    } catch (error) {
      if (uploadedCount > 0) {
        await fetchCarouselImages(true);
        await waitForNextPaint();
      }
      addToast(
        `${
          uploadedCount > 0
            ? `${uploadedCount} image${uploadedCount === 1 ? " was" : "s were"} uploaded. `
            : ""
        }${
          error instanceof Error
            ? error.message
            : "Failed to upload carousel images"
        }`,
        uploadedCount > 0 ? "warning" : "error",
      );
    } finally {
      setCarouselUploading(false);
    }
  };

  const deleteCarouselImage = async (image: CareerCarouselImage) => {
    const shouldDelete = window.confirm(
      carouselImages.length === 1
        ? "Delete this image? The public careers carousel will return to its original images."
        : "Delete this careers carousel image?",
    );
    if (!shouldDelete) return;

    setCarouselBusyId(image.id);
    try {
      const response = await fetch(
        apiUrl(`jobs/carousel_images.php?id=${image.id}`),
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete carousel image");
      }

      await fetchCarouselImages();
      addToast("Careers carousel image deleted", "success");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Failed to delete carousel image",
        "error",
      );
    } finally {
      setCarouselBusyId(null);
    }
  };

  const moveCarouselImage = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= carouselImages.length) return;

    const previousImages = carouselImages;
    const nextImages = [...carouselImages];
    [nextImages[index], nextImages[targetIndex]] = [
      nextImages[targetIndex],
      nextImages[index],
    ];
    setCarouselImages(nextImages);
    setCarouselReordering(true);

    try {
      const response = await fetch(apiUrl("jobs/carousel_images.php"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: nextImages.map((image) => image.id) }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to reorder carousel images");
      }

      await fetchCarouselImages();
    } catch (error) {
      setCarouselImages(previousImages);
      addToast(
        error instanceof Error
          ? error.message
          : "Failed to reorder carousel images",
        "error",
      );
    } finally {
      setCarouselReordering(false);
    }
  };

  const carouselPreviewUrl = (image: CareerCarouselImage) => {
    const parsedVersion = image.updated_at
      ? Date.parse(`${image.updated_at.replace(" ", "T")}Z`)
      : 0;
    return withCacheVersion(
      normalizeApiAssetUrl(image.image_url),
      Number.isFinite(parsedVersion) ? parsedVersion : 0,
    );
  };

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="fixed left-3 right-3 top-3 z-50 sm:left-auto sm:right-6 sm:top-6 sm:w-96 sm:max-w-full">
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
          <h1 className="text-xl font-semibold text-gray-900">Jobs Management</h1>
        </div>
        <p className="text-gray-600">Create and update careers listings from admin.</p>
      </div>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <ImageIcon className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Careers Image Carousel
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Upload, remove, and reorder the images shown at the top of the
                careers page.
              </p>
            </div>
          </div>

          <label
            className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 ${
              carouselUploading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
          >
            <Upload className="h-4 w-4" />
            {carouselUploading ? "Uploading..." : "Add Images"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={carouselUploading}
              className="sr-only"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = "";
                if (files.length > 0) void uploadCarouselImages(files);
              }}
            />
          </label>
        </div>

        {carouselLoading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Loading carousel images...
          </p>
        ) : carouselImages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
            <ImageIcon className="mx-auto mb-3 h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              The public careers page is using its four original images.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Add one or more images here to replace the original carousel.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {carouselImages.map((image, index) => {
              const isBusy = carouselBusyId === image.id;
              return (
                <article
                  key={image.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                >
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={carouselPreviewUrl(image)}
                      alt={`Careers carousel image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 p-3">
                    <span className="text-sm font-semibold text-gray-700">
                      Slide {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveCarouselImage(index, -1)}
                        disabled={
                          index === 0 || carouselReordering || isBusy
                        }
                        className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                        title="Move earlier"
                        aria-label={`Move slide ${index + 1} earlier`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCarouselImage(index, 1)}
                        disabled={
                          index === carouselImages.length - 1 ||
                          carouselReordering ||
                          isBusy
                        }
                        className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                        title="Move later"
                        aria-label={`Move slide ${index + 1} later`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCarouselImage(image)}
                        disabled={isBusy || carouselReordering}
                        className="rounded-md border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35"
                        title="Delete image"
                        aria-label={`Delete slide ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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

        <div className="flex flex-wrap items-center justify-end gap-3">
          {editId !== null && (
            <button
              onClick={resetForm}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:w-auto"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={submitJob}
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? "Saving..." : editId !== null ? "Update Job" : "Add Job"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900">Job Listings</h2>
          <button
            onClick={fetchJobs}
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:w-auto"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
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
                      <div className="flex flex-wrap items-center gap-3">
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
