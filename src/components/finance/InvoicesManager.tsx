"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatINR, invoices } from "@/lib/ops-data";
import { formatDisplayDate } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, EmptyRow, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

const statusStyles = {
  Paid: "bg-[#e8f3ec] text-success",
  Unpaid: "bg-accent-soft text-[#8a6a2f]",
  Overdue: "bg-[#f8e9e6] text-danger",
  Draft: "bg-surface-muted text-muted",
};

export function InvoicesManager() {
  const [filter, setFilter] = useState<"All" | "Paid" | "Unpaid" | "Overdue" | "Draft">(
    "All",
  );
  const filtered = useMemo(
    () => invoices.filter((inv) => (filter === "All" ? true : inv.status === filter)),
    [filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Generate and track invoices for stays and extras."
        action={
          <PermissionGate action="invoices.generate">
            <button
              type="button"
              onClick={() => window.alert("Generate invoice (demo).")}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              <FileText className="h-4 w-4" />
              Generate invoice
            </button>
          </PermissionGate>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Invoices" value={invoices.length} />
        <StatPill
          label="Paid"
          value={invoices.filter((i) => i.status === "Paid").length}
          tone="success"
        />
        <StatPill
          label="Unpaid"
          value={invoices.filter((i) => i.status === "Unpaid").length}
          tone="warning"
        />
        <StatPill
          label="Overdue"
          value={invoices.filter((i) => i.status === "Overdue").length}
          tone="danger"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", "Paid", "Unpaid", "Overdue", "Draft"] as const).map((item) => (
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

      <SectionCard title="Invoice register" description={`${filtered.length} invoices`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Issued</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => (
                <tr key={invoice.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{invoice.id}</div>
                    <div className="text-xs text-muted">{invoice.reservationId}</div>
                  </td>
                  <td className="px-5 py-3.5">{invoice.guest}</td>
                  <td className="px-5 py-3.5 text-muted">
                    {formatDisplayDate(invoice.issuedOn)}
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    {formatDisplayDate(invoice.dueOn)}
                  </td>
                  <td className="px-5 py-3.5 font-medium">
                    {formatINR(invoice.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={statusStyles[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <PermissionGate action="invoices.download">
                      <button
                        type="button"
                        onClick={() => window.alert(`Download ${invoice.id} PDF (demo).`)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-surface-muted"
                      >
                        Download PDF
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <EmptyRow colSpan={7} label="No invoices found." />
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
