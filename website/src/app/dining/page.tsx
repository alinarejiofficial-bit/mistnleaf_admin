import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand, PageIntro, Section } from "@/components/PageShell";
import { dining } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dining",
  description: "Seasonal dining at Fern Kitchen, Mistnleaf.",
};

export default function DiningPage() {
  return (
    <>
      <PageIntro
        eyebrow="Fern Kitchen"
        title="Dining"
        lead={dining.intro}
      />
      <Section className="pt-0">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={dining.image}
              alt="Dining at Fern Kitchen"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-8">
            {dining.meals.map((meal) => (
              <div key={meal.name} className="border-t border-line pt-5">
                <h2 className="font-display text-2xl text-pine">{meal.name}</h2>
                <p className="mt-1 text-sm text-lichen">{meal.time}</p>
                <p className="mt-2 text-muted">{meal.note}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
