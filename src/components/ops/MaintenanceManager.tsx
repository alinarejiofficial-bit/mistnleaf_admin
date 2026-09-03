"use client";

import { useMemo, useState } from "react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useFloatingToast } from "@/components/ui/useFloatingToast";
import { useOps } from "@/components/ops/OpsProvider";
import { type MaintenanceTicket } from "@/lib/ops-data";
import { formatDisplayDate } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, EmptyRow, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

const statusStyles = {
  Open: "bg-[#f8e9e6] text-danger",
  "In progress": "bg-[#e7f0f5] text-info",
  Resolved: "bg-[#e8f3ec] text-success",
};

const priorityStyles = {
  Critical: "bg-[#f8e9e6] text-danger",
  High: "bg-accent-soft text-[#8a6a2f]",
  Medium: "bg-[#e7f0f5] text-info",
  Low: "bg-surface-muted text-muted",
};

function nextMaintenanceStatus(
  status: MaintenanceTicket["status"],
): MaintenanceTicket["status"] {
  if (status === "Open") return "In progress";
  if (status === "In progress") return "Resolved";
  return "Resolved";
}

export function MaintenanceManager() {
  const { maintenance: tickets, advanceMaintenance } = useOps();
  const [filter, setFilter] = useState<"All" | "Open" | "In progress" | "Resolved">(
    "All",
  );
  const { showToast, toast } = useFloatingToast();

  const filtered = useMemo(
    () =>
      tickets.filter((ticket) => (filter === "All" ? true : ticket.status === filter)),
    [filter, tickets],
  );

  function advanceStatus(ticketId: string) {
    void advanceMaintenance(ticketId);
    showToast("Maintenance ticket updated.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Track work orders and out-of-service rooms."
      />
      <div className="grid gap-3 sm:grid-cols-4">
        <StatPill label="Tickets" value={tickets.length} />
        <StatPill
          label="Open"
          value={tickets.filter((t) => t.status === "Open").length}
          tone="danger"
        />
        <StatPill
          label="In progress"
          value={tickets.filter((t) => t.status === "In progress").length}
          tone="info"
        />
        <StatPill
          label="Resolved"
          value={tickets.filter((t) => t.status === "Resolved").length}
          tone="success"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", "Open", "In progress", "Resolved"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              filter === item
                ? "bg-brand text-white"
                : "border border-border bg-surface hover:bg-surface-muted"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <SectionCard title="Work orders" description={`${filtered.length} tickets`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Ticket</th>
                <th className="px-5 py-3 font-medium">Room</th>
                <th className="px-5 py-3 font-medium">Issue</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Reported</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5 font-medium">{ticket.id}</td>
                  <td className="px-5 py-3.5">{ticket.room}</td>
                  <td className="px-5 py-3.5">
                    <div>{ticket.issue}</div>
                    <div className="text-xs text-muted">by {ticket.reportedBy}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={priorityStyles[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    {formatDisplayDate(ticket.reportedAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={statusStyles[ticket.status]}>
                      {ticket.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <PermissionGate action="maintenance.update">
                      {ticket.status !== "Resolved" ? (
                        <button
                          type="button"
                          onClick={() => advanceStatus(ticket.id)}
                          className="rounded-lg bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-hover"
                        >
                          {ticket.status === "Open" ? "Start work" : "Mark resolved"}
                        </button>
                      ) : (
                        <span className="text-xs text-muted">Resolved</span>
                      )}
                    </PermissionGate>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <EmptyRow colSpan={7} label="No maintenance tickets." />
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {toast}
    </div>
  );
}
