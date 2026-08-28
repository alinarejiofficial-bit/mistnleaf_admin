"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { FinanceGreeting } from "@/components/finance/FinanceGreeting";
import {
  financeReportKpis,
  formatINR,
  outstandingPaymentReport,
  paymentStatusReport,
  revenueByPaymentMethod,
  revenueOverview,
} from "@/lib/finance-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/ModulePrimitives";

type Period = "7d" | "30d" | "90d" | "custom";

export function FinancialReportsManager() {
  const [period, setPeriod] = useState<Period>("30d");
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState("2026-08-20");

  const periodLabel = useMemo(() => {
    if (period === "custom") return `${from} → ${to}`;
    if (period === "7d") return "Last 7 days";
    if (period === "90d") return "Last 90 days";
    return "Last 30 days";
  }, [from, period, to]);

  return (
    <div className="space-y-6">
      <FinanceGreeting />
      <PageHeader
        title="Financial Reports"
        description="Revenue, payment method breakdown, outstanding balances, and payment status."
        action={
          <PermissionGate action="reports.export">
            <button
              type="button"
              onClick={() =>
                window.alert(`Financial report export for ${periodLabel} (demo).`)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
            >
              <Download className="h-4 w-4" />
              Export report
            </button>
          </PermissionGate>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["7d", "7 days"],
              ["30d", "30 days"],
              ["90d", "90 days"],
              ["custom", "Custom"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={`rounded-xl px-3 py-2 text-sm font-medium ${
                period === value
                  ? "bg-brand text-white"
                  : "border border-border bg-surface hover:bg-surface-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {period === "custom" ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
            />
            <span className="text-sm text-muted">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
            />
          </div>
        ) : null}
      </div>

      <p className="text-sm text-muted">Showing data for {periodLabel}.</p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {financeReportKpis.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-1 font-display text-2xl text-foreground">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Revenue by payment method">
          <ul className="space-y-3 px-5 py-4">
            {revenueByPaymentMethod.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-xl bg-surface-muted/50 px-3 py-2.5 text-sm"
              >
                <span>{item.label}</span>
                <span className="font-medium">{formatINR(item.amount)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Revenue by room type">
          <ul className="space-y-3 px-5 py-4">
            {revenueOverview.byRoomType.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-xl bg-surface-muted/50 px-3 py-2.5 text-sm"
              >
                <span>{item.label}</span>
                <span className="font-medium">{formatINR(item.amount)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Outstanding payment report">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Booking</th>
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Balance</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {outstandingPaymentReport.map((row) => (
                  <tr key={row.booking} className="border-t border-border-subtle">
                    <td className="px-5 py-3.5 font-medium">{row.booking}</td>
                    <td className="px-5 py-3.5">{row.guest}</td>
                    <td className="px-5 py-3.5 font-medium text-danger">
                      {formatINR(row.balance)}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{row.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <SectionCard title="Payment status report">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Count</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paymentStatusReport.map((row) => (
                  <tr key={row.status} className="border-t border-border-subtle">
                    <td className="px-5 py-3.5 font-medium">{row.status}</td>
                    <td className="px-5 py-3.5">{row.count}</td>
                    <td className="px-5 py-3.5 font-medium">
                      {formatINR(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
