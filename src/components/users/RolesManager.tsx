"use client";

import Link from "next/link";
import {
  Building2,
  ConciergeBell,
  Globe,
  IndianRupee,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAccessibleModules } from "@/lib/permission-matrix";
import { roles, roleBadgeClass, type RoleId } from "@/lib/roles";

const roleIcons: Record<RoleId, React.ReactNode> = {
  super_administrator: <ShieldCheck className="h-5 w-5" />,
  resort_manager: <Building2 className="h-5 w-5" />,
  front_desk: <ConciergeBell className="h-5 w-5" />,
  housekeeping: <Sparkles className="h-5 w-5" />,
  accountant: <IndianRupee className="h-5 w-5" />,
  website_content_manager: <Globe className="h-5 w-5" />,
};

export function RolesManager() {
  const { users } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & permissions"
        description="Six fixed roles. Super Administrator is locked at the highest level. Super Administrators can assign or revoke operational permissions on the other five roles."
      />

      <div className="rounded-2xl border border-brand/20 bg-brand-soft/50 px-5 py-4 text-sm text-muted">
        Super Administrator permissions cannot be modified. Resort Manager, Front Desk,
        Housekeeping, Content Manager, and Finance cannot change Super Administrator
        accounts or access system-level controls (users, roles, integrations, audit logs,
        and critical settings).
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => {
          const assignedCount = users.filter((user) => user.roleId === role.id).length;
          const modules = getAccessibleModules(role.id);

          return (
            <Link
              key={role.id}
              href={`/roles/${role.id}`}
              className="group rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm transition hover:border-brand/25 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-white ${roleBadgeClass[role.id]}`}
                >
                  {roleIcons[role.id]}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl text-foreground group-hover:text-brand">
                    {role.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{role.description}</p>
                  {role.id === "super_administrator" ? (
                    <p className="mt-2 text-xs font-medium text-brand">Locked · full system access</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-surface-muted px-2.5 py-1 font-medium text-foreground">
                  {assignedCount} users
                </span>
                <span className="rounded-lg bg-brand-soft px-2.5 py-1 font-medium text-brand">
                  {modules.length} modules
                </span>
                <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-muted">
                  {role.permissions.length} permissions
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
