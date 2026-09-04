import type { PublishedCmsContent } from "@/lib/cms/types";

export function getCmsApiBase(): string {
  return (
    process.env.CMS_API_URL ??
    process.env.NEXT_PUBLIC_CMS_API_URL ??
    "http://127.0.0.1:3001"
  ).replace(/\/$/, "");
}

export function getCmsAdminBase(): string {
  return (
    process.env.NEXT_PUBLIC_CMS_ADMIN_URL ??
    process.env.CMS_ADMIN_URL ??
    "http://localhost:3002"
  ).replace(/\/$/, "");
}

export async function fetchPublishedCms(): Promise<PublishedCmsContent | null> {
  const base = getCmsApiBase();

  try {
    const response = await fetch(`${base}/api/cms/`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) return null;
    return (await response.json()) as PublishedCmsContent;
  } catch {
    return null;
  }
}
