import type { CmsRouteSection } from "@/lib/cms-data";

export type PublicSiteSectionId =
  | "hero"
  | "about"
  | "rooms"
  | "experiences"
  | "amenities"
  | "gallery"
  | "offers"
  | "testimonials"
  | "location"
  | "faqs"
  | "contact"
  | "footer";

export type PublicSiteSectionConfig = {
  id: PublicSiteSectionId;
  label: string;
  cmsSection: CmsRouteSection;
  navLabel?: string;
  /** Standalone public page (not a scroll section on the homepage). */
  standalonePage?: boolean;
};

/** Public homepage sections mapped to CMS edit routes. */
export const publicSiteSections: PublicSiteSectionConfig[] = [
  { id: "hero", label: "Hero", cmsSection: "homepage" },
  {
    id: "about",
    label: "About",
    cmsSection: "about",
    navLabel: "About",
    standalonePage: true,
  },
  { id: "rooms", label: "Featured rooms", cmsSection: "rooms", navLabel: "Rooms" },
  {
    id: "experiences",
    label: "Experiences",
    cmsSection: "experiences",
    navLabel: "Experiences",
  },
  { id: "amenities", label: "Amenities", cmsSection: "amenities", navLabel: "Amenities" },
  { id: "gallery", label: "Gallery", cmsSection: "gallery", navLabel: "Gallery" },
  { id: "offers", label: "Offers", cmsSection: "offers", navLabel: "Offers" },
  {
    id: "testimonials",
    label: "Testimonials",
    cmsSection: "testimonials",
    navLabel: "Testimonials",
  },
  { id: "location", label: "Location", cmsSection: "location", navLabel: "Location" },
  { id: "faqs", label: "FAQs", cmsSection: "faqs", navLabel: "FAQs" },
  { id: "contact", label: "Contact", cmsSection: "contact", navLabel: "Contact" },
  { id: "footer", label: "Footer & social", cmsSection: "footer" },
];

export function getPublicSiteSection(id: PublicSiteSectionId) {
  return publicSiteSections.find((section) => section.id === id);
}

export const publicSiteNavSections = publicSiteSections.filter((section) => section.navLabel);

/** Sections that scroll on the homepage — excludes standalone pages like About. */
export const homepageScrollSections = publicSiteSections.filter(
  (section) => !section.standalonePage,
);

/** Homepage scroll blocks only — not standalone pages, contact, or footer. */
export const homepageEditorSections: PublicSiteSectionConfig[] = [
  { id: "hero", label: "Hero", cmsSection: "homepage" },
  {
    id: "about",
    label: "About band",
    cmsSection: "about",
    navLabel: "About",
    standalonePage: true,
  },
  ...homepageScrollSections.filter(
    (section) =>
      section.id !== "hero" && section.id !== "contact" && section.id !== "footer",
  ),
];

/** Inline homepage editors — never routes to full page CMS (Rooms, Experiences, etc.). */
export function getHomepageEditorHref(section: PublicSiteSectionConfig): string {
  return `/website/homepage?edit=${section.id}`;
}
