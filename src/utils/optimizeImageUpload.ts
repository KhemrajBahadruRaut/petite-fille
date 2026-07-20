const OPTIMIZABLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.9;

export interface OptimizedImageUpload {
  file: File;
  originalSize: number;
  optimized: boolean;
  reason?: string;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Reduces upload time for large About-page photos in the browser. Files that
 * cannot be safely decoded (for example animated GIF, SVG, HEIC or AVIF in an
 * older browser) are returned unchanged. We also keep the original whenever
 * the encoded result is not actually smaller.
 */
export async function optimizeImageUpload(
  originalFile: File,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY,
): Promise<OptimizedImageUpload> {
  const unchanged = (reason: string): OptimizedImageUpload => ({
    file: originalFile,
    originalSize: originalFile.size,
    optimized: false,
    reason,
  });

  if (!OPTIMIZABLE_IMAGE_TYPES.has(originalFile.type)) {
    return unchanged("This format is uploaded unchanged.");
  }

  if (typeof createImageBitmap !== "function") {
    return unchanged("Image optimization is unavailable in this browser.");
  }

  let bitmap: ImageBitmap | null = null;

  try {
    bitmap = await createImageBitmap(originalFile);

    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return unchanged("Image optimization could not be started.");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, originalFile.type, quality);
    if (!blob) return unchanged("The browser could not encode this image.");
    if (blob.type !== originalFile.type) {
      return unchanged("The browser could not preserve this image format.");
    }

    // Avoid replacing an already efficient image for a negligible saving.
    if (blob.size >= originalFile.size * 0.95) {
      return unchanged("The original image is already efficiently compressed.");
    }

    return {
      file: new File([blob], originalFile.name, {
        type: originalFile.type,
        lastModified: Date.now(),
      }),
      originalSize: originalFile.size,
      optimized: true,
    };
  } catch {
    return unchanged("This image could not be decoded, so it was left unchanged.");
  } finally {
    bitmap?.close();
  }
}
