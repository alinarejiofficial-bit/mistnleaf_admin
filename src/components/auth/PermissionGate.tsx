"use client";

import type { AppAction } from "@/lib/permissions";
import { usePermissions } from "@/components/auth/usePermissions";

export function PermissionGate({
  action,
  children,
  fallback = null,
}: {
  action: AppAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermissions();
  if (!can(action)) return <>{fallback}</>;
  return <>{children}</>;
}
