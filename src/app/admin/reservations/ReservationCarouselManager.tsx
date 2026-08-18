"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Trash2, Upload } from "lucide-react";
import {
  apiUrl,
  normalizeApiAssetUrl,
  withCacheVersion,
} from "@/utils/api";
import { logAdminActivity } from "@/utils/activityLog";
import { optimizeImageUpload } from "@/utils/optimizeImageUpload";
import { preloadImages, waitForNextPaint } from "@/utils/preloadImage";

interface ReservationCarouselImage {
  id: number;
  image_url: string;
  sort_order: number;
  updated_at?: string;
}

interface FeedbackMessage {
  type: "success" | "error" | "idle";
  text: string;
}

interface ReservationCarouselManagerProps {
  onMessage: (message: FeedbackMessage) => void;
}

function carouselPreviewUrl(image: ReservationCarouselImage): string {
  const parsedVersion = image.updated_at
    ? Date.parse(`${image.updated_at.replace(" ", "T")}Z`)
    : 0;

  return withCacheVersion(
    normalizeApiAssetUrl(image.image_url),
    Number.isFinite(parsedVersion) ? parsedVersion : 0,
  );
}

export default function ReservationCarouselManager({
  onMessage,
}: ReservationCarouselManagerProps) {
  const [images, setImages] = useState<ReservationCarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  const fetchImages = useCallback(
    async (waitForPreviews = false) => {
      if (!waitForPreviews) setLoading(true);

      try {
        const response = await fetch(
          apiUrl("reservation/carousel_images.php"),
          { cache: "no-store" },
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch carousel images");
        }

        const nextImages: ReservationCarouselImage[] = Array.isArray(
          data.images,
        )
          ? data.images
              .map((image: ReservationCarouselImage) => ({
                ...image,
                id: Number(image.id),
                sort_order: Number(image.sort_order),
              }))
              .filter(
                (image: ReservationCarouselImage) =>
                  image.id > 0 && Boolean(image.image_url),
              )
          : [];

        const previewsReady = waitForPreviews
          ? await preloadImages(nextImages.map(carouselPreviewUrl))
          : true;
        setImages(nextImages);
        return previewsReady;
      } catch (error) {
        setImages([]);
        onMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Failed to load reservation carousel images.",
        });
        return false;
      } finally {
        if (!waitForPreviews) setLoading(false);
      }
    },
    [onMessage],
  );

  useEffect(() => {
    void fetchImages();
  }, [fetchImages]);

  const uploadImages = async (selectedFiles: File[]) => {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const invalidFile = selectedFiles.find(
      (file) =>
        !allowedTypes.has(file.type) || file.size > 25 * 1024 * 1024,
    );

    if (invalidFile) {
      onMessage({
        type: "error",
        text: "Choose JPG, PNG, or WebP images no larger than 25 MB each.",
      });
      return;
    }

    setUploading(true);
    let uploadedCount = 0;

    try {
      for (const selectedFile of selectedFiles) {
        const optimized = await optimizeImageUpload(selectedFile, 1600, 0.82);
        if (optimized.file.size > 10 * 1024 * 1024) {
          throw new Error(
            `${selectedFile.name} is still larger than the 10 MB upload limit.`,
          );
        }

        const body = new FormData();
        body.append("image", optimized.file, optimized.file.name);
        const response = await fetch(
          apiUrl("reservation/carousel_images.php"),
          { method: "POST", body },
        );
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || `Failed to upload ${selectedFile.name}`,
          );
        }
        uploadedCount += 1;
      }

      const previewsReady = await fetchImages(true);
      await waitForNextPaint();
      onMessage({
        type: previewsReady ? "success" : "error",
        text: previewsReady
          ? `${uploadedCount} reservation carousel image${uploadedCount === 1 ? "" : "s"} added.`
          : "The images were uploaded, but their previews are still loading.",
      });
      logAdminActivity(
        "Reservations",
        "Uploaded reservation carousel image",
        `${uploadedCount} reservation carousel image(s) added`,
      );
    } catch (error) {
      if (uploadedCount > 0) {
        await fetchImages(true);
        await waitForNextPaint();
      }
      onMessage({
        type: "error",
        text: `${uploadedCount > 0 ? `${uploadedCount} image(s) uploaded. ` : ""}${
          error instanceof Error
            ? error.message
            : "Failed to upload carousel images."
        }`,
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (image: ReservationCarouselImage) => {
    const shouldDelete = window.confirm(
      images.length === 1
        ? "Delete this image? The public reservation carousel will show a skeleton until another image is uploaded."
        : "Delete this reservation carousel image?",
    );
    if (!shouldDelete) return;

    setBusyId(image.id);
    try {
      const response = await fetch(
        apiUrl(`reservation/carousel_images.php?id=${image.id}`),
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete carousel image");
      }

      await fetchImages();
      onMessage({
        type: "success",
        text: "Reservation carousel image deleted.",
      });
      logAdminActivity(
        "Reservations",
        "Deleted reservation carousel image",
        `Removed carousel image #${image.id}`,
      );
    } catch (error) {
      onMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to delete carousel image.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const previousImages = images;
    const nextImages = [...images];
    [nextImages[index], nextImages[targetIndex]] = [
      nextImages[targetIndex],
      nextImages[index],
    ];
    setImages(nextImages);
    setReordering(true);

    try {
      const response = await fetch(apiUrl("reservation/carousel_images.php"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: nextImages.map((image) => image.id) }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to reorder carousel images");
      }

      await fetchImages();
    } catch (error) {
      setImages(previousImages);
      onMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to reorder carousel images.",
      });
    } finally {
      setReordering(false);
    }
  };

  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-indigo-100 p-2">
            <ImageIcon className="h-5 w-5 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Reservation Image Carousel
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload, remove, and reorder the images shown on the public
              reservation page.
            </p>
          </div>
        </div>

        <label
          className={`inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 ${
            uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Add Images"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (files.length > 0) void uploadImages(files);
            }}
          />
        </label>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">
          Loading carousel images...
        </p>
      ) : images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
          <ImageIcon className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            No reservation carousel images have been uploaded.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            The public carousel shows a skeleton until an image is added.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => {
            const isBusy = busyId === image.id;
            return (
              <article
                key={image.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
              >
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={carouselPreviewUrl(image)}
                    alt={`Reservation carousel image ${index + 1}`}
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
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0 || reordering || isBusy}
                      className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label={`Move slide ${index + 1} earlier`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={
                        index === images.length - 1 || reordering || isBusy
                      }
                      className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label={`Move slide ${index + 1} later`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteImage(image)}
                      disabled={isBusy || reordering}
                      className="rounded-md border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35"
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
    </section>
  );
}
