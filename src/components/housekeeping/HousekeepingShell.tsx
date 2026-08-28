"use client";

import { HousekeepingProvider } from "@/components/housekeeping/HousekeepingProvider";

export function HousekeepingShell({ children }: { children: React.ReactNode }) {
  return <HousekeepingProvider>{children}</HousekeepingProvider>;
}
