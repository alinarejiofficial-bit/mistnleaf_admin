"use client";

import { useEffect, useState } from "react";
import { PublicSiteFooter } from "@/components/site/PublicSiteFooter";
import { PublicSiteHeader } from "@/components/site/PublicSiteHeader";
import { PublicSiteSection } from "@/components/site/PublicSiteSectionEdit";
import { fetchPublishedCmsFromApi } from "@/lib/cms-api-client";
import { CMS_UPDATED_EVENT, loadPublishedCmsContent } from "@/lib/cms-storage";
import type { PublishedCmsContent } from "@/lib/cms-published";
import { OffersPublicPreview } from "@/components/site/OffersPublicPreview";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}


export function PublicWebsite() {
  const [content, setContent] = useState<PublishedCmsContent | null>(null);

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

  const featuredRooms = content.rooms.filter((r) =>
    content.homepage.featuredRoomIds.includes(r.id),
  );
  const rooms = featuredRooms.length ? featuredRooms : content.rooms.slice(0, 3);

  const heroStyle = content.homepage.heroMediaUrl
    ? {
        backgroundImage: `linear-gradient(rgba(15,26,20,0.72), rgba(15,26,20,0.88)), url(${content.homepage.heroMediaUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#0f1a14] text-white">
      <PublicSiteHeader />

      <PublicSiteSection
        sectionId="hero"
        className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(47,107,86,0.35),transparent_55%)]"
          style={heroStyle}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-sm tracking-[0.2em] text-[#9dceb8] uppercase">
            {content.homepage.heroEyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-6xl">
            {content.homepage.heroHeadline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">
            {content.homepage.heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#contact"
              className="rounded-full bg-[#2f6b56] px-6 py-3 text-sm font-medium text-white hover:bg-[#3a7d65]"
            >
              {content.homepage.heroCtaPrimary}
            </a>
            <a
              href="#rooms"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              {content.homepage.heroCtaSecondary}
            </a>
          </div>
        </div>
      </PublicSiteSection>

      <PublicSiteSection
        sectionId="rooms"
        className="border-t border-white/10 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl">Featured Rooms</h2>
          <p className="mt-2 text-white/70">Suites and cottages shaped for rest.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {rooms.map((room) => (
              <article key={room.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                {room.images[0] ? (
                  <div
                    className="mb-4 aspect-[4/3] rounded-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${room.images[0]})` }}
                  />
                ) : (
                  <div className="mb-4 aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#2f6b56]/30 to-transparent" />
                )}
                <h3 className="font-display text-xl">{room.name}</h3>
                <p className="mt-2 text-sm text-white/70">{room.tagline}</p>
                <p className="mt-4 text-sm font-medium text-[#9dceb8]">
                  From {formatINR(room.priceFrom)} / night
                </p>
              </article>
            ))}
          </div>
        </div>
      </PublicSiteSection>

      <PublicSiteSection
        sectionId="experiences"
        className="border-t border-white/10 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl">Experiences</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {content.experiences.map((exp, index) => (
              <article key={exp.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs text-[#9dceb8]">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-xl">{exp.title}</h3>
                <p className="mt-1 text-sm text-[#9dceb8]">{exp.duration}</p>
                <p className="mt-3 text-sm text-white/70">{exp.description}</p>
              </article>
            ))}
          </div>
        </div>
      </PublicSiteSection>

      <PublicSiteSection
        sectionId="amenities"
        className="border-t border-white/10 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl">Amenities</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.amenities.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </PublicSiteSection>

      <PublicSiteSection
        sectionId="gallery"
        className="border-t border-white/10 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl">Gallery</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.galleryImages.map((image) => (
              <figure key={image.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {image.imageUrl ? (
                  <div
                    className="aspect-[4/3] bg-cover bg-center"
                    style={{ backgroundImage: `url(${image.imageUrl})` }}
                  />
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#2f6b56]/25 to-transparent" />
                )}
                <figcaption className="p-4">
                  <p className="font-medium">{image.title}</p>
                  <p className="mt-1 text-sm text-white/65">{image.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </PublicSiteSection>

      <PublicSiteSection sectionId="offers" className="border-t border-white/10">
        <OffersPublicPreview section={content.offersSection} offers={content.offers} />
      </PublicSiteSection>

      <PublicSiteSection
        sectionId="testimonials"
        className="border-t border-white/10 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl">Guest Testimonials</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.testimonials.map((item) => (
              <blockquote key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm leading-relaxed text-white/80">"{item.content}"</p>
                <footer className="mt-4 text-sm">
                  <span className="font-medium">{item.guestName}</span>
                  <span className="text-white/55"> · {item.guestLocation}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </PublicSiteSection>

      <PublicSiteSection
        sectionId="location"
        className="border-t border-white/10 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl">{content.location.title}</h2>
          <p className="mt-3 max-w-2xl text-white/70">{content.location.description}</p>
          <p className="mt-4 whitespace-pre-line text-sm text-white/80">{content.location.address}</p>
          <p className="mt-2 text-sm text-[#9dceb8]">{content.location.airportNote}</p>
        </div>
      </PublicSiteSection>

      <PublicSiteSection
        sectionId="faqs"
        className="border-t border-white/10 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl">FAQs</h2>
          <div className="mt-8 space-y-4">
            {content.faqs.map((faq) => (
              <details key={faq.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer font-medium">{faq.question}</summary>
                <p className="mt-3 text-sm text-white/70">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </PublicSiteSection>

      <PublicSiteSection
        sectionId="contact"
        className="border-t border-white/10 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl">Book your stay</h2>
          <p className="mt-3 text-white/70">{content.contact.checkInNote}</p>
          <div className="mt-6 space-y-1 text-sm text-white/80">
            <p>{content.contact.email}</p>
            <p>{content.contact.phone}</p>
            <p className="whitespace-pre-line">{content.contact.address}</p>
          </div>
        </div>
      </PublicSiteSection>

      <PublicSiteFooter footer={content.footer} contact={content.contact} />
    </div>
  );
}
