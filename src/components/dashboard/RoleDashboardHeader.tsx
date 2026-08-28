"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePermissions } from "@/components/auth/usePermissions";
import { getDashboardConfig } from "@/lib/dashboard-registry";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function RoleDashboardHeader() {
  const { currentUser } = useAuth();
  const { can, roleId } = usePermissions();
  const now = new Date();
  const greeting = greetingForHour(now.getHours());
  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const config = roleId ? getDashboardConfig(roleId) : null;
  const firstName =
    currentUser?.roleId === "super_administrator"
      ? "Super Admin"
      : currentUser?.name?.split(" ")[0] ?? "there";

  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="animate-fade-up">
        <p className="text-xs font-medium tracking-[0.14em] text-brand-mid uppercase">
          {config?.eyebrow ?? "Operations"}
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{dateLabel}</p>
      </div>

      <div className="flex items-center gap-2">
        {can("notifications.view") ? (
          <Link
            href="/notifications"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border-subtle bg-surface text-muted shadow-sm transition hover:border-brand/20 hover:text-brand-mid"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
          </Link>
        ) : null}
        <Link
          href="/profile"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-subtle bg-surface px-3 shadow-sm transition hover:border-brand/20"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-white">
            {currentUser?.initials ?? "—"}
          </span>
          <span className="hidden text-sm font-medium text-foreground sm:block">
            Profile
          </span>
        </Link>
      </div>
    </header>
  );
}
