import type { Metadata } from "next";
import { FaqList } from "@/components/FaqList";
import { PageIntro, Section } from "@/components/PageShell";
import { faqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Common questions about staying at Mistnleaf.",
};

export default function FaqsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Help"
        title="FAQs"
        lead="Answers to the questions guests ask most before arrival."
      />
      <Section className="pt-0">
        <FaqList items={faqs} className="faq-list--page" />
      </Section>
    </>
  );
}
