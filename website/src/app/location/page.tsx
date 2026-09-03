import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { CmsSectionEdit } from "@/components/cms/CmsSectionEdit";
import { PageIntro, Section } from "@/components/PageShell";
import { getSiteContent } from "@/lib/cms/get-site-content";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Location",
  description: "Find Mistnleaf in the hills of Munnar, Kerala.",
};

export default async function LocationPage() {
  const content = await getSiteContent();
  const { site: siteInfo, location } = content;
  const directionsHref =
    location.directionsUrl.startsWith("http")
      ? location.directionsUrl
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${location.addressLine1}, ${location.addressLine2}, ${siteInfo.address.country}`,
        )}`;

  return (
    <>
      <PageIntro
        eyebrow="Find us"
        title={location.title}
        lead={location.description}
      />

      <section className="relative overflow-hidden">
        <Suspense fallback={null}>
          <CmsSectionEdit section="location" label="Location" />
        </Suspense>
        <div className="location-panel absolute inset-0">
          <Image
            src={media.locationHills}
            alt="Hills surrounding Mistnleaf in Munnar"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div className="relative z-[2] mx-auto flex min-h-[26rem] max-w-6xl flex-col justify-end px-6 py-16 md:min-h-[32rem] md:py-20">
          <div className="max-w-xl text-fog">
            <p className="font-display text-3xl md:text-4xl">{siteInfo.name}</p>
            <p className="mt-4 leading-relaxed text-fog/80">
              {location.addressLine1}
              <br />
              {location.addressLine2}
              <br />
              {siteInfo.address.country}
            </p>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 md:grid-cols-3">
          <div className="border-t-2 border-lichen/50 pt-5">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-lichen">
              By air
            </p>
            <p className="mt-3 font-display text-xl text-pine">
              Cochin International
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {location.airportNote}. Private transfers can be arranged when you
              book.
            </p>
          </div>
          <div className="border-t-2 border-lichen/50 pt-5">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-lichen">
              Arrival
            </p>
            <p className="mt-3 font-display text-xl text-pine">Hill Road access</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Near Whispering Pines. Share your ETA and we will guide the final
              stretch to the lodge.
            </p>
          </div>
          <div className="border-t-2 border-lichen/50 pt-5">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-lichen">
              Need help?
            </p>
            <p className="mt-3 font-display text-xl text-pine">Ask the desk</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Email {siteInfo.email} or call {siteInfo.phone} for directions and
              transfer quotes.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center bg-pine px-6 py-3 text-[0.8rem] font-medium uppercase tracking-[0.08em] text-fog transition hover:bg-pine-soft"
          >
            Get directions
          </a>
          <ButtonLink href="/contact" variant="ghost">
            Ask for directions
          </ButtonLink>
          <Link href="/booking/search" className="link-arrow self-center">
            Check availability
          </Link>
        </div>
      </Section>
    </>
  );
}
