"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuditLogOptional } from "@/components/auth/AuditProvider";
import { PermissionList } from "@/components/users/RoleCards";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, SectionCard } from "@/components/ui/ModulePrimitives";
import {
  getMatrixForRole,
  matrixActionColumns,
  matrixActionLabels,
} from "@/lib/permission-matrix";
import {
  allPermissions,
  accountantModuleAccess,
  frontDeskModuleAccess,
  getRole,
  hasPermission,
  housekeepingModuleAccess,
  isLockedRole,
  permissionLabels,
  resortManagerModuleAccess,
  roleBadgeClass,
  superAdminModuleAccess,
  SYSTEM_LEVEL_PERMISSIONS,
  websiteContentManagerModuleAccess,
  type Permission,
  type RoleId,
} from "@/lib/roles";
import {
  fetchStaffRole,
  updateStaffRolePermissions,
} from "@/lib/staff-api-client";

const moduleAccessByRole: Record<RoleId, { module: string; access: string }[]> = {
  super_administrator: superAdminModuleAccess,
  resort_manager: resortManagerModuleAccess,
  front_desk: frontDeskModuleAccess,
  housekeeping: housekeepingModuleAccess,
  accountant: accountantModuleAccess,
  website_content_manager: websiteContentManagerModuleAccess,
};

const systemLevelSet = new Set<Permission>(SYSTEM_LEVEL_PERMISSIONS);

export function RoleDetailManager({ roleId }: { roleId: RoleId }) {
  const { users, currentUser, refreshDirectory } = useAuth();
  const audit = useAuditLogOptional();
  const role = getRole(roleId);
  const matrix = getMatrixForRole(roleId);
  const moduleAccess = moduleAccessByRole[roleId];
  const assignedUsers = users.filter((user) => user.roleId === roleId);
  const locked = isLockedRole(roleId);
  const canEditPermissions = Boolean(
    currentUser &&
      hasPermission(currentUser.roleId, "manage_roles", currentUser.permissions) &&
      !locked,
  );

  const [selected, setSelected] = useState<Permission[]>(role?.permissions ?? []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSelected(role?.permissions ?? []);
    setMessage("");
    setError("");
    void fetchStaffRole(roleId)
      .then((payload) => {
        setSelected(payload.permissions as Permission[]);
      })
      .catch(() => undefined);
  }, [roleId, role?.permissions]);

  const operationalPermissions = useMemo(
    () => allPermissions.filter((permission) => !systemLevelSet.has(permission)),
    [],
  );

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

  function togglePermission(permission: Permission) {
    if (!canEditPermissions || systemLevelSet.has(permission)) return;
    setSelected((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission],
    );
    setMessage("");
  }

  async function handleSave() {
    if (!canEditPermissions) return;
    setSaving(true);
    setError("");
    try {
      const payload = await updateStaffRolePermissions(roleId, selected);
      setSelected(payload.permissions as Permission[]);
      await refreshDirectory();
      audit?.log({
        action: "Role permissions updated",
        module: "Roles",
        detail: role?.name ?? roleId,
        newValue: `${payload.permissions.length} permissions`,
      });
      setMessage("Permissions saved. Staff with this role will use the updated access immediately.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save permissions.");
    } finally {
      setSaving(false);
    }
  }

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
        action={
          canEditPermissions ? (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save permissions"}
            </button>
          ) : null
        }
      />

      {locked ? (
        <div className="flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft/50 px-5 py-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div>
            <p className="font-medium text-foreground">Super Administrator permissions are locked</p>
            <p className="mt-1 text-sm text-muted">
              This role always has complete CMS access. Lower-level roles cannot view, assign,
              revoke, or otherwise change Super Administrator permissions.
            </p>
          </div>
        </div>
      ) : null}

      {role.note && !locked ? (
        <p className="rounded-xl border border-border-subtle bg-surface-muted/50 px-4 py-3 text-sm text-muted italic">
          {role.note}
        </p>
      ) : null}

      {message ? <p className="text-sm font-medium text-success">{message}</p> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
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

      {canEditPermissions ? (
        <SectionCard
          title="Assign and revoke permissions"
          description="Super Administrators can grant or revoke operational permissions for this role. System-level controls stay locked."
        >
          <div className="space-y-5 px-1 py-1">
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                System-level (Super Administrator only)
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {SYSTEM_LEVEL_PERMISSIONS.map((permission) => (
                  <li
                    key={permission}
                    className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-muted/60 px-3.5 py-3 text-sm text-muted"
                  >
                    <input type="checkbox" disabled checked={false} className="mt-1" />
                    <span>
                      {permissionLabels[permission]}
                      <span className="mt-0.5 block text-xs">Cannot be assigned to this role</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                Operational permissions
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {operationalPermissions.map((permission) => {
                  const checked = selected.includes(permission);
                  return (
                    <li key={permission}>
                      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-muted/40 px-3.5 py-3 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(permission)}
                          className="mt-1"
                        />
                        <span>{permissionLabels[permission]}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Granular permissions" description={`${selected.length} permission strings`}>
          <PermissionList permissions={selected} />
        </SectionCard>
      )}
    </div>
  );
}
