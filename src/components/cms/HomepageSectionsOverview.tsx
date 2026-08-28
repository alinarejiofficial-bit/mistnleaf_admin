"use client";

import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import { useCms } from "@/components/cms/CmsProvider";
import { PublishBadge } from "@/components/cms/CmsShared";
import type { CmsContent, PublishStatus } from "@/lib/cms-data";
import {
  homepageScrollSections,
  type PublicSiteSectionId,
} from "@/lib/public-site-sections";

type SectionSummary = {
  summary: string;
  status: PublishStatus | "mixed";
};

function publishedCount<T extends { status: PublishStatus }>(items: T[]) {
  return items.filter((item) => item.status === "Published").length;
}

function getSectionSummary(sectionId: PublicSiteSectionId, content: CmsContent): SectionSummary {
  switch (sectionId) {
    case "hero":
      return {
        summary: content.homepage.heroHeadline,
        status: content.homepage.status,
      };
    case "about":
      return {
        summary: content.about.title,
        status: content.about.status,
      };
    case "rooms": {
      const published = publishedCount(content.rooms);
      const featured = content.homepage.featuredRoomIds.length;
      return {
        summary: `${published} published · ${featured} featured on homepage`,
        status: published === content.rooms.length ? "Published" : published > 0 ? "mixed" : "Draft",
      };
    }
    case "experiences": {
      const published = publishedCount(content.experiences);
      return {
        summary: `${published} of ${content.experiences.length} published`,
        status: published === content.experiences.length ? "Published" : published > 0 ? "mixed" : "Draft",
      };
    }
    case "amenities": {
      const published = publishedCount(content.amenities);
      return {
        summary: `${published} of ${content.amenities.length} published`,
        status: published === content.amenities.length ? "Published" : published > 0 ? "mixed" : "Draft",
      };
    }
    case "gallery": {
      const published = publishedCount(content.galleryImages);
      return {
        summary: `${published} images published`,
        status: published === content.galleryImages.length ? "Published" : published > 0 ? "mixed" : "Draft",
      };
    }
    case "offers": {
      const published = content.offers.filter((o) => o.status === "Published" && o.active).length;
      return {
        summary: `${published} packages · ${content.offersSection.title}`,
        status: content.offersSection.status,
      };
    }
    case "testimonials": {
      const published = publishedCount(content.testimonials);
      return {
        summary: `${published} of ${content.testimonials.length} published`,
        status: published === content.testimonials.length ? "Published" : published > 0 ? "mixed" : "Draft",
      };
    }
    case "location":
      return {
        summary: content.location.title,
        status: content.location.status,
      };
    case "faqs": {
      const published = publishedCount(content.faqs);
      return {
        summary: `${published} of ${content.faqs.length} published`,
        status: published === content.faqs.length ? "Published" : published > 0 ? "mixed" : "Draft",
      };
    }
    case "contact":
      return {
        summary: content.contact.email,
        status: content.contact.status,
      };
    case "footer":
      return {
        summary: content.footer.brandDescription || content.footer.tagline,
        status: content.footer.status,
      };
    default:
      return { summary: "", status: "Draft" };
  }
}

function SummaryStatus({ status }: { status: PublishStatus | "mixed" }) {
  if (status === "mixed") {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
        Mixed
      </span>
    );
  }
  return <PublishBadge status={status} />;
}

/** Maps every public homepage block to its CMS editor. */
export function HomepageSectionsOverview() {
  const { content } = useCms();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl text-foreground">Homepage sections</h2>
        <p className="mt-1 text-sm text-muted">
          Blocks that scroll on the homepage. Standalone pages like About are edited from
          the sidebar.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {homepageScrollSections.map((section, index) => {
          const { summary, status } = getSectionSummary(section.id, content);
          const isHero = section.id === "hero";
          const editHref = isHero
            ? "/website/homepage?edit=hero"
            : `/website/${section.cmsSection}`;

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
                <SummaryStatus status={status} />
              </div>
              <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted">{summary}</p>
              <Link
                href={editHref}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
              >
                <Pencil className="h-3.5 w-3.5" />
                {isHero ? "Edit hero banner" : `Edit ${section.label}`}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
