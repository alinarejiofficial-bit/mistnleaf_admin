"use client";

import { useOps } from "@/components/ops/OpsProvider";

export function OccupancyOverview() {
  const {
    occupancy: {
      occupancyPercent,
      available,
      occupied,
      reserved,
      outOfOrder,
      totalInventory,
    },
  } = useOps();

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (occupancyPercent / 100) * circumference;

  return (
    <section className="animate-fade-up-delay-1 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-xl text-foreground">Occupancy Overview</h2>
      <p className="mt-1 text-sm text-muted">
        Current occupancy and inventory across {totalInventory} rooms
      </p>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--surface-muted)"
              strokeWidth="12"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--brand-mid)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl text-foreground">
              {occupancyPercent}%
            </span>
            <span className="text-xs tracking-wide text-muted uppercase">
              Occupancy
            </span>
          </div>
        </div>

        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          <LegendItem
            color="bg-[#9db8a8]"
            label="Available inventory"
            value={`${available} rooms`}
          />
          <LegendItem
            color="bg-brand-mid"
            label="Occupied inventory"
            value={`${occupied} rooms`}
          />
          <LegendItem
            color="bg-accent"
            label="Reserved inventory"
            value={`${reserved} rooms`}
          />
          <LegendItem
            color="bg-danger"
            label="Out-of-order rooms"
            value={`${outOfOrder} rooms`}
          />
        </div>
      </div>
    </section>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-surface-muted/70 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
        <span className="text-xs text-muted">{label}</span>
      </div>
      <p className="mt-1 pl-[18px] text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
