import { filterPublishedContent } from "@/lib/cms-published";
import { defaultCmsContent, type CmsContent } from "@/lib/cms-data";
import { normalizeCmsContent } from "@/lib/cms-normalize";

export const CMS_STORAGE_KEY = "mistnleaf_cms_content";
export const CMS_PUBLISHED_KEY = "mistnleaf_cms_published";
export const CMS_UPDATED_EVENT = "mistnleaf-cms-updated";

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

export function saveCmsContent(content: CmsContent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(content));
  const published = filterPublishedContent(content);
  window.localStorage.setItem(CMS_PUBLISHED_KEY, JSON.stringify(published));
  window.dispatchEvent(new CustomEvent(CMS_UPDATED_EVENT));
}
