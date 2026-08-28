"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PermissionList } from "@/components/users/RoleCards";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, SectionCard } from "@/components/ui/ModulePrimitives";
import {
  getMatrixForRole,
  matrixActionColumns,
  matrixActionLabels,
} from "@/lib/permission-matrix";
import {
  accountantModuleAccess,
  frontDeskModuleAccess,
  getRole,
  housekeepingModuleAccess,
  resortManagerModuleAccess,
  roleBadgeClass,
  superAdminModuleAccess,
  websiteContentManagerModuleAccess,
  type RoleId,
} from "@/lib/roles";

const moduleAccessByRole: Record<RoleId, { module: string; access: string }[]> = {
  super_administrator: superAdminModuleAccess,
  resort_manager: resortManagerModuleAccess,
  front_desk: frontDeskModuleAccess,
  housekeeping: housekeepingModuleAccess,
  accountant: accountantModuleAccess,
  website_content_manager: websiteContentManagerModuleAccess,
};

export function RoleDetailManager({ roleId }: { roleId: RoleId }) {
  const { users } = useAuth();
  const role = getRole(roleId);
  const matrix = getMatrixForRole(roleId);
  const moduleAccess = moduleAccessByRole[roleId];
  const assignedUsers = users.filter((user) => user.roleId === roleId);

  if (!role) {
    return (
      <div className="rounded-2xl border border-dashed border-border-subtle p-10 text-center text-sm text-muted">
        Role not found.
      </div>
    );
  }

  const visibleMatrix = matrix.filter((row) =>
    matrixActionColumns.some((action) => row.actions[action]),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/roles"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-mid hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        All roles
      </Link>

      <PageHeader
        title={role.name}
        description={role.description}
      />

      {role.note ? (
        <p className="rounded-xl border border-border-subtle bg-surface-muted/50 px-4 py-3 text-sm text-muted italic">
          {role.note}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Users assigned" description={`${assignedUsers.length} staff accounts`}>
          <ul className="space-y-2">
            {assignedUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-muted/40 px-3.5 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
                <Badge className={roleBadgeClass[user.roleId]}>{user.status}</Badge>
              </li>
            ))}
            {assignedUsers.length === 0 ? (
              <li className="text-sm text-muted">No users assigned to this role.</li>
            ) : null}
          </ul>
        </SectionCard>

        <div className="lg:col-span-2">
          <SectionCard title="Modules accessible" description="Summary of module-level access">
            <div className="max-h-72 overflow-y-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Module</th>
                    <th className="px-4 py-3 font-medium">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {moduleAccess.map((row) => (
                    <tr key={row.module} className="border-t border-border-subtle">
                      <td className="px-4 py-3 font-medium text-foreground">{row.module}</td>
                      <td className="px-4 py-3 text-muted">{row.access}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Permission matrix"
        description="View, Create, Edit, Delete, Approve, and other actions per module"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Module</th>
                {matrixActionColumns.map((action) => (
                  <th key={action} className="px-3 py-3 text-center font-medium">
                    {matrixActionLabels[action]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleMatrix.map((row) => (
                <tr key={row.module} className="border-t border-border-subtle">
                  <td className="px-4 py-3 font-medium text-foreground">{row.module}</td>
                  {matrixActionColumns.map((action) => (
                    <td key={action} className="px-3 py-3 text-center">
                      {row.actions[action] ? (
                        <span className="text-success" aria-label="Allowed">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted/40">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Granular permissions" description={`${role.permissions.length} permission strings`}>
        <PermissionList permissions={role.permissions} />
      </SectionCard>
    </div>
  );
}
