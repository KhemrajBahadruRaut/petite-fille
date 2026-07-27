const DEFAULT_IMAGE_TIMEOUT_MS = 20_000;

/**
 * Downloads and decodes an image before UI state starts using its URL. This
 * keeps the existing image visible until its replacement is ready to paint.
 */
export function preloadImage(
  url: string,
  timeoutMs = DEFAULT_IMAGE_TIMEOUT_MS,
): Promise<boolean> {
  if (typeof window === "undefined" || !url) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const image = new window.Image();
    let settled = false;

    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      image.onload = null;
      image.onerror = null;
      resolve(loaded);
    };

    const timeoutId = window.setTimeout(() => finish(false), timeoutMs);

    image.onload = () => {
      if (typeof image.decode !== "function") {
        finish(true);
        return;
      }

      void image.decode().then(
        () => finish(true),
        () => finish(image.naturalWidth > 0),
      );
    };
    image.onerror = () => finish(false);
    image.decoding = "async";
    image.src = url;

    if (image.complete && image.naturalWidth > 0) {
      finish(true);
    }
  });
}

export async function preloadImages(urls: string[]): Promise<boolean> {
  const results = await Promise.all(urls.map((url) => preloadImage(url)));
  return results.every(Boolean);
}

/** Wait until React has had an opportunity to commit and paint new image URLs. */
export function waitForNextPaint(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}
