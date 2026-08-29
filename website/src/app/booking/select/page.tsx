import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingStepper } from "@/components/booking/BookingStepper";
import {
  BookingHiddens,
  ghostBtnClass,
  primaryBtnClass,
  StaySummaryCard,
} from "@/components/booking/BookingUi";
import { PageIntro, Section } from "@/components/PageShell";
import {
  formatInr,
  getAvailability,
  parseBookingQuery,
  requireSearch,
  toQuery,
} from "@/lib/booking";
import { goToAddons } from "../actions";

export const metadata: Metadata = {
  title: "Room Selection · Booking",
};

type Props = PageProps<"/booking/select">;

export default async function BookingSelectPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = parseBookingQuery(params);

  if (!requireSearch(query)) {
    redirect("/booking/search");
  }

  const guests = Number(query.guests) || 1;
  const options = getAvailability(query.checkIn, query.checkOut, guests).filter(
    (item) => item.available,
  );
  const q = toQuery(query);

  if (options.length === 0) {
    redirect(`/booking/availability?${q}`);
  }

  return (
    <>
      <BookingStepper current="select" query={q} />
      <PageIntro
        eyebrow="Step 3"
        title="Select Room Type"
        lead="Choose the room that fits your stay. Pricing is shown for your selected nights."
      />
      <Section className="pt-0">
        <form action={goToAddons} className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <BookingHiddens query={{ ...query, room: "" }} includeGuest />

          <div className="space-y-5">
            {options.map(({ room, estimate, nights }) => (
              <label
                key={room.slug}
                className="flex cursor-pointer flex-col gap-4 border border-line bg-fog/70 p-4 has-[:checked]:border-pine sm:flex-row"
              >
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden sm:w-44">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover"
                    sizes="176px"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="room"
                        value={room.slug}
                        required
                        defaultChecked={
                          query.room === room.slug ||
                          (!query.room && room.slug === options[0]?.room.slug)
                        }
                        className="mt-1"
                      />
                      <div>
                        <h2 className="font-display text-2xl text-pine">
                          {room.name}
                        </h2>
                        <p className="mt-1 text-sm text-muted">{room.short}</p>
                        <p className="mt-2 text-sm text-pine">
                          {formatInr(room.price)} / night · {room.beds} · up to{" "}
                          {room.guests} guests
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted sm:text-right">
                    {nights} night{nights === 1 ? "" : "s"} · {estimate}
                  </p>
                </div>
              </label>
            ))}

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className={primaryBtnClass}>
                Continue to packages & add-ons
              </button>
              <Link
                href={`/booking/availability?${q}`}
                className={ghostBtnClass}
              >
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
