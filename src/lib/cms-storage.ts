import { filterPublishedContent } from "@/lib/cms-published";
import { defaultCmsContent, type CmsContent } from "@/lib/cms-data";
import { normalizeCmsContent } from "@/lib/cms-normalize";

export const CMS_STORAGE_KEY = "mistnleaf_cms_content";
export const CMS_PUBLISHED_KEY = "mistnleaf_cms_published";
export const CMS_UPDATED_EVENT = "mistnleaf-cms-updated";

const DATA_URL_PREFIX = "data:";

function stripDataUrl(value: string | undefined | null): string {
  if (!value) return "";
  return value.startsWith(DATA_URL_PREFIX) ? "" : value;
}

/** Remove embedded base64 blobs before caching — keeps localStorage under quota. */
function stripContentForStorage(content: CmsContent): CmsContent {
  return {
    ...content,
    homepage: {
      ...content.homepage,
      heroMediaUrl: stripDataUrl(content.homepage.heroMediaUrl),
    },
    about: {
      ...content.about,
      imageUrl: stripDataUrl(content.about.imageUrl),
      storyImageUrl: stripDataUrl(content.about.storyImageUrl),
      placeImageUrl: stripDataUrl(content.about.placeImageUrl),
      mosaic: (content.about.mosaic ?? []).map((item) => ({
        ...item,
        imageUrl: stripDataUrl(item.imageUrl),
      })),
    },
    rooms: content.rooms.map((room) => ({
      ...room,
      images: (room.images ?? []).map(stripDataUrl).filter(Boolean),
    })),
    amenities: content.amenities.map((item) => ({
      ...item,
      imageUrl: stripDataUrl(item.imageUrl),
    })),
    experiences: content.experiences.map((item) => ({
      ...item,
      imageUrl: stripDataUrl(item.imageUrl),
    })),
    galleryImages: content.galleryImages.map((item) => ({
      ...item,
      imageUrl: stripDataUrl(item.imageUrl),
    })),
  };
}

function writeStorage(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function loadCmsContent(): CmsContent {
  if (typeof window === "undefined") return defaultCmsContent;

  try {
    const raw = window.localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) return defaultCmsContent;
    return normalizeCmsContent(JSON.parse(raw) as Partial<CmsContent>);
  } catch {
    return defaultCmsContent;
  }
}

export function loadPublishedCmsContent(): ReturnType<typeof filterPublishedContent> {
  if (typeof window === "undefined") {
    return filterPublishedContent(defaultCmsContent);
  }

  try {
    const raw = window.localStorage.getItem(CMS_PUBLISHED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through
  }

  return filterPublishedContent(loadCmsContent());
}

/**
 * Cache CMS locally for offline fallback. Never throws — Django API is the source of truth.
 * Base64 image blobs are stripped to avoid localStorage quota errors (~5 MB limit).
 */
export function saveCmsContent(content: CmsContent) {
  if (typeof window === "undefined") return;

  const stripped = stripContentForStorage(content);
  const serialized = JSON.stringify(stripped);
  const published = JSON.stringify(filterPublishedContent(stripped));

  const savedFull = writeStorage(CMS_STORAGE_KEY, serialized);
  const savedPublished = writeStorage(CMS_PUBLISHED_KEY, published);

  if (!savedFull || !savedPublished) {
    try {
      window.localStorage.removeItem(CMS_PUBLISHED_KEY);
      window.localStorage.removeItem(CMS_STORAGE_KEY);
    } catch {
      // ignore cleanup failures
    }
    console.warn(
      "CMS local cache skipped (browser storage full). Changes still save to the website backend.",
    );
  }

  window.dispatchEvent(new CustomEvent(CMS_UPDATED_EVENT));
}
