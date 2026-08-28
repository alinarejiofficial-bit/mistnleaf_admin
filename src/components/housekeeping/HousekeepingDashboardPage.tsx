"use client";

import { HousekeepingShell } from "@/components/housekeeping/HousekeepingShell";
import { HousekeepingDashboard } from "@/components/housekeeping/HousekeepingDashboard";

export function HousekeepingDashboardPage() {
  return (
    <HousekeepingShell>
      <HousekeepingDashboard />
    </HousekeepingShell>
  );
}
