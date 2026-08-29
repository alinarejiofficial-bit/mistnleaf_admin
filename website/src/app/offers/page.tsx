import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageIntro, Section } from "@/components/PageShell";
import { formatInr, offers } from "@/lib/site";

export const metadata: Metadata = {
  title: "Offers & Packages",
  description: "Seasonal packages and stay inclusions at Mistnleaf.",
};

export default function OffersPage() {
  return (
    <>
      <PageIntro
        eyebrow="Packages"
        title="Offers & Packages"
        lead="Thoughtful combinations of stay, meals, and experiences — without the clutter."
      />
      <Section className="pt-0">
        <div className="border-b border-line">
          {offers.map((offer, index) => (
            <article key={offer.title} className="offer-panel">
              <p className="offer-index" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className="max-w-xl">
                <h2 className="font-display text-2xl text-pine md:text-[2rem]">
                  {offer.title}
                </h2>
                <p className="mt-3 leading-relaxed text-muted">{offer.detail}</p>
                <p className="mt-3 text-[0.72rem] uppercase tracking-[0.16em] text-lichen">
                  {offer.valid}
                </p>
              </div>
              <div className="md:min-w-[9.5rem] md:text-right">
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">
                  From
                </p>
                <p className="mt-1 font-display text-3xl text-pine">
                  {formatInr(offer.priceFrom)}
                </p>
                <Link href="/booking/search" className="link-arrow mt-4">
                  Enquire to book
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
