"use client";

import {
  CalendarCheck,
  CalendarMinus,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { usePermissions } from "@/components/auth/usePermissions";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { BookingOverview } from "@/components/dashboard/BookingOverview";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { OccupancyOverview } from "@/components/dashboard/OccupancyOverview";
import { RevenueOverview } from "@/components/dashboard/RevenueOverview";
import { RoleDashboardHeader } from "@/components/dashboard/RoleDashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { UpcomingReservations } from "@/components/dashboard/UpcomingReservations";
import { getDashboardConfig } from "@/lib/dashboard-registry";

export function ManagementDashboard() {
  const { can, roleId, isResortManager } = usePermissions();
  const config = roleId ? getDashboardConfig(roleId) : null;

  return (
    <div className="space-y-6">
      <RoleDashboardHeader />

      {config && isResortManager ? (
        <>
          <DashboardQuickActions
            title="Today's operations"
            description="Quick access to arrivals, departures, room readiness, and reporting."
            actions={config.quickActions}
            accentClass={config.accentClass}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickStat
              icon={<CalendarCheck className="h-4 w-4" />}
              label="Check-ins today"
              value="6"
            />
            <QuickStat
              icon={<CalendarMinus className="h-4 w-4" />}
              label="Check-outs today"
              value="4"
            />
            <QuickStat
              icon={<Sparkles className="h-4 w-4" />}
              label="Rooms cleaning"
              value="4"
            />
          </div>
        </>
      ) : null}

      <StatCards />

      <div className="grid gap-4 xl:grid-cols-2">
        <OccupancyOverview />
        {can("bookings.view") ? <BookingOverview /> : null}
      </div>

      {can("dashboard.viewRevenue") ? <RevenueOverview /> : null}

      {can("reports.view") ? <AnalyticsChart /> : null}

      {can("bookings.view") ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-mid" />
            <h2 className="font-display text-xl text-foreground">Upcoming reservations</h2>
          </div>
        </div>
      ) : null}
      {can("bookings.view") ? <UpcomingReservations /> : null}
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface/80 px-4 py-3">
      <div className="flex items-center gap-2 text-brand-mid">{icon}</div>
      <p className="mt-2 text-xs text-muted">{label}</p>
      <p className="font-display text-2xl text-foreground">{value}</p>
    </div>
  );
}
