"use client";

import { Sparkles, Loader, ClipboardCheck, BedDouble } from "lucide-react";
import { useHousekeeping } from "@/components/housekeeping/HousekeepingProvider";
import { housekeepingSummary } from "@/lib/housekeeping-data";

const cards = [
  { key: "toClean" as const, label: "Rooms to Clean", icon: Sparkles, tone: "bg-accent-soft/80 border-accent/25 text-[#8a6a2f]" },
  { key: "inProgress" as const, label: "Cleaning In Progress", icon: Loader, tone: "bg-[#e7f0f5]/80 border-info/20 text-info" },
  { key: "awaitingInspection" as const, label: "Awaiting Inspection", icon: ClipboardCheck, tone: "bg-brand-soft/80 border-brand/20 text-brand" },
  { key: "ready" as const, label: "Ready Rooms", icon: BedDouble, tone: "bg-[#e8f3ec]/80 border-success/20 text-success" },
];

export function HousekeepingSummaryCards({
  scope = "property",
}: {
  scope?: "property" | "assigned";
}) {
  const { summary } = useHousekeeping();
  const counts = scope === "assigned" ? summary : housekeepingSummary;

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = counts[card.key];
        return (
          <article
            key={card.key}
            className={`animate-fade-up rounded-2xl border p-5 shadow-sm ${card.tone}`}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm opacity-80">{card.label}</p>
                <p className="mt-2 font-display text-4xl tracking-tight">{value}</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface/70 shadow-sm">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
