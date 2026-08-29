import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth/staff";
import { db } from "@/lib/store/db";
import { formatInr } from "@/lib/utils";

type Props = PageProps<"/staff">;

export default async function StaffDashboardPage({ searchParams }: Props) {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  const params = await searchParams;
  const store = db();

  const confirmed = store.bookings.filter((b) =>
    ["confirmed", "checked_in", "modified"].includes(b.status),
  ).length;
  const occupied = store.roomUnits.filter((u) => u.status === "occupied").length;
  const dirty = store.roomUnits.filter((u) => u.housekeeping === "dirty").length;
  const revenue = store.payments
    .filter((p) => p.status === "succeeded")
    .reduce((s, p) => s + p.amount, 0);
  const outstanding = store.bookings.reduce(
    (s, b) => s + Math.max(b.total - b.amountPaid, 0),
    0,
  );

  const cards = [
    { label: "Active bookings", value: String(confirmed) },
    { label: "Occupied units", value: String(occupied) },
    { label: "Dirty rooms", value: String(dirty) },
    { label: "Payments captured", value: formatInr(revenue) },
    { label: "Outstanding balance", value: formatInr(outstanding) },
    { label: "Guests in database", value: String(store.guests.length) },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-[#1f332b]">Dashboard</h1>
      <p className="mt-2 text-sm text-[#667069]">
        Welcome, {user.name}. Central operations overview for Mistnleaf.
      </p>
      {params.denied ? (
        <p className="mt-4 border border-[#d7dbd6] bg-white px-3 py-2 text-sm">
          Your role cannot access that area.
        </p>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="border border-[#d7dbd6] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#667069]">
              {card.label}
            </p>
            <p className="mt-3 font-display text-3xl text-[#1f332b]">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/staff/bookings" className="bg-[#1f332b] px-4 py-2 text-white">
          Manage bookings
        </Link>
        <Link href="/staff/housekeeping" className="border border-[#d7dbd6] bg-white px-4 py-2">
          Housekeeping board
        </Link>
        <Link href="/staff/reports" className="border border-[#d7dbd6] bg-white px-4 py-2">
          View reports
        </Link>
      </div>
    </div>
  );
}
