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