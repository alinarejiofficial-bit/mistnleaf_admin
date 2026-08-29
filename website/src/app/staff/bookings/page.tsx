import { redirect } from "next/navigation";
import Link from "next/link";
import {
  cancelBookingAction,
  checkInAction,
  checkOutAction,
  modifyDatesAction,
} from "@/app/staff/actions";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { db } from "@/lib/store/db";
import { formatInr } from "@/lib/utils";

type Props = PageProps<"/staff/bookings">;

export default async function StaffBookingsPage({ searchParams }: Props) {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, "bookings")) redirect("/staff?denied=1");
  const params = await searchParams;
  const store = db();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[#1f332b]">Bookings</h1>
          <p className="mt-2 text-sm text-[#667069]">
            Check-in / check-out, modifications, and cancellations. Conflicts are
            blocked by the availability engine.
          </p>
        </div>
        <Link
          href="/staff/bookings/new"
          className="bg-[#1f332b] px-4 py-2.5 text-xs uppercase tracking-wide text-white"
        >
          New staff booking
        </Link>
      </div>
      {params.error === "conflict" ? (
        <p className="mt-4 border border-[#d7dbd6] bg-white px-3 py-2 text-sm">
          Date change blocked — would cause a double booking.
        </p>
      ) : null}
      {params.error === "checkin" ? (
        <p className="mt-4 border border-[#d7dbd6] bg-white px-3 py-2 text-sm">
          Check-in requires a confirmed booking.
        </p>
      ) : null}

      <div className="mt-8 space-y-4">
        {store.bookings.length === 0 ? (
          <div className="border border-[#d7dbd6] bg-white px-5 py-10 text-center text-sm text-[#667069]">
            No bookings yet.{" "}
            <Link href="/staff/bookings/new" className="underline">
              Create a staff booking
            </Link>{" "}
            or complete a customer reservation.
          </div>
        ) : null}
        {store.bookings.map((b) => {
          const guest = store.guests.find((g) => g.id === b.guestId);
          const type = store.roomTypes.find((t) => t.id === b.roomTypeId);
          const unit = store.roomUnits.find((u) => u.id === b.roomUnitId);
          return (
            <article key={b.id} className="border border-[#d7dbd6] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#667069]">
                    {b.reference}
                  </p>
                  <p className="mt-1 font-display text-2xl text-[#1f332b]">
                    {guest?.fullName} · {type?.name}
                  </p>
                  <p className="mt-2 text-sm text-[#667069]">
                    {b.checkIn} → {b.checkOut} · {unit?.code || "Unassigned"} ·{" "}
                    {b.adults + b.children} guests
                  </p>
                  <p className="mt-1 text-sm">
                    Status: <span className="capitalize">{b.status.replace("_", " ")}</span> ·
                    Payment: {b.paymentStatus} · {formatInr(b.total)} (paid{" "}
                    {formatInr(b.amountPaid)})
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <form action={checkInAction}>
                  <input type="hidden" name="bookingId" value={b.id} />
                  <button type="submit" className="bg-[#1f332b] px-3 py-2 text-xs uppercase tracking-wide text-white">
                    Check in
                  </button>
                </form>
                <form action={checkOutAction}>
                  <input type="hidden" name="bookingId" value={b.id} />
                  <button type="submit" className="border border-[#d7dbd6] px-3 py-2 text-xs uppercase tracking-wide">
                    Check out
                  </button>
                </form>
                <form action={cancelBookingAction}>
                  <input type="hidden" name="bookingId" value={b.id} />
                  <button type="submit" className="border border-[#d7dbd6] px-3 py-2 text-xs uppercase tracking-wide">
                    Cancel
                  </button>
                </form>
              </div>

              <form action={modifyDatesAction} className="mt-4 flex flex-wrap items-end gap-2 border-t border-[#d7dbd6] pt-4">
                <input type="hidden" name="bookingId" value={b.id} />
                <label className="text-xs uppercase tracking-[0.12em] text-[#667069]">
                  New check-in
                  <input type="date" name="checkIn" required className="mt-1 block border border-[#d7dbd6] px-2 py-1.5" />
                </label>
                <label className="text-xs uppercase tracking-[0.12em] text-[#667069]">
                  New check-out
                  <input type="date" name="checkOut" required className="mt-1 block border border-[#d7dbd6] px-2 py-1.5" />
                </label>
                <button type="submit" className="bg-[#2d463b] px-3 py-2 text-xs uppercase tracking-wide text-white">
                  Modify dates
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
