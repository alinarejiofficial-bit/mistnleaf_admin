import type { Permission, RoleId } from "@/lib/roles";

export const CMS_EDITOR_ROLE_IDS: RoleId[] = [
  "super_administrator",
  "website_content_manager",
];

export function canEditCmsContent(
  roleId: string | null | undefined,
  livePermissions?: Permission[],
): boolean {
  if (CMS_EDITOR_ROLE_IDS.includes(roleId as RoleId)) return true;
  return Boolean(
    livePermissions?.some(
      (permission) =>
        permission === "manage_website" || permission === "update_website_content",
    ),
  );
}

export function getCmsPublicOrigin(): string {
  return process.env.CMS_PUBLIC_ORIGIN ?? "http://localhost:3001";
}

export function getCmsAdminOrigin(): string {
  return process.env.CMS_ADMIN_ORIGIN ?? "http://localhost:3000";
}

const allowedOrigins = () =>
  new Set([
    getCmsPublicOrigin(),
    getCmsAdminOrigin(),
    "http://localhost:3001",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3000",
  ]);

export function corsHeaders(methods = "GET, OPTIONS", request?: Request) {
  const origin = request?.headers.get("Origin");
  const allowOrigin =
    origin && allowedOrigins().has(origin) ? origin : getCmsPublicOrigin();

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers":
      "Content-Type, X-Mistnleaf-Role-Id, X-Mistnleaf-User-Id",
  };
}

export function getEditorRoleFromRequest(request: Request): RoleId | null {
  const roleId = request.headers.get("X-Mistnleaf-Role-Id");
  if (!roleId || !canEditCmsContent(roleId)) return null;
  return roleId as RoleId;
}
