import type { Metadata } from "next";
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
  parseAddonIds,
  parseBookingQuery,
  requireRoom,
  toQuery,
} from "@/lib/booking";
import { db } from "@/lib/store/db";
import { goToGuest } from "../actions";

export const metadata: Metadata = {
  title: "Packages & Add-ons · Booking",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookingAddonsPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = parseBookingQuery(params);

  if (!requireRoom(query)) {
    redirect(`/booking/select?${toQuery(query)}`);
  }

  const catalog = db().addons.filter((a) => a.active);
  const selected = new Set(parseAddonIds(query.addons));
  const q = toQuery(query);

  return (
    <>
      <BookingStepper current="addons" query={q} />
      <PageIntro
        eyebrow="Step 4"
        title="Packages & Add-ons"
        lead="Optional extras for your stay. Continue without selecting any if you prefer."
      />
      <Section className="pt-0">
        <form
          action={goToGuest}
          className="grid gap-8 lg:grid-cols-[1fr_280px]"
        >
          <BookingHiddens query={{ ...query, addons: "" }} includeGuest />
          <input type="hidden" name="addonsStep" value="1" />

          <div className="space-y-4">
            {catalog.map((addon) => (
              <label
                key={addon.id}
                className="flex cursor-pointer items-start gap-4 border border-line bg-fog/70 p-5 has-[:checked]:border-pine"
              >
                <input
                  type="checkbox"
                  name="addonIds"
                  value={addon.id}
                  defaultChecked={selected.has(addon.id)}
                  className="mt-1"
                />
                <span className="flex-1">
                  <span className="block font-display text-xl text-pine">
                    {addon.name}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    Optional package for your reservation.
                  </span>
                </span>
                <span className="text-sm text-pine">{formatInr(addon.price)}</span>
              </label>
            ))}

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className={primaryBtnClass}>
                Continue to guest details
              </button>
              <Link href={`/booking/select?${q}`} className={ghostBtnClass}>
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
