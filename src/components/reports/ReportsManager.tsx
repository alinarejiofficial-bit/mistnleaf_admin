"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { revenueOverview } from "@/lib/data";
import { formatINR, reportCards } from "@/lib/ops-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

type Period = "7d" | "30d" | "90d" | "custom";

export function ReportsManager() {
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
      <PageHeader
        title="Reports"
        description="Occupancy, ADR, RevPAR, and financial performance."
        action={
          <PermissionGate action="reports.export">
            <button
              type="button"
              onClick={() =>
                window.alert(`Report export prepared for ${periodLabel} (demo).`)
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
        {reportCards.map((card) => (
          <StatPill key={card.label} label={card.label} value={card.value} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
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
        <SectionCard title="Revenue by booking source">
          <ul className="space-y-3 px-5 py-4">
            {revenueOverview.byBookingSource.map((item) => (
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
    </div>
  );
}
