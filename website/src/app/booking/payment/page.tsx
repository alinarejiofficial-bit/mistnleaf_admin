import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingStepper } from "@/components/booking/BookingStepper";
import {
  BookingHiddens,
  fieldClass,
  ghostBtnClass,
  primaryBtnClass,
} from "@/components/booking/BookingUi";
import { PageIntro, Section } from "@/components/PageShell";
import {
  calcStayTotal,
  formatInr,
  getRoom,
  nightsBetween,
  parseBookingQuery,
  requireGuest,
  toQuery,
} from "@/lib/booking";
import { completePayment } from "../actions";

export const metadata: Metadata = {
  title: "Payment · Booking",
};

type Props = PageProps<"/booking/payment">;

export default async function BookingPaymentPage({ searchParams }: Props) {
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
      <BookingStepper current="payment" query={q} />
      <PageIntro
        eyebrow="Step 7"
        title="Payment"
        lead="Secure checkout — demo card gateway records payment, generates invoice, and confirms the booking."
      />
      <Section className="pt-0">
        <form
          action={completePayment}
          className="mx-auto grid max-w-xl gap-4 border border-line bg-fog/80 p-6 md:p-8"
        >
          <BookingHiddens query={query} includeGuest />

          <p className="font-display text-2xl text-pine">
            Pay {formatInr(totals.total)}
          </p>
          <p className="text-sm text-muted">
            {room.name} · {nights} night{nights === 1 ? "" : "s"}
            {totals.addons.length > 0
              ? ` · ${totals.addons.length} add-on${totals.addons.length === 1 ? "" : "s"}`
              : ""}
          </p>

          <label className="block text-sm text-muted">
            Name on card
            <input
              name="cardName"
              required
              defaultValue={query.name}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm text-muted">
            Card number
            <input
              name="cardNumber"
              required
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              className={fieldClass}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm text-muted">
              Expiry
              <input
                name="expiry"
                required
                placeholder="MM/YY"
                className={fieldClass}
              />
            </label>
            <label className="block text-sm text-muted">
              CVC
              <input
                name="cvc"
                required
                placeholder="123"
                className={fieldClass}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" className={primaryBtnClass}>
              Confirm & pay
            </button>
            <Link href={`/booking/summary?${q}`} className={ghostBtnClass}>
              Back
            </Link>
          </div>
        </form>
      </Section>
    </>
  );
}
