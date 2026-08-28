import { defaultCmsContent, type CmsContent, type CmsExperience, type CmsWebsiteOffer } from "@/lib/cms-data";

type LegacyHomepage = CmsContent["homepage"] & {
  introductionTitle?: string;
  introductionContent?: string;
  experiences?: CmsExperience[];
};

function migrateExperiences(items: CmsExperience[]): CmsExperience[] {
  return items.map((item, index) => ({
    ...item,
    duration: item.duration ?? "—",
    sortOrder: item.sortOrder ?? index,
  }));
}

function parseTermsFromDetails(details: string): string[] {
  const text = details.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return [];
  return text
    .split(/[·|]/)
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean);
}

function normalizeOffer(offer: CmsWebsiteOffer, index: number): CmsWebsiteOffer {
  return {
    ...offer,
    priceFrom: offer.priceFrom ?? 0,
    priceLabel: offer.priceLabel ?? "FROM",
    terms: offer.terms?.length ? offer.terms : parseTermsFromDetails(offer.details ?? ""),
    bookCtaLabel: offer.bookCtaLabel ?? "Book package →",
    bookCtaHref: offer.bookCtaHref ?? "#contact",
    sortOrder: offer.sortOrder ?? index,
  };
}

export function normalizeCmsContent(
  raw: Partial<CmsContent> & { homepage?: LegacyHomepage },
): CmsContent {
  const legacyHomepage = raw.homepage;
  const migratedExperiences =
    raw.experiences && raw.experiences.length > 0
      ? migrateExperiences(raw.experiences)
      : legacyHomepage?.experiences?.length
        ? migrateExperiences(legacyHomepage.experiences)
        : defaultCmsContent.experiences;

  const homepage = {
    ...defaultCmsContent.homepage,
    ...legacyHomepage,
    heroEyebrow:
      legacyHomepage?.heroEyebrow ??
      legacyHomepage?.introductionTitle ??
      defaultCmsContent.homepage.heroEyebrow,
    heroCtaPrimary:
      legacyHomepage?.heroCtaPrimary ?? defaultCmsContent.homepage.heroCtaPrimary,
    heroCtaSecondary:
      legacyHomepage?.heroCtaSecondary ?? defaultCmsContent.homepage.heroCtaSecondary,
  };

  const rooms = (raw.rooms ?? defaultCmsContent.rooms).map((room) => ({
    ...room,
    tagline: room.tagline ?? "",
    priceFrom: room.priceFrom ?? 0,
  }));

  const offers = (raw.offers ?? defaultCmsContent.offers).map((offer, index) =>
    normalizeOffer(offer, index),
  );

  const offersSection = {
    ...defaultCmsContent.offersSection,
    ...raw.offersSection,
  };

  const testimonials = (raw.testimonials ?? defaultCmsContent.testimonials).map(
    (item) => ({
      ...item,
      guestLocation: item.guestLocation ?? "",
      initials: item.initials ?? item.guestName.slice(0, 2).toUpperCase(),
    }),
  );

  return {
    homepage,
    about: { ...defaultCmsContent.about, ...raw.about },
    rooms,
    amenities: raw.amenities ?? defaultCmsContent.amenities,
    experiences: migratedExperiences,
    galleryCategories: raw.galleryCategories ?? defaultCmsContent.galleryCategories,
    galleryImages: raw.galleryImages ?? defaultCmsContent.galleryImages,
    offersSection,
    offers,
    testimonials,
    faqs: raw.faqs ?? defaultCmsContent.faqs,
    contact: { ...defaultCmsContent.contact, ...raw.contact },
    location: { ...defaultCmsContent.location, ...raw.location },
    social: { ...defaultCmsContent.social, ...raw.social },
    footer: normalizeFooter(raw.footer),
  };
}

function normalizeFooter(raw: Partial<CmsContent["footer"]> | undefined): CmsContent["footer"] {
  const merged = { ...defaultCmsContent.footer, ...raw };

  return {
    ...merged,
    brandEyebrow: raw?.brandEyebrow ?? defaultCmsContent.footer.brandEyebrow,
    brandDescription:
      raw?.brandDescription ?? raw?.tagline ?? defaultCmsContent.footer.brandDescription,
    exploreLinks: raw?.exploreLinks?.length
      ? raw.exploreLinks
      : defaultCmsContent.footer.exploreLinks,
    planLinks: raw?.planLinks?.length ? raw.planLinks : defaultCmsContent.footer.planLinks,
    policyLinks: raw?.policyLinks?.length
      ? raw.policyLinks
      : defaultCmsContent.footer.policyLinks,
  };
}
