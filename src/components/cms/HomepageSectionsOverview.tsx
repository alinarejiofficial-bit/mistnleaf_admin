"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Pencil } from "lucide-react";
import { useCms } from "@/components/cms/CmsProvider";
import {
  ConfirmDialog,
  PublishBadge,
  ToastPortal,
  useToast,
} from "@/components/cms/CmsShared";
import {
  togglePublishStatus,
  type CmsContent,
  type CmsHomepage,
  type CmsHomepageBands,
  type PublishStatus,
} from "@/lib/cms-data";
import {
  homepageEditorSections,
  getHomepageEditorHref,
  type PublicSiteSectionId,
} from "@/lib/public-site-sections";

type BandKey = keyof CmsHomepageBands;

type SectionSummary = {
  summary: string;
  status: PublishStatus;
};

type PendingToggle = {
  sectionId: PublicSiteSectionId;
  label: string;
  current: PublishStatus;
};

const BAND_SECTION_KEYS: Partial<Record<PublicSiteSectionId, BandKey>> = {
  rooms: "rooms",
  experiences: "experiences",
  amenities: "amenities",
  gallery: "gallery",
  offers: "offers",
  testimonials: "testimonials",
  location: "location",
  faqs: "faqs",
};

function getSectionSummary(sectionId: PublicSiteSectionId, content: CmsContent): SectionSummary {
  const { homepage } = content;
  const bands = homepage.bands;

  switch (sectionId) {
    case "hero":
      return {
        summary: homepage.heroHeadline,
        status: homepage.status,
      };
    case "about":
      return {
        summary: content.about.title,
        status: content.about.status,
      };
    case "rooms": {
      const featured = homepage.featuredRoomIds?.length || 3;
      return {
        summary: `${featured} featured · ${bands?.rooms?.title ?? "Rooms"}`,
        status: bands?.rooms?.status ?? "Published",
      };
    }
    case "experiences": {
      const count = homepage.featuredExperienceIds?.length || 4;
      return {
        summary: `${count} on homepage · ${bands?.experiences?.title ?? "Experiences"}`,
        status: bands?.experiences?.status ?? "Published",
      };
    }
    case "amenities": {
      const count = homepage.featuredAmenityIds?.length || 3;
      return {
        summary: `${count} featured · ${bands?.amenities?.title ?? "Amenities"}`,
        status: bands?.amenities?.status ?? "Published",
      };
    }
    case "gallery": {
      const count = homepage.homepageGalleryImageIds?.length || 7;
      return {
        summary: `${count} images · ${bands?.gallery?.title ?? "Gallery"}`,
        status: bands?.gallery?.status ?? "Published",
      };
    }
    case "offers": {
      const count = homepage.featuredOfferIds?.length || 3;
      return {
        summary: `${count} on homepage · ${bands?.offers?.title ?? "Offers"}`,
        status: bands?.offers?.status ?? "Published",
      };
    }
    case "testimonials": {
      const count = homepage.featuredTestimonialIds?.length || 3;
      return {
        summary: `${count} featured · ${bands?.testimonials?.title ?? "Testimonials"}`,
        status: bands?.testimonials?.status ?? "Published",
      };
    }
    case "location":
      return {
        summary: bands?.location?.title ?? "Location",
        status: bands?.location?.status ?? "Published",
      };
    case "faqs": {
      const count = homepage.homepageFaqIds?.length || 4;
      return {
        summary: `${count} on homepage · ${bands?.faqs?.title ?? "FAQs"}`,
        status: bands?.faqs?.status ?? "Published",
      };
    }
    default:
      return { summary: "", status: "Draft" };
  }
}

function updateBandStatus(
  homepage: CmsHomepage,
  bandKey: BandKey,
  status: PublishStatus,
): CmsHomepage {
  return {
    ...homepage,
    bands: {
      ...homepage.bands,
      [bandKey]: {
        ...homepage.bands[bandKey],
        status,
      },
    },
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

/** Maps every public homepage block to its homepage-scoped CMS editor. */
export function HomepageSectionsOverview() {
  const { content, saveHomepage, saveAbout } = useCms();
  const { toast, showSuccess, clearToast } = useToast();
  const [pending, setPending] = useState<PendingToggle | null>(null);

  function applyToggle(sectionId: PublicSiteSectionId, current: PublishStatus) {
    const next = togglePublishStatus(current);

    if (sectionId === "hero") {
      saveHomepage({
        ...content.homepage,
        status: next,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      showSuccess(next === "Published" ? "Hero shown on website." : "Hero hidden from website.");
      return;
    }

    if (sectionId === "about") {
      saveAbout({
        ...content.about,
        status: next,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      showSuccess(
        next === "Published" ? "About band shown on website." : "About band hidden from website.",
      );
      return;
    }

    const bandKey = BAND_SECTION_KEYS[sectionId];
    if (!bandKey) return;

    saveHomepage(updateBandStatus(content.homepage, bandKey, next));
    showSuccess(
      next === "Published"
        ? "Section shown on the public website."
        : "Section hidden from the public website.",
    );
  }

  function confirmPending() {
    if (!pending) return;
    applyToggle(pending.sectionId, pending.current);
    setPending(null);
  }

  const hiding = pending?.current === "Published";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl text-foreground">Homepage sections</h2>
        <p className="mt-1 text-sm text-muted">
          Publish a section to show it on the public website, or unpublish to hide it. Edit controls
          headings and featured picks; manage full catalogs from the sidebar.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {homepageEditorSections.map((section, index) => {
          const { summary, status } = getSectionSummary(section.id, content);
          const editHref = getHomepageEditorHref(section);

          return (
            <article
              key={section.id}
              className="flex flex-col rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
                    Section {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 font-medium text-foreground">{section.label}</h3>
                </div>
                <PublishBadge status={status} />
              </div>
              <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted">{summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPending({
                      sectionId: section.id,
                      label: section.label,
                      current: status,
                    })
                  }
                  className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
                >
                  {status === "Published" ? "Hide from website" : "Show on website"}
                </button>
                <Link
                  href={editHref}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="mt-2 text-[11px] text-muted">
                {status === "Published" ? "Shown on website" : "Hidden from website"}
              </p>
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="Are you sure?"
        message={
          pending
            ? hiding
              ? `Hide “${pending.label}” from the public website? Visitors will not see this section until you show it again.`
              : `Show “${pending.label}” on the public website? It will appear on the homepage after save.`
            : ""
        }
        confirmLabel={hiding ? "Hide from website" : "Show on website"}
        confirmTone={hiding ? "danger" : "brand"}
        onCancel={() => setPending(null)}
        onConfirm={confirmPending}
      />

      <ToastPortal toast={toast} onClose={clearToast} />
    </div>
  );
}
