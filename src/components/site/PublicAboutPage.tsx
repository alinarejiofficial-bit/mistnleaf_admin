"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { PublicSiteFooter } from "@/components/site/PublicSiteFooter";
import { PublicSiteHeader } from "@/components/site/PublicSiteHeader";
import { PublicSiteSection } from "@/components/site/PublicSiteSectionEdit";
import { useAuth } from "@/components/auth/AuthProvider";
import { canEditCmsContent } from "@/lib/cms-api-auth";
import { fetchPublishedCmsFromApi } from "@/lib/cms-api-client";
import { CMS_UPDATED_EVENT, loadPublishedCmsContent } from "@/lib/cms-storage";
import type { PublishedCmsContent } from "@/lib/cms-published";
import { getPublicSiteBasePath } from "@/lib/public-site-nav";

export function PublicAboutPage() {
  const { currentUser } = useAuth();
  const [content, setContent] = useState<PublishedCmsContent | null>(null);
  const isEditor = currentUser && canEditCmsContent(currentUser.roleId, currentUser.permissions);
  const homeHref = getPublicSiteBasePath() || "/";

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const fromApi = await fetchPublishedCmsFromApi();
        if (!cancelled) setContent(fromApi);
      } catch {
        if (!cancelled) setContent(loadPublishedCmsContent());
      }
    }

    void refresh();
    const interval = window.setInterval(() => void refresh(), 5000);
    const onRefresh = () => void refresh();
    window.addEventListener(CMS_UPDATED_EVENT, onRefresh);
    window.addEventListener("focus", onRefresh);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener(CMS_UPDATED_EVENT, onRefresh);
      window.removeEventListener("focus", onRefresh);
    };
  }, []);

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1a14] text-sm text-white/70">
        Loading Mistnleaf…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1a14] text-white">
      <PublicSiteHeader />

      <div className="relative border-b border-white/10 px-4 py-16 sm:px-6 sm:py-24">
        {isEditor ? (
          <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
            <Link
              href="/website/about"
              className="inline-flex items-center gap-2 rounded-full border border-[#9dceb8]/40 bg-[#0f1a14]/90 px-4 py-2 text-sm font-medium text-[#9dceb8] shadow-lg backdrop-blur-sm hover:bg-[#1b4d3e]/80 hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit About page
            </Link>
          </div>
        ) : null}

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm tracking-[0.16em] text-[#9dceb8] uppercase">
              {content.about.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
              {content.about.title}
            </h1>
            <div
              className="prose prose-invert mt-6 max-w-none text-white/75 prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.about.content }}
            />
            {content.about.ctaLabel ? (
              <Link
                href={`${homeHref}#contact`}
                className="mt-8 inline-block text-sm font-medium text-[#9dceb8] hover:text-white"
              >
                {content.about.ctaLabel} →
              </Link>
            ) : null}
          </div>
          {content.about.imageUrl ? (
            <div
              className="min-h-[280px] rounded-3xl border border-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url(${content.about.imageUrl})` }}
            />
          ) : (
            <div className="min-h-[280px] rounded-3xl border border-white/10 bg-gradient-to-br from-[#1b4d3e]/40 to-[#0f1a14]" />
          )}
        </div>
      </div>

      <PublicSiteSection sectionId="footer">
        <PublicSiteFooter footer={content.footer} contact={content.contact} />
      </PublicSiteSection>
    </div>
  );
}
