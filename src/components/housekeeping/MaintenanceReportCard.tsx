"use client";

import { useState } from "react";
import { Wrench } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useHousekeeping } from "@/components/housekeeping/HousekeepingProvider";
import { maintenanceCategories } from "@/lib/housekeeping-data";

export function MaintenanceReportCard() {
  const { myRooms, reports, reportIssue } = useHousekeeping();
  const [room, setRoom] = useState(myRooms[0]?.roomNumber ?? "");
  const [category, setCategory] = useState<(typeof maintenanceCategories)[number]>(
    "Plumbing",
  );
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!room.trim() || !description.trim()) return;
    reportIssue({ room, category, description: description.trim() });
    setDescription("");
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-[#8a6a2f]">
          <Wrench className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-xl text-foreground">Report maintenance issue</h2>
          <p className="mt-1 text-sm text-muted">
            Flag plumbing, electrical, AC, furniture, or other room problems.
          </p>
        </div>
      </div>

      <PermissionGate action="housekeeping.reportIssue">
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Room</span>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                required
              >
                {myRooms.map((r) => (
                  <option key={r.id} value={r.roomNumber}>
                    {r.roomNumber}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">
                Issue type
              </span>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as (typeof maintenanceCategories)[number])
                }
                className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
              >
                {maintenanceCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the issue clearly for the maintenance team…"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
              required
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              Submit report
            </button>
            {submitted ? (
              <p className="text-sm text-success" role="status">
                Issue reported — maintenance has been notified.
              </p>
            ) : null}
          </div>
        </form>
      </PermissionGate>

      {reports.length > 0 ? (
        <div className="mt-6 border-t border-border-subtle pt-5">
          <h3 className="text-sm font-semibold text-foreground">Your recent reports</h3>
          <ul className="mt-3 space-y-2">
            {reports.slice(0, 3).map((report) => (
              <li
                key={report.id}
                className="rounded-xl border border-border-subtle bg-surface-muted/40 px-3.5 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {report.room} · {report.category}
                  </span>
                  <span className="text-xs text-muted">{report.status}</span>
                </div>
                <p className="mt-1 text-muted">{report.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
