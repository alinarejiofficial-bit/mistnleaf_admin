"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import type { DashboardQuickAction } from "@/lib/dashboard-registry";

type DashboardQuickActionsProps = {
  title: string;
  description: string;
  actions: readonly DashboardQuickAction[];
  accentClass?: string;
  linkHoverClass?: string;
};

export function DashboardQuickActions({
  title,
  description,
  actions,
  accentClass = "border-border-subtle bg-surface",
  linkHoverClass = "hover:border-brand/30 hover:bg-brand-soft/40",
}: DashboardQuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${accentClass}`}>
      <div>
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">{description}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {actions.map((item) => (
          <PermissionGate key={item.href} action={item.action}>
            <Link
              href={item.href}
              className={`group flex items-center justify-between rounded-xl border border-border-subtle bg-surface/95 px-4 py-3 text-sm font-medium text-foreground transition ${linkHoverClass}`}
            >
              {item.label}
              <ArrowRight className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-mid" />
            </Link>
          </PermissionGate>
        ))}
      </div>
    </section>
  );
}
