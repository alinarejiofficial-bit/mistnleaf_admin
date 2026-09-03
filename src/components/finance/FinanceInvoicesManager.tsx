"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Printer, Search } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { FinanceGreeting } from "@/components/finance/FinanceGreeting";
import { useOps } from "@/components/ops/OpsProvider";
import {
  formatINR,
  invoiceStatusStyles,
  type FinanceInvoiceDetail,
} from "@/lib/finance-data";
import { formatDisplayDate } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyRow, SectionCard } from "@/components/ui/ModulePrimitives";

type StatusFilter = "All" | "Paid" | "Unpaid" | "Overdue" | "Draft";

export function FinanceInvoicesManager() {
  const { financeInvoices } = useOps();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return financeInvoices.filter((inv) => {
      if (filter !== "All" && inv.status !== filter) return false;
      if (!q) return true;
      return (
        inv.id.toLowerCase().includes(q) ||
        inv.bookingRef.toLowerCase().includes(q) ||
        inv.guest.toLowerCase().includes(q)
      );
    });
  }, [query, filter, financeInvoices]);

  const selected =
    filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="space-y-6">
      <FinanceGreeting />
      <PageHeader
        title="Invoices"
        description="Generate, download, and review guest folios and balances."
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

      <label className="relative block max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search invoices…"
          className="h-11 w-full rounded-xl border border-border bg-surface pr-3 pl-10 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
        />
      </label>

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

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <SectionCard title="Invoice register" description={`${filtered.length} invoices`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Balance</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => setSelectedId(invoice.id)}
                    className={`cursor-pointer border-t border-border-subtle hover:bg-surface-muted/40 ${
                      selected?.id === invoice.id ? "bg-brand-soft/40" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{invoice.id}</div>
                      <div className="text-xs text-muted">{invoice.bookingRef}</div>
                    </td>
                    <td className="px-5 py-3.5">{invoice.guest}</td>
                    <td className="px-5 py-3.5 font-medium">
                      {formatINR(invoice.total)}
                    </td>
                    <td className="px-5 py-3.5">{formatINR(invoice.balance)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${invoiceStatusStyles[invoice.status]}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <EmptyRow colSpan={5} label="No invoices found." />
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <InvoiceDetailPanel invoice={selected} />
      </div>
    </div>
  );
}

function InvoiceDetailPanel({
  invoice,
}: {
  invoice: FinanceInvoiceDetail | null;
}) {
  if (!invoice) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
        Select an invoice to view details.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-brand-mid uppercase">
        Invoice details
      </p>
      <h2 className="mt-1 font-display text-3xl text-foreground">{invoice.id}</h2>
      <p className="mt-1 text-sm text-muted">{invoice.bookingRef}</p>

      <dl className="mt-5 space-y-2.5 text-sm">
        <Row label="Guest" value={invoice.guest} />
        <Row label="Room" value={invoice.room} />
        <Row
          label="Stay"
          value={`${formatDisplayDate(invoice.checkIn)} → ${formatDisplayDate(invoice.checkOut)}`}
        />
        <Row label="Charges" value={formatINR(invoice.charges)} />
        <Row label="Discounts" value={formatINR(invoice.discounts)} />
        <Row label="Taxes" value={formatINR(invoice.taxes)} />
        <Row label="Total" value={formatINR(invoice.total)} bold />
        <Row label="Amount paid" value={formatINR(invoice.paid)} />
        <Row
          label="Balance due"
          value={formatINR(invoice.balance)}
          highlight={invoice.balance > 0}
        />
      </dl>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
        <PermissionGate action="invoices.download">
          <button
            type="button"
            onClick={() => window.alert(`Download ${invoice.id} PDF (demo).`)}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => window.alert(`Print ${invoice.id} (demo).`)}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </PermissionGate>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted/40 px-3 py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`text-right ${bold ? "font-semibold" : "font-medium"} ${
          highlight ? "text-danger" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
