import { redirect } from "next/navigation";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { db } from "@/lib/store/db";
import { formatInr } from "@/lib/utils";

export default async function StaffReportsPage() {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, "reports")) redirect("/staff?denied=1");
  const store = db();

  const byStatus = store.bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const revenue = store.payments
    .filter((p) => p.status === "succeeded")
    .reduce((s, p) => s + p.amount, 0);
  const outstanding = store.bookings.reduce(
    (s, b) => s + Math.max(b.total - b.amountPaid, 0),
    0,
  );
  const occupancy =
    store.roomUnits.length === 0
      ? 0
      : Math.round(
          (store.roomUnits.filter((u) => u.status === "occupied" || u.status === "reserved")
            .length /
            store.roomUnits.length) *
            100,
        );

  return (
    <div>
      <h1 className="font-display text-3xl text-[#1f332b]">
        Operational & financial reports
      </h1>
      <p className="mt-2 text-sm text-[#667069]">
        Demo reporting surface — ready to connect to a warehouse or analytics API later.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Gross payments", value: formatInr(revenue) },
          { label: "Outstanding", value: formatInr(outstanding) },
          { label: "Unit occupancy signal", value: `${occupancy}%` },
          { label: "Total bookings", value: String(store.bookings.length) },
        ].map((card) => (
          <div key={card.label} className="border border-[#d7dbd6] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#667069]">
              {card.label}
            </p>
            <p className="mt-3 font-display text-3xl text-[#1f332b]">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-sm uppercase tracking-[0.14em] text-[#667069]">
        Bookings by status
      </h2>
      <ul className="mt-3 space-y-2">
        {Object.entries(byStatus).map(([status, count]) => (
          <li
            key={status}
            className="flex justify-between border border-[#d7dbd6] bg-white px-4 py-3 text-sm"
          >
            <span className="capitalize">{status.replace("_", " ")}</span>
            <span>{count}</span>
          </li>
        ))}
        {Object.keys(byStatus).length === 0 ? (
          <li className="text-sm text-[#667069]">No booking activity yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
