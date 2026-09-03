import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { CmsSectionEdit } from "@/components/cms/CmsSectionEdit";
import { PageIntro, Section } from "@/components/PageShell";
import { getSiteContent } from "@/lib/cms/get-site-content";

export const metadata: Metadata = {
  title: "Contact & Enquiries",
  description: "Contact Mistnleaf or submit a stay enquiry.",
};

type Props = PageProps<"/contact">;

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams;
  const content = await getSiteContent();
  const siteInfo = content.site;
  const contact = content.contact;
  const sent = params.sent === "1";
  const missing = params.error === "missing";

  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Contact & Enquiries"
        lead="Reach the resort desk, ask about availability, or send an enquiry — we will respond with next steps."
      />
      <Section className="relative pt-0">
        <Suspense fallback={null}>
          <CmsSectionEdit section="contact" label="Contact" />
        </Suspense>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl text-pine">Resort contact</h2>
            <div className="mt-6 space-y-4 text-muted">
              <p>
                <span className="block text-xs uppercase tracking-[0.18em] text-lichen">
                  Email
                </span>
                <a
                  href={`mailto:${contact.email || siteInfo.email}`}
                  className="text-pine hover:underline"
                >
                  {contact.email || siteInfo.email}
                </a>
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.18em] text-lichen">
                  Phone
                </span>
                <a
                  href={`tel:${(contact.phone || siteInfo.phone).replace(/\s/g, "")}`}
                  className="text-pine hover:underline"
                >
                  {contact.phone || siteInfo.phone}
                </a>
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.18em] text-lichen">
                  Hours
                </span>
                {siteInfo.hours}
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.18em] text-lichen">
                  Address
                </span>
                {contact.addressLine1 || siteInfo.address.line1}
                <br />
                {contact.addressLine2 || siteInfo.address.line2}
                <br />
                {siteInfo.address.country}
              </p>
              {contact.checkInNote ? (
                <p className="text-sm">{contact.checkInNote}</p>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              <Link href="/location" className="link-arrow">
                View location & directions
              </Link>
              <Link href="/booking/search" className="link-arrow">
                Check availability
              </Link>
            </div>
          </div>

          <div className="border border-line bg-fog/70 p-6 md:p-8">
            <h2 className="font-display text-2xl text-pine">Submit an enquiry</h2>
            <p className="mt-2 text-sm text-muted">
              Tell us what you need — stays, transfers, experiences, or general
              questions.
            </p>
            {sent ? (
              <div className="mt-6 border border-line bg-sand-cool/50 px-4 py-5 text-sm text-pine">
                Thank you. Your enquiry has been received
                {typeof params.id === "string" ? ` (ref ${params.id})` : ""}.
                Our team will follow up by email.
              </div>
            ) : null}
            {missing ? (
              <p className="mt-4 text-sm text-pine">
                Please complete the required fields and try again.
              </p>
            ) : null}
            {!sent ? (
              <div className="mt-6">
                <EnquiryForm />
              </div>
            ) : (
              <Link
                href="/contact"
                className="mt-6 inline-flex text-sm text-pine underline-offset-4 hover:underline"
              >
                Send another enquiry
              </Link>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
