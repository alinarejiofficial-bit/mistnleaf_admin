"use client";

import { getDashboardComponent } from "@/components/dashboard/dashboard-components";
import { usePermissions } from "@/components/auth/usePermissions";

export function DashboardRouter() {
  const { roleId } = usePermissions();

  if (!roleId) return null;

  const Dashboard = getDashboardComponent(roleId);
  return <Dashboard />;
}
