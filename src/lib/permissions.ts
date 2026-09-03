import {
  hasAnyPermission,
  hasPermission,
  type Permission,
  type RoleId,
} from "@/lib/roles";

/** Action keys used across the admin UI. */
export type AppAction =
  | "dashboard.view"
  | "dashboard.viewRevenue"
  | "bookings.view"
  | "bookings.create"
  | "bookings.edit"
  | "bookings.confirm"
  | "bookings.cancel"
  | "bookings.assignRoom"
  | "bookings.export"
  | "calendar.view"
  | "calendar.assignRoom"
  | "enquiries.manage"
  | "rooms.view"
  | "rooms.create"
  | "rooms.edit"
  | "rooms.updateStatus"
  | "guests.view"
  | "guests.create"
  | "guests.edit"
  | "checkin.manage"
  | "checkout.manage"
  | "housekeeping.view"
  | "housekeeping.assign"
  | "housekeeping.update"
  | "housekeeping.markReady"
  | "housekeeping.reportIssue"
  | "maintenance.view"
  | "maintenance.update"
  | "payments.view"
  | "payments.record"
  | "payments.export"
  | "payments.refund"
  | "invoices.view"
  | "invoices.generate"
  | "invoices.download"
  | "pricing.manage"
  | "offers.manage"
  | "addons.manage"
  | "reports.view"
  | "reports.export"
  | "notifications.view"
  | "users.view"
  | "users.manageStaff"
  | "users.manageAll"
  | "users.delete"
  | "roles.manage"
  | "settings.full"
  | "settings.limited"
  | "integrations.manage"
  | "audit.view"
  | "cms.full"
  | "cms.limited"
  | "cms.view"
  | "cms.create"
  | "cms.edit"
  | "cms.delete"
  | "cms.upload"
  | "cms.reorder"
  | "cms.publish"
  | "cms.preview";

const actionPermissions: Record<AppAction, Permission[]> = {
  "dashboard.view": ["view_dashboard"],
  "dashboard.viewRevenue": ["view_revenue", "view_revenue_reports", "manage_reports"],
  "bookings.view": ["manage_bookings", "create_bookings", "modify_bookings"],
  "bookings.create": ["manage_bookings", "create_bookings"],
  "bookings.edit": ["manage_bookings", "modify_bookings"],
  "bookings.confirm": ["manage_bookings", "confirm_bookings"],
  "bookings.cancel": ["manage_bookings", "cancel_bookings"],
  "bookings.assignRoom": ["manage_bookings", "assign_rooms"],
  "bookings.export": ["manage_bookings", "export_bookings"],
  "calendar.view": ["manage_calendar", "view_availability", "manage_bookings"],
  "calendar.assignRoom": ["manage_calendar", "assign_rooms"],
  "enquiries.manage": ["manage_enquiries", "manage_guests"],
  "rooms.view": ["manage_rooms", "view_room_status"],
  "rooms.create": ["manage_rooms"],
  "rooms.edit": ["manage_rooms", "manage_room_descriptions"],
  "rooms.updateStatus": ["manage_rooms", "view_room_status"],
  "guests.view": ["manage_guests", "register_guests"],
  "guests.create": ["manage_guests", "register_guests"],
  "guests.edit": ["manage_guests"],
  "checkin.manage": ["manage_check_in_out", "check_guests_in"],
  "checkout.manage": ["manage_check_in_out", "check_guests_out"],
  "housekeeping.view": [
    "manage_housekeeping",
    "monitor_housekeeping",
    "view_assigned_rooms",
  ],
  "housekeeping.assign": ["manage_housekeeping", "monitor_housekeeping"],
  "housekeeping.update": [
    "manage_housekeeping",
    "update_cleaning_status",
  ],
  "housekeeping.markReady": ["manage_housekeeping", "mark_rooms_ready"],
  "housekeeping.reportIssue": [
    "manage_maintenance",
    "report_maintenance_issues",
  ],
  "maintenance.view": [
    "manage_maintenance",
    "monitor_maintenance",
    "report_maintenance_issues",
  ],
  "maintenance.update": ["manage_maintenance", "update_maintenance_status"],
  "payments.view": ["manage_payments", "view_payments"],
  "payments.record": [
    "manage_payments",
    "record_payments",
    "record_operational_payments",
    "record_offline_payments",
  ],
  "payments.export": ["manage_payments", "export_payments", "view_payments"],
  "payments.refund": [
    "manage_payments",
    "view_payments",
    "generate_financial_reports",
  ],
  "invoices.view": ["manage_invoices", "generate_invoices", "download_invoices"],
  "invoices.generate": ["manage_invoices", "generate_invoices"],
  "invoices.download": ["manage_invoices", "download_invoices"],
  "pricing.manage": ["manage_pricing"],
  "offers.manage": ["manage_offers"],
  "addons.manage": ["manage_addons"],
  "reports.view": [
    "manage_reports",
    "view_reports",
    "view_revenue_reports",
    "generate_financial_reports",
  ],
  "reports.export": ["manage_reports", "export_reports", "generate_financial_reports"],
  "notifications.view": [
    "manage_notifications",
    "view_notifications",
    "view_operational_data",
  ],
  "users.view": ["manage_users", "manage_staff"],
  "users.manageStaff": ["manage_staff"],
  "users.manageAll": ["manage_users"],
  "users.delete": ["manage_users"],
  "roles.manage": ["manage_roles"],
  "settings.full": ["manage_settings"],
  "settings.limited": ["view_limited_settings", "manage_pricing"],
  "integrations.manage": ["manage_integrations"],
  "audit.view": ["view_audit_logs", "view_operational_audit_logs"],
  "cms.full": ["manage_website"],
  "cms.limited": ["update_website_content", "manage_room_descriptions"],
  "cms.view": [
    "manage_website",
    "update_website_content",
    "manage_images",
    "manage_room_descriptions",
    "manage_facilities",
    "manage_blog_content",
    "manage_offers",
  ],
  "cms.create": [
    "manage_website",
    "update_website_content",
    "manage_images",
    "manage_offers",
    "manage_blog_content",
  ],
  "cms.edit": [
    "manage_website",
    "update_website_content",
    "manage_images",
    "manage_room_descriptions",
    "manage_facilities",
    "manage_offers",
    "manage_blog_content",
  ],
  "cms.delete": ["manage_website", "update_website_content"],
  "cms.upload": ["manage_website", "manage_images"],
  "cms.reorder": ["manage_website", "manage_images"],
  "cms.publish": ["manage_website", "update_website_content"],
  "cms.preview": ["manage_website", "update_website_content"],
};

export function canPerformAction(
  roleId: RoleId,
  action: AppAction,
  livePermissions?: Permission[],
): boolean {
  const required = actionPermissions[action];
  return hasAnyPermission(roleId, required, livePermissions);
}

export function getActionPermissions(action: AppAction): Permission[] {
  return actionPermissions[action];
}

export function isSuperAdmin(roleId: RoleId) {
  return roleId === "super_administrator";
}

export function isResortManager(roleId: RoleId) {
  return roleId === "resort_manager";
}

export function isFrontDesk(roleId: RoleId) {
  return roleId === "front_desk";
}

export function isHousekeeping(roleId: RoleId) {
  return roleId === "housekeeping";
}

export function isAccountant(roleId: RoleId) {
  return roleId === "accountant";
}

export function isWebsiteContentManager(roleId: RoleId) {
  return roleId === "website_content_manager";
}

export function canPerformActionOrSuper(
  roleId: RoleId,
  action: AppAction,
  livePermissions?: Permission[],
): boolean {
  if (isSuperAdmin(roleId)) return true;
  return canPerformAction(roleId, action, livePermissions);
}

/** Super Administrator quick actions for the system dashboard. */
export const superAdminQuickActions = [
  {
    label: "Users & roles",
    href: "/users",
    action: "users.view" as AppAction,
  },
  {
    label: "Reservations",
    href: "/reservations",
    action: "bookings.view" as AppAction,
  },
  {
    label: "Payments",
    href: "/payments",
    action: "payments.view" as AppAction,
  },
  {
    label: "Reports",
    href: "/reports",
    action: "reports.view" as AppAction,
  },
  {
    label: "Website CMS",
    href: "/website",
    action: "cms.full" as AppAction,
  },
  {
    label: "Settings",
    href: "/settings",
    action: "settings.full" as AppAction,
  },
] as const;

/** Resort Manager quick actions for the management dashboard. */
export const resortManagerQuickActions = [
  {
    label: "New booking",
    href: "/reservations",
    action: "bookings.create" as AppAction,
  },
  {
    label: "Today's check-ins",
    href: "/check-in",
    action: "checkin.manage" as AppAction,
  },
  {
    label: "Today's check-outs",
    href: "/check-out",
    action: "checkout.manage" as AppAction,
  },
  {
    label: "Room status",
    href: "/rooms",
    action: "rooms.view" as AppAction,
  },
  {
    label: "Housekeeping",
    href: "/housekeeping",
    action: "housekeeping.view" as AppAction,
  },
  {
    label: "View reports",
    href: "/reports",
    action: "reports.view" as AppAction,
  },
] as const;

/** Front Desk quick actions for the reception dashboard. */
export const frontDeskQuickActions = [
  {
    label: "New booking",
    href: "/reservations",
    action: "bookings.create" as AppAction,
  },
  {
    label: "Today's check-ins",
    href: "/check-in",
    action: "checkin.manage" as AppAction,
  },
  {
    label: "Today's check-outs",
    href: "/check-out",
    action: "checkout.manage" as AppAction,
  },
  {
    label: "Find guest",
    href: "/guests",
    action: "guests.view" as AppAction,
  },
  {
    label: "Record payment",
    href: "/payments",
    action: "payments.record" as AppAction,
  },
  {
    label: "Room calendar",
    href: "/calendar",
    action: "calendar.view" as AppAction,
  },
] as const;

/** Accountant / Finance quick actions for the finance dashboard. */
export const financeQuickActions = [
  {
    label: "Payments",
    href: "/payments",
    action: "payments.view" as AppAction,
  },
  {
    label: "Invoices",
    href: "/invoices",
    action: "invoices.view" as AppAction,
  },
  {
    label: "Refunds",
    href: "/refunds",
    action: "payments.refund" as AppAction,
  },
  {
    label: "Financial reports",
    href: "/financial-reports",
    action: "reports.view" as AppAction,
  },
  {
    label: "Export payments",
    href: "/payments",
    action: "payments.export" as AppAction,
  },
] as const;

/** Housekeeping quick navigation for the operations dashboard. */
export const housekeepingQuickActions = [
  {
    label: "My rooms",
    href: "/my-rooms",
    action: "housekeeping.view" as AppAction,
  },
  {
    label: "Cleaning tasks",
    href: "/cleaning-tasks",
    action: "housekeeping.view" as AppAction,
  },
  {
    label: "Room status",
    href: "/room-status",
    action: "housekeeping.view" as AppAction,
  },
  {
    label: "Maintenance issues",
    href: "/maintenance-issues",
    action: "housekeeping.reportIssue" as AppAction,
  },
] as const;

/** Website Content Manager quick actions for the CMS dashboard. */
export const cmsContentManagerQuickActions = [
  {
    label: "Edit homepage",
    href: "/website/homepage",
    action: "cms.edit" as AppAction,
  },
  {
    label: "Room content",
    href: "/website/rooms",
    action: "cms.view" as AppAction,
  },
  {
    label: "Upload gallery",
    href: "/website/gallery",
    action: "cms.upload" as AppAction,
  },
  {
    label: "Manage offers",
    href: "/website/offers",
    action: "cms.edit" as AppAction,
  },
  {
    label: "Testimonials",
    href: "/website/testimonials",
    action: "cms.view" as AppAction,
  },
  {
    label: "FAQs & contact",
    href: "/website/faqs",
    action: "cms.view" as AppAction,
  },
] as const;
