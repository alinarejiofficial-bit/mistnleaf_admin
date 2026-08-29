import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingStepper } from "@/components/booking/BookingStepper";
import {
  BookingHiddens,
  ghostBtnClass,
  primaryBtnClass,
} from "@/components/booking/BookingUi";
import { PageIntro, Section } from "@/components/PageShell";
import {
  calcStayTotal,
  formatInr,
  formatStayRange,
  getRoom,
  nightsBetween,
  parseBookingQuery,
  requireGuest,
  toQuery,
} from "@/lib/booking";
import { goToPayment } from "../actions";

export const metadata: Metadata = {
  title: "Price Summary · Booking",
};

type Props = PageProps<"/booking/summary">;

export default async function BookingSummaryPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = parseBookingQuery(params);

  if (!requireGuest(query)) {
    redirect(`/booking/guest?${toQuery(query)}`);
  }

  const room = getRoom(query.room)!;
  const nights = nightsBetween(query.checkIn, query.checkOut);
  const totals = calcStayTotal(room, nights, query.addons);
  const q = toQuery(query);

  return (
    <>
      <BookingStepper current="summary" query={q} />
      <PageIntro
        eyebrow="Step 6"
        title="Price Calculation"
        lead="Review your stay total before payment. Taxes are estimated for this demo."
      />
      <Section className="pt-0">
        <div className="mx-auto max-w-xl border border-line bg-fog/80 p-6 md:p-8">
          <dl className="space-y-3 text-sm">
            {[
              ["Room", room.name],
              ["Guest", query.name],
              ["Dates", formatStayRange(query.checkIn, query.checkOut)],
              ["Nights", String(nights)],
              ["Guests", query.guests],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-line py-2"
              >
                <dt className="text-muted">{label}</dt>
                <dd className="text-right text-pine">{value}</dd>
              </div>
            ))}
          </dl>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                Room · {formatInr(totals.perNight)} × {nights}
              </dt>
              <dd className="text-pine">{formatInr(totals.roomSubtotal)}</dd>
            </div>
            {totals.addons.map((addon) => (
              <div key={addon.id} className="flex justify-between gap-4">
                <dt className="text-muted">{addon.name}</dt>
                <dd className="text-pine">{formatInr(addon.price)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Taxes & fees (12%)</dt>
              <dd className="text-pine">{formatInr(totals.taxes)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt className="font-display text-xl text-pine">Total</dt>
              <dd className="font-display text-2xl text-pine">
                {formatInr(totals.total)}
              </dd>
            </div>
          </dl>

          <form action={goToPayment} className="mt-8 flex flex-wrap gap-3">
            <BookingHiddens query={query} includeGuest />
            <button type="submit" className={primaryBtnClass}>
              Continue to payment
            </button>
            <Link href={`/booking/guest?${q}`} className={ghostBtnClass}>
              Back
            </Link>
          </form>
        </div>
      </Section>
    </>
  );
}
