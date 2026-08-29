import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingStepper } from "@/components/booking/BookingStepper";
import {
  ghostBtnClass,
  primaryBtnClass,
  StaySummaryCard,
} from "@/components/booking/BookingUi";
import { PageIntro, Section } from "@/components/PageShell";
import {
  formatStayRange,
  getAvailability,
  parseBookingQuery,
  requireSearch,
  toQuery,
} from "@/lib/booking";
import { goToSelect } from "../actions";

export const metadata: Metadata = {
  title: "Availability · Booking",
};

type Props = PageProps<"/booking/availability">;

export default async function BookingAvailabilityPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = parseBookingQuery(params);

  if (!requireSearch(query)) {
    redirect("/booking/search");
  }

  const guests = Number(query.guests) || 1;
  const availability = getAvailability(query.checkIn, query.checkOut, guests);
  const openCount = availability.filter((item) => item.available).length;
  const q = toQuery(query);
  const unavailable = params.error === "unavailable";

  return (
    <>
      <BookingStepper current="availability" query={q} />
      <PageIntro
        eyebrow="Step 2"
        title="Availability"
        lead={`${openCount} room type${openCount === 1 ? "" : "s"} open for ${formatStayRange(query.checkIn, query.checkOut)}.`}
      />
      <Section className="pt-0">
        {unavailable ? (
          <p className="mb-6 border border-line bg-mist px-4 py-3 text-sm text-pine">
            That room is no longer available for these dates (double-booking
            prevented). Please choose another room or dates.
          </p>
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {availability.map(({ room, available, status, estimate }) => (
              <article
                key={room.slug}
                className="flex flex-col justify-between gap-3 border border-line bg-fog/70 p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <h2 className="font-display text-2xl text-pine">{room.name}</h2>
                  <p className="mt-1 text-sm text-muted">{room.short}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-lichen">
                    {status === "available" && "Available"}
                    {status === "limited" && "Limited availability"}
                    {status === "sold-out" && "Sold out for these dates"}
                    {status === "too-small" && "Exceeds guest capacity"}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  {estimate ? (
                    <p className="text-sm text-pine">From {estimate}</p>
                  ) : (
                    <p className="text-sm text-muted">—</p>
                  )}
                  <p
                    className={`mt-1 text-xs ${
                      available ? "text-leaf" : "text-muted"
                    }`}
                  >
                    {available ? "Ready to select" : "Not selectable"}
                  </p>
                </div>
              </article>
            ))}

            <form action={goToSelect} className="flex flex-wrap gap-3 pt-4">
              <input type="hidden" name="checkIn" value={query.checkIn} />
              <input type="hidden" name="checkOut" value={query.checkOut} />
              <input type="hidden" name="guests" value={query.guests} />
              {query.room ? (
                <input type="hidden" name="room" value={query.room} />
              ) : null}
              <button
                type="submit"
                className={primaryBtnClass}
                disabled={openCount === 0}
              >
                Continue to room selection
              </button>
              <Link href={`/booking/search?${q}`} className={ghostBtnClass}>
                Edit search
              </Link>
            </form>
          </div>
          <StaySummaryCard query={query} />
        </div>
      </Section>
    </>
  );
}
