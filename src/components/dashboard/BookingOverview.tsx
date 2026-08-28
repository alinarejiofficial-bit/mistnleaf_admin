import { bookingOverview } from "@/lib/data";

const items = [
  {
    label: "Today's bookings",
    value: bookingOverview.todaysBookings,
    tone: "brand" as const,
  },
  {
    label: "Upcoming bookings",
    value: bookingOverview.upcomingBookings,
    tone: "info" as const,
  },
  {
    label: "Pending bookings",
    value: bookingOverview.pendingBookings,
    tone: "warning" as const,
  },
  {
    label: "Confirmed bookings",
    value: bookingOverview.confirmedBookings,
    tone: "success" as const,
  },
  {
    label: "Cancelled bookings",
    value: bookingOverview.cancelledBookings,
    tone: "danger" as const,
  },
  {
    label: "Completed stays",
    value: bookingOverview.completedStays,
    tone: "muted" as const,
  },
];

const toneStyles = {
  brand: "bg-brand-soft text-brand",
  info: "bg-[#e7f0f5] text-info",
  warning: "bg-accent-soft text-[#8a6a2f]",
  success: "bg-[#e8f3ec] text-success",
  danger: "bg-[#f8e9e6] text-danger",
  muted: "bg-surface-muted text-muted",
};

export function BookingOverview() {
  return (
    <section className="animate-fade-up-delay-2 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-xl text-foreground">Booking Overview</h2>
      <p className="mt-1 text-sm text-muted">Reservation pipeline and stay status</p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-muted/40 px-4 py-3"
          >
            <span className="text-sm text-foreground">{item.label}</span>
            <span
              className={`inline-flex min-w-9 items-center justify-center rounded-lg px-2.5 py-1 text-sm font-semibold ${toneStyles[item.tone]}`}
            >
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
