import type { Metadata } from "next";
import { Suspense } from "react";
import { FaqList } from "@/components/FaqList";
import { CmsSectionEdit } from "@/components/cms/CmsSectionEdit";
import { PageIntro, Section } from "@/components/PageShell";
import { getSiteContent } from "@/lib/cms/get-site-content";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Common questions about staying at Mistnleaf.",
};

export default async function FaqsPage() {
  const content = await getSiteContent();
  const band = content.homepageBands.faqs;

  return (
    <>
      <PageIntro
        eyebrow={band.eyebrow}
        title={band.title}
        lead={band.lead}
      />
      <Section className="relative pt-0">
        <Suspense fallback={null}>
          <CmsSectionEdit section="faqs" label="FAQs" />
        </Suspense>
        <FaqList items={content.faqs} className="faq-list--page" />
      </Section>
    </>
  );
}
