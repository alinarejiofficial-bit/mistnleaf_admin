import type { PublishedCmsContent } from "@/lib/cms-published";
import type { CmsContent } from "@/lib/cms-data";
import { normalizeCmsContent } from "@/lib/cms-normalize";
import type { RoleId } from "@/lib/roles";

/**
 * CMS content API base URL — must be the Django backend (public site + CMS store).
 * Never fall back to the Next.js admin origin; that writes a separate disk file the
 * public website at :3001 does not read.
 */
export function getCmsBackendUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_CMS_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:3001`;
    }
  }

  return "http://127.0.0.1:3001";
}

/** CMS API base URL — same host as the admin app by default. */
export function getCmsApiBase(): string {
  return getCmsBackendUrl();
}

function editorHeaders(roleId: RoleId, userId: string) {
  const headers: Record<string, string> = {
    "X-Mistnleaf-Role-Id": roleId,
    "X-Mistnleaf-User-Id": userId,
  };
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("mistnleaf_jwt_access");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

const DATA_URL_PREFIX = "data:";

function isDataUrl(value: string | undefined | null): value is string {
  return Boolean(value && value.startsWith(DATA_URL_PREFIX));
}

async function uploadDataUrl(
  dataUrl: string,
  roleId: RoleId,
  userId: string,
  filename: string,
): Promise<string> {
  const response = await fetch(`${getCmsApiBase()}/api/cms/media/upload/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...editorHeaders(roleId, userId),
    },
    body: JSON.stringify({ dataUrl, filename }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Image upload failed (${response.status})`);
  }
  const payload = (await response.json()) as { url: string };
  return payload.url;
}

/** Upload a file to Django media storage; returns a public URL (not base64). */
export async function uploadCmsMediaFile(
  file: File,
  roleId: RoleId,
  userId: string,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${getCmsApiBase()}/api/cms/media/upload/`, {
    method: "POST",
    headers: editorHeaders(roleId, userId),
    body: form,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Image upload failed (${response.status})`);
  }
  const payload = (await response.json()) as { url: string };
  return payload.url;
}

/** Replace any embedded base64 data URLs with uploaded media URLs before saving CMS JSON. */
export async function resolveContentMediaUrls(
  content: CmsContent,
  roleId: RoleId,
  userId: string,
): Promise<CmsContent> {
  let next = content;

  if (isDataUrl(content.homepage.heroMediaUrl)) {
    const heroMediaUrl = await uploadDataUrl(
      content.homepage.heroMediaUrl,
      roleId,
      userId,
      "hero-media.png",
    );
    next = { ...next, homepage: { ...next.homepage, heroMediaUrl } };
  }

  if (isDataUrl(next.about.imageUrl)) {
    const imageUrl = await uploadDataUrl(next.about.imageUrl, roleId, userId, "about.png");
    next = { ...next, about: { ...next.about, imageUrl } };
  }
  if (isDataUrl(next.about.storyImageUrl)) {
    const storyImageUrl = await uploadDataUrl(
      next.about.storyImageUrl,
      roleId,
      userId,
      "about-story.png",
    );
    next = { ...next, about: { ...next.about, storyImageUrl } };
  }
  if (isDataUrl(next.about.placeImageUrl)) {
    const placeImageUrl = await uploadDataUrl(
      next.about.placeImageUrl,
      roleId,
      userId,
      "about-place.png",
    );
    next = { ...next, about: { ...next.about, placeImageUrl } };
  }
  if (next.about.mosaic?.length) {
    const mosaic = await Promise.all(
      next.about.mosaic.map(async (item, index) => {
        if (!isDataUrl(item.imageUrl)) return item;
        const imageUrl = await uploadDataUrl(
          item.imageUrl,
          roleId,
          userId,
          `about-mosaic-${index + 1}.png`,
        );
        return { ...item, imageUrl };
      }),
    );
    next = { ...next, about: { ...next.about, mosaic } };
  }

  const rooms = await Promise.all(
    next.rooms.map(async (room, index) => {
      const images = await Promise.all(
        (room.images ?? []).map(async (image, imageIndex) => {
          if (!isDataUrl(image)) return image;
          return uploadDataUrl(image, roleId, userId, `room-${index + 1}-${imageIndex + 1}.png`);
        }),
      );
      return { ...room, images };
    }),
  );
  next = { ...next, rooms };

  const amenities = await Promise.all(
    next.amenities.map(async (item, index) => {
      if (!isDataUrl(item.imageUrl)) return item;
      const imageUrl = await uploadDataUrl(item.imageUrl, roleId, userId, `amenity-${index + 1}.png`);
      return { ...item, imageUrl };
    }),
  );
  next = { ...next, amenities };

  const experiences = await Promise.all(
    next.experiences.map(async (item, index) => {
      if (!isDataUrl(item.imageUrl)) return item;
      const imageUrl = await uploadDataUrl(
        item.imageUrl,
        roleId,
        userId,
        `experience-${index + 1}.png`,
      );
      return { ...item, imageUrl };
    }),
  );
  next = { ...next, experiences };

  const galleryImages = await Promise.all(
    next.galleryImages.map(async (item, index) => {
      if (!isDataUrl(item.imageUrl)) return item;
      const imageUrl = await uploadDataUrl(
        item.imageUrl,
        roleId,
        userId,
        `gallery-${index + 1}.png`,
      );
      return { ...item, imageUrl };
    }),
  );
  next = { ...next, galleryImages };

  return next;
}

export async function fetchPublishedCmsFromApi(): Promise<PublishedCmsContent> {
  const response = await fetch(`${getCmsApiBase()}/api/cms/`, {
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
  const response = await fetch(`${getCmsApiBase()}/api/cms/content/`, {
    cache: "no-store",
    headers: editorHeaders(roleId, userId),
  });
  if (!response.ok) {
    throw new Error(`Failed to load CMS content (${response.status})`);
  }
  const payload = (await response.json()) as { content: Partial<CmsContent> };
  return normalizeCmsContent(payload.content);
}

export async function saveCmsContentToApi(
  content: CmsContent,
  roleId: RoleId,
  userId: string,
): Promise<void> {
  const resolved = await resolveContentMediaUrls(
    normalizeCmsContent(content),
    roleId,
    userId,
  );
  const response = await fetch(`${getCmsApiBase()}/api/cms/content/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...editorHeaders(roleId, userId),
    },
    body: JSON.stringify({ content: resolved }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Failed to save CMS content (${response.status})`);
  }
}
