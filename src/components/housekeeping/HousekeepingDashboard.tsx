"use client";

import { useRef } from "react";
import { RoleDashboardHeader } from "@/components/dashboard/RoleDashboardHeader";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { usePermissions } from "@/components/auth/usePermissions";
import { getDashboardConfig } from "@/lib/dashboard-registry";
import { HousekeepingSummaryCards } from "@/components/housekeeping/HousekeepingSummaryCards";
import { AssignedRoomsList } from "@/components/housekeeping/AssignedRoomsList";
import { RoomStatusBoard } from "@/components/housekeeping/RoomStatusBoard";
import { HousekeepingQuickActions } from "@/components/housekeeping/HousekeepingQuickActions";
import { MaintenanceReportCard } from "@/components/housekeeping/MaintenanceReportCard";

export function HousekeepingDashboard() {
  const reportRef = useRef<HTMLDivElement>(null);
  const { roleId } = usePermissions();
  const config = roleId ? getDashboardConfig(roleId) : null;

  return (
    <div className="space-y-6">
      <RoleDashboardHeader />
      {config ? (
        <DashboardQuickActions
          title="Your cleaning workspace"
          description="Navigate to assigned rooms, tasks, status board, and maintenance reports."
          actions={config.quickActions}
          accentClass={config.accentClass}
        />
      ) : null}
      <HousekeepingSummaryCards />
      <HousekeepingQuickActions
        onReportIssue={() =>
          reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />
      <AssignedRoomsList compact />
      <div>
        <h2 className="mb-3 font-display text-xl text-foreground">Room status</h2>
        <RoomStatusBoard scope="mine" />
      </div>
      <div ref={reportRef}>
        <MaintenanceReportCard />
      </div>
    </div>
  );
}
