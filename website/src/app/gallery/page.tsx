import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro, Section } from "@/components/PageShell";
import { galleryImages } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A visual look at Mistnleaf rooms, grounds, and surroundings.",
};

export default function GalleryPage() {
  return (
    <>
      <PageIntro
        eyebrow="Look"
        title="Gallery"
        lead="Moments from the lodge, the trails, and the mist that gives us our name."
      />
      <Section className="pt-0">
        <div className="gallery-mosaic gallery-mosaic--page">
          {galleryImages.map((image, index) => (
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
