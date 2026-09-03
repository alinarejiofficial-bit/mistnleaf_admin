"use client";

import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatINR, type Payment } from "@/lib/ops-data";
import { useOps } from "@/components/ops/OpsProvider";
import { formatDisplayDate } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { useFloatingToast } from "@/components/ui/useFloatingToast";
import { Badge, EmptyRow, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

const statusStyles = {
  Success: "bg-[#e8f3ec] text-success",
  Pending: "bg-accent-soft text-[#8a6a2f]",
  Failed: "bg-[#f8e9e6] text-danger",
  Refunded: "bg-surface-muted text-muted",
};

export function PaymentsManager() {
  const { payments, recordPayment, bookings } = useOps();
  const items = payments;
  const [filter, setFilter] = useState<"All" | "Online" | "Offline" | "Pending">("All");
  const [recordOpen, setRecordOpen] = useState(false);
  const [form, setForm] = useState({ guest: "", amount: "", method: "UPI" as Payment["method"] });
  const { showToast, toast } = useFloatingToast();

  const filtered = useMemo(() => {
    if (filter === "Pending") {
      return items.filter((p) => p.status === "Pending");
    }
    if (filter === "All") return items;
    return items.filter((p) => p.channel === filter);
  }, [filter, items]);

  const collected = items
    .filter((p) => p.status === "Success")
    .reduce((s, p) => s + p.amount, 0);

  const pendingPayments = items.filter((p) => p.status === "Pending");
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatPill label="Transactions" value={items.length} />
        <StatPill label="Collected" value={formatINR(collected)} tone="success" />
        <StatPill
          label="Online"
          value={items.filter((p) => p.channel === "Online").length}
          tone="info"
        />
        <StatPill
          label="Offline"
          value={items.filter((p) => p.channel === "Offline").length}
          tone="warning"
        />
        <StatPill
          label="Pending"
          value={pendingPayments.length}
          tone="danger"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["All", "Online", "Offline", "Pending"] as const).map((item) => (
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
                    <div className="text-xs text-muted">{payment.channel}</div>
                  </td>
                  <td className="px-5 py-3.5 font-medium">
                    {formatINR(payment.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    {formatDisplayDate(payment.date)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={statusStyles[payment.status]}>
                      {payment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <EmptyRow colSpan={6} label="No payments found." />
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

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
