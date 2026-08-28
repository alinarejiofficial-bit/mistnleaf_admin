"use client";

import type { CmsOffersSection, CmsWebsiteOffer } from "@/lib/cms-data";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type OffersPublicPreviewProps = {
  section: CmsOffersSection;
  offers: CmsWebsiteOffer[];
};

export function OffersPublicPreview({ section, offers }: OffersPublicPreviewProps) {
  const sorted = [...offers]
    .filter((offer) => offer.status === "Published" && offer.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="bg-[#e8e0d4] px-4 py-16 text-[#1a2e24] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs tracking-[0.2em] text-[#5c7a6e] uppercase">{section.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{section.title}</h2>
        <p className="mt-4 max-w-2xl text-base text-[#3d5248]">{section.subtitle}</p>
        {section.viewAllLabel ? (
          <a
            href={section.viewAllHref}
            className="mt-4 inline-block text-sm font-medium text-[#2f6b56] hover:underline"
          >
            {section.viewAllLabel} →
          </a>
        ) : null}

        <div className="mt-10 divide-y divide-[#c9bfb0]/80 border-t border-b border-[#c9bfb0]/80">
          {sorted.map((offer, index) => (
            <article
              key={offer.id}
              className="grid gap-6 py-8 lg:grid-cols-[auto_1fr_auto] lg:items-start"
            >
              <p className="font-display text-5xl text-[#c9bfb0] sm:text-6xl">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <h3 className="font-display text-2xl text-[#1a2e24] sm:text-3xl">{offer.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#3d5248] sm:text-base">
                  {offer.description}
                </p>
                {offer.terms.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                    {offer.terms.map((term) => (
                      <span
                        key={term}
                        className="text-[11px] tracking-[0.14em] text-[#5c7a6e] uppercase"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="text-left lg:text-right">
                <p className="text-[11px] tracking-[0.16em] text-[#5c7a6e] uppercase">
                  {offer.priceLabel}
                </p>
                <p className="mt-1 font-display text-3xl text-[#1a2e24] sm:text-4xl">
                  {formatINR(offer.priceFrom)}
                </p>
                <a
                  href={offer.bookCtaHref}
                  className="mt-4 inline-block text-sm font-medium text-[#2f6b56] hover:underline"
                >
                  {offer.bookCtaLabel}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
