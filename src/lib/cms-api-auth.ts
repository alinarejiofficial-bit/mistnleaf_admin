import type { RoleId } from "@/lib/roles";

export const CMS_EDITOR_ROLE_IDS: RoleId[] = [
  "super_administrator",
  "website_content_manager",
];

export function canEditCmsContent(roleId: string | null | undefined): boolean {
  return CMS_EDITOR_ROLE_IDS.includes(roleId as RoleId);
}

export function getCmsPublicOrigin(): string {
  return process.env.CMS_PUBLIC_ORIGIN ?? "http://localhost:3001";
}

export function corsHeaders(methods = "GET, OPTIONS") {
  const origin = getCmsPublicOrigin();
  return {
    "Access-Control-Allow-Origin": origin,
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
