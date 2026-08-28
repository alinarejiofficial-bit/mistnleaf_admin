"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { enquiries } from "@/lib/ops-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, EmptyRow, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

const statusStyles = {
  New: "bg-brand-soft text-brand",
  "In progress": "bg-[#e7f0f5] text-info",
  Closed: "bg-surface-muted text-muted",
};

export function EnquiriesManager() {
  const [filter, setFilter] = useState<"All" | "New" | "In progress" | "Closed">(
    "All",
  );
  const filtered = useMemo(
    () => enquiries.filter((e) => (filter === "All" ? true : e.status === filter)),
    [filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description="Inbound website, phone, and email booking requests."
        action={
          <PermissionGate action="enquiries.manage">
            <button
              type="button"
              onClick={() => window.alert("New enquiry form (demo).")}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              New enquiry
            </button>
          </PermissionGate>
        }
      />
      <div className="grid gap-3 sm:grid-cols-4">
        <StatPill label="Total" value={enquiries.length} />
        <StatPill
          label="New"
          value={enquiries.filter((e) => e.status === "New").length}
          tone="brand"
        />
        <StatPill
          label="In progress"
          value={enquiries.filter((e) => e.status === "In progress").length}
          tone="info"
        />
        <StatPill
          label="Closed"
          value={enquiries.filter((e) => e.status === "Closed").length}
          tone="success"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", "New", "In progress", "Closed"] as const).map((item) => (
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

      <SectionCard title="Enquiry inbox" description={`${filtered.length} requests`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Requester</th>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Channel</th>
                <th className="px-5 py-3 font-medium">Received</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((enquiry) => (
                <tr key={enquiry.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{enquiry.name}</div>
                    <div className="text-xs text-muted">{enquiry.email}</div>
                  </td>
                  <td className="px-5 py-3.5">{enquiry.subject}</td>
                  <td className="px-5 py-3.5">{enquiry.channel}</td>
                  <td className="px-5 py-3.5 text-muted">{enquiry.receivedAt}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={statusStyles[enquiry.status]}>
                      {enquiry.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <PermissionGate action="enquiries.manage">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => window.alert("Follow up sent (demo).")}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-surface-muted"
                        >
                          Follow up
                        </button>
                        {enquiry.status !== "Closed" ? (
                          <button
                            type="button"
                            onClick={() => window.alert("Converted to booking (demo).")}
                            className="rounded-lg bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-hover"
                          >
                            Convert
                          </button>
                        ) : null}
                      </div>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <EmptyRow colSpan={6} label="No enquiries." />
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
