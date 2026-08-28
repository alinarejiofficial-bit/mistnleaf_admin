"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { getRole } from "@/lib/roles";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardGreeting() {
  const { currentUser } = useAuth();
  const now = new Date();
  const greeting = greetingForHour(now.getHours());
  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const roleName = currentUser ? getRole(currentUser.roleId)?.name : null;
  const displayName =
    currentUser?.roleId === "super_administrator"
      ? "Super Admin"
      : currentUser?.name?.split(" ")[0] ?? "there";

  return (
    <div className="animate-fade-up">
      <p className="text-sm font-medium tracking-wide text-brand-mid uppercase">
        {roleName ?? "Operations"}
      </p>
      <h1 className="mt-1 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
        {greeting}, {displayName}
      </h1>
      <p className="mt-1.5 text-sm text-muted">{dateLabel}</p>
    </div>
  );
}
