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
    featuredExperienceIds:
      legacyHomepage?.featuredExperienceIds ?? defaultCmsContent.homepage.featuredExperienceIds,
    featuredAmenityIds:
      legacyHomepage?.featuredAmenityIds ?? defaultCmsContent.homepage.featuredAmenityIds,
    featuredTestimonialIds:
      legacyHomepage?.featuredTestimonialIds ??
      defaultCmsContent.homepage.featuredTestimonialIds,
    homepageGalleryImageIds:
      legacyHomepage?.homepageGalleryImageIds ??
      defaultCmsContent.homepage.homepageGalleryImageIds,
    homepageFaqIds:
      legacyHomepage?.homepageFaqIds ?? defaultCmsContent.homepage.homepageFaqIds,
    bands: {
      ...defaultCmsContent.homepage.bands,
      ...legacyHomepage?.bands,
      rooms: {
        ...defaultCmsContent.homepage.bands.rooms,
        ...legacyHomepage?.bands?.rooms,
        status:
          legacyHomepage?.bands?.rooms?.status ??
          defaultCmsContent.homepage.bands.rooms.status,
      },
      experiences: {
        ...defaultCmsContent.homepage.bands.experiences,
        ...legacyHomepage?.bands?.experiences,
        status:
          legacyHomepage?.bands?.experiences?.status ??
          defaultCmsContent.homepage.bands.experiences.status,
      },
      amenities: {
        ...defaultCmsContent.homepage.bands.amenities,
        ...legacyHomepage?.bands?.amenities,
        status:
          legacyHomepage?.bands?.amenities?.status ??
          defaultCmsContent.homepage.bands.amenities.status,
      },
      gallery: {
        ...defaultCmsContent.homepage.bands.gallery,
        ...legacyHomepage?.bands?.gallery,
        status:
          legacyHomepage?.bands?.gallery?.status ??
          defaultCmsContent.homepage.bands.gallery.status,
      },
      offers: {
        ...defaultCmsContent.homepage.bands.offers,
        ...legacyHomepage?.bands?.offers,
        status:
          legacyHomepage?.bands?.offers?.status ??
          defaultCmsContent.homepage.bands.offers.status,
      },
      testimonials: {
        ...defaultCmsContent.homepage.bands.testimonials,
        ...legacyHomepage?.bands?.testimonials,
        status:
          legacyHomepage?.bands?.testimonials?.status ??
          defaultCmsContent.homepage.bands.testimonials.status,
      },
      faqs: {
        ...defaultCmsContent.homepage.bands.faqs,
        ...legacyHomepage?.bands?.faqs,
        status:
          legacyHomepage?.bands?.faqs?.status ??
          defaultCmsContent.homepage.bands.faqs.status,
      },
      location: {
        ...defaultCmsContent.homepage.bands.location,
        ...legacyHomepage?.bands?.location,
        status:
          legacyHomepage?.bands?.location?.status ??
          defaultCmsContent.homepage.bands.location.status,
      },
    },
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
    about: normalizeAbout(raw.about),
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

function normalizeAbout(raw: Partial<CmsContent["about"]> | undefined): CmsContent["about"] {
  const defaults = defaultCmsContent.about;
  const merged = { ...defaults, ...raw };
  const pillars =
    raw?.pillars && raw.pillars.length > 0
      ? raw.pillars.map((pillar, index) => ({
          ...defaults.pillars[index % defaults.pillars.length],
          ...pillar,
          id: pillar.id || `about-pillar-${index + 1}`,
        }))
      : defaults.pillars;
  const mosaic =
    raw?.mosaic && raw.mosaic.length > 0
      ? raw.mosaic.map((item, index) => ({
          ...defaults.mosaic[index % defaults.mosaic.length],
          ...item,
          id: item.id || `about-mosaic-${index + 1}`,
        }))
      : defaults.mosaic;

  return {
    ...merged,
    pageEyebrow: raw?.pageEyebrow ?? defaults.pageEyebrow,
    lead: raw?.lead ?? defaults.lead,
    storyEyebrow: raw?.storyEyebrow ?? defaults.storyEyebrow,
    storyTitle: raw?.storyTitle ?? defaults.storyTitle,
    storyHtml: raw?.storyHtml ?? defaults.storyHtml,
    storyImageUrl: raw?.storyImageUrl ?? defaults.storyImageUrl,
    pillarsEyebrow: raw?.pillarsEyebrow ?? defaults.pillarsEyebrow,
    pillarsTitle: raw?.pillarsTitle ?? defaults.pillarsTitle,
    pillars,
    atmosphereEyebrow: raw?.atmosphereEyebrow ?? defaults.atmosphereEyebrow,
    atmosphereTitle: raw?.atmosphereTitle ?? defaults.atmosphereTitle,
    atmosphereLead: raw?.atmosphereLead ?? defaults.atmosphereLead,
    mosaic,
    placeEyebrow: raw?.placeEyebrow ?? defaults.placeEyebrow,
    placeTitle: raw?.placeTitle ?? defaults.placeTitle,
    placeLead: raw?.placeLead ?? defaults.placeLead,
    placeMeta: raw?.placeMeta ?? defaults.placeMeta,
    placeCtaLabel: raw?.placeCtaLabel ?? defaults.placeCtaLabel,
    placeDirectionsLabel: raw?.placeDirectionsLabel ?? defaults.placeDirectionsLabel,
    placeImageUrl: raw?.placeImageUrl ?? defaults.placeImageUrl,
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
