import type { Guest } from "@/lib/ops-data";

export const OPS_GUESTS_STORAGE_KEY = "mistnleaf_ops_guest_overrides";

export type GuestOverride = {
  id: string;
  /** Emails this override should match after bookings refresh / email edits. */
  matchEmails: string[];
  name: string;
  email: string;
  phone: string;
  nationality: string;
  status: Guest["status"];
  notes?: string;
};

export function loadLocalGuestOverrides(): GuestOverride[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OPS_GUESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestOverride[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalGuestOverrides(overrides: GuestOverride[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OPS_GUESTS_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // ignore quota errors
  }
}

export function guestOverrideFromGuest(
  guest: Guest,
  previous?: Guest | null,
): GuestOverride {
  const emails = new Set<string>();
  if (previous?.email) emails.add(previous.email.trim().toLowerCase());
  if (guest.email) emails.add(guest.email.trim().toLowerCase());
  return {
    id: previous?.id ?? guest.id,
    matchEmails: Array.from(emails),
    name: guest.name.trim(),
    email: guest.email.trim(),
    phone: guest.phone.trim(),
    nationality: guest.nationality.trim(),
    status: guest.status,
    notes: guest.notes?.trim() || undefined,
  };
}

export function upsertGuestOverride(
  overrides: GuestOverride[],
  next: GuestOverride,
): GuestOverride[] {
  const matchKeys = new Set([
    next.id,
    ...next.matchEmails.map((email) => email.toLowerCase()),
  ]);
  const filtered = overrides.filter((item) => {
    if (matchKeys.has(item.id)) return false;
    return !item.matchEmails.some((email) => matchKeys.has(email.toLowerCase()));
  });
  return [...filtered, next];
}

export function applyGuestOverrides(
  guests: Guest[],
  overrides: GuestOverride[],
): Guest[] {
  if (!overrides.length) return guests;
  return guests.map((guest) => {
    const emailKey = guest.email.trim().toLowerCase();
    const override = overrides.find(
      (item) =>
        item.id === guest.id ||
        item.matchEmails.some((email) => email.toLowerCase() === emailKey),
    );
    if (!override) return guest;
    return {
      ...guest,
      id: override.id,
      name: override.name,
      email: override.email,
      phone: override.phone,
      nationality: override.nationality,
      status: override.status,
      notes: override.notes,
    };
  });
}
