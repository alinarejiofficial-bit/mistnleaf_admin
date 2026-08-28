"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  canPerformAction,
  canPerformActionOrSuper,
  type AppAction,
} from "@/lib/permissions";
import { getRole, type RoleId } from "@/lib/roles";

export function usePermissions() {
  const { currentUser } = useAuth();
  const roleId = currentUser?.roleId ?? null;

  return useMemo(() => {
    const can = (action: AppAction) =>
      roleId ? canPerformActionOrSuper(roleId, action) : false;

    const canStrict = (action: AppAction) =>
      roleId ? canPerformAction(roleId, action) : false;

    return {
      roleId,
      role: roleId ? getRole(roleId) : null,
      currentUser,
      can,
      canStrict,
      isSuperAdmin: roleId === "super_administrator",
      isResortManager: roleId === "resort_manager",
      isFrontDesk: roleId === "front_desk",
      isHousekeeping: roleId === "housekeeping",
      isAccountant: roleId === "accountant",
      isWebsiteContentManager: roleId === "website_content_manager",
    };
  }, [currentUser, roleId]);
}

export function useRoleId(): RoleId | null {
  return useAuth().currentUser?.roleId ?? null;
}
