import Link from "next/link";
import {
  calcStayTotal,
  formatInr,
  formatStayRange,
  getRoom,
  nightsBetween,
  type BookingQuery,
} from "@/lib/booking";

export function StaySummaryCard({ query }: { query: BookingQuery }) {
  const room = getRoom(query.room);
  const nights = nightsBetween(query.checkIn, query.checkOut);
  const totals =
    room && nights > 0 ? calcStayTotal(room, nights, query.addons) : null;

  return (
    <aside className="border border-line bg-fog/90 p-6 text-sm shadow-[0_20px_50px_-36px_rgba(18,32,24,0.35)]">
      <p className="text-[0.68rem] uppercase tracking-[0.18em] text-lichen">
        Your stay
      </p>
      <dl className="mt-5 space-y-3 text-muted">
        <div className="flex justify-between gap-3">
          <dt>Dates</dt>
          <dd className="text-right text-pine">
            {formatStayRange(query.checkIn, query.checkOut)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Nights</dt>
          <dd className="text-pine">{nights || "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Guests</dt>
          <dd className="text-pine">{query.guests || "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Room</dt>
          <dd className="text-right text-pine">{room?.name || "Not selected"}</dd>
        </div>
        {totals && totals.addons.length > 0 ? (
          <div className="border-t border-line pt-3">
            <dt className="mb-2 text-muted">Add-ons</dt>
            <dd className="space-y-1">
              {totals.addons.map((addon) => (
                <div
                  key={addon.id}
                  className="flex justify-between gap-3 text-pine"
                >
                  <span>{addon.name}</span>
                  <span>{formatInr(addon.price)}</span>
                </div>
              ))}
            </dd>
          </div>
        ) : null}
        {totals ? (
          <div className="flex justify-between gap-3 border-t border-line pt-4">
            <dt>Est. total</dt>
            <dd className="font-display text-xl text-pine">
              {formatInr(totals.total)}
            </dd>
          </div>
        ) : null}
      </dl>
      {!room ? (
        <Link
          href={`/booking/select?${new URLSearchParams({
            checkIn: query.checkIn,
            checkOut: query.checkOut,
            guests: query.guests,
          }).toString()}`}
          className="link-arrow mt-5"
        >
          Choose a room
        </Link>
      ) : null}
    </aside>
  );
}

/** Hidden fields that carry booking state between steps. */
export function BookingHiddens({
  query,
  includeGuest = false,
}: {
  query: BookingQuery;
  includeGuest?: boolean;
}) {
  return (
    <>
      <input type="hidden" name="checkIn" value={query.checkIn} />
      <input type="hidden" name="checkOut" value={query.checkOut} />
      <input type="hidden" name="guests" value={query.guests} />
      {query.room ? <input type="hidden" name="room" value={query.room} /> : null}
      {query.addons ? (
        <input type="hidden" name="addons" value={query.addons} />
      ) : null}
      {includeGuest ? (
        <>
          {query.name ? (
            <input type="hidden" name="name" value={query.name} />
          ) : null}
          {query.email ? (
            <input type="hidden" name="email" value={query.email} />
          ) : null}
          {query.phone ? (
            <input type="hidden" name="phone" value={query.phone} />
          ) : null}
          {query.notes ? (
            <input type="hidden" name="notes" value={query.notes} />
          ) : null}
        </>
      ) : null}
    </>
  );
}

export const fieldClass = "input-field";

export const primaryBtnClass =
  "inline-flex min-h-11 items-center justify-center bg-pine px-7 py-3 text-[0.8rem] font-medium uppercase tracking-[0.08em] text-fog transition hover:bg-pine-soft disabled:opacity-50";

export const ghostBtnClass =
  "inline-flex min-h-11 items-center justify-center border border-line px-7 py-3 text-[0.8rem] font-medium uppercase tracking-[0.08em] text-pine transition hover:bg-sand-cool/60";
