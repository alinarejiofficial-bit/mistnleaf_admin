"use client";

import { useEffect, useMemo, useState } from "react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, EmptyRow, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";
import {
  fetchStaffEnquiries,
  updateStaffEnquiry,
  type StaffEnquiry,
} from "@/lib/staff-api-client";

const statusStyles = {
  New: "bg-brand-soft text-brand",
  "In progress": "bg-[#e7f0f5] text-info",
  Closed: "bg-surface-muted text-muted",
};

export function EnquiriesManager() {
  const [filter, setFilter] = useState<"All" | "New" | "In progress" | "Closed">("All");
  const [enquiries, setEnquiries] = useState<StaffEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchStaffEnquiries();
      setEnquiries(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load enquiries from the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => enquiries.filter((item) => (filter === "All" ? true : item.status === filter)),
    [filter, enquiries],
  );

  async function setStatus(id: string, status: StaffEnquiry["status"]) {
    setBusyId(id);
    try {
      const updated = await updateStaffEnquiry(id, { status });
      setEnquiries((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update enquiry.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description="Inbound website, phone, and email requests from the public site."
      />
      {error ? (
        <p className="rounded-xl border border-danger/30 bg-[#f8e9e6] px-4 py-3 text-sm text-danger">
          {error} Sign in again if your session expired.
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-4">
        <StatPill label="Total" value={enquiries.length} />
        <StatPill
          label="New"
          value={enquiries.filter((item) => item.status === "New").length}
          tone="brand"
        />
        <StatPill
          label="In progress"
          value={enquiries.filter((item) => item.status === "In progress").length}
          tone="info"
        />
        <StatPill
          label="Closed"
          value={enquiries.filter((item) => item.status === "Closed").length}
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
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
        >
          Refresh
        </button>
      </div>

      <SectionCard
        title="Enquiry inbox"
        description={loading ? "Loading…" : `${filtered.length} requests from the website backend`}
      >
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
                    <Badge className={statusStyles[enquiry.status]}>{enquiry.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <PermissionGate action="enquiries.manage">
                      <div className="flex flex-wrap gap-1.5">
                        {enquiry.status === "New" ? (
                          <button
                            type="button"
                            disabled={busyId === enquiry.id}
                            onClick={() => void setStatus(enquiry.id, "In progress")}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-surface-muted"
                          >
                            Start
                          </button>
                        ) : null}
                        {enquiry.status !== "Closed" ? (
                          <button
                            type="button"
                            disabled={busyId === enquiry.id}
                            onClick={() => void setStatus(enquiry.id, "Closed")}
                            className="rounded-lg bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-hover"
                          >
                            Close
                          </button>
                        ) : null}
                      </div>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 ? (
                <EmptyRow colSpan={6} label="No enquiries from the website yet." />
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
