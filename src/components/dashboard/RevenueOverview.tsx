"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useOps } from "@/components/ops/OpsProvider";
import { formatINR, type RevenuePeriod } from "@/lib/data";

const periodOptions: { value: RevenuePeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "weekly", label: "This week" },
  { value: "monthly", label: "This month" },
];

export function RevenueOverview() {
  const { revenue } = useOps();
  const [period, setPeriod] = useState<RevenuePeriod>("monthly");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const data = revenue[period];
  const roomTypeMax = Math.max(1, ...data.byRoomType.map((item) => item.amount));
  const sourceMax = Math.max(1, ...data.byBookingSource.map((item) => item.amount));
  const paymentTotal = data.onlinePayments + data.offlinePayments || 1;

  const periodLabel = useMemo(() => {
    if (customFrom && customTo) {
      return `${customFrom} → ${customTo}`;
    }
    return data.label;
  }, [customFrom, customTo, data.label]);

  return (
    <section className="animate-fade-up-delay-3 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-foreground">Revenue Overview</h2>
          <p className="mt-1 text-sm text-muted">
            Management view of collections by period, room type, and source
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value as RevenuePeriod);
                setCustomFrom("");
                setCustomTo("");
              }}
              className="h-10 appearance-none rounded-xl border border-border bg-surface py-2 pr-9 pl-3 text-sm font-medium text-foreground outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
              aria-label="Revenue period"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-border-subtle bg-surface-muted/40 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-muted uppercase">
          <CalendarDays className="h-3.5 w-3.5" />
          Custom range
        </div>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted">From</span>
            <input
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted">To</span>
            <input
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
            />
          </label>
          {customFrom && customTo ? (
            <p className="pb-2 text-xs text-muted">
              Showing {periodLabel} using {periodOptions.find((o) => o.value === period)?.label.toLowerCase()} breakdown as reference.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label={`${data.label} revenue`} value={formatINR(data.total)} />
        <Metric
          label="Online share"
          value={`${Math.round((data.onlinePayments / paymentTotal) * 100)}%`}
        />
        <Metric
          label="Offline share"
          value={`${Math.round((data.offlinePayments / paymentTotal) * 100)}%`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BreakdownList
          title="Revenue by room type"
          items={data.byRoomType}
          max={roomTypeMax}
          barClass="bg-brand-mid"
        />
        <BreakdownList
          title="Revenue by booking source"
          items={data.byBookingSource}
          max={sourceMax}
          barClass="bg-accent"
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <PaymentCard
          label="Online payments"
          amount={data.onlinePayments}
          share={Math.round((data.onlinePayments / paymentTotal) * 100)}
          periodLabel={data.label}
          tone="online"
        />
        <PaymentCard
          label="Offline payments"
          amount={data.offlinePayments}
          share={Math.round((data.offlinePayments / paymentTotal) * 100)}
          periodLabel={data.label}
          tone="offline"
        />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-muted/50 px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function BreakdownList({
  title,
  items,
  max,
  barClass,
}: {
  title: string;
  items: { label: string; amount: number }[];
  max: number;
  barClass: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => {
          const width = Math.max(8, Math.round((item.amount / max) * 100));
          return (
            <li key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground">{item.label}</span>
                <span className="font-medium text-muted">{formatINR(item.amount)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={`h-full rounded-full ${barClass}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PaymentCard({
  label,
  amount,
  share,
  periodLabel,
  tone,
}: {
  label: string;
  amount: number;
  share: number;
  periodLabel: string;
  tone: "online" | "offline";
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-4 ${
        tone === "online"
          ? "border-brand/20 bg-brand-soft/60"
          : "border-accent/30 bg-accent-soft/70"
      }`}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl text-foreground">
        {formatINR(amount)}
      </p>
      <p className="mt-1 text-xs text-muted">
        {share}% of {periodLabel.toLowerCase()} collections
      </p>
    </div>
  );
}
