"use client";

import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatINR, type Payment } from "@/lib/ops-data";
import { useOps } from "@/components/ops/OpsProvider";
import { formatDisplayDate } from "@/lib/data";
import type { PaymentStatus } from "@/lib/reservations";
import { PageHeader } from "@/components/ui/PageHeader";
import { useFloatingToast } from "@/components/ui/useFloatingToast";
import { Badge, EmptyRow, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

const statusStyles = {
  Success: "bg-[#e8f3ec] text-success",
  Pending: "bg-accent-soft text-[#8a6a2f]",
  Failed: "bg-[#f8e9e6] text-danger",
  Refunded: "bg-surface-muted text-muted",
};

const paymentStatuses: Payment["status"][] = [
  "Success",
  "Pending",
  "Failed",
  "Refunded",
];

function bookingPaymentStatus(
  status: Payment["status"],
  paid: number,
  total: number,
): PaymentStatus {
  if (status === "Refunded") return "Refunded";
  if (status === "Pending" || status === "Failed") return "Pending";
  return paid >= total ? "Paid" : "Partial";
}

export function PaymentsManager() {
  const { payments, recordPayment, bookings, saveBooking } = useOps();
  const items = payments;
  const [filter, setFilter] = useState<"All" | "Paid" | "Pending">("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [recordOpen, setRecordOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    status: "Pending" as Payment["status"],
  });
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");
  const [form, setForm] = useState({ guest: "", amount: "", method: "UPI" as Payment["method"] });
  const { showToast, toast } = useFloatingToast();

  const filtered = useMemo(() => {
    return items.filter((payment) => {
      if (filter === "Paid" && payment.status !== "Success") return false;
      if (filter === "Pending" && payment.status !== "Pending") return false;
      if (dateFrom && payment.date < dateFrom) return false;
      if (dateTo && payment.date > dateTo) return false;
      return true;
    });
  }, [filter, dateFrom, dateTo, items]);

  const collected = items
    .filter((p) => p.status === "Success")
    .reduce((s, p) => s + p.amount, 0);

  const paidPayments = items.filter((p) => p.status === "Success");
  const pendingPayments = items.filter((p) => p.status === "Pending");
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  function openEdit(payment: Payment) {
    setEditing(payment);
    setEditForm({
      amount: String(payment.amount),
      status: payment.status,
    });
    setEditError("");
    setEditBusy(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Capture, refund, and reconcile guest payments."
        action={
          <div className="flex flex-wrap gap-2">
            <PermissionGate action="payments.export">
              <button
                type="button"
                onClick={() => showToast("Payment export prepared (CSV download).")}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </PermissionGate>
            <PermissionGate action="payments.record">
              <button
                type="button"
                onClick={() => setRecordOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
              >
                <Plus className="h-4 w-4" />
                Record payment
              </button>
            </PermissionGate>
          </div>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Transactions" value={items.length} />
        <StatPill label="Collected" value={formatINR(collected)} tone="success" />
        <StatPill label="Paid" value={paidPayments.length} tone="success" />
        <StatPill
          label="Pending"
          value={pendingPayments.length}
          tone="danger"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "Paid", "Pending"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-xl px-3 py-2 text-sm font-medium ${
                filter === item
                  ? "bg-brand text-white"
                  : "border border-border bg-surface hover:bg-surface-muted"
              }`}
            >
              {item}
            </button>
          ))}
          {filter === "Pending" ? (
            <span className="text-sm text-muted">
              {formatINR(pendingAmount)} awaiting collection
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="whitespace-nowrap">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                const value = event.target.value;
                setDateFrom(value);
                if (dateTo && value && value > dateTo) setDateTo(value);
              }}
              aria-label="From date"
              max={dateTo || undefined}
              className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="whitespace-nowrap">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                const value = event.target.value;
                if (dateFrom && value && value < dateFrom) {
                  setDateTo(dateFrom);
                  return;
                }
                setDateTo(value);
              }}
              aria-label="To date"
              min={dateFrom || undefined}
              className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
            />
          </label>
          {dateFrom || dateTo ? (
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="rounded-xl border border-border px-3 py-2 text-sm text-muted hover:bg-surface-muted"
            >
              Clear dates
            </button>
          ) : null}
        </div>
      </div>

      <SectionCard title="Payment ledger" description={`${filtered.length} records`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => (
                <tr key={payment.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{payment.id}</div>
                    <div className="text-xs text-muted">
                      Ref: {payment.id} · {payment.reservationId}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{payment.guest}</td>
                  <td className="px-5 py-3.5">
                    <div>{payment.method}</div>
                  </td>
                  <td className="px-5 py-3.5 font-medium">
                    {formatINR(payment.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    {formatDisplayDate(payment.date)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={statusStyles[payment.status]}>
                      {payment.status === "Success" ? "Paid" : payment.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <PermissionGate action="payments.record">
                      <button
                        type="button"
                        onClick={() => openEdit(payment)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
                      >
                        Edit
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <EmptyRow colSpan={7} label="No payments found." />
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {editing ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setEditing(null)}
            className="absolute inset-0 bg-foreground/40"
          />
          <form
            className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-xl"
            onSubmit={(event) => {
              event.preventDefault();
              const amount = Number(editForm.amount);
              if (!Number.isFinite(amount) || amount < 0) {
                setEditError("Enter a valid amount.");
                return;
              }
              const booking = bookings.find(
                (item) => item.id === editing.reservationId,
              );
              if (!booking) {
                setEditError("No booking found for this payment.");
                return;
              }
              setEditBusy(true);
              setEditError("");
              void saveBooking(booking.id, {
                paidAmount: amount,
                paymentStatus: bookingPaymentStatus(
                  editForm.status,
                  amount,
                  booking.amount,
                ),
              })
                .then(() => {
                  showToast("Payment updated.");
                  setEditing(null);
                })
                .catch((err: unknown) => {
                  setEditError(
                    err instanceof Error ? err.message : "Could not update payment.",
                  );
                })
                .finally(() => setEditBusy(false));
            }}
          >
            <h3 className="font-display text-xl text-foreground">Edit payment</h3>
            <p className="text-sm text-muted">
              {editing.id} · {editing.guest} · {editing.reservationId}
            </p>
            {editError ? (
              <p className="rounded-xl border border-danger/20 bg-[#f8e9e6] px-3 py-2 text-sm text-danger">
                {editError}
              </p>
            ) : null}
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Amount (₹)</span>
              <input
                type="number"
                min={0}
                step={100}
                value={editForm.amount}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                className="field-input h-11"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Status</span>
              <select
                value={editForm.status}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    status: event.target.value as Payment["status"],
                  }))
                }
                className="field-input h-11"
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "Success" ? "Paid" : status}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editBusy}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {editBusy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {recordOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" aria-label="Close" onClick={() => setRecordOpen(false)} className="absolute inset-0 bg-foreground/40" />
          <form
            className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-xl"
            onSubmit={(event) => {
              event.preventDefault();
              const amount = Number(form.amount);
              if (!form.guest.trim() || !amount) return;
              const match = bookings.find(
                (booking) => booking.guest.toLowerCase() === form.guest.trim().toLowerCase(),
              );
              if (match) {
                void recordPayment(match.id, match.paidAmount + amount);
              }
              setRecordOpen(false);
              setForm({ guest: "", amount: "", method: "UPI" });
              showToast(match ? "Payment recorded on the booking." : "No matching booking found for that guest.");
            }}
          >
            <h3 className="font-display text-xl text-foreground">Record payment</h3>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Guest name</span>
              <input value={form.guest} onChange={(e) => setForm({ ...form, guest: e.target.value })} className="field-input h-11" required />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Amount (₹)</span>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="field-input h-11" required />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Method</span>
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as Payment["method"] })} className="field-input h-11">
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank transfer">Bank transfer</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRecordOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium">Cancel</button>
              <button type="submit" className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white">Save payment</button>
            </div>
          </form>
        </div>
      ) : null}

      {toast}
    </div>
  );
}
