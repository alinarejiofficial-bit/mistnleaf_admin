import type { PublicSiteSectionConfig } from "@/lib/public-site-sections";

/** Base path for public site routes — empty on port 3001, `/site` on admin preview. */
export function getPublicSiteBasePath(): string {
  return process.env.NEXT_PUBLIC_PUBLIC_SITE === "true" ? "" : "/site";
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
  return `${getPublicSiteBasePath()}/about`;
}
