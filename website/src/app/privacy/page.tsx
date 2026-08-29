import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        title="Privacy Policy"
        lead="How Mistnleaf collects, uses, and protects information you share with us."
      />
      <Section className="prose-muted mx-auto max-w-3xl space-y-4 pt-0 text-muted">
        <p>
          When you enquire or book, we collect details such as your name, email,
          phone number, stay dates, and any notes you provide. We use this
          information only to manage your reservation, respond to messages, and
          improve our hospitality.
        </p>
        <p>
          We do not sell personal data. Payment details, when collected through a
          payment provider, are processed by that provider under their own
          policies. Access to guest information is limited to staff who need it
          to deliver your stay.
        </p>
        <p>
          You may request access, correction, or deletion of your personal data
          by emailing stay@mistnleaf.com. This page is a starter policy and
          should be reviewed by legal counsel before public launch.
        </p>
      </Section>
    </>
  );
}
