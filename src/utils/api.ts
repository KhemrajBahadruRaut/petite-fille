const DEFAULT_API_BASE = "http://localhost/petite-backend";
const LOCALHOST_API_BASE = "http://localhost/petite-backend";

const sanitizeBase = (base: string) => base.replace(/\/+$/, "");
const sanitizePath = (path: string) => path.replace(/^\/+/, "");

export const API_BASE = sanitizeBase(
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE,
);

export function apiUrl(path: string): string {
  return `${API_BASE}/${sanitizePath(path)}`;
}

export function normalizeApiAssetUrl(url?: string | null): string {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url.replace(LOCALHOST_API_BASE, API_BASE);
  }

  return apiUrl(url);
}
