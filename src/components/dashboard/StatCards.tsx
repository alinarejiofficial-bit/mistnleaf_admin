"use client";

import Link from "next/link";
import {
  BedDouble,
  CalendarCheck,
  CalendarMinus,
  ClipboardList,
  IndianRupee,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { dashboardSummary, formatINR } from "@/lib/data";
import type { AppAction } from "@/lib/permissions";

type SummaryCard = {
  key: string;
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  href: string;
  action: AppAction;
};

const cards: SummaryCard[] = [
  {
    key: "total-rooms",
    label: "Total Rooms",
    value: String(dashboardSummary.totalRooms),
    icon: BedDouble,
    accent: "bg-brand-soft text-brand",
    href: "/rooms",
    action: "rooms.view",
  },
  {
    key: "available",
    label: "Available",
    value: String(dashboardSummary.availableRooms),
    icon: BedDouble,
    accent: "bg-[#e8f3ec] text-success",
    href: "/rooms",
    action: "rooms.view",
  },
  {
    key: "occupied",
    label: "Occupied",
    value: String(dashboardSummary.occupiedRooms),
    icon: Users,
    accent: "bg-accent-soft text-[#8a6a2f]",
    href: "/rooms",
    action: "rooms.view",
  },
  {
    key: "reserved",
    label: "Reserved",
    value: String(dashboardSummary.reservedRooms),
    icon: ClipboardList,
    accent: "bg-[#e7f0f5] text-info",
    href: "/calendar",
    action: "calendar.view",
  },
  {
    key: "check-ins",
    label: "Check-ins",
    value: String(dashboardSummary.todaysCheckIns),
    icon: CalendarCheck,
    accent: "bg-brand-soft text-brand",
    href: "/check-in",
    action: "checkin.manage",
  },
  {
    key: "check-outs",
    label: "Check-outs",
    value: String(dashboardSummary.todaysCheckOuts),
    icon: CalendarMinus,
    accent: "bg-[#e7f0f5] text-info",
    href: "/check-out",
    action: "checkout.manage",
  },
  {
    key: "today-revenue",
    label: "Today's Revenue",
    value: formatINR(dashboardSummary.todaysRevenue),
    icon: IndianRupee,
    accent: "bg-[#e8f3ec] text-success",
    href: "/payments",
    action: "payments.view",
  },
  {
    key: "monthly-revenue",
    label: "Monthly Revenue",
    value: formatINR(dashboardSummary.monthlyRevenue),
    icon: IndianRupee,
    accent: "bg-[#e8f3ec] text-success",
    href: "/reports",
    action: "reports.view",
  },
];

export function StatCards() {
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-display text-xl text-foreground">Dashboard summary</h2>
        <p className="mt-1 text-sm text-muted">
          Live property, guest, and revenue snapshot — tap a card to open the module
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <PermissionGate key={card.key} action={card.action}>
              <Link
                href={card.href}
                className="animate-fade-up block rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm transition hover:border-brand/25 hover:bg-brand-soft/20"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-muted">{card.label}</p>
                    <p className="mt-2 font-display text-3xl tracking-tight text-foreground">
                      {card.value}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.accent}`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                </div>
              </Link>
            </PermissionGate>
          );
        })}
      </div>
    </section>
  );
}
