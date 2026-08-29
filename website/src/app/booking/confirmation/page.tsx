import type { Metadata } from "next";
import Link from "next/link";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { PageIntro, Section } from "@/components/PageShell";
import { formatStayRange, param, toQuery } from "@/lib/booking";
import { db } from "@/lib/store/db";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Confirmation · Booking",
  description: "Your Mistnleaf booking confirmation.",
};

type Props = PageProps<"/booking/confirmation">;

export default async function BookingConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const ref = param(params, "ref");
  const id = param(params, "id");
  const store = db();
  const booking =
    store.bookings.find((b) => b.id === id) ||
    store.bookings.find((b) => b.reference === ref);

  const guest = booking
    ? store.guests.find((g) => g.id === booking.guestId)
    : null;
  const roomType = booking
    ? store.roomTypes.find((t) => t.id === booking.roomTypeId)
    : null;
  const invoice = booking
    ? store.invoices.find((i) => i.bookingId === booking.id)
    : null;

  const name = guest?.fullName || param(params, "name");
  const email = guest?.email || param(params, "email");
  const room = roomType?.name || param(params, "room");
  const checkIn = booking?.checkIn || param(params, "checkIn");
  const checkOut = booking?.checkOut || param(params, "checkOut");
  const guests = booking
    ? String(booking.adults + booking.children)
    : param(params, "guests");
  const reference = booking?.reference || ref || "—";
  const addonNames =
    booking?.addonIds
      .map((id) => store.addons.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(", ") || "None";

  const q = toQuery({
    checkIn,
    checkOut,
    guests,
    room,
    name,
    email,
    ref: reference,
  });

  return (
    <>
      <BookingStepper current="confirmation" query={q} />
      <PageIntro
        eyebrow="Confirmed"
        title="Booking Confirmed"
        lead="Your reservation and payment are recorded. Room inventory is reserved, and your invoice is below."
      />
      <Section className="pt-0">
        <div className="mx-auto max-w-xl border border-line bg-fog/80 p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-lichen">
            Booking reference
          </p>
          <p className="mt-1 font-display text-3xl text-pine">{reference}</p>
          <dl className="mt-8 space-y-3 text-sm">
            {[
              ["Guest", name],
              ["Email", email],
              ["Room", room],
              ["Dates", formatStayRange(checkIn, checkOut)],
              ["Guests", guests],
              ["Add-ons", addonNames],
              ["Status", booking?.status.replace("_", " ") || "confirmed"],
              [
                "Payment",
                booking
                  ? `${booking.paymentStatus} · ${formatInr(booking.amountPaid)}`
                  : "paid",
              ],
              ["Invoice", invoice?.number || "Generated on payment"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-line py-2"
              >
                <dt className="text-muted">{label}</dt>
                <dd className="text-right capitalize text-pine">{value || "—"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-muted">
            Your guest profile is saved in the Mistnleaf guest database for
            future stays. Staff can manage this booking from the operations
            console.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex bg-pine px-5 py-3 text-sm text-fog transition hover:bg-pine-soft"
            >
              Back to home
            </Link>
            <Link
              href="/staff/login"
              className="inline-flex text-sm text-pine underline-offset-4 hover:underline"
            >
              Staff console
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
