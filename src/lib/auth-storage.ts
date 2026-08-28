import {
  createStaffUser,
  getDepartmentForRole,
  staffUsers as seedUsers,
  type RoleId,
  type StaffUser,
} from "@/lib/roles";

export const USERS_STORAGE_KEY = "mistnleaf_staff_users_v1";
export const SESSION_STORAGE_KEY = "mistnleaf_session_v1";

export type AuthUser = StaffUser & {
  password: string;
};

const DEFAULT_PASSWORDS: Record<string, string> = {
  "admin@mistnleaf.com": "Admin@123",
  "neha@mistnleaf.com": "Staff@123",
  "arjun@mistnleaf.com": "Staff@123",
  "sofia@mistnleaf.com": "Staff@123",
  "kavya@mistnleaf.com": "Staff@123",
  "ishaan@mistnleaf.com": "Staff@123",
};

export function getSeedUsers(): AuthUser[] {
  return seedUsers.map((user) => ({
    ...user,
    email: user.email.toLowerCase(),
    password: DEFAULT_PASSWORDS[user.email.toLowerCase()] ?? "Staff@123",
  }));
}

function normalizeAuthUser(user: AuthUser): AuthUser {
  return {
    ...user,
    email: user.email.trim().toLowerCase(),
    department: user.department ?? getDepartmentForRole(user.roleId),
    createdAt: user.createdAt ?? "2025-01-01",
  };
}

const DEMO_EMAILS = new Set(Object.keys(DEFAULT_PASSWORDS));

export function isDemoAccountEmail(email: string) {
  return DEMO_EMAILS.has(email.trim().toLowerCase());
}

/** Ensures all seeded demo accounts exist and are login-ready. */
export function mergeWithSeedUsers(stored: AuthUser[]): AuthUser[] {
  const normalized = stored.map(normalizeAuthUser);
  const byEmail = new Map(normalized.map((user) => [user.email, user]));

  for (const seedUser of getSeedUsers()) {
    const existing = byEmail.get(seedUser.email);
    const defaultPassword = DEFAULT_PASSWORDS[seedUser.email];

    if (!existing) {
      byEmail.set(seedUser.email, seedUser);
      continue;
    }

    if (!defaultPassword) continue;

    // Always restore demo accounts so credentials stay predictable.
    byEmail.set(seedUser.email, {
      ...seedUser,
      id: existing.id,
      password: defaultPassword,
      status: seedUser.status,
    });
  }

  return Array.from(byEmail.values());
}

export function loadUsers(): AuthUser[] {
  if (typeof window === "undefined") return getSeedUsers();

  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const seeded = getSeedUsers();
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(raw) as AuthUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = getSeedUsers();
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const merged = mergeWithSeedUsers(parsed);
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return getSeedUsers();
  }
}

export function saveUsers(users: AuthUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function loadSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

export function saveSessionUserId(userId: string | null) {
  if (typeof window === "undefined") return;
  if (!userId) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, userId);
}

export function authenticateUser(
  users: AuthUser[],
  email: string,
  password: string,
): AuthUser | null {
  const normalized = email.trim().toLowerCase();
  const match = users.find(
    (user) => user.email.trim().toLowerCase() === normalized,
  );
  if (!match) return null;
  if (match.status === "Disabled") return null;
  if ((match.password ?? "").trim() !== password.trim()) return null;
  return match;
}

/** Load, repair demo accounts, and authenticate in one step. */
export function authenticateWithRepair(
  email: string,
  password: string,
): { user: AuthUser | null; users: AuthUser[] } {
  const users = loadUsers();
  const match = authenticateUser(users, email, password);
  if (match) return { user: match, users };

  if (!isDemoAccountEmail(email)) return { user: null, users };

  const repaired = mergeWithSeedUsers(users);
  saveUsers(repaired);
  return {
    user: authenticateUser(repaired, email, password),
    users: repaired,
  };
}

export function createAuthUser(input: {
  name: string;
  email: string;
  roleId: RoleId;
  password: string;
  phone?: string;
  department?: string;
}): AuthUser {
  const email = input.email.trim().toLowerCase();
  return {
    ...createStaffUser({
      name: input.name,
      email,
      roleId: input.roleId,
      phone: input.phone,
    }),
    department: input.department ?? getDepartmentForRole(input.roleId),
    email,
    password: input.password,
    status: "Active",
  };
}

export function toPublicUser(user: AuthUser): StaffUser {
  const { password: _password, ...rest } = user;
  return rest;
}
