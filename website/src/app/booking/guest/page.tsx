import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingStepper } from "@/components/booking/BookingStepper";
import {
  BookingHiddens,
  fieldClass,
  ghostBtnClass,
  primaryBtnClass,
  StaySummaryCard,
} from "@/components/booking/BookingUi";
import { PageIntro, Section } from "@/components/PageShell";
import {
  parseBookingQuery,
  requireRoom,
  toQuery,
} from "@/lib/booking";
import { goToSummary } from "../actions";

export const metadata: Metadata = {
  title: "Guest Details · Booking",
};

type Props = PageProps<"/booking/guest">;

export default async function BookingGuestPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = parseBookingQuery(params);

  if (!requireRoom(query)) {
    redirect(`/booking/select?${toQuery(query)}`);
  }

  const q = toQuery(query);
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <>
      <BookingStepper current="guest" query={q} />
      <PageIntro
        eyebrow="Step 5"
        title="Guest Information"
        lead="Tell us who is staying so we can prepare your arrival."
      />
      <Section className="pt-0">
        <form
          action={goToSummary}
          className="grid gap-8 lg:grid-cols-[1fr_280px]"
        >
          <BookingHiddens query={query} />

          <div className="space-y-4">
            {error ? (
              <p className="border border-line bg-mist px-4 py-3 text-sm text-pine">
                Please enter your name and email to continue.
              </p>
            ) : null}
            <label className="block text-sm text-muted">
              Full name *
              <input
                name="name"
                required
                defaultValue={query.name}
                className={fieldClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-muted">
                Email *
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={query.email}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm text-muted">
                Phone
                <input
                  name="phone"
                  defaultValue={query.phone}
                  className={fieldClass}
                />
              </label>
            </div>
            <label className="block text-sm text-muted">
              Special requests
              <textarea
                name="notes"
                rows={4}
                defaultValue={query.notes}
                placeholder="Arrival time, celebrations, dietary needs…"
                className={fieldClass}
              />
            </label>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className={primaryBtnClass}>
                Continue to price summary
              </button>
              <Link href={`/booking/add-ons?${q}`} className={ghostBtnClass}>
                Back
              </Link>
            </div>
          </div>
          <StaySummaryCard query={query} />
        </form>
      </Section>
    </>
  );
}
