"use client";

import { HousekeepingGreeting } from "@/components/housekeeping/HousekeepingGreeting";
import { MaintenanceReportCard } from "@/components/housekeeping/MaintenanceReportCard";
import { useHousekeeping } from "@/components/housekeeping/HousekeepingProvider";

export function StaffMaintenanceView() {
  const { reports } = useHousekeeping();

  return (
    <div className="space-y-6">
      <HousekeepingGreeting />
      <MaintenanceReportCard />
      {reports.length > 0 ? (
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <h2 className="font-display text-xl text-foreground">All your reports</h2>
          <ul className="mt-4 space-y-3">
            {reports.map((report) => (
              <li
                key={report.id}
                className="rounded-xl border border-border-subtle bg-surface-muted/40 px-4 py-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-foreground">
                    {report.room} · {report.category}
                  </p>
                  <span className="text-xs text-muted">{report.reportedAt}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{report.description}</p>
                <p className="mt-2 text-xs font-medium text-brand-mid">{report.status}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
