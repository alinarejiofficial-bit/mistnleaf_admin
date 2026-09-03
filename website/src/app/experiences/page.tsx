import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { CmsSectionEdit } from "@/components/cms/CmsSectionEdit";
import { CtaBand, PageIntro, Section } from "@/components/PageShell";
import { getSiteContent } from "@/lib/cms/get-site-content";

export const metadata: Metadata = {
  title: "Experiences",
  description: "Guided walks, tea tastings, and quiet workshops at Mistnleaf.",
};

export default async function ExperiencesPage() {
  const content = await getSiteContent();
  const band = content.homepageBands.experiences;

  return (
    <>
      <PageIntro
        eyebrow={band.eyebrow}
        title={band.title}
        lead={band.lead}
      />
      <Section className="relative pt-0">
        <Suspense fallback={null}>
          <CmsSectionEdit section="experiences" label="Experiences" />
        </Suspense>
        <div className="grid gap-10 md:grid-cols-2">
          {content.experiences.map((item) => (
            <article key={item.title}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized={item.image.startsWith("http")}
                />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-lichen">
                {item.duration}
              </p>
              <h2 className="mt-2 font-display text-2xl text-pine">{item.title}</h2>
              <p className="mt-2 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
