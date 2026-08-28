"use client";

import Link from "next/link";
import {
  ArrowRight,
  AlertCircle,
  CreditCard,
  FileText,
  IndianRupee,
  RefreshCcw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { RoleDashboardHeader } from "@/components/dashboard/RoleDashboardHeader";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { usePermissions } from "@/components/auth/usePermissions";
import { getDashboardConfig } from "@/lib/dashboard-registry";
import {
  financePayments,
  financeSummary,
  formatINR,
  financeStatusStyles,
  revenueByPaymentMethod,
} from "@/lib/finance-data";
import { formatDisplayDate } from "@/lib/data";

const kpiCards = [
  {
    key: "totalRevenue",
    label: "Total revenue",
    value: formatINR(financeSummary.totalRevenue),
    icon: TrendingUp,
    tone: "border-brand/20 bg-brand-soft/60",
  },
  {
    key: "todaysRevenue",
    label: "Today's revenue",
    value: formatINR(financeSummary.todaysRevenue),
    icon: IndianRupee,
    tone: "border-success/20 bg-[#e8f3ec]/70",
  },
  {
    key: "monthlyRevenue",
    label: "Monthly revenue",
    value: formatINR(financeSummary.monthlyRevenue),
    icon: TrendingUp,
    tone: "border-brand/20 bg-brand-soft/50",
  },
  {
    key: "pendingPayments",
    label: "Pending payments",
    value: String(financeSummary.pendingPayments),
    icon: AlertCircle,
    tone: "border-accent/30 bg-accent-soft/70",
  },
  {
    key: "partiallyPaidBookings",
    label: "Partially paid",
    value: String(financeSummary.partiallyPaidBookings),
    icon: CreditCard,
    tone: "border-info/20 bg-[#e7f0f5]/70",
  },
  {
    key: "outstandingBalances",
    label: "Outstanding balances",
    value: formatINR(financeSummary.outstandingBalances),
    icon: AlertCircle,
    tone: "border-danger/20 bg-[#f8e9e6]/60",
  },
  {
    key: "refundedPayments",
    label: "Refunded payments",
    value: String(financeSummary.refundedPayments),
    icon: RefreshCcw,
    tone: "border-border-subtle bg-surface-muted/70",
  },
  {
    key: "failedPayments",
    label: "Failed payments",
    value: String(financeSummary.failedPayments),
    icon: XCircle,
    tone: "border-danger/20 bg-[#f8e9e6]/60",
  },
];

export function FinanceDashboard() {
  const { roleId } = usePermissions();
  const config = roleId ? getDashboardConfig(roleId) : null;
  const recent = [...financePayments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <RoleDashboardHeader />

      {config ? (
        <DashboardQuickActions
          title="Finance workspace"
          description="Payments, invoices, refunds, and financial reporting."
          actions={config.quickActions}
          accentClass={config.accentClass}
          linkHoverClass="hover:border-[#4a5d6a]/30 hover:bg-[#e8eef1]/60"
        />
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <article
              key={card.key}
              className={`animate-fade-up rounded-2xl border p-5 shadow-sm ${card.tone}`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">{card.label}</p>
                  <p className="mt-2 font-display text-2xl tracking-tight text-foreground sm:text-3xl">
                    {card.value}
                  </p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface/80 shadow-sm">
                  <Icon className="h-5 w-5 text-brand-mid" strokeWidth={1.8} />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
            <div>
              <h2 className="font-display text-xl text-foreground">Recent transactions</h2>
              <p className="mt-0.5 text-sm text-muted">Latest payment activity</p>
            </div>
            <Link
              href="/payments"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-mid hover:text-brand"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted/50 text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((payment) => (
                  <tr key={payment.id} className="border-t border-border-subtle">
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{payment.reference}</div>
                      <div className="text-xs text-muted">{payment.bookingId}</div>
                    </td>
                    <td className="px-5 py-3.5">{payment.guest}</td>
                    <td className="px-5 py-3.5 font-medium">
                      {formatINR(payment.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {formatDisplayDate(payment.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${financeStatusStyles[payment.status]}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <h2 className="font-display text-xl text-foreground">Revenue overview</h2>
          <p className="mt-1 text-sm text-muted">By payment method — current month</p>
          <ul className="mt-4 space-y-3">
            {revenueByPaymentMethod.map((item) => (
              <li key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <span className="font-medium">{formatINR(item.amount)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-brand-mid"
                    style={{
                      width: `${Math.round((item.amount / 624000) * 72)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/financial-reports"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-mid hover:text-brand"
          >
            <FileText className="h-4 w-4" />
            Open financial reports
          </Link>
        </section>
      </div>
    </div>
  );
}
