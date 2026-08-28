"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  HelpCircle,
  Home,
  Image,
  LayoutGrid,
  MapPin,
  MessageSquareQuote,
  Percent,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  FileText,
  Info,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CmsProvider, useCms } from "@/components/cms/CmsProvider";
import { CmsPreviewPanel, type PreviewState } from "@/components/cms/CmsPreview";
import { LoadingState } from "@/components/cms/CmsShared";
import {
  FaqsContactSection,
  GallerySection,
  OffersCmsSection,
  TestimonialsSection,
} from "@/components/cms/sections/CmsSectionsPart2";
import {
  HomepageSection,
  RoomContentSection,
} from "@/components/cms/sections/CmsSectionsPart1";
import {
  AboutSection,
  AmenitiesSection,
  ExperiencesSection,
  FooterSection,
  LocationSection,
  SocialSection,
} from "@/components/cms/sections/CmsSectionsPart3";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  cmsRouteLabels,
  cmsRouteSections,
  type CmsRouteSection,
  type CmsSectionId,
} from "@/lib/cms-data";
import { getPublicAboutPath, getPublicSiteBasePath } from "@/lib/public-site-nav";
import { hasAnyPermission } from "@/lib/roles";

const sectionIcons: Record<CmsSectionId, React.ReactNode> = {
  homepage: <Home className="h-4 w-4" />,
  about: <Info className="h-4 w-4" />,
  rooms: <LayoutGrid className="h-4 w-4" />,
  amenities: <Sparkles className="h-4 w-4" />,
  experiences: <Sparkles className="h-4 w-4" />,
  gallery: <Image className="h-4 w-4" />,
  offers: <Percent className="h-4 w-4" />,
  testimonials: <MessageSquareQuote className="h-4 w-4" />,
  faqs: <HelpCircle className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  footer: <FileText className="h-4 w-4" />,
};

const cmsPermissions = [
  "manage_website",
  "update_website_content",
  "manage_images",
  "manage_room_descriptions",
  "manage_facilities",
  "manage_blog_content",
  "manage_offers",
] as const;

type WebsiteCmsManagerProps = {
  initialSection?: CmsRouteSection;
  showInternalNav?: boolean;
  compactHeader?: boolean;
};

type ActiveCmsSection = CmsSectionId | "contact";

function toActiveSection(section: CmsRouteSection): ActiveCmsSection {
  return section;
}

function sectionIcon(id: CmsRouteSection) {
  if (id === "contact") return <Phone className="h-4 w-4" />;
  return sectionIcons[id];
}

export function WebsiteCmsManager({
  initialSection = "homepage",
  showInternalNav = true,
  compactHeader = false,
}: WebsiteCmsManagerProps = {}) {
  return (
    <CmsProvider>
      <WebsiteCmsShell
        initialSection={initialSection}
        showInternalNav={showInternalNav}
        compactHeader={compactHeader}
      />
    </CmsProvider>
  );
}

function WebsiteCmsShell({
  initialSection,
  showInternalNav,
  compactHeader,
}: Required<WebsiteCmsManagerProps>) {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { ready, content } = useCms();
  const [internalSection, setInternalSection] = useState<ActiveCmsSection>(
    toActiveSection(initialSection),
  );
  const activeSection = showInternalNav ? internalSection : toActiveSection(initialSection);
  const [preview, setPreview] = useState<PreviewState>(null);
  const [navQuery, setNavQuery] = useState("");

  useEffect(() => {
    setInternalSection(toActiveSection(initialSection));
  }, [initialSection]);

  useEffect(() => {
    const match = pathname.match(/^\/website\/([^/]+)/);
    if (!match) return;
    const segment = match[1];
    if (cmsRouteSections.includes(segment as CmsRouteSection)) {
      setInternalSection(segment as ActiveCmsSection);
    }
  }, [pathname]);

  const canManage = currentUser
    ? hasAnyPermission(currentUser.roleId, [...cmsPermissions])
    : false;

  const stats = useMemo(
    () => ({
      published:
        content.rooms.filter((r) => r.status === "Published").length +
        content.offers.filter((o) => o.status === "Published").length +
        content.testimonials.filter((t) => t.status === "Published").length,
      drafts:
        content.rooms.filter((r) => r.status === "Draft").length +
        content.offers.filter((o) => o.status === "Draft").length +
        content.galleryImages.filter((g) => g.status === "Draft").length,
      media: content.galleryImages.length + content.rooms.filter((r) => r.images.length).length,
    }),
    [content],
  );

  const navSections = cmsRouteSections.filter((id) =>
    cmsRouteLabels[id].toLowerCase().includes(navQuery.trim().toLowerCase()),
  );

  const headerSection: CmsRouteSection =
    activeSection === "contact" ? "contact" : activeSection;

  const faqsFocus =
    activeSection === "contact" ? "contact" : activeSection === "faqs" ? "faqs" : "all";

  const publicSiteHref = getPublicSiteBasePath() || "/";
  const publicViewHref =
    activeSection === "about" ? getPublicAboutPath() : publicSiteHref;

  function handlePreview(section: string, data?: unknown) {
    setPreview({ section, data });
  }

  if (!canManage) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface px-6 py-16 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-muted" />
        <h2 className="mt-4 font-display text-xl text-foreground">Access restricted</h2>
        <p className="mt-2 text-sm text-muted">
          Website CMS requires website content management permissions.
        </p>
      </div>
    );
  }

  if (!ready) return <LoadingState label="Loading website content…" />;

  return (
    <div className="space-y-5">
      {!compactHeader ? (
        <header className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-soft via-surface to-accent-soft p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-brand-mid uppercase">
                MistnLeaf · Public website
              </p>
              <h1 className="mt-1 font-display text-3xl tracking-tight text-foreground">
                Website CMS
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Manage homepage, rooms, gallery, offers, testimonials, FAQs, and contact
                information — no code editing required.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <StatChip label="Published" value={stats.published} />
              <StatChip label="Drafts" value={stats.drafts} />
              <StatChip label="Media" value={stats.media} />
            </div>
          </div>
        </header>
      ) : (
        <header className="rounded-2xl border border-border-subtle bg-surface px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link
                href={publicSiteHref}
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to public homepage
              </Link>
              <p className="text-xs font-medium tracking-[0.14em] text-brand-mid uppercase">
                Website CMS
              </p>
              <h1 className="mt-1 font-display text-2xl tracking-tight text-foreground">
                {cmsRouteLabels[headerSection]}
              </h1>
            </div>
            <Link
              href={publicViewHref}
              target={publicViewHref.startsWith("/site") ? "_blank" : undefined}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand/25 bg-brand-soft/50 px-3 py-2 text-sm font-medium text-brand-mid hover:bg-brand-soft"
            >
              <ExternalLink className="h-4 w-4" />
              {activeSection === "about" ? "View About page" : "View public site"}
            </Link>
          </div>
        </header>
      )}

      <div
        className={
          showInternalNav ? "grid gap-5 xl:grid-cols-[240px_1fr]" : "grid gap-5"
        }
      >
        {showInternalNav ? (
          <aside className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm xl:sticky xl:top-4 xl:self-start">
            <label className="relative mb-3 block">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={navQuery}
                onChange={(event) => setNavQuery(event.target.value)}
                placeholder="Filter sections…"
                className="h-10 w-full rounded-xl border border-border bg-surface-muted/40 pr-3 pl-9 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
              />
            </label>
            <nav className="space-y-1">
              {navSections.map((id) => {
                const href = `/website/${id}`;
                const isActive = pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    key={id}
                    href={href}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      isActive
                        ? "bg-brand font-medium text-white shadow-sm"
                        : "text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    {sectionIcon(id)}
                    {cmsRouteLabels[id]}
                  </Link>
                );
              })}
            </nav>
          </aside>
        ) : null}

        <main className="min-w-0 rounded-2xl border border-border-subtle bg-surface/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          {activeSection === "homepage" ? (
            <Suspense fallback={<LoadingState label="Loading homepage…" />}>
              <HomepageSection onPreview={handlePreview} />
            </Suspense>
          ) : null}
          {activeSection === "about" ? (
            <AboutSection onPreview={handlePreview} />
          ) : null}
          {activeSection === "rooms" ? (
            <RoomContentSection onPreview={handlePreview} />
          ) : null}
          {activeSection === "amenities" ? (
            <AmenitiesSection onPreview={handlePreview} />
          ) : null}
          {activeSection === "experiences" ? (
            <ExperiencesSection onPreview={handlePreview} />
          ) : null}
          {activeSection === "gallery" ? (
            <GallerySection onPreview={handlePreview} />
          ) : null}
          {activeSection === "offers" ? (
            <OffersCmsSection onPreview={handlePreview} />
          ) : null}
          {activeSection === "testimonials" ? (
            <TestimonialsSection onPreview={handlePreview} />
          ) : null}
          {activeSection === "faqs" || activeSection === "contact" ? (
            <FaqsContactSection onPreview={handlePreview} focus={faqsFocus} />
          ) : null}
          {activeSection === "location" ? (
            <LocationSection onPreview={handlePreview} />
          ) : null}
          {activeSection === "social" ? (
            <SocialSection onPreview={handlePreview} />
          ) : null}
          {activeSection === "footer" ? (
            <FooterSection onPreview={handlePreview} />
          ) : null}
        </main>
      </div>

      <CmsPreviewPanel preview={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface/80 px-3 py-2">
      <p className="text-[10px] tracking-wide text-muted uppercase">{label}</p>
      <p className="font-display text-xl text-foreground">{value}</p>
    </div>
  );
}
