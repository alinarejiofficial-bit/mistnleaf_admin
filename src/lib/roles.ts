export type Permission =
  | "manage_settings"
  | "manage_users"
  | "manage_roles"
  | "manage_integrations"
  | "view_audit_logs"
  | "manage_rooms"
  | "manage_bookings"
  | "cancel_bookings"
  | "confirm_bookings"
  | "assign_rooms"
  | "export_bookings"
  | "export_payments"
  | "export_reports"
  | "record_operational_payments"
  | "update_maintenance_status"
  | "manage_calendar"
  | "manage_guests"
  | "manage_payments"
  | "manage_reports"
  | "manage_website"
  | "manage_pricing"
  | "manage_offers"
  | "manage_addons"
  | "manage_notifications"
  | "manage_enquiries"
  | "manage_housekeeping"
  | "manage_maintenance"
  | "monitor_maintenance"
  | "view_notifications"
  | "manage_staff"
  | "view_operational_audit_logs"
  | "view_limited_settings"
  | "view_operational_data"
  | "view_dashboard"
  | "manage_check_in_out"
  | "view_revenue"
  | "view_reports"
  | "monitor_housekeeping"
  | "create_bookings"
  | "modify_bookings"
  | "view_availability"
  | "register_guests"
  | "check_guests_in"
  | "check_guests_out"
  | "record_payments"
  | "generate_invoices"
  | "download_invoices"
  | "view_room_status"
  | "view_assigned_rooms"
  | "view_rooms_requiring_cleaning"
  | "update_cleaning_status"
  | "mark_rooms_ready"
  | "report_maintenance_issues"
  | "view_payments"
  | "record_offline_payments"
  | "manage_invoices"
  | "view_revenue_reports"
  | "view_outstanding_balances"
  | "generate_financial_reports"
  | "update_website_content"
  | "manage_images"
  | "manage_room_descriptions"
  | "manage_facilities"
  | "manage_blog_content";

export type RoleId =
  | "super_administrator"
  | "resort_manager"
  | "front_desk"
  | "housekeeping"
  | "accountant"
  | "website_content_manager";

export type Role = {
  id: RoleId;
  name: string;
  description: string;
  note?: string;
  permissions: Permission[];
};

export const permissionLabels: Record<Permission, string> = {
  manage_settings: "Full system settings access",
  manage_users: "Create, edit, deactivate users",
  manage_roles: "Create and manage roles & permissions",
  manage_integrations: "Manage third-party integrations",
  view_audit_logs: "View complete audit history",
  manage_rooms: "Create, edit, manage room availability & status",
  manage_bookings: "View, create, edit, and manage bookings",
  cancel_bookings: "Cancel reservations",
  confirm_bookings: "Confirm reservations",
  assign_rooms: "Assign rooms to bookings",
  export_bookings: "Export booking data",
  export_payments: "Export payment information",
  export_reports: "Export reports",
  record_operational_payments: "Record operational payments",
  update_maintenance_status: "Update maintenance status",
  manage_calendar: "Full booking calendar access",
  manage_guests: "Full guest management",
  manage_payments: "View and manage payments",
  manage_reports: "Full reports & analytics access",
  manage_website: "Full website CMS access",
  manage_pricing: "Manage all pricing",
  manage_offers: "Create, edit, activate/deactivate offers",
  manage_addons: "Full add-ons management",
  manage_notifications: "Full notifications access",
  manage_enquiries: "Manage guest enquiries",
  manage_housekeeping: "View and manage housekeeping",
  manage_maintenance: "View and manage maintenance",
  monitor_maintenance: "View and monitor maintenance issues",
  view_notifications: "View operational notifications",
  manage_staff: "Manage operational staff accounts",
  view_operational_audit_logs: "View relevant operational activity",
  view_limited_settings: "Limited property settings access",
  view_operational_data: "View all operational data",
  view_dashboard: "Full dashboard access",
  manage_check_in_out: "Full check-in / check-out access",
  view_revenue: "View revenue data",
  view_reports: "View reports",
  monitor_housekeeping: "Monitor housekeeping operations",
  create_bookings: "Create bookings",
  modify_bookings: "Edit bookings",
  view_availability: "View room availability",
  register_guests: "Register guests",
  check_guests_in: "Check guests in",
  check_guests_out: "Check guests out",
  record_payments: "Record payments",
  generate_invoices: "Create invoices",
  download_invoices: "Download and print invoices",
  view_room_status: "View room status",
  view_assigned_rooms: "View assigned rooms",
  view_rooms_requiring_cleaning: "View rooms requiring cleaning",
  update_cleaning_status: "Update cleaning status",
  mark_rooms_ready: "Mark rooms as ready",
  report_maintenance_issues: "Report maintenance issues",
  view_payments: "View payments",
  record_offline_payments: "Record offline payments",
  manage_invoices: "Manage invoices",
  view_revenue_reports: "View revenue reports",
  view_outstanding_balances: "View outstanding balances",
  generate_financial_reports: "Generate financial reports",
  update_website_content: "Update website content",
  manage_images: "Manage images",
  manage_room_descriptions: "Manage room descriptions",
  manage_facilities: "Manage facilities",
  manage_blog_content: "Manage blog/content sections",
};

/** Super Administrator module access matrix. */
export const superAdminModuleAccess: { module: string; access: string }[] = [
  { module: "Dashboard", access: "Full access" },
  { module: "Reservations / Bookings", access: "View, create, edit, cancel, manage" },
  { module: "Booking Calendar", access: "Full access" },
  { module: "Rooms & Room Types", access: "Create, edit, manage availability/status" },
  { module: "Guests", access: "Full guest management" },
  { module: "Check-in / Check-out", access: "Full access" },
  { module: "Housekeeping", access: "View and manage" },
  { module: "Maintenance", access: "View and manage" },
  { module: "Payments", access: "View and manage" },
  { module: "Invoices", access: "Create, view, download/print" },
  { module: "Pricing", access: "Manage all pricing" },
  { module: "Offers", access: "Create, edit, activate/deactivate" },
  { module: "Add-ons", access: "Full management" },
  { module: "Reports & Analytics", access: "Full access" },
  { module: "Notifications", access: "Full access" },
  { module: "Website CMS", access: "Full content management" },
  { module: "Users", access: "Create, edit, deactivate/manage users" },
  { module: "Roles & Permissions", access: "Create/manage roles and permissions" },
  { module: "Audit Logs", access: "View complete audit history" },
  { module: "System Settings", access: "Full access" },
  { module: "Integrations", access: "Manage integrations" },
];

/** Resort Manager module access matrix. */
export const resortManagerModuleAccess: { module: string; access: string }[] = [
  {
    module: "Dashboard",
    access: "Operational KPIs, occupancy, check-ins/outs, revenue, quick actions",
  },
  {
    module: "Reservations",
    access: "View, create, edit, confirm, cancel, assign rooms, export",
  },
  {
    module: "Booking Calendar",
    access: "Availability, allocations, conflicts, filters",
  },
  { module: "Enquiries", access: "View, create, update, follow up, convert to bookings" },
  {
    module: "Rooms & Room Types",
    access: "View, add, edit, update status, availability, amenities",
  },
  {
    module: "Guests",
    access: "Profiles, booking & payment history, preferences and notes",
  },
  { module: "Check-in / Check-out", access: "Full operational access" },
  {
    module: "Housekeeping",
    access: "View status, monitor cleaning, assign/update tasks, readiness",
  },
  {
    module: "Maintenance",
    access: "View issues, assign/monitor tasks, update status, resolution notes",
  },
  {
    module: "Payments & Invoices",
    access: "View records, record operational payments, generate/view invoices, export",
  },
  {
    module: "Pricing, Offers & Add-ons",
    access: "Manage pricing, offers, activate/deactivate, add-ons",
  },
  {
    module: "Reports & Analytics",
    access: "Booking, occupancy, revenue, guest, housekeeping reports with export",
  },
  { module: "Notifications", access: "Operational alerts for all resort events" },
  { module: "Users", access: "View staff, limited management — no Super Admin control" },
  { module: "Roles & Permissions", access: "No access" },
  { module: "System Settings", access: "Limited operational settings only" },
  { module: "Integrations", access: "No access" },
  { module: "Audit Logs", access: "View operational activity — read only" },
  { module: "Website CMS", access: "Only assigned content sections if permitted" },
];

export const allPermissions: Permission[] = Object.keys(
  permissionLabels,
) as Permission[];

export const frontDeskPermissions: Permission[] = [
  "view_dashboard",
  "create_bookings",
  "modify_bookings",
  "cancel_bookings",
  "confirm_bookings",
  "assign_rooms",
  "view_availability",
  "manage_calendar",
  "manage_guests",
  "register_guests",
  "manage_check_in_out",
  "check_guests_in",
  "check_guests_out",
  "view_payments",
  "record_payments",
  "record_offline_payments",
  "view_outstanding_balances",
  "manage_invoices",
  "generate_invoices",
  "download_invoices",
  "manage_enquiries",
  "view_notifications",
  "view_room_status",
];

/** Front Desk / Reception module access matrix. */
export const frontDeskModuleAccess: { module: string; access: string }[] = [
  {
    module: "Dashboard",
    access: "Check-ins/outs, current guests, pending reservations, room availability, quick actions",
  },
  {
    module: "Reservations / Bookings",
    access: "View, search, create, edit, confirm, cancel, assign rooms, check-in/out actions",
  },
  {
    module: "Booking Calendar",
    access: "Availability, reservations by date, conflicts, assign rooms, filters",
  },
  { module: "Enquiries", access: "View and follow up on inbound booking requests" },
  {
    module: "Guests",
    access: "Profiles, booking & payment history, preferences and notes",
  },
  { module: "Check-in", access: "Arrivals, verify guest, payment check, assign room, confirm" },
  {
    module: "Check-out",
    access: "Departures, folio review, final payment, invoice, auto cleaning queue",
  },
  {
    module: "Payments",
    access: "View records, record permitted payments, transaction details",
  },
  {
    module: "Invoices",
    access: "View, generate, download/print invoice PDFs",
  },
  { module: "Notifications", access: "Operational booking, payment and arrival alerts" },
  { module: "Profile", access: "View own account details" },
  { module: "Users", access: "No access" },
  { module: "Roles & Permissions", access: "No access" },
  { module: "Audit Logs", access: "No access" },
  { module: "System Settings", access: "No access" },
  { module: "Integrations", access: "No access" },
  { module: "Pricing", access: "No access" },
  { module: "Website CMS", access: "No access" },
  { module: "Reports & Analytics", access: "No access" },
  { module: "Housekeeping", access: "No access" },
  { module: "Maintenance", access: "No access" },
];

export const housekeepingPermissions: Permission[] = [
  "view_dashboard",
  "view_assigned_rooms",
  "view_rooms_requiring_cleaning",
  "update_cleaning_status",
  "mark_rooms_ready",
  "report_maintenance_issues",
  "view_notifications",
];

/** Housekeeping Staff module access matrix. */
export const housekeepingModuleAccess: { module: string; access: string }[] = [
  { module: "Dashboard", access: "Summary cards, assigned rooms, status groups, quick actions" },
  { module: "My Rooms", access: "View and update assigned room cleaning status" },
  { module: "Cleaning Tasks", access: "Active tasks requiring attention" },
  { module: "Room Status", access: "Rooms grouped by cleaning workflow stage" },
  { module: "Maintenance Issues", access: "Report plumbing, electrical, AC, furniture issues" },
  { module: "Notifications", access: "Operational alerts for assigned rooms" },
  { module: "Profile", access: "View own account details" },
  { module: "Revenue / Analytics", access: "No access" },
  { module: "Bookings / Guests", access: "No access" },
  { module: "Payments / Invoices", access: "No access" },
  { module: "Users / Settings / CMS", access: "No access" },
];

export const accountantPermissions: Permission[] = [
  "view_dashboard",
  "view_payments",
  "record_offline_payments",
  "manage_invoices",
  "download_invoices",
  "view_revenue",
  "view_revenue_reports",
  "view_outstanding_balances",
  "generate_financial_reports",
  "export_payments",
  "export_reports",
  "view_notifications",
];

/** Accountant / Finance User module access matrix. */
export const accountantModuleAccess: { module: string; access: string }[] = [
  {
    module: "Finance Dashboard",
    access: "Revenue KPIs, pending/partial payments, outstanding balances, recent transactions",
  },
  { module: "Payments", access: "View, search, filter, record permitted payments, export" },
  {
    module: "Invoices",
    access: "View, search, generate, download/print, full folio details",
  },
  { module: "Refunds", access: "View refund queue and process permitted refunds" },
  {
    module: "Financial Reports",
    access: "Revenue, payment method, outstanding and status reports with export",
  },
  { module: "Notifications", access: "Payment and finance operational alerts" },
  { module: "Profile", access: "View own account details" },
  { module: "Users / Roles / Settings", access: "No access" },
  { module: "Website CMS", access: "No access" },
  { module: "Rooms / Housekeeping / Maintenance", access: "No access" },
  { module: "Pricing / Operations", access: "No access" },
];

export const websiteContentManagerPermissions: Permission[] = [
  "view_dashboard",
  "view_notifications",
  "manage_website",
  "update_website_content",
  "manage_images",
  "manage_room_descriptions",
  "manage_facilities",
  "manage_offers",
  "manage_blog_content",
];

export const websiteContentManagerModuleAccess: { module: string; access: string }[] = [
  {
    module: "Dashboard",
    access: "CMS overview with published/draft counts and quick links to sections",
  },
  {
    module: "Homepage",
    access: "Headline, intro, hero media, featured rooms/offers, experiences, preview",
  },
  {
    module: "Room content",
    access: "Descriptions, images, amenities, capacity; publish/unpublish",
  },
  {
    module: "Gallery",
    access: "Upload, categorize, reorder, delete; preview; publish/unpublish",
  },
  {
    module: "Offers",
    access: "Create, edit, activate/deactivate website offers",
  },
  {
    module: "Testimonials",
    access: "Add, edit, remove; publish/unpublish",
  },
  { module: "FAQs", access: "Add, edit, delete, reorder; publish/unpublish" },
  {
    module: "Contact information",
    access: "Phone, email, address, guest notes; publish/unpublish",
  },
  {
    module: "Notifications",
    access:
      "Content updates, new content requests, approvals, publishing, media/assets, offers & testimonials, and CMS permission alerts only",
  },
  { module: "Profile", access: "View own account details" },
  {
    module: "Bookings / Operations / Finance / Admin",
    access: "No access",
  },
];

/** Super Administrator — every permission in the system. */
export const superAdministratorPermissions: Permission[] = [...allPermissions];

export const resortManagerPermissions: Permission[] = [
  "view_dashboard",
  "view_operational_data",
  "view_revenue",
  "manage_bookings",
  "create_bookings",
  "modify_bookings",
  "cancel_bookings",
  "confirm_bookings",
  "assign_rooms",
  "export_bookings",
  "manage_calendar",
  "view_availability",
  "manage_rooms",
  "view_room_status",
  "manage_pricing",
  "manage_room_descriptions",
  "manage_guests",
  "register_guests",
  "manage_check_in_out",
  "check_guests_in",
  "check_guests_out",
  "monitor_housekeeping",
  "manage_housekeeping",
  "update_cleaning_status",
  "mark_rooms_ready",
  "monitor_maintenance",
  "update_maintenance_status",
  "report_maintenance_issues",
  "view_payments",
  "record_operational_payments",
  "view_outstanding_balances",
  "generate_invoices",
  "export_payments",
  "manage_offers",
  "manage_addons",
  "manage_reports",
  "view_reports",
  "view_revenue_reports",
  "generate_financial_reports",
  "export_reports",
  "view_notifications",
  "manage_enquiries",
  "manage_staff",
  "view_operational_audit_logs",
  "view_limited_settings",
];

/** Roles a Resort Manager may assign — excludes Super Administrator. */
export const resortManagerAssignableRoleIds: RoleId[] = [
  "resort_manager",
  "front_desk",
  "housekeeping",
  "accountant",
  "website_content_manager",
];

export const roles: Role[] = [
  {
    id: "super_administrator",
    name: "Super Administrator",
    description:
      "Highest-level system role with complete control over users, roles, permissions, operations, CMS, reports, audit logs, and system settings.",
    note: "This role is locked. Super Administrator permissions cannot be modified, and lower-level roles cannot change Super Administrator accounts.",
    permissions: superAdministratorPermissions,
  },
  {
    id: "resort_manager",
    name: "Resort Manager",
    description: "Management-level operational access across the property.",
    note: "System administration, roles, integrations, and critical settings remain with Super Administrator.",
    permissions: resortManagerPermissions,
  },
  {
    id: "front_desk",
    name: "Front Desk / Reception",
    description: "Guest-facing reception focused on bookings, guests, check-in/out, payments and invoices.",
    note: "No access to users, settings, pricing, reports, housekeeping, maintenance, or CMS administration.",
    permissions: frontDeskPermissions,
  },
  {
    id: "housekeeping",
    name: "Housekeeping Staff",
    description: "Assigned room cleaning, status updates, readiness, and maintenance reporting.",
    note: "No access to bookings, payments, revenue, or management administration.",
    permissions: housekeepingPermissions,
  },
  {
    id: "accountant",
    name: "Accountant / Finance User",
    description: "Payments, invoices, and financial reporting across the property.",
    note: "No access to resort operations, room management, users, settings, or CMS administration.",
    permissions: accountantPermissions,
  },
  {
    id: "website_content_manager",
    name: "Website Content Manager",
    description: "Website content and digital assets for the public MistnLeaf site.",
    note: "No access to bookings, operations, finance, users, settings, or system administration.",
    permissions: websiteContentManagerPermissions,
  },
];

export function getRole(id: RoleId) {
  return roles.find((role) => role.id === id);
}

export function hasPermission(roleId: RoleId, permission: Permission, livePermissions?: Permission[]) {
  if (roleId === "super_administrator") return true;
  // Empty arrays are treated as "unset" so a failed directory sync cannot lock users out.
  if (livePermissions && livePermissions.length > 0) {
    return livePermissions.includes(permission);
  }
  return getRole(roleId)?.permissions.includes(permission) ?? false;
}

export function hasAnyPermission(roleId: RoleId, permissions: Permission[], livePermissions?: Permission[]) {
  return permissions.some((permission) => hasPermission(roleId, permission, livePermissions));
}

export const LOCKED_ROLE_ID: RoleId = "super_administrator";

export const SYSTEM_LEVEL_PERMISSIONS: Permission[] = [
  "manage_settings",
  "manage_users",
  "manage_roles",
  "manage_integrations",
  "view_audit_logs",
];

export function isLockedRole(roleId: RoleId) {
  return roleId === LOCKED_ROLE_ID;
}

export function canMutateStaffUser(
  actor: { id: string; roleId: RoleId; permissions?: Permission[] },
  target: { id: string; roleId: RoleId },
) {
  if (actor.id === target.id) return false;
  if (
    isLockedRole(target.roleId) &&
    !hasPermission(actor.roleId, "manage_users", actor.permissions)
  ) {
    return false;
  }
  return (
    hasPermission(actor.roleId, "manage_users", actor.permissions) ||
    hasPermission(actor.roleId, "manage_staff", actor.permissions)
  );
}

export function canDeleteStaffUser(
  actor: { id: string; roleId: RoleId; permissions?: Permission[] },
  target: { id: string; roleId: RoleId },
) {
  return (
    hasPermission(actor.roleId, "manage_users", actor.permissions) &&
    canMutateStaffUser(actor, target)
  );
}

export function isLastActiveSuperAdministrator(
  users: { id: string; roleId: RoleId; status: string }[],
  targetId: string,
) {
  const active = users.filter(
    (user) => user.roleId === "super_administrator" && user.status !== "Disabled",
  );
  return active.length <= 1 && active.some((user) => user.id === targetId);
}

export function getAssignableRolesFor(
  roleId: RoleId,
  livePermissions?: Permission[],
): Role[] {
  if (hasPermission(roleId, "manage_users", livePermissions)) {
    return assignableRoles;
  }
  if (hasPermission(roleId, "manage_staff", livePermissions)) {
    return roles.filter((role) => resortManagerAssignableRoleIds.includes(role.id));
  }
  return [];
}

/** Roles a Super Administrator can assign when creating staff. */
export const assignableRoles: Role[] = roles;

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function createStaffUser(input: {
  name: string;
  email: string;
  roleId: RoleId;
  phone?: string;
}): StaffUser {
  const id = `USR-${Date.now().toString().slice(-6)}`;
  const today = new Date().toISOString().slice(0, 10);
  return {
    id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || undefined,
    department: getDepartmentForRole(input.roleId),
    initials: getInitials(input.name) || "U",
    roleId: input.roleId,
    status: "Invited",
    lastActive: "—",
    createdAt: today,
  };
}

export const roleBadgeClass: Record<RoleId, string> = {
  super_administrator: "bg-brand text-white",
  resort_manager: "bg-[#8f7350] text-white",
  front_desk: "bg-info text-white",
  housekeeping: "bg-success text-white",
  accountant: "bg-[#4a5d6a] text-white",
  website_content_manager: "bg-[#5c7a6e] text-white",
};

export const departmentByRole: Record<RoleId, string> = {
  super_administrator: "Administration",
  resort_manager: "Management",
  front_desk: "Front Office",
  housekeeping: "Housekeeping",
  accountant: "Finance",
  website_content_manager: "Marketing & CMS",
};

export function getDepartmentForRole(roleId: RoleId) {
  return departmentByRole[roleId];
}

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  initials: string;
  roleId: RoleId;
  status: "Active" | "Invited" | "Disabled";
  lastActive: string;
  createdAt: string;
  permissions?: Permission[];
};

export const currentUser: StaffUser = {
  id: "USR-001",
  name: "Admin",
  email: "admin@mistnleaf.com",
  phone: "+91 98765 43210",
  department: "Administration",
  initials: "SA",
  roleId: "super_administrator",
  status: "Active",
  lastActive: "Just now",
  createdAt: "2025-01-15",
};

export const staffUsers: StaffUser[] = [
  currentUser,
  {
    id: "USR-002",
    name: "Neha Kapoor",
    email: "neha@mistnleaf.com",
    phone: "+91 98765 43211",
    department: "Management",
    initials: "NK",
    roleId: "resort_manager",
    status: "Active",
    lastActive: "2 hours ago",
    createdAt: "2025-03-10",
  },
  {
    id: "USR-003",
    name: "Arjun Patel",
    email: "arjun@mistnleaf.com",
    phone: "+91 98765 43212",
    department: "Front Office",
    initials: "AP",
    roleId: "front_desk",
    status: "Active",
    lastActive: "Yesterday",
    createdAt: "2025-04-22",
  },
  {
    id: "USR-004",
    name: "Sofia Fernandes",
    email: "sofia@mistnleaf.com",
    phone: "+91 98765 43213",
    department: "Housekeeping",
    initials: "SF",
    roleId: "housekeeping",
    status: "Invited",
    lastActive: "—",
    createdAt: "2025-06-01",
  },
  {
    id: "USR-005",
    name: "Kavya Menon",
    email: "kavya@mistnleaf.com",
    phone: "+91 98765 43214",
    department: "Finance",
    initials: "KM",
    roleId: "accountant",
    status: "Active",
    lastActive: "4 hours ago",
    createdAt: "2025-05-18",
  },
  {
    id: "USR-006",
    name: "Ishaan Rao",
    email: "ishaan@mistnleaf.com",
    phone: "+91 98765 43215",
    department: "Marketing & CMS",
    initials: "IR",
    roleId: "website_content_manager",
    status: "Active",
    lastActive: "1 day ago",
    createdAt: "2025-07-08",
  },
];
