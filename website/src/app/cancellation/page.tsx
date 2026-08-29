import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Cancellation Policy",
};

export default function CancellationPage() {
  return (
    <>
      <PageIntro
        title="Cancellation Policy"
        lead="Clear timelines so you can plan your stay with confidence."
      />
      <Section className="mx-auto max-w-3xl space-y-4 pt-0 text-muted">
        <p>
          Cancellations made 7 or more days before check-in receive a full
          refund of prepaid amounts, less any non-refundable third-party fees.
        </p>
        <p>
          Cancellations within 6 days of arrival, or no-shows, may forfeit one
          night&apos;s stay. Date changes are subject to availability and may
          adjust the rate.
        </p>
        <p>
          Peak-season and package bookings may carry different terms, which will
          be stated in your confirmation email. Contact stay@mistnleaf.com for
          assistance.
        </p>
      </Section>
    </>
  );
}
