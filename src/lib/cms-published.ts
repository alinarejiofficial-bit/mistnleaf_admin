import type { CmsContent, PublishStatus } from "@/lib/cms-data";

/** Published-only snapshot for the public website and API consumers. */
export type PublishedCmsContent = {
  homepage: CmsContent["homepage"];
  about: CmsContent["about"];
  rooms: CmsContent["rooms"];
  amenities: CmsContent["amenities"];
  experiences: CmsContent["experiences"];
  galleryCategories: CmsContent["galleryCategories"];
  galleryImages: CmsContent["galleryImages"];
  offers: CmsContent["offers"];
  offersSection: CmsContent["offersSection"];
  testimonials: CmsContent["testimonials"];
  faqs: CmsContent["faqs"];
  contact: CmsContent["contact"];
  location: CmsContent["location"];
  social: CmsContent["social"];
  footer: CmsContent["footer"];
  publishedAt: string;
};

function isPublished(status: PublishStatus) {
  return status === "Published";
}

export function filterPublishedContent(content: CmsContent): PublishedCmsContent {
  return {
    homepage: isPublished(content.homepage.status) ? content.homepage : {
      ...content.homepage,
      status: "Draft" as const,
    },
    about: isPublished(content.about.status) ? content.about : { ...content.about, status: "Draft" },
    rooms: content.rooms.filter((r) => isPublished(r.status)),
    amenities: content.amenities.filter((a) => isPublished(a.status)),
    experiences: content.experiences.filter((e) => isPublished(e.status)),
    galleryCategories: content.galleryCategories.filter((c) => isPublished(c.status)),
    galleryImages: content.galleryImages.filter((i) => isPublished(i.status)),
    offers: content.offers.filter((o) => isPublished(o.status) && o.active),
    offersSection: isPublished(content.offersSection.status)
      ? content.offersSection
      : { ...content.offersSection, status: "Draft" as const },
    testimonials: content.testimonials.filter((t) => isPublished(t.status)),
    faqs: content.faqs.filter((f) => isPublished(f.status)),
    contact: isPublished(content.contact.status) ? content.contact : { ...content.contact, status: "Draft" },
    location: isPublished(content.location.status) ? content.location : { ...content.location, status: "Draft" },
    social: isPublished(content.social.status) ? content.social : { ...content.social, status: "Draft" },
    footer: isPublished(content.footer.status) ? content.footer : { ...content.footer, status: "Draft" },
    publishedAt: new Date().toISOString(),
  };
}

/** True published view — omit draft-only sections entirely. */
export function getLivePublishedContent(content: CmsContent): PublishedCmsContent {
  const filtered = filterPublishedContent(content);
  return {
    ...filtered,
    homepage: isPublished(content.homepage.status) ? content.homepage : filtered.homepage,
    about: isPublished(content.about.status) ? content.about : filtered.about,
    contact: isPublished(content.contact.status) ? content.contact : filtered.contact,
    location: isPublished(content.location.status) ? content.location : filtered.location,
    social: isPublished(content.social.status) ? content.social : filtered.social,
    footer: isPublished(content.footer.status) ? content.footer : filtered.footer,
    publishedAt: new Date().toISOString(),
  };
}
