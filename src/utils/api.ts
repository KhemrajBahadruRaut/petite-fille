const sanitizeBase = (base: string) => base.replace(/\/+$/, "");
const sanitizePath = (path: string) => path.replace(/^\/+/, "");

if (!process.env.NEXT_PUBLIC_API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE is not set in your env file");
}

export const API_BASE = sanitizeBase(process.env.NEXT_PUBLIC_API_BASE);

export function apiUrl(path: string): string {
  return `${API_BASE}/${sanitizePath(path)}`;
}

export function normalizeApiAssetUrl(url?: string | null): string {
  if (!url) return "";
  
  if (/^https?:\/\//i.test(url)) {
    return url.replace(/https?:\/\/[^/]+\/petite-backend/, API_BASE);
  }

  return apiUrl(url);
}

/**
 * Give mutable API resources a new URL after an update. The backend currently
 * reuses image filenames, so browsers and CDNs can otherwise keep showing an
 * older response for the same URL.
 */
export function withCacheVersion(url: string, version = Date.now()): string {
  if (!url) return "";

  const [urlWithoutHash, hash] = url.split("#", 2);
  const separator = urlWithoutHash.includes("?") ? "&" : "?";
  const versionedUrl = `${urlWithoutHash}${separator}v=${encodeURIComponent(version)}`;

  return hash ? `${versionedUrl}#${hash}` : versionedUrl;
}
