"use client";

import { useState } from "react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FinanceGreeting } from "@/components/finance/FinanceGreeting";
import {
  financeRefunds,
  formatINR,
  refundStatusStyles,
} from "@/lib/finance-data";
import { formatDisplayDate } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyRow, SectionCard } from "@/components/ui/ModulePrimitives";

export function RefundsManager() {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const confirmRefund = financeRefunds.find((r) => r.id === confirmId);

  return (
    <div className="space-y-6">
      <FinanceGreeting />
      <PageHeader
        title="Refunds"
        description="Review refund requests, processed returns, and payment reversals."
      />

      <SectionCard title="Refund queue" description={`${financeRefunds.length} records`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Refund</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {financeRefunds.map((refund) => (
                <tr key={refund.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{refund.id}</div>
                    <div className="text-xs text-muted">{refund.bookingId}</div>
                  </td>
                  <td className="px-5 py-3.5">{refund.paymentId}</td>
                  <td className="px-5 py-3.5">{refund.guest}</td>
                  <td className="px-5 py-3.5 font-medium">
                    {formatINR(refund.amount)}
                  </td>
                  <td className="px-5 py-3.5">{refund.method}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${refundStatusStyles[refund.status]}`}
                    >
                      {refund.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {refund.status === "Pending" ? (
                      <PermissionGate action="payments.refund">
                        <button
                          type="button"
                          onClick={() => setConfirmId(refund.id)}
                          className="rounded-lg bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-hover"
                        >
                          Process refund
                        </button>
                      </PermissionGate>
                    ) : (
                      <span className="text-xs text-muted">
                        {formatDisplayDate(refund.processedOn)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {financeRefunds.length === 0 ? (
                <EmptyRow colSpan={7} label="No refunds recorded." />
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <section className="rounded-2xl border border-border-subtle bg-surface-muted/40 px-4 py-3 text-sm text-muted">
        Refund details include original payment reference, booking ID, guest name, amount,
        and reason. Only permitted finance actions can process refunds.
      </section>

      <ConfirmDialog
        open={Boolean(confirmRefund)}
        title="Process refund?"
        description={
          confirmRefund
            ? `Refund ${formatINR(confirmRefund.amount)} to ${confirmRefund.guest} for ${confirmRefund.bookingId}.`
            : ""
        }
        confirmLabel="Process refund"
        danger
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          setConfirmId(null);
          window.alert("Refund processed (demo).");
        }}
      />
    </div>
  );
}
