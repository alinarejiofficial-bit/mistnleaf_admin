import Link from "next/link";
import { redirect } from "next/navigation";
import { staffCreateBookingAction } from "@/app/staff/actions";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { availableUnitsForType, db, quoteStay } from "@/lib/store/db";
import { formatInr } from "@/lib/utils";

type Props = PageProps<"/staff/bookings/new">;

export default async function StaffNewBookingPage({ searchParams }: Props) {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, "bookings")) redirect("/staff?denied=1");

  const params = await searchParams;
  const store = db();
  const checkIn = typeof params.checkIn === "string" ? params.checkIn : "";
  const checkOut = typeof params.checkOut === "string" ? params.checkOut : "";
  const roomTypeId =
    typeof params.roomTypeId === "string" ? params.roomTypeId : store.roomTypes[0]?.id ?? "";
  const done = params.done === "1";
  const error = typeof params.error === "string" ? params.error : null;
  const ref = typeof params.ref === "string" ? params.ref : "";

  const units =
    checkIn && checkOut && roomTypeId
      ? availableUnitsForType(roomTypeId, checkIn, checkOut)
      : [];
  const quote =
    checkIn && checkOut && roomTypeId
      ? quoteStay({ roomTypeId, checkIn, checkOut })
      : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#667069]">
            Internal booking
          </p>
          <h1 className="mt-1 font-display text-3xl text-[#1f332b]">
            Staff walk-in booking
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#667069]">
            Availability check → guest registration → room assignment → payment →
            confirmation. Inventory updates when the booking is created.
          </p>
        </div>
        <Link
          href="/staff/bookings"
          className="text-sm text-[#1f332b] underline-offset-4 hover:underline"
        >
          ← All bookings
        </Link>
      </div>

      {done ? (
        <div className="mt-8 border border-[#cfe0d6] bg-[#f4faf6] px-5 py-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[#5a7a68]">
            Confirmation
          </p>
          <p className="mt-2 font-display text-2xl text-[#1f332b]">
            Booking {ref} created
          </p>
          <p className="mt-2 text-sm text-[#667069]">
            Guest registered, room assigned, and inventory reserved
            {params.id ? " (paid if selected)." : "."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/staff/bookings"
              className="bg-[#1f332b] px-4 py-2 text-xs uppercase tracking-wide text-white"
            >
              View bookings
            </Link>
            <Link
              href="/staff/bookings/new"
              className="border border-[#d7dbd6] px-4 py-2 text-xs uppercase tracking-wide"
            >
              New booking
            </Link>
          </div>
        </div>
      ) : null}

      {!done ? (
        <>
          {error ? (
            <p className="mt-6 border border-[#e2d5d0] bg-[#fff8f5] px-4 py-3 text-sm text-[#5c4036]">
              {error === "missing"
                ? "Fill guest details, dates, room type, and assign a unit."
                : "Selected room is unavailable for those dates."}
            </p>
          ) : null}

          <form
            method="get"
            className="mt-8 grid gap-4 border border-[#d7dbd6] bg-white p-5 md:grid-cols-4"
          >
            <label className="block text-xs uppercase tracking-[0.12em] text-[#667069]">
              Check-in
              <input
                type="date"
                name="checkIn"
                required
                defaultValue={checkIn}
                className="mt-1 w-full border border-[#d7dbd6] px-3 py-2 text-sm normal-case tracking-normal"
              />
            </label>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#667069]">
              Check-out
              <input
                type="date"
                name="checkOut"
                required
                defaultValue={checkOut}
                className="mt-1 w-full border border-[#d7dbd6] px-3 py-2 text-sm normal-case tracking-normal"
              />
            </label>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#667069]">
              Room type
              <select
                name="roomTypeId"
                defaultValue={roomTypeId}
                className="mt-1 w-full border border-[#d7dbd6] px-3 py-2 text-sm normal-case tracking-normal"
              >
                {store.roomTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-[#1f332b] px-4 py-2.5 text-xs uppercase tracking-wide text-white"
              >
                Check availability
              </button>
            </div>
          </form>

          {checkIn && checkOut && roomTypeId ? (
            <div className="mt-6 border border-[#d7dbd6] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-[#667069]">
                Availability
              </p>
              <p className="mt-2 text-sm text-[#1f332b]">
                {units.length} unit{units.length === 1 ? "" : "s"} open · quote{" "}
                {quote ? formatInr(quote.total) : "—"} (incl. tax)
              </p>
              {units.length === 0 ? (
                <p className="mt-3 text-sm text-[#8a5a4a]">
                  No inventory for these dates. Try another type or range.
                </p>
              ) : null}
            </div>
          ) : null}

          {units.length > 0 ? (
            <form
              action={staffCreateBookingAction}
              className="mt-6 space-y-6 border border-[#d7dbd6] bg-white p-5"
            >
              <input type="hidden" name="checkIn" value={checkIn} />
              <input type="hidden" name="checkOut" value={checkOut} />
              <input type="hidden" name="roomTypeId" value={roomTypeId} />

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#667069]">
                  Guest registration
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="block text-sm text-[#667069]">
                    Full name *
                    <input
                      name="fullName"
                      required
                      className="mt-1 w-full border border-[#d7dbd6] px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm text-[#667069]">
                    Email *
                    <input
                      name="email"
                      type="email"
                      required
                      className="mt-1 w-full border border-[#d7dbd6] px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm text-[#667069]">
                    Phone
                    <input
                      name="phone"
                      className="mt-1 w-full border border-[#d7dbd6] px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm text-[#667069]">
                    Adults
                    <input
                      name="adults"
                      type="number"
                      min={1}
                      defaultValue={2}
                      className="mt-1 w-full border border-[#d7dbd6] px-3 py-2"
                    />
                  </label>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#667069]">
                  Room assignment
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {units.map((unit) => (
                    <label
                      key={unit.id}
                      className="flex cursor-pointer items-center gap-3 border border-[#d7dbd6] px-3 py-3 text-sm"
                    >
                      <input
                        type="radio"
                        name="roomUnitId"
                        value={unit.id}
                        required
                        defaultChecked={unit.id === units[0]?.id}
                      />
                      <span>
                        <span className="font-medium text-[#1f332b]">
                          {unit.code}
                        </span>
                        <span className="ml-2 text-[#667069]">
                          Floor {unit.floor} · {unit.status}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm text-[#667069]">
                  Payment method
                  <select
                    name="method"
                    className="mt-1 w-full border border-[#d7dbd6] px-3 py-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank</option>
                  </select>
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm text-[#1f332b]">
                  <input type="checkbox" name="payNow" value="1" defaultChecked />
                  Collect payment now (confirm booking)
                </label>
              </div>

              <button
                type="submit"
                className="bg-[#1f332b] px-5 py-3 text-xs uppercase tracking-wide text-white"
              >
                Create booking & confirm
              </button>
            </form>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
