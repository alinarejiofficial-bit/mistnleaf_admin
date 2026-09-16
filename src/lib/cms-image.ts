/** Resolve CMS image URLs for display in the admin dashboard. */
import { getCmsBackendUrl } from "@/lib/cms-api-client";
import { getPublicWebsiteBaseUrl } from "@/lib/public-site-nav";

export function resolveCmsImageUrl(url: string | undefined | null): string {
  const value = (url ?? "").trim();
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  // Seeded public-site assets live on the guest website, not the admin host.
  if (value.startsWith("/images/")) {
    const base = getPublicWebsiteBaseUrl();
    return base ? `${base}${value}` : value;
  }

  // Django media uploads.
  if (value.startsWith("/media/")) {
    const api = getCmsBackendUrl();
    return api ? `${api}${value}` : value;
  }

  return value;
}
