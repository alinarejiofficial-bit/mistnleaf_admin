import Link from "next/link";
import {
  formatDisplayDate,
  formatINR,
  upcomingReservations,
  type ReservationStatus,
} from "@/lib/data";

const statusStyles: Record<ReservationStatus, string> = {
  Confirmed: "bg-brand-soft text-brand",
  "Checked-in": "bg-[#e7f0f5] text-info",
  Pending: "bg-accent-soft text-[#8a6a2f]",
  Cancelled: "bg-[#f8e9e6] text-danger",
  "Checked-out": "bg-surface-muted text-muted",
};

export function UpcomingReservations() {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-xl text-foreground">Upcoming Reservations</h2>
          <p className="mt-1 text-sm text-muted">Next stays across the property</p>
        </div>
        <Link
          href="/reservations"
          className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
        >
          View all
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-5 py-3 font-medium sm:px-6">Guest</th>
              <th className="px-5 py-3 font-medium sm:px-6">Room</th>
              <th className="px-5 py-3 font-medium sm:px-6">Dates</th>
              <th className="px-5 py-3 font-medium sm:px-6">Status</th>
              <th className="px-5 py-3 font-medium sm:px-6">Amount</th>
              <th className="px-5 py-3 font-medium sm:px-6"> </th>
            </tr>
          </thead>
          <tbody>
            {upcomingReservations.map((reservation) => (
              <tr
                key={reservation.id}
                className="border-t border-border-subtle transition hover:bg-surface-muted/40"
              >
                <td className="px-5 py-4 sm:px-6">
                  <div className="font-medium text-foreground">{reservation.guest}</div>
                  <div className="text-xs text-muted">{reservation.id}</div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-foreground sm:px-6">
                  {reservation.room}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-muted sm:px-6">
                  {formatDisplayDate(reservation.checkIn)} →{" "}
                  {formatDisplayDate(reservation.checkOut)}
                </td>
                <td className="px-5 py-4 sm:px-6">
                  <span
                    className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${statusStyles[reservation.status]}`}
                  >
                    {reservation.status}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap font-medium text-foreground sm:px-6">
                  {formatINR(reservation.amount)}
                </td>
                <td className="px-5 py-4 sm:px-6">
                  <Link
                    href={`/reservations?id=${reservation.id}`}
                    className="text-sm font-medium text-brand-mid hover:text-brand"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
