"use client";

import Link from "next/link";
import {
  FileEdit,
  Globe,
  Image,
  LayoutGrid,
  Percent,
  Sparkles,
} from "lucide-react";
import { RoleDashboardHeader } from "@/components/dashboard/RoleDashboardHeader";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { usePermissions } from "@/components/auth/usePermissions";
import { CmsProvider, useCms } from "@/components/cms/CmsProvider";
import { LoadingState } from "@/components/cms/CmsShared";
import { getDashboardConfig } from "@/lib/dashboard-registry";
import { cmsRouteLabels, type CmsRouteSection } from "@/lib/cms-data";

const sectionIcons: Partial<Record<CmsRouteSection, React.ReactNode>> = {
  homepage: <Globe className="h-5 w-5 text-brand-mid" />,
  about: <Globe className="h-5 w-5 text-brand-mid" />,
  rooms: <LayoutGrid className="h-5 w-5 text-brand-mid" />,
  amenities: <Sparkles className="h-5 w-5 text-brand-mid" />,
  experiences: <Sparkles className="h-5 w-5 text-brand-mid" />,
  gallery: <Image className="h-5 w-5 text-brand-mid" />,
  offers: <Percent className="h-5 w-5 text-brand-mid" />,
  testimonials: <Sparkles className="h-5 w-5 text-brand-mid" />,
  faqs: <FileEdit className="h-5 w-5 text-brand-mid" />,
  contact: <Globe className="h-5 w-5 text-brand-mid" />,
  location: <Globe className="h-5 w-5 text-brand-mid" />,
  social: <Globe className="h-5 w-5 text-brand-mid" />,
  footer: <FileEdit className="h-5 w-5 text-brand-mid" />,
};

function ContentManagerDashboardShell() {
  const { ready, content } = useCms();
  const { roleId } = usePermissions();
  const config = roleId ? getDashboardConfig(roleId) : null;

  if (!ready) return <LoadingState label="Loading website content…" />;

  const publishedRooms = content.rooms.filter((r) => r.status === "Published").length;
  const draftRooms = content.rooms.filter((r) => r.status === "Draft").length;
  const publishedOffers = content.offers.filter((o) => o.status === "Published").length;
  const draftOffers = content.offers.filter((o) => o.status === "Draft").length;
  const publishedTestimonials = content.testimonials.filter(
    (t) => t.status === "Published",
  ).length;
  const draftGallery = content.galleryImages.filter((g) => g.status === "Draft").length;
  const publishedFaqs = content.faqs.filter((f) => f.status === "Published").length;

  const stats = [
    {
      label: "Published items",
      value:
        publishedRooms +
        publishedOffers +
        publishedTestimonials +
        publishedFaqs +
        (content.contact.status === "Published" ? 1 : 0),
      tone: "border-brand/20 bg-brand-soft/60",
    },
    {
      label: "Draft content",
      value: draftRooms + draftOffers + draftGallery,
      tone: "border-accent/30 bg-accent-soft/70",
    },
    {
      label: "Gallery images",
      value: content.galleryImages.length,
      tone: "border-info/20 bg-[#e7f0f5]/70",
    },
    {
      label: "Experiences",
      value: content.experiences.length,
      tone: "border-success/20 bg-[#e8f3ec]/70",
    },
  ];

  const recentSections: { section: CmsRouteSection; detail: string; updated: string }[] = [
    {
      section: "homepage",
      detail: content.homepage.heroHeadline,
      updated: content.homepage.updatedAt,
    },
    {
      section: "rooms",
      detail: `${content.rooms.length} room pages · ${publishedRooms} published`,
      updated: content.rooms[0]?.updatedAt ?? "—",
    },
    {
      section: "gallery",
      detail: `${content.galleryImages.length} images · ${content.galleryCategories.length} categories`,
      updated: "—",
    },
    {
      section: "offers",
      detail: `${content.offers.length} offers · ${publishedOffers} live`,
      updated: content.offers[0]?.updatedAt ?? "—",
    },
  ];

  return (
    <div className="space-y-6">
      <RoleDashboardHeader />

      {config ? (
        <DashboardQuickActions
          title="Content workspace"
          description="Edit homepage, rooms, gallery, offers, testimonials, and FAQs on the live site at localhost:3000."
          actions={config.quickActions}
          accentClass={config.accentClass}
        />
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <article
            key={stat.label}
            className={`animate-fade-up rounded-2xl border p-5 shadow-sm ${stat.tone}`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-2 font-display text-3xl tracking-tight text-foreground">
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-foreground">Content sections</h2>
            <p className="mt-1 text-sm text-muted">
              Jump into any area of the public website.
            </p>
          </div>
        </div>
        <ul className="divide-y divide-border-subtle">
          {recentSections.map((item) => (
            <li key={item.section}>
              <Link
                href={`/website/${item.section}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface-muted/60"
              >
                <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
                      {sectionIcons[item.section] ?? <Globe className="h-5 w-5 text-brand-mid" />}
                    </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {cmsRouteLabels[item.section]}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted">{item.detail}</p>
                  </div>
                </div>
                <span className="text-xs text-muted">Updated {item.updated}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function ContentManagerDashboard() {
  return (
    <CmsProvider>
      <ContentManagerDashboardShell />
    </CmsProvider>
  );
}
