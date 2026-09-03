import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { CmsSectionEdit } from "@/components/cms/CmsSectionEdit";
import { CtaBand, PageIntro, Section } from "@/components/PageShell";
import { getSiteContent } from "@/lib/cms/get-site-content";

export const metadata: Metadata = {
  title: "Amenities",
  description: "Spa, pool, lounge, yoga deck, and garden paths at Mistnleaf.",
};

export default async function AmenitiesPage() {
  const content = await getSiteContent();
  const band = content.homepageBands.amenities;

  return (
    <>
      <PageIntro
        eyebrow={band.eyebrow}
        title={band.title}
        lead={band.lead}
      />
      <Section className="relative pt-0">
        <Suspense fallback={null}>
          <CmsSectionEdit section="amenities" label="Amenities" />
        </Suspense>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {content.amenities.map((item) => (
            <article key={item.title}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={item.image.startsWith("http")}
                />
              </div>
              <h2 className="mt-4 font-display text-2xl text-pine">{item.title}</h2>
              <p className="mt-2 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
