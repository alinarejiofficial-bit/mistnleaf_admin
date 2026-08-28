import type { RoleId } from "@/lib/roles";

/** Standard module actions used in the role permission matrix UI. */
export type MatrixAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "cancel"
  | "refund"
  | "manage"
  | "publish"
  | "unpublish";

export type MatrixModule =
  | "Dashboard"
  | "Reservations"
  | "Booking Calendar"
  | "Enquiries"
  | "Rooms"
  | "Guests"
  | "Check-in"
  | "Check-out"
  | "Housekeeping"
  | "Maintenance"
  | "Payments"
  | "Invoices"
  | "Refunds"
  | "Pricing"
  | "Offers"
  | "Add-ons"
  | "Reports & Analytics"
  | "Notifications"
  | "Website CMS"
  | "Users"
  | "Roles & Permissions"
  | "Audit Logs"
  | "System Settings"
  | "Integrations";

export type ModulePermissionRow = {
  module: MatrixModule;
  actions: Partial<Record<MatrixAction, boolean>>;
};

export const matrixActionColumns: MatrixAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "cancel",
  "refund",
  "manage",
  "publish",
  "unpublish",
];

export const matrixActionLabels: Record<MatrixAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  approve: "Approve",
  cancel: "Cancel",
  refund: "Refund",
  manage: "Manage",
  publish: "Publish",
  unpublish: "Unpublish",
};

function row(
  module: MatrixModule,
  actions: Partial<Record<MatrixAction, boolean>>,
): ModulePermissionRow {
  return { module, actions };
}

const none = {} as const;

/** role → permissions → modules → actions */
export const rolePermissionMatrix: Record<RoleId, ModulePermissionRow[]> = {
  super_administrator: [
    row("Dashboard", { view: true, manage: true }),
    row("Reservations", { view: true, create: true, edit: true, delete: true, approve: true, cancel: true, manage: true }),
    row("Booking Calendar", { view: true, create: true, edit: true, manage: true }),
    row("Enquiries", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Rooms", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Guests", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Check-in", { view: true, create: true, edit: true, manage: true }),
    row("Check-out", { view: true, create: true, edit: true, manage: true }),
    row("Housekeeping", { view: true, create: true, edit: true, delete: true, manage: true, approve: true }),
    row("Maintenance", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Payments", { view: true, create: true, edit: true, delete: true, approve: true, refund: true, manage: true }),
    row("Invoices", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Refunds", { view: true, create: true, edit: true, approve: true, refund: true, manage: true }),
    row("Pricing", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Offers", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Add-ons", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Reports & Analytics", { view: true, create: true, edit: true, manage: true }),
    row("Notifications", { view: true, create: true, edit: true, manage: true }),
    row("Website CMS", { view: true, create: true, edit: true, delete: true, publish: true, unpublish: true, approve: true, manage: true }),
    row("Users", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Roles & Permissions", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Audit Logs", { view: true, manage: true }),
    row("System Settings", { view: true, create: true, edit: true, delete: true, manage: true }),
    row("Integrations", { view: true, create: true, edit: true, delete: true, manage: true }),
  ],
  resort_manager: [
    row("Dashboard", { view: true, manage: true }),
    row("Reservations", { view: true, create: true, edit: true, approve: true, cancel: true }),
    row("Booking Calendar", { view: true, create: true, edit: true }),
    row("Enquiries", { view: true, create: true, edit: true }),
    row("Rooms", { view: true, create: true, edit: true }),
    row("Guests", { view: true, create: true, edit: true }),
    row("Check-in", { view: true, create: true, edit: true, manage: true }),
    row("Check-out", { view: true, create: true, edit: true, manage: true }),
    row("Housekeeping", { view: true, edit: true, manage: true, approve: true }),
    row("Maintenance", { view: true, edit: true, manage: true }),
    row("Payments", { view: true, create: true, edit: true, approve: true }),
    row("Invoices", { view: true, create: true, edit: true }),
    row("Refunds", { view: true }),
    row("Pricing", { view: true, create: true, edit: true, manage: true }),
    row("Offers", { view: true, create: true, edit: true, manage: true }),
    row("Add-ons", { view: true, create: true, edit: true, manage: true }),
    row("Reports & Analytics", { view: true, manage: true }),
    row("Notifications", { view: true }),
    row("Website CMS", { view: true, edit: true }),
    row("Users", { view: true, create: true, edit: true }),
    row("Roles & Permissions", none),
    row("Audit Logs", { view: true }),
    row("System Settings", { view: true, edit: true }),
    row("Integrations", none),
  ],
  front_desk: [
    row("Dashboard", { view: true }),
    row("Reservations", { view: true, create: true, edit: true, approve: true, cancel: true }),
    row("Booking Calendar", { view: true, edit: true }),
    row("Enquiries", { view: true, edit: true }),
    row("Rooms", { view: true }),
    row("Guests", { view: true, create: true, edit: true }),
    row("Check-in", { view: true, create: true, edit: true, manage: true }),
    row("Check-out", { view: true, create: true, edit: true, manage: true }),
    row("Housekeeping", none),
    row("Maintenance", none),
    row("Payments", { view: true, create: true, edit: true }),
    row("Invoices", { view: true, create: true, edit: true }),
    row("Refunds", none),
    row("Pricing", none),
    row("Offers", none),
    row("Add-ons", none),
    row("Reports & Analytics", none),
    row("Notifications", { view: true }),
    row("Website CMS", none),
    row("Users", none),
    row("Roles & Permissions", none),
    row("Audit Logs", none),
    row("System Settings", none),
    row("Integrations", none),
  ],
  housekeeping: [
    row("Dashboard", { view: true }),
    row("Reservations", none),
    row("Booking Calendar", none),
    row("Enquiries", none),
    row("Rooms", none),
    row("Guests", none),
    row("Check-in", none),
    row("Check-out", none),
    row("Housekeeping", { view: true, edit: true }),
    row("Maintenance", { view: true, create: true }),
    row("Payments", none),
    row("Invoices", none),
    row("Refunds", none),
    row("Pricing", none),
    row("Offers", none),
    row("Add-ons", none),
    row("Reports & Analytics", none),
    row("Notifications", { view: true }),
    row("Website CMS", none),
    row("Users", none),
    row("Roles & Permissions", none),
    row("Audit Logs", none),
    row("System Settings", none),
    row("Integrations", none),
  ],
  accountant: [
    row("Dashboard", { view: true }),
    row("Reservations", none),
    row("Booking Calendar", none),
    row("Enquiries", none),
    row("Rooms", none),
    row("Guests", none),
    row("Check-in", none),
    row("Check-out", none),
    row("Housekeeping", none),
    row("Maintenance", none),
    row("Payments", { view: true, create: true, edit: true }),
    row("Invoices", { view: true, create: true, edit: true }),
    row("Refunds", { view: true, refund: true, approve: true }),
    row("Pricing", none),
    row("Offers", none),
    row("Add-ons", none),
    row("Reports & Analytics", { view: true, manage: true }),
    row("Notifications", { view: true }),
    row("Website CMS", none),
    row("Users", none),
    row("Roles & Permissions", none),
    row("Audit Logs", none),
    row("System Settings", none),
    row("Integrations", none),
  ],
  website_content_manager: [
    row("Dashboard", { view: true }),
    row("Reservations", none),
    row("Booking Calendar", none),
    row("Enquiries", none),
    row("Rooms", none),
    row("Guests", none),
    row("Check-in", none),
    row("Check-out", none),
    row("Housekeeping", none),
    row("Maintenance", none),
    row("Payments", none),
    row("Invoices", none),
    row("Refunds", none),
    row("Pricing", none),
    row("Offers", none),
    row("Add-ons", none),
    row("Reports & Analytics", none),
    row("Notifications", { view: true }),
    row("Website CMS", { view: true, create: true, edit: true, delete: true, publish: true, unpublish: true, approve: true }),
    row("Users", none),
    row("Roles & Permissions", none),
    row("Audit Logs", none),
    row("System Settings", none),
    row("Integrations", none),
  ],
};

export function getMatrixForRole(roleId: RoleId): ModulePermissionRow[] {
  return rolePermissionMatrix[roleId];
}

export function getAccessibleModules(roleId: RoleId): MatrixModule[] {
  return rolePermissionMatrix[roleId]
    .filter((entry) => entry.actions.view === true)
    .map((entry) => entry.module);
}

export function hasMatrixAction(
  roleId: RoleId,
  module: MatrixModule,
  action: MatrixAction,
): boolean {
  const entry = rolePermissionMatrix[roleId].find((r) => r.module === module);
  return entry?.actions[action] === true;
}
