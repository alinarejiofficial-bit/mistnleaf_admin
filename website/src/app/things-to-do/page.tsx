import type { Metadata } from "next";
import { CtaBand, PageIntro, Section } from "@/components/PageShell";
import { thingsToDo } from "@/lib/site";

export const metadata: Metadata = {
  title: "Things to Do",
  description: "Nearby trails, parks, markets, and viewpoints around Mistnleaf.",
};

export default function ThingsToDoPage() {
  return (
    <>
      <PageIntro
        eyebrow="Around us"
        title="Things to Do"
        lead="When you want to leave the lodge, the hills offer parks, waterfalls, markets, and sunrise views."
      />
      <Section className="pt-0">
        <div className="grid gap-8 md:grid-cols-2">
          {thingsToDo.map((item) => (
            <article key={item.title} className="border-t border-line pt-5">
              <p className="text-xs uppercase tracking-[0.18em] text-lichen">
                {item.distance}
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
