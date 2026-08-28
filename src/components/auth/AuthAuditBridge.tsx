"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { AuditProvider } from "@/components/auth/AuditProvider";
import { getRole } from "@/lib/roles";

export function AuthAuditBridge({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const role = currentUser ? getRole(currentUser.roleId) : null;
  const actor = currentUser
    ? {
        name: currentUser.name,
        roleId: currentUser.roleId,
        roleName: role?.name ?? currentUser.roleId,
      }
    : null;

  return <AuditProvider actor={actor}>{children}</AuditProvider>;
}
