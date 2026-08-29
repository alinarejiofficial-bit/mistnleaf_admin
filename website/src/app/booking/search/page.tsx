import type { Metadata } from "next";
import { BookingStepper } from "@/components/booking/BookingStepper";
import {
  fieldClass,
  primaryBtnClass,
} from "@/components/booking/BookingUi";
import { PageIntro, Section } from "@/components/PageShell";
import { param } from "@/lib/booking";
import { goToAvailability } from "../actions";

export const metadata: Metadata = {
  title: "Search · Booking",
  description: "Search available dates at Mistnleaf.",
};

type Props = PageProps<"/booking/search">;

export default async function BookingSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = param(params, "error");
  const room = param(params, "room");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <BookingStepper current="search" />
      <PageIntro
        eyebrow="Step 1"
        title="Search"
        lead="Choose check-in, check-out, and guests — then view rooms, add packages, see the price, enter details, and pay."
      />
      <Section className="pt-0">
        <form
          action={goToAvailability}
          className="mx-auto grid max-w-xl gap-4"
        >
          {room ? <input type="hidden" name="room" value={room} /> : null}
          {error === "dates" ? (
            <p className="border border-line bg-mist px-4 py-3 text-sm text-pine">
              Please select valid check-in and check-out dates.
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-muted">
              Check-in
              <input
                type="date"
                name="checkIn"
                required
                min={today}
                defaultValue={param(params, "checkIn")}
                className={fieldClass}
              />
            </label>
            <label className="block text-sm text-muted">
              Check-out
              <input
                type="date"
                name="checkOut"
                required
                min={today}
                defaultValue={param(params, "checkOut")}
                className={fieldClass}
              />
            </label>
          </div>
          <label className="block text-sm text-muted">
            Guests
            <input
              type="number"
              name="guests"
              min={1}
              max={6}
              required
              defaultValue={param(params, "guests", "2")}
              className={fieldClass}
            />
          </label>
          <button type="submit" className={primaryBtnClass}>
            Check availability
          </button>
        </form>
      </Section>
    </>
  );
}
