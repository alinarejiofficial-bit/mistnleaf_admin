import { redirect } from "next/navigation";
import { staffRecordPaymentAction } from "@/app/staff/actions";
import { getCurrentStaff, canAccess } from "@/lib/auth/staff";
import { db } from "@/lib/store/db";
import { formatInr } from "@/lib/utils";

export default async function StaffPaymentsPage() {
  const user = await getCurrentStaff();
  if (!user) redirect("/staff/login");
  if (!canAccess(user.role, "payments")) redirect("/staff?denied=1");
  const store = db();

  return (
    <div>
      <h1 className="font-display text-3xl text-[#1f332b]">Payments & invoices</h1>
      <p className="mt-2 text-sm text-[#667069]">
        Track payments, outstanding balances, invoices and receipts.
      </p>

      <h2 className="mt-8 text-sm uppercase tracking-[0.14em] text-[#667069]">
        Outstanding balances
      </h2>
      <div className="mt-3 space-y-3">
        {store.bookings
          .filter((b) => b.amountPaid < b.total && b.status !== "cancelled")
          .map((b) => {
            const guest = store.guests.find((g) => g.id === b.guestId);
            const due = b.total - b.amountPaid;
            return (
              <div key={b.id} className="flex flex-wrap items-end justify-between gap-3 border border-[#d7dbd6] bg-white p-4">
                <div>
                  <p className="font-medium">{b.reference} · {guest?.fullName}</p>
                  <p className="text-sm text-[#667069]">
                    Due {formatInr(due)} of {formatInr(b.total)}
                  </p>
                </div>
                <form action={staffRecordPaymentAction} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="bookingId" value={b.id} />
                  <input type="hidden" name="amount" value={due} />
                  <select name="method" className="border border-[#d7dbd6] px-2 py-1.5 text-sm">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank</option>
                  </select>
                  <button type="submit" className="bg-[#1f332b] px-3 py-2 text-xs uppercase tracking-wide text-white">
                    Record payment
                  </button>
                </form>
              </div>
            );
          })}
        {store.bookings.every((b) => b.amountPaid >= b.total || b.status === "cancelled") ? (
          <p className="text-sm text-[#667069]">No outstanding balances.</p>
        ) : null}
      </div>

      <h2 className="mt-10 text-sm uppercase tracking-[0.14em] text-[#667069]">
        Invoices / receipts
      </h2>
      <div className="mt-3 overflow-x-auto border border-[#d7dbd6] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#d7dbd6] bg-[#f3f4f2] text-xs uppercase tracking-[0.12em] text-[#667069]">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {store.invoices.map((inv) => {
              const booking = store.bookings.find((b) => b.id === inv.bookingId);
              return (
                <tr key={inv.id} className="border-b border-[#d7dbd6]/70">
                  <td className="px-4 py-3">{inv.number}</td>
                  <td className="px-4 py-3">{booking?.reference}</td>
                  <td className="px-4 py-3">{formatInr(inv.total)}</td>
                  <td className="px-4 py-3">{formatInr(inv.amountPaid)}</td>
                  <td className="px-4 py-3">{formatInr(inv.balance)}</td>
                </tr>
              );
            })}
            {store.invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#667069]">
                  Invoices appear after successful payments.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-sm uppercase tracking-[0.14em] text-[#667069]">
        Payment ledger
      </h2>
      <ul className="mt-3 space-y-2">
        {store.payments.map((p) => (
          <li key={p.id} className="border border-[#d7dbd6] bg-white px-4 py-3 text-sm">
            {new Date(p.createdAt).toLocaleString()} · {formatInr(p.amount)} · {p.method} ·{" "}
            {p.status}
          </li>
        ))}
        {store.payments.length === 0 ? (
          <li className="text-sm text-[#667069]">No payments recorded yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
