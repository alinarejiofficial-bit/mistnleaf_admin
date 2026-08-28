import type { RoleId } from "@/lib/roles";
import type { AppAction } from "@/lib/permissions";
import {
  cmsContentManagerQuickActions,
  financeQuickActions,
  frontDeskQuickActions,
  housekeepingQuickActions,
  resortManagerQuickActions,
  superAdminQuickActions,
} from "@/lib/permissions";

export type DashboardQuickAction = {
  label: string;
  href: string;
  action: AppAction;
};

export type RoleDashboardConfig = {
  roleId: RoleId;
  label: string;
  eyebrow: string;
  accentClass: string;
  quickActions: readonly DashboardQuickAction[];
};

export const roleDashboardConfigs: RoleDashboardConfig[] = [
  {
    roleId: "super_administrator",
    label: "Super Administrator",
    eyebrow: "System administration",
    accentClass: "border-brand/25 bg-gradient-to-br from-brand-soft/80 via-surface to-accent-soft/50",
    quickActions: superAdminQuickActions,
  },
  {
    roleId: "resort_manager",
    label: "Resort Manager",
    eyebrow: "Management overview",
    accentClass: "border-accent/25 bg-gradient-to-br from-accent-soft/80 via-surface to-brand-soft/50",
    quickActions: resortManagerQuickActions,
  },
  {
    roleId: "front_desk",
    label: "Front Desk",
    eyebrow: "Front desk",
    accentClass: "border-info/20 bg-gradient-to-br from-[#e7f0f5]/90 via-surface to-brand-soft/40",
    quickActions: frontDeskQuickActions,
  },
  {
    roleId: "housekeeping",
    label: "Housekeeping",
    eyebrow: "Housekeeping",
    accentClass: "border-brand/20 bg-gradient-to-br from-brand-soft/40 via-surface to-accent-soft/30",
    quickActions: housekeepingQuickActions,
  },
  {
    roleId: "accountant",
    label: "Finance",
    eyebrow: "Finance",
    accentClass: "border-[#4a5d6a]/25 bg-gradient-to-br from-[#e8eef1]/90 via-surface to-brand-soft/40",
    quickActions: financeQuickActions,
  },
  {
    roleId: "website_content_manager",
    label: "Website CMS",
    eyebrow: "Website CMS",
    accentClass: "border-brand/20 bg-gradient-to-br from-brand-soft/70 via-surface to-accent-soft/40",
    quickActions: cmsContentManagerQuickActions,
  },
];

const dashboardByRole = Object.fromEntries(
  roleDashboardConfigs.map((config) => [config.roleId, config]),
) as Record<RoleId, RoleDashboardConfig>;

export function getDashboardConfig(roleId: RoleId): RoleDashboardConfig {
  return dashboardByRole[roleId] ?? dashboardByRole.resort_manager;
}

export function getQuickActionsForRole(roleId: RoleId): readonly DashboardQuickAction[] {
  return getDashboardConfig(roleId).quickActions;
}
