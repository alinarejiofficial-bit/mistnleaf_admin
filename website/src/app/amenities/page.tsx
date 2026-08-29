import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand, PageIntro, Section } from "@/components/PageShell";
import { amenities } from "@/lib/site";

export const metadata: Metadata = {
  title: "Amenities",
  description: "Spa, pool, lounge, yoga deck, and garden paths at Mistnleaf.",
};

export default function AmenitiesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Comforts"
        title="Amenities"
        lead="Shared spaces designed for rest between walks, meals, and quiet hours."
      />
      <Section className="pt-0">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((item) => (
            <article key={item.title}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h2 className="mt-4 font-display text-2xl text-pine">
                {item.title}
              </h2>
              <p className="mt-2 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
