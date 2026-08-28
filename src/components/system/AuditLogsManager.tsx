"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuditLog } from "@/components/auth/AuditProvider";
import { usePermissions } from "@/components/auth/usePermissions";
import { formatDisplayDate } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

export function AuditLogsManager() {
  const { entries } = useAuditLog();
  const { currentUser } = useAuth();
  const { can } = usePermissions();
  const isFullAudit = can("audit.view") && currentUser?.roleId === "super_administrator";

  const filtered = useMemo(() => {
    if (isFullAudit) return entries;
    const operationalModules = new Set([
      "Reservations",
      "Housekeeping",
      "Payments",
      "Maintenance",
      "Offers",
      "Guests",
      "Check-in",
      "Check-out",
    ]);
    return entries.filter((entry) => operationalModules.has(entry.module));
  }, [entries, isFullAudit]);

  const modulesTracked = new Set(filtered.map((entry) => entry.module)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit logs"
        description={
          isFullAudit
            ? "Complete system activity across reservations, rooms, payments, users, and housekeeping."
            : "Operational activity relevant to resort management."
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatPill label="Entries" value={filtered.length} tone="brand" />
        <StatPill label="Modules tracked" value={modulesTracked} />
        <StatPill label="Access" value="Read only" tone="warning" />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-accent-soft/30 px-4 py-3 text-sm text-muted">
        Audit records are append-only and cannot be modified or deleted.
      </div>

      <SectionCard title="Activity log">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Module</th>
                <th className="px-5 py-3 font-medium">Detail</th>
                <th className="px-5 py-3 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                    {formatDisplayDate(entry.at.slice(0, 10))}
                    <span className="block text-xs">{entry.at.slice(11)}</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {entry.action}
                  </td>
                  <td className="px-5 py-3.5">{entry.user}</td>
                  <td className="px-5 py-3.5 text-muted">{entry.role}</td>
                  <td className="px-5 py-3.5">{entry.module}</td>
                  <td className="px-5 py-3.5 text-muted">{entry.detail}</td>
                  <td className="px-5 py-3.5 text-xs text-muted">
                    {entry.previousValue && entry.newValue ? (
                      <>
                        <span className="line-through">{entry.previousValue}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium text-foreground">{entry.newValue}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted">
                    No audit entries recorded yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
