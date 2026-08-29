import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand, PageIntro, Section } from "@/components/PageShell";
import { experiences } from "@/lib/site";

export const metadata: Metadata = {
  title: "Experiences",
  description: "Guided walks, tea tastings, and quiet workshops at Mistnleaf.",
};

export default function ExperiencesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Do"
        title="Experiences"
        lead="Optional rituals for your stay — from dawn walks to fireside evenings."
      />
      <Section className="pt-0">
        <div className="grid gap-10 md:grid-cols-2">
          {experiences.map((item) => (
            <article key={item.title}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-lichen">
                {item.duration}
              </p>
              <h2 className="mt-2 font-display text-2xl text-pine">
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
