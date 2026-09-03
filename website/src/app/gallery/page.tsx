import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { CmsSectionEdit } from "@/components/cms/CmsSectionEdit";
import { PageIntro, Section } from "@/components/PageShell";
import { getSiteContent } from "@/lib/cms/get-site-content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A visual look at Mistnleaf rooms, grounds, and surroundings.",
};

export default async function GalleryPage() {
  const content = await getSiteContent();
  const band = content.homepageBands.gallery;

  return (
    <>
      <PageIntro
        eyebrow={band.eyebrow}
        title={band.title}
        lead={band.lead}
      />
      <Section className="relative pt-0">
        <Suspense fallback={null}>
          <CmsSectionEdit section="gallery" label="Gallery" />
        </Suspense>
        <div className="gallery-mosaic gallery-mosaic--page">
          {content.galleryImages.map((image, index) => (
            <figure
              key={`${image.src}-${index}`}
              className="gallery-tile gallery-tile--page group"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="gallery-tile__img object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized={image.src.startsWith("http")}
              />
              <span className="gallery-tile__index" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <figcaption className="gallery-tile__caption">
                <span className="gallery-tile__label">
                  {image.label ?? image.alt}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
