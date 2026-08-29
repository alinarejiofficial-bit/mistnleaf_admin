import type { Metadata } from "next";
import { PageIntro, Section } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <>
      <PageIntro
        title="Terms & Conditions"
        lead="The basics that govern bookings and stays at Mistnleaf."
      />
      <Section className="mx-auto max-w-3xl space-y-4 pt-0 text-muted">
        <p>
          By requesting or confirming a reservation, you agree to provide
          accurate guest details and to respect house guidelines shared at
          check-in. Rates are quoted per room per night unless a package states
          otherwise.
        </p>
        <p>
          Mistnleaf may decline or cancel a booking in rare cases of
          overbooking, safety concerns, or force majeure, and will offer an
          alternative date or refund of prepaid amounts where applicable.
        </p>
        <p>
          Guests are responsible for damage beyond normal wear. These terms are
          a template for the demo site and should be finalized with legal advice
          before launch.
        </p>
      </Section>
    </>
  );
}
