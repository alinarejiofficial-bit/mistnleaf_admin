import type { CmsRouteSection } from "@/lib/cms-data";
import type { PublicSiteSectionConfig } from "@/lib/public-site-sections";

/** Django public website paths (port 3001) — matches mistnleaf_backend/apps/website/urls.py */
const DJANGO_PUBLIC_PATHS: Record<CmsRouteSection, string> = {
  homepage: "/",
  about: "/about/",
  rooms: "/rooms/",
  amenities: "/amenities/",
  experiences: "/experiences/",
  gallery: "/gallery/",
  offers: "/offers/",
  testimonials: "/",
  faqs: "/faqs/",
  contact: "/contact/",
  location: "/location/",
  social: "/",
  footer: "/",
};

/** Base path for in-admin public site preview routes (`/site/*`). */
export function getPublicSiteBasePath(): string {
  return process.env.NEXT_PUBLIC_PUBLIC_SITE === "true" ? "" : "/site";
}

/** Base URL of the live Django public website. */
export function getPublicWebsiteBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_PUBLIC_SITE === "true") {
    return "";
  }
  return (
    process.env.NEXT_PUBLIC_PUBLIC_WEBSITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3001"
  );
}

/** Full URL to a page on the live public website. */
export function getPublicWebsiteUrl(path = "/"): string {
  if (process.env.NEXT_PUBLIC_PUBLIC_SITE === "true") {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const base = getPublicWebsiteBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized === "/" ? "" : normalized}`;
}

/** Live public URL for a CMS section (maps to Django routes). */
export function getPublicSectionUrl(section: CmsRouteSection): string {
  if (process.env.NEXT_PUBLIC_PUBLIC_SITE === "true") {
    const base = getPublicSiteBasePath();
    if (section === "about") return `${base}/about`;
    if (section === "homepage") return base || "/";
    return `${base}#${section}`;
  }
  return getPublicWebsiteUrl(DJANGO_PUBLIC_PATHS[section] ?? "/");
}

export function getPublicNavHref(section: PublicSiteSectionConfig): string {
  const base = getPublicSiteBasePath();

  if (section.standalonePage) {
    return `${base}/${section.id}`;
  }

  if (base) {
    return `${base}#${section.id}`;
  }

  return `/#${section.id}`;
}

export function getPublicAboutPath(): string {
  if (process.env.NEXT_PUBLIC_PUBLIC_SITE === "true") {
    return `${getPublicSiteBasePath()}/about`;
  }
  return "/about/";
}
