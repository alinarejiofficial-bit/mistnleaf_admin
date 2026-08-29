import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  completeCheckoutAction,
  staffRecordPaymentAction,
} from "@/app/staff/actions";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { bookingBalance, db } from "@/lib/store/db";
import { formatInr } from "@/lib/utils";

type Props = PageProps<"/staff/bookings/[id]/checkout">;

export default async function StaffCheckoutPage({
  params,
  searchParams,
}: Props) {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, "bookings")) redirect("/staff?denied=1");

  const { id } = await params;
  const query = await searchParams;
  const store = db();
  const booking = store.bookings.find((b) => b.id === id);
  if (!booking) notFound();

  const guest = store.guests.find((g) => g.id === booking.guestId);
  const type = store.roomTypes.find((t) => t.id === booking.roomTypeId);
  const unit = store.roomUnits.find((u) => u.id === booking.roomUnitId);
  const invoice = store.invoices.find((i) => i.bookingId === booking.id);
  const balance = bookingBalance(booking.id);
  const done = query.done === "1";
  const error = typeof query.error === "string" ? query.error : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#667069]">
            Guest checkout
          </p>
          <h1 className="mt-1 font-display text-3xl text-[#1f332b]">
            Final bill · {booking.reference}
          </h1>
          <p className="mt-2 text-sm text-[#667069]">
            Final bill → payment → invoice → booking completed → room cleaning →
            available
          </p>
        </div>
        <Link
          href="/staff/bookings"
          className="text-sm text-[#1f332b] underline-offset-4 hover:underline"
        >
          ← Bookings
        </Link>
      </div>

      {done ? (
        <div className="mt-8 border border-[#cfe0d6] bg-[#f4faf6] px-5 py-6">
          <p className="font-display text-2xl text-[#1f332b]">
            Checkout complete
          </p>
          <p className="mt-2 text-sm text-[#667069]">
            Invoice {typeof query.invoice === "string" ? query.invoice : ""}{" "}
            issued. Room {unit?.code} is marked dirty for housekeeping. After
            clean/inspect it returns to available inventory.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/staff/housekeeping"
              className="bg-[#1f332b] px-4 py-2 text-xs uppercase tracking-wide text-white"
            >
              Open housekeeping
            </Link>
            <Link
              href="/staff/bookings"
              className="border border-[#d7dbd6] px-4 py-2 text-xs uppercase tracking-wide"
            >
              Back to bookings
            </Link>
          </div>
        </div>
      ) : null}

      {!done ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border border-[#d7dbd6] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#667069]">
              Stay summary
            </p>
            <p className="mt-2 font-display text-2xl text-[#1f332b]">
              {guest?.fullName} · {type?.name}
            </p>
            <p className="mt-2 text-sm text-[#667069]">
              {booking.checkIn} → {booking.checkOut} · Unit {unit?.code} · Status{" "}
              {booking.status.replace("_", " ")}
            </p>

            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between border-b border-[#ecefeb] py-2">
                <dt className="text-[#667069]">Subtotal</dt>
                <dd>{formatInr(booking.subtotal)}</dd>
              </div>
              <div className="flex justify-between border-b border-[#ecefeb] py-2">
                <dt className="text-[#667069]">Discount</dt>
                <dd>-{formatInr(booking.discount)}</dd>
              </div>
              <div className="flex justify-between border-b border-[#ecefeb] py-2">
                <dt className="text-[#667069]">Taxes</dt>
                <dd>{formatInr(booking.taxes)}</dd>
              </div>
              <div className="flex justify-between border-b border-[#ecefeb] py-2">
                <dt className="text-[#667069]">Amount paid</dt>
                <dd>{formatInr(booking.amountPaid)}</dd>
              </div>
              <div className="flex justify-between pt-2">
                <dt className="font-display text-xl text-[#1f332b]">Balance</dt>
                <dd className="font-display text-2xl text-[#1f332b]">
                  {formatInr(balance)}
                </dd>
              </div>
            </dl>

            {invoice ? (
              <p className="mt-4 text-sm text-[#667069]">
                Invoice on file: {invoice.number}
              </p>
            ) : (
              <p className="mt-4 text-sm text-[#667069]">
                Invoice will be generated on final payment / checkout.
              </p>
            )}
          </div>

          <div className="space-y-4">
            {error ? (
              <p className="border border-[#e2d5d0] bg-[#fff8f5] px-4 py-3 text-sm">
                Could not complete checkout. Settle any balance and ensure the
                guest is checked in.
              </p>
            ) : null}

            {balance > 0 ? (
              <form
                action={staffRecordPaymentAction}
                className="border border-[#d7dbd6] bg-white p-5"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-[#667069]">
                  Collect balance
                </p>
                <input type="hidden" name="bookingId" value={booking.id} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/staff/bookings/${booking.id}/checkout`}
                />
                <label className="mt-3 block text-sm text-[#667069]">
                  Amount
                  <input
                    name="amount"
                    type="number"
                    min={balance}
                    defaultValue={balance}
                    className="mt-1 w-full border border-[#d7dbd6] px-3 py-2"
                  />
                </label>
                <label className="mt-3 block text-sm text-[#667069]">
                  Method
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
                <button
                  type="submit"
                  className="mt-4 w-full bg-[#1f332b] px-4 py-2.5 text-xs uppercase tracking-wide text-white"
                >
                  Record payment
                </button>
              </form>
            ) : null}

            <form
              action={completeCheckoutAction}
              className="border border-[#d7dbd6] bg-white p-5"
            >
              <input type="hidden" name="bookingId" value={booking.id} />
              <input type="hidden" name="method" value="cash" />
              <p className="text-sm text-[#667069]">
                {booking.status === "checked_in"
                  ? balance > 0
                    ? "Settle the balance above, then complete checkout."
                    : "Balance clear. Complete checkout to issue invoice and send the room to housekeeping."
                  : `Guest must be checked in first (current: ${booking.status.replace("_", " ")}).`}
              </p>
              <button
                type="submit"
                disabled={booking.status !== "checked_in" || balance > 0}
                className="mt-4 w-full bg-[#1f332b] px-4 py-2.5 text-xs uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Complete checkout
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
