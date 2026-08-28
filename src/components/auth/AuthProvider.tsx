"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  authenticateWithRepair,
  createAuthUser,
  loadSessionUserId,
  loadUsers,
  saveSessionUserId,
  saveUsers,
  type AuthUser,
} from "@/lib/auth-storage";
import {
  loadAuditLogs,
  recordAudit,
  saveAuditLogs,
  type AuditActor,
} from "@/lib/audit-log";
import {
  getDepartmentForRole,
  getRole,
  type RoleId,
  type StaffUser,
} from "@/lib/roles";

type AuthContextValue = {
  ready: boolean;
  users: AuthUser[];
  currentUser: AuthUser | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  addUser: (input: {
    name: string;
    email: string;
    roleId: RoleId;
    password: string;
    phone?: string;
    department?: string;
  }) => { ok: true; user: AuthUser } | { ok: false; error: string };
  updateUser: (
    userId: string,
    patch: Partial<Pick<StaffUser, "name" | "email" | "phone" | "roleId" | "status">>,
  ) => void;
  updateUserRole: (userId: string, roleId: RoleId) => void;
  toggleUserStatus: (userId: string) => void;
  setUserPassword: (userId: string, password: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  const writeAudit = useCallback(
    (
      actor: AuditActor | null,
      input: {
        action: string;
        module: string;
        detail: string;
        previousValue?: string;
        newValue?: string;
      },
    ) => {
      if (!actor) return;
      const next = recordAudit(loadAuditLogs(), actor, input);
      saveAuditLogs(next);
    },
    [],
  );

  useEffect(() => {
    const loadedUsers = loadUsers();
    const sessionId = loadSessionUserId();
    setUsers(loadedUsers);
    setSessionUserId(sessionId);
    setReady(true);
  }, []);

  const persistUsers = useCallback((next: AuthUser[]) => {
    setUsers(next);
    saveUsers(next);
  }, []);

  const currentUser = useMemo(
    () => users.find((user) => user.id === sessionUserId) ?? null,
    [users, sessionUserId],
  );

  const auditActor = useMemo((): AuditActor | null => {
    if (!currentUser) return null;
    const role = getRole(currentUser.roleId);
    return {
      name: currentUser.name,
      roleId: currentUser.roleId,
      roleName: role?.name ?? currentUser.roleId,
    };
  }, [currentUser]);

  const login = useCallback(
    (email: string, password: string) => {
      const { user: match, users: freshUsers } = authenticateWithRepair(
        email,
        password,
      );

      if (!match) {
        return {
          ok: false as const,
          error: "Invalid email or password, or account is disabled.",
        };
      }

      setUsers(freshUsers);
      const nextUsers = freshUsers.map((user) =>
        user.id === match.id
          ? { ...user, lastActive: "Just now", status: "Active" as const }
          : user,
      );
      persistUsers(nextUsers);
      setSessionUserId(match.id);
      saveSessionUserId(match.id);
      return { ok: true as const };
    },
    [persistUsers],
  );

  const logout = useCallback(() => {
    setSessionUserId(null);
    saveSessionUserId(null);
  }, []);

  const addUser = useCallback(
    (input: {
      name: string;
      email: string;
      roleId: RoleId;
      password: string;
      phone?: string;
      department?: string;
    }) => {
      const email = input.email.trim().toLowerCase();
      if (users.some((user) => user.email === email)) {
        return { ok: false as const, error: "A user with this email already exists." };
      }

      const user = createAuthUser({
        ...input,
        email,
        department: input.department ?? getDepartmentForRole(input.roleId),
      });
      persistUsers([user, ...users]);
      writeAudit(auditActor, {
        action: "User created",
        module: "Users",
        detail: `${user.name} · ${user.email}`,
        newValue: getRole(user.roleId)?.name ?? user.roleId,
      });
      return { ok: true as const, user };
    },
    [users, persistUsers, writeAudit, auditActor],
  );

  const updateUser = useCallback(
    (
      userId: string,
      patch: Partial<Pick<StaffUser, "name" | "email" | "phone" | "roleId" | "status">>,
    ) => {
      const existing = users.find((user) => user.id === userId);
      if (!existing) return;

      const nextRoleId = patch.roleId ?? existing.roleId;
      persistUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                ...patch,
                department: getDepartmentForRole(nextRoleId),
                email: patch.email?.trim().toLowerCase() ?? user.email,
              }
            : user,
        ),
      );

      writeAudit(auditActor, {
        action: "User updated",
        module: "Users",
        detail: `${existing.name} · ${existing.email}`,
        previousValue: existing.status,
        newValue: patch.status ?? existing.status,
      });
    },
    [users, persistUsers, writeAudit, auditActor],
  );

  const updateUserRole = useCallback(
    (userId: string, roleId: RoleId) => {
      const existing = users.find((user) => user.id === userId);
      if (!existing) return;

      persistUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, roleId, department: getDepartmentForRole(roleId) }
            : user,
        ),
      );

      writeAudit(auditActor, {
        action: "Role changed",
        module: "Users",
        detail: `${existing.name}`,
        previousValue: getRole(existing.roleId)?.name ?? existing.roleId,
        newValue: getRole(roleId)?.name ?? roleId,
      });
    },
    [users, persistUsers, writeAudit, auditActor],
  );

  const toggleUserStatus = useCallback(
    (userId: string) => {
      const existing = users.find((user) => user.id === userId);
      if (!existing) return;

      const nextStatus = existing.status === "Disabled" ? "Active" : "Disabled";
      persistUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: nextStatus } : user,
        ),
      );

      writeAudit(auditActor, {
        action: nextStatus === "Active" ? "User activated" : "User deactivated",
        module: "Users",
        detail: existing.name,
        previousValue: existing.status,
        newValue: nextStatus,
      });
    },
    [users, persistUsers, writeAudit, auditActor],
  );

  const setUserPassword = useCallback(
    (userId: string, password: string) => {
      const existing = users.find((user) => user.id === userId);
      persistUsers(
        users.map((user) => (user.id === userId ? { ...user, password } : user)),
      );
      if (existing) {
        writeAudit(auditActor, {
          action: "Access reset",
          module: "Users",
          detail: `${existing.name} · password reset`,
        });
      }
    },
    [users, persistUsers, writeAudit, auditActor],
  );

  const value = useMemo(
    () => ({
      ready,
      users,
      currentUser,
      login,
      logout,
      addUser,
      updateUser,
      updateUserRole,
      toggleUserStatus,
      setUserPassword,
    }),
    [
      ready,
      users,
      currentUser,
      login,
      logout,
      addUser,
      updateUser,
      updateUserRole,
      toggleUserStatus,
      setUserPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}

export type { StaffUser };
