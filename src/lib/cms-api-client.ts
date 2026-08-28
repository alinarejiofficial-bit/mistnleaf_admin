import type { PublishedCmsContent } from "@/lib/cms-published";
import type { CmsContent } from "@/lib/cms-data";
import type { RoleId } from "@/lib/roles";

/** Base URL for CMS API — empty string = same origin (admin app). */
export function getCmsApiBase(): string {
  const base = process.env.NEXT_PUBLIC_CMS_API_URL?.replace(/\/$/, "");
  return base ?? "";
}

function editorHeaders(roleId: RoleId, userId: string) {
  return {
    "X-Mistnleaf-Role-Id": roleId,
    "X-Mistnleaf-User-Id": userId,
  };
}

export async function fetchPublishedCmsFromApi(): Promise<PublishedCmsContent> {
  const response = await fetch(`${getCmsApiBase()}/api/cms`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to load published CMS (${response.status})`);
  }
  return response.json() as Promise<PublishedCmsContent>;
}

export async function fetchCmsContentFromApi(
  roleId: RoleId,
  userId: string,
): Promise<CmsContent> {
  const response = await fetch(`${getCmsApiBase()}/api/cms/content`, {
    cache: "no-store",
    headers: editorHeaders(roleId, userId),
  });
  if (!response.ok) {
    throw new Error(`Failed to load CMS content (${response.status})`);
  }
  const payload = (await response.json()) as { content: CmsContent };
  return payload.content;
}

export async function saveCmsContentToApi(
  content: CmsContent,
  roleId: RoleId,
  userId: string,
): Promise<void> {
  const response = await fetch(`${getCmsApiBase()}/api/cms/content`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...editorHeaders(roleId, userId),
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Failed to save CMS content (${response.status})`);
  }
}
