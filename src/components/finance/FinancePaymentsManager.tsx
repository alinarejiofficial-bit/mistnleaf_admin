"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { FinanceGreeting } from "@/components/finance/FinanceGreeting";
import {
  financePaymentMethods,
  financePayments,
  financePaymentStatuses,
  financeStatusStyles,
  formatINR,
  type FinancePaymentMethod,
  type FinancePaymentStatus,
} from "@/lib/finance-data";
import { formatDisplayDate } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyRow, SectionCard } from "@/components/ui/ModulePrimitives";

export function FinancePaymentsManager() {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<"All" | FinancePaymentMethod>("All");
  const [status, setStatus] = useState<"All" | FinancePaymentStatus>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return financePayments.filter((payment) => {
      if (method !== "All" && payment.method !== method) return false;
      if (status !== "All" && payment.status !== status) return false;
      if (dateFrom && payment.date < dateFrom) return false;
      if (dateTo && payment.date > dateTo) return false;
      if (!q) return true;
      return (
        payment.bookingId.toLowerCase().includes(q) ||
        payment.reference.toLowerCase().includes(q) ||
        payment.guest.toLowerCase().includes(q) ||
        payment.id.toLowerCase().includes(q)
      );
    });
  }, [query, method, status, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <FinanceGreeting />
      <PageHeader
        title="Payments"
        description="Search, filter, and reconcile guest payment transactions."
        action={
          <div className="flex flex-wrap gap-2">
            <PermissionGate action="payments.export">
              <button
                type="button"
                onClick={() => window.alert("Payment export prepared (demo CSV).")}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </PermissionGate>
            <PermissionGate action="payments.record">
              <button
                type="button"
                onClick={() => window.alert("Record payment form (demo).")}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
              >
                <Plus className="h-4 w-4" />
                Record payment
              </button>
            </PermissionGate>
          </div>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative block w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by booking ID, reference, guest…"
            className="h-11 w-full rounded-xl border border-border bg-surface pr-3 pl-10 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="From date"
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="To date"
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as "All" | FinancePaymentMethod)}
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid"
        >
          <option value="All">All methods</option>
          {financePaymentMethods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {(["All", ...financePaymentStatuses] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              status === item
                ? "bg-brand text-white"
                : "border border-border bg-surface hover:bg-surface-muted"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <SectionCard title="Payment ledger" description={`${filtered.length} transactions`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Booking</th>
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
                    <div className="font-medium">{payment.reference}</div>
                    <div className="text-xs text-muted">{payment.id}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{payment.bookingId}</div>
                    <div className="text-xs text-muted">{payment.room}</div>
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
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${financeStatusStyles[payment.status]}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <EmptyRow colSpan={7} label="No payments match your filters." />
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
