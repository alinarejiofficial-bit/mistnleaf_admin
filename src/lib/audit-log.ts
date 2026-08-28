import type { RoleId } from "@/lib/roles";

export type AuditLogEntry = {
  id: string;
  user: string;
  role: string;
  roleId: RoleId;
  action: string;
  module: string;
  detail: string;
  previousValue?: string;
  newValue?: string;
  at: string;
};

export const AUDIT_STORAGE_KEY = "mistnleaf_audit_logs_v1";

const seedAuditEntries: AuditLogEntry[] = [
  {
    id: "AUD-101",
    action: "Booking confirmed",
    user: "Neha Kapoor",
    role: "Resort Manager",
    roleId: "resort_manager",
    module: "Reservations",
    detail: "RSV-2041 · Ananya Sharma",
    previousValue: "Pending",
    newValue: "Confirmed",
    at: "2026-08-20 09:14",
  },
  {
    id: "AUD-102",
    action: "Room status updated",
    user: "Sofia Fernandes",
    role: "Housekeeping Staff",
    roleId: "housekeeping",
    module: "Housekeeping",
    detail: "Leaf Suite 03 → Cleaning in Progress",
    previousValue: "Cleaning Required",
    newValue: "Cleaning in Progress",
    at: "2026-08-20 08:42",
  },
  {
    id: "AUD-103",
    action: "Payment recorded",
    user: "Arjun Patel",
    role: "Front Desk / Reception",
    roleId: "front_desk",
    module: "Payments",
    detail: "₹18,600 · Walk-in guest",
    previousValue: "Pending",
    newValue: "Success",
    at: "2026-08-20 08:05",
  },
  {
    id: "AUD-104",
    action: "Maintenance ticket opened",
    user: "Neha Kapoor",
    role: "Resort Manager",
    roleId: "resort_manager",
    module: "Maintenance",
    detail: "Canopy King 10 · AC compressor",
    at: "2026-08-19 17:30",
  },
  {
    id: "AUD-105",
    action: "Offer activated",
    user: "Neha Kapoor",
    role: "Resort Manager",
    roleId: "resort_manager",
    module: "Offers",
    detail: "Monsoon Escape · MIST20",
    previousValue: "Scheduled",
    newValue: "Active",
    at: "2026-08-19 11:20",
  },
];

function formatAuditTimestamp(date = new Date()) {
  const iso = date.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

export function loadAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return seedAuditEntries;
  try {
    const raw = window.localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(seedAuditEntries));
      return seedAuditEntries;
    }
    const parsed = JSON.parse(raw) as AuditLogEntry[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedAuditEntries;
  } catch {
    return seedAuditEntries;
  }
}

export function saveAuditLogs(entries: AuditLogEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(entries.slice(0, 200)));
}

export function appendAuditLog(
  entries: AuditLogEntry[],
  input: Omit<AuditLogEntry, "id" | "at"> & { at?: string },
): AuditLogEntry[] {
  const entry: AuditLogEntry = {
    ...input,
    id: `AUD-${Date.now().toString().slice(-6)}`,
    at: input.at ?? formatAuditTimestamp(),
  };
  return [entry, ...entries];
}

export type AuditActor = {
  name: string;
  roleId: RoleId;
  roleName: string;
};

export function recordAudit(
  entries: AuditLogEntry[],
  actor: AuditActor,
  input: {
    action: string;
    module: string;
    detail: string;
    previousValue?: string;
    newValue?: string;
  },
): AuditLogEntry[] {
  return appendAuditLog(entries, {
    user: actor.name,
    role: actor.roleName,
    roleId: actor.roleId,
    ...input,
  });
}
