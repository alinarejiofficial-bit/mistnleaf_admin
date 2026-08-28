import type { Permission, RoleId } from "./roles";
import { hasPermission } from "./roles";

/** Minimum permission(s) required to open a route — user needs any one listed. */
export const routePermissions: Record<string, Permission[]> = {
  "/": ["view_dashboard"],
  "/reservations": [
    "manage_bookings",
    "create_bookings",
    "modify_bookings",
    "cancel_bookings",
    "confirm_bookings",
    "assign_rooms",
  ],
  "/calendar": ["manage_calendar", "manage_bookings", "view_availability"],
  "/rooms": ["manage_rooms", "view_room_status", "manage_room_descriptions"],
  "/guests": ["manage_guests", "register_guests"],
  "/check-in": ["manage_check_in_out", "check_guests_in"],
  "/check-out": ["manage_check_in_out", "check_guests_out"],
  "/housekeeping": [
    "manage_housekeeping",
    "monitor_housekeeping",
    "view_assigned_rooms",
    "update_cleaning_status",
  ],
  "/maintenance": [
    "manage_maintenance",
    "monitor_maintenance",
    "report_maintenance_issues",
    "update_maintenance_status",
  ],
  "/payments": [
    "manage_payments",
    "view_payments",
    "record_payments",
    "record_operational_payments",
    "record_offline_payments",
  ],
  "/invoices": [
    "manage_invoices",
    "generate_invoices",
    "download_invoices",
  ],
  "/offers": ["manage_offers"],
  "/add-ons": ["manage_addons"],
  "/reports": [
    "manage_reports",
    "view_reports",
    "view_revenue_reports",
    "generate_financial_reports",
  ],
  "/enquiries": ["manage_enquiries", "manage_guests", "view_operational_data"],
  "/notifications": [
    "manage_notifications",
    "view_notifications",
    "view_operational_data",
  ],
  "/profile": [],
  "/my-rooms": ["view_assigned_rooms"],
  "/cleaning-tasks": ["view_assigned_rooms", "view_rooms_requiring_cleaning"],
  "/room-status": ["view_assigned_rooms", "view_rooms_requiring_cleaning"],
  "/maintenance-issues": ["report_maintenance_issues"],
  "/refunds": ["view_payments", "view_revenue_reports", "generate_financial_reports"],
  "/financial-reports": [
    "view_revenue_reports",
    "generate_financial_reports",
    "export_reports",
  ],
  "/website": ["manage_website", "update_website_content"],
  "/website/homepage": ["manage_website", "update_website_content"],
  "/website/about": ["manage_website", "update_website_content"],
  "/website/rooms": ["manage_website", "update_website_content", "manage_room_descriptions"],
  "/website/amenities": ["manage_website", "update_website_content", "manage_facilities"],
  "/website/experiences": ["manage_website", "update_website_content", "manage_blog_content"],
  "/website/gallery": ["manage_website", "update_website_content", "manage_images"],
  "/website/offers": ["manage_website", "update_website_content", "manage_offers"],
  "/website/testimonials": ["manage_website", "update_website_content", "manage_blog_content"],
  "/website/faqs": ["manage_website", "update_website_content"],
  "/website/contact": ["manage_website", "update_website_content"],
  "/website/location": ["manage_website", "update_website_content"],
  "/website/social": ["manage_website", "update_website_content"],
  "/website/footer": ["manage_website", "update_website_content"],
  "/users": ["manage_users", "manage_roles", "manage_staff"],
  "/roles": ["manage_roles", "manage_users"],
  "/audit-logs": ["view_audit_logs", "view_operational_audit_logs"],
  "/settings": [
    "manage_settings",
    "manage_integrations",
    "manage_pricing",
    "view_limited_settings",
  ],
};

const routePriority = [
  "/",
  "/my-rooms",
  "/cleaning-tasks",
  "/room-status",
  "/maintenance-issues",
  "/payments",
  "/invoices",
  "/refunds",
  "/financial-reports",
  "/reservations",
  "/calendar",
  "/rooms",
  "/guests",
  "/check-in",
  "/check-out",
  "/housekeeping",
  "/maintenance",
  "/offers",
  "/add-ons",
  "/reports",
  "/enquiries",
  "/notifications",
  "/website",
  "/website/homepage",
  "/website/about",
  "/website/rooms",
  "/website/amenities",
  "/website/experiences",
  "/website/gallery",
  "/website/offers",
  "/website/testimonials",
  "/website/faqs",
  "/website/contact",
  "/website/location",
  "/website/social",
  "/website/footer",
  "/users",
  "/roles",
  "/audit-logs",
  "/settings",
  "/profile",
  "/help",
];

export function canAccessRoute(roleId: RoleId, href: string): boolean {
  if (href === "/help" || href === "/login" || href === "/profile") return true;

  if (href.startsWith("/website/")) {
    const cmsPerms = routePermissions["/website"];
    if (cmsPerms) {
      return cmsPerms.some((permission) => hasPermission(roleId, permission));
    }
  }

  const permissions = routePermissions[href];
  if (!permissions) return true;

  return permissions.some((permission) => hasPermission(roleId, permission));
}

export function getDefaultRoute(roleId: RoleId): string {
  return routePriority.find((href) => canAccessRoute(roleId, href)) ?? "/help";
}

export function filterByRouteAccess<T extends { href: string }>(
  roleId: RoleId,
  items: T[],
): T[] {
  return items.filter((item) => canAccessRoute(roleId, item.href));
}
