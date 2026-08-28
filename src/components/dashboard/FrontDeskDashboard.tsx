"use client";

import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  CalendarMinus,
  ClipboardList,
  CreditCard,
  Users,
} from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { usePermissions } from "@/components/auth/usePermissions";
import { BookingOverview } from "@/components/dashboard/BookingOverview";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { RoleDashboardHeader } from "@/components/dashboard/RoleDashboardHeader";
import { UpcomingReservations } from "@/components/dashboard/UpcomingReservations";
import { getDashboardConfig } from "@/lib/dashboard-registry";
import { dashboardSummary, formatINR } from "@/lib/data";

export function FrontDeskDashboard() {
  const { can, roleId } = usePermissions();
  const config = roleId ? getDashboardConfig(roleId) : null;

  return (
    <div className="space-y-6">
      <RoleDashboardHeader />

      {config ? (
        <DashboardQuickActions
          title="Today's reception desk"
          description="Fast access to arrivals, departures, guest lookup, and payments."
          actions={config.quickActions}
          accentClass={config.accentClass}
          linkHoverClass="hover:border-info/30 hover:bg-[#e7f0f5]/50"
        />
      ) : null}

      <section>
        <div className="mb-3">
          <h2 className="font-display text-xl text-foreground">Today at a glance</h2>
          <p className="mt-1 text-sm text-muted">
            Arrivals, departures, guests in-house, and room availability
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <FrontDeskStat
            icon={<CalendarCheck className="h-4 w-4" />}
            label="Check-ins today"
            value={String(dashboardSummary.todaysCheckIns)}
            tone="brand"
            href="/check-in"
            action="checkin.manage"
          />
          <FrontDeskStat
            icon={<CalendarMinus className="h-4 w-4" />}
            label="Check-outs today"
            value={String(dashboardSummary.todaysCheckOuts)}
            tone="info"
            href="/check-out"
            action="checkout.manage"
          />
          <FrontDeskStat
            icon={<Users className="h-4 w-4" />}
            label="Current guests"
            value={String(dashboardSummary.currentGuests)}
            tone="success"
            href="/guests"
            action="guests.view"
          />
          <FrontDeskStat
            icon={<ClipboardList className="h-4 w-4" />}
            label="Pending reservations"
            value={String(dashboardSummary.pendingReservations)}
            tone="warning"
            href="/reservations"
            action="bookings.view"
          />
          <FrontDeskStat
            icon={<BedDouble className="h-4 w-4" />}
            label="Rooms available"
            value={String(dashboardSummary.availableRooms)}
            tone="success"
            href="/calendar"
            action="calendar.view"
          />
          <FrontDeskStat
            icon={<CreditCard className="h-4 w-4" />}
            label="Today's collections"
            value={formatINR(dashboardSummary.todaysRevenue)}
            tone="brand"
            href="/payments"
            action="payments.record"
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {can("bookings.view") ? <BookingOverview /> : null}
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <h3 className="font-display text-xl text-foreground">Room availability</h3>
          <p className="mt-1 text-sm text-muted">Live inventory snapshot for front desk</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <AvailabilityPill label="Available" value={dashboardSummary.availableRooms} tone="success" />
            <AvailabilityPill label="Occupied" value={dashboardSummary.occupiedRooms} tone="brand" />
            <AvailabilityPill label="Reserved" value={dashboardSummary.reservedRooms} tone="info" />
            <AvailabilityPill label="Total rooms" value={dashboardSummary.totalRooms} />
          </div>
          <PermissionGate action="calendar.view">
            <Link
              href="/calendar"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-mid hover:text-brand"
            >
              Open booking calendar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </PermissionGate>
        </section>
      </div>

      {can("bookings.view") ? (
        <>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-mid" />
            <h2 className="font-display text-xl text-foreground">Upcoming reservations</h2>
          </div>
          <UpcomingReservations />
        </>
      ) : null}
    </div>
  );
}

function FrontDeskStat({
  icon,
  label,
  value,
  tone = "default",
  href,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "brand" | "info" | "success" | "warning";
  href: string;
  action: import("@/lib/permissions").AppAction;
}) {
  const tones = {
    default: "border-border-subtle bg-surface",
    brand: "border-brand/20 bg-brand-soft/60",
    info: "border-info/20 bg-[#e7f0f5]/70",
    success: "border-success/20 bg-[#e8f3ec]/70",
    warning: "border-accent/30 bg-accent-soft/70",
  };

  return (
    <PermissionGate action={action}>
      <Link
        href={href}
        className={`block rounded-2xl border p-4 shadow-sm transition hover:border-brand/25 ${tones[tone]}`}
      >
        <div className="text-brand-mid">{icon}</div>
        <p className="mt-2 text-xs text-muted">{label}</p>
        <p className="mt-1 font-display text-2xl text-foreground">{value}</p>
      </Link>
    </PermissionGate>
  );
}

function AvailabilityPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "brand" | "info";
}) {
  const tones = {
    success: "bg-[#e8f3ec] text-success",
    brand: "bg-brand-soft text-brand",
    info: "bg-[#e7f0f5] text-info",
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-muted/40 px-3 py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 inline-flex rounded-lg px-2 py-0.5 font-display text-xl ${
          tone ? tones[tone] : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
