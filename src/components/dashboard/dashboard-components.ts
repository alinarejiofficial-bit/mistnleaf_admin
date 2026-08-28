"use client";

import type { ComponentType } from "react";
import type { RoleId } from "@/lib/roles";
import { ContentManagerDashboardPage } from "@/components/cms/ContentManagerDashboardPage";
import { FrontDeskDashboard } from "@/components/dashboard/FrontDeskDashboard";
import { ManagementDashboard } from "@/components/dashboard/ManagementDashboard";
import { FinanceDashboardPage } from "@/components/finance/FinanceDashboardPage";
import { HousekeepingDashboardPage } from "@/components/housekeeping/HousekeepingDashboardPage";

const dashboardComponents: Record<RoleId, ComponentType> = {
  super_administrator: ManagementDashboard,
  resort_manager: ManagementDashboard,
  front_desk: FrontDeskDashboard,
  housekeeping: HousekeepingDashboardPage,
  accountant: FinanceDashboardPage,
  website_content_manager: ContentManagerDashboardPage,
};

export function getDashboardComponent(roleId: RoleId): ComponentType {
  return dashboardComponents[roleId] ?? ManagementDashboard;
}
