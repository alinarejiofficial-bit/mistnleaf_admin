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
  createAuthUser,
  loadSessionUserId,
  loadUsers,
  saveSessionUserId,
  saveUsers,
  type AuthUser,
} from "@/lib/auth-storage";
import { mapDirectoryUser } from "@/lib/ops-live";
import {
  createStaffDirectoryUser,
  deleteStaffDirectoryUser,
  fetchStaffUsers,
  getAccessToken,
  loginToBackend,
  logoutFromBackend,
  updateStaffDirectoryUser,
} from "@/lib/staff-api-client";
import {
  loadAuditLogs,
  recordAudit,
  saveAuditLogs,
  type AuditActor,
} from "@/lib/audit-log";
import {
  canDeleteStaffUser,
  canMutateStaffUser,
  getDepartmentForRole,
  getRole,
  hasPermission,
  isLastActiveSuperAdministrator,
  type RoleId,
  type StaffUser,
} from "@/lib/roles";

type MutateResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  ready: boolean;
  users: AuthUser[];
  currentUser: AuthUser | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  refreshDirectory: () => Promise<void>;
  addUser: (input: {
    name: string;
    email: string;
    roleId: RoleId;
    password: string;
    phone?: string;
    department?: string;
  }) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  updateUser: (
    userId: string,
    patch: Partial<Pick<StaffUser, "name" | "email" | "phone" | "roleId" | "status">>,
  ) => Promise<MutateResult>;
  updateUserRole: (userId: string, roleId: RoleId) => Promise<MutateResult>;
  toggleUserStatus: (userId: string) => Promise<MutateResult>;
  setUserPassword: (userId: string, password: string) => Promise<MutateResult>;
  deleteUser: (userId: string) => Promise<MutateResult>;
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

  const refreshDirectory = useCallback(async () => {
    try {
      const rows = await fetchStaffUsers();
      if (!rows.length) return;
      setUsers((prev) => {
        const byEmail = new Map(prev.map((user) => [user.email, user]));
        for (const row of rows) {
          const mapped = mapDirectoryUser(row);
          const existing = byEmail.get(mapped.email);
          byEmail.set(mapped.email, {
            ...mapped,
            password: existing?.password ?? "",
          });
        }
        const next = Array.from(byEmail.values());
        saveUsers(next);
        return next;
      });
    } catch {
      // Directory refresh is best-effort when the API is unavailable.
    }
  }, []);

  const persistUsers = useCallback((next: AuthUser[]) => {
    setUsers(next);
    saveUsers(next);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const loadedUsers = loadUsers();
      const sessionId = loadSessionUserId();
      const sessionUser = loadedUsers.find((user) => user.id === sessionId) ?? null;

      // Restore JWT against Django so staff APIs (rooms, bookings) work after refresh.
      if (sessionUser?.password) {
        const hasToken = Boolean(getAccessToken());
        if (!hasToken) {
          try {
            const backend = await loginToBackend(sessionUser.email, sessionUser.password);
            if (cancelled) return;
            const mapped = mapDirectoryUser({ ...backend.user, is_active: true });
            const nextUsers = [
              { ...mapped, password: sessionUser.password },
              ...loadedUsers.filter(
                (user) => user.email !== mapped.email && user.id !== mapped.id,
              ),
            ];
            setUsers(nextUsers);
            saveUsers(nextUsers);
            setSessionUserId(mapped.id);
            saveSessionUserId(mapped.id);
            setReady(true);
            return;
          } catch {
            // Local session without a live API token cannot load rooms — force re-login.
            if (!cancelled) {
              setUsers(loadedUsers);
              setSessionUserId(null);
              saveSessionUserId(null);
              setReady(true);
            }
            return;
          }
        }
      }

      if (cancelled) return;
      setUsers(loadedUsers);
      setSessionUserId(sessionId);
      setReady(true);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !sessionUserId) return;
    void refreshDirectory();
  }, [ready, sessionUserId, refreshDirectory]);

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
    async (email: string, password: string) => {
      try {
        const backend = await loginToBackend(email, password);
        const mapped = mapDirectoryUser({
          ...backend.user,
          is_active: true,
        });
        const freshUsers = loadUsers();
        const nextUsers = [
          { ...mapped, password },
          ...freshUsers.filter((user) => user.email !== mapped.email && user.id !== mapped.id),
        ];
        persistUsers(nextUsers);
        setSessionUserId(mapped.id);
        saveSessionUserId(mapped.id);
        return { ok: true as const };
      } catch (err) {
        // Never fall back to local-only login — that leaves no JWT and rooms stay empty.
        const message =
          err instanceof Error
            ? err.message
            : "Could not sign in to the API. Is Django running on port 3001?";
        return { ok: false as const, error: message };
      }
    },
    [persistUsers],
  );

  const logout = useCallback(() => {
    void logoutFromBackend();
    setSessionUserId(null);
    saveSessionUserId(null);
  }, []);

  const addUser = useCallback(
    async (input: {
      name: string;
      email: string;
      roleId: RoleId;
      password: string;
      phone?: string;
      department?: string;
    }) => {
      if (!currentUser) {
        return { ok: false as const, error: "You must be signed in to add users." };
      }
      if (
        !hasPermission(currentUser.roleId, "manage_users", currentUser.permissions) &&
        !hasPermission(currentUser.roleId, "manage_staff", currentUser.permissions)
      ) {
        return { ok: false as const, error: "You do not have permission to add users." };
      }
      if (
        input.roleId === "super_administrator" &&
        !hasPermission(currentUser.roleId, "manage_users", currentUser.permissions)
      ) {
        return {
          ok: false as const,
          error: "Only Super Administrators can create Super Administrator accounts.",
        };
      }

      const email = input.email.trim().toLowerCase();
      if (users.some((user) => user.email === email)) {
        return { ok: false as const, error: "A user with this email already exists." };
      }

      const department = input.department ?? getDepartmentForRole(input.roleId);

      if (getAccessToken()) {
        try {
          const row = await createStaffDirectoryUser({
            name: input.name,
            email,
            password: input.password,
            role_id: input.roleId,
            phone: input.phone,
            department,
          });
          const user = { ...mapDirectoryUser(row), password: input.password };
          persistUsers([user, ...users.filter((item) => item.email !== email && item.id !== user.id)]);
          writeAudit(auditActor, {
            action: "User created",
            module: "Users",
            detail: `${user.name} · ${user.email}`,
            newValue: getRole(user.roleId)?.name ?? user.roleId,
          });
          return { ok: true as const, user };
        } catch (error) {
          return {
            ok: false as const,
            error: error instanceof Error ? error.message : "Could not create user.",
          };
        }
      }

      const user = createAuthUser({
        ...input,
        email,
        department,
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
    [users, persistUsers, writeAudit, auditActor, currentUser],
  );

  const updateUser = useCallback(
    async (
      userId: string,
      patch: Partial<Pick<StaffUser, "name" | "email" | "phone" | "roleId" | "status">>,
    ): Promise<MutateResult> => {
      const existing = users.find((user) => user.id === userId);
      if (!existing || !currentUser) {
        return { ok: false, error: "User not found." };
      }
      if (!canMutateStaffUser(currentUser, existing)) {
        return { ok: false, error: "You cannot modify this account." };
      }
      const nextRoleId = patch.roleId ?? existing.roleId;
      if (
        existing.roleId === "super_administrator" &&
        (nextRoleId !== "super_administrator" || patch.status === "Disabled") &&
        isLastActiveSuperAdministrator(users, userId)
      ) {
        return {
          ok: false,
          error: "The last Super Administrator cannot be demoted or deactivated.",
        };
      }

      if (getAccessToken()) {
        try {
          const row = await updateStaffDirectoryUser(userId, {
            name: patch.name,
            email: patch.email,
            phone: patch.phone,
            role_id: patch.roleId,
            status: patch.status,
          });
          const mapped = mapDirectoryUser(row);
          persistUsers(
            users.map((user) =>
              user.id === userId ? { ...user, ...mapped, password: user.password } : user,
            ),
          );
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : "Could not update user.",
          };
        }
      } else {
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
      }

      writeAudit(auditActor, {
        action: "User updated",
        module: "Users",
        detail: `${existing.name} · ${existing.email}`,
        previousValue: existing.status,
        newValue: patch.status ?? existing.status,
      });
      return { ok: true };
    },
    [users, persistUsers, writeAudit, auditActor, currentUser],
  );

  const updateUserRole = useCallback(
    async (userId: string, roleId: RoleId): Promise<MutateResult> => {
      const existing = users.find((user) => user.id === userId);
      if (!existing || !currentUser) {
        return { ok: false, error: "User not found." };
      }
      if (!canMutateStaffUser(currentUser, existing)) {
        return { ok: false, error: "You cannot change this user's role." };
      }
      if (
        existing.roleId === "super_administrator" &&
        roleId !== "super_administrator" &&
        isLastActiveSuperAdministrator(users, userId)
      ) {
        return {
          ok: false,
          error: "The last Super Administrator cannot be demoted.",
        };
      }
      if (
        roleId === "super_administrator" &&
        !hasPermission(currentUser.roleId, "manage_users", currentUser.permissions)
      ) {
        return {
          ok: false,
          error: "Only Super Administrators can assign the Super Administrator role.",
        };
      }

      if (getAccessToken()) {
        try {
          const row = await updateStaffDirectoryUser(userId, { role_id: roleId });
          const mapped = mapDirectoryUser(row);
          persistUsers(
            users.map((user) =>
              user.id === userId ? { ...user, ...mapped, password: user.password } : user,
            ),
          );
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : "Could not change role.",
          };
        }
      } else {
        persistUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, roleId, department: getDepartmentForRole(roleId) }
              : user,
          ),
        );
      }

      writeAudit(auditActor, {
        action: "Role changed",
        module: "Users",
        detail: `${existing.name}`,
        previousValue: getRole(existing.roleId)?.name ?? existing.roleId,
        newValue: getRole(roleId)?.name ?? roleId,
      });
      return { ok: true };
    },
    [users, persistUsers, writeAudit, auditActor, currentUser],
  );

  const toggleUserStatus = useCallback(
    async (userId: string): Promise<MutateResult> => {
      const existing = users.find((user) => user.id === userId);
      if (!existing || !currentUser) {
        return { ok: false, error: "User not found." };
      }
      if (!canMutateStaffUser(currentUser, existing)) {
        return { ok: false, error: "You cannot change this account's status." };
      }
      const nextStatus = existing.status === "Disabled" ? "Active" : "Disabled";
      if (
        nextStatus === "Disabled" &&
        existing.roleId === "super_administrator" &&
        isLastActiveSuperAdministrator(users, userId)
      ) {
        return {
          ok: false,
          error: "The last Super Administrator cannot be deactivated.",
        };
      }

      if (getAccessToken()) {
        try {
          const row = await updateStaffDirectoryUser(userId, { status: nextStatus });
          const mapped = mapDirectoryUser(row);
          persistUsers(
            users.map((user) =>
              user.id === userId ? { ...user, ...mapped, password: user.password } : user,
            ),
          );
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : "Could not update status.",
          };
        }
      } else {
        persistUsers(
          users.map((user) =>
            user.id === userId ? { ...user, status: nextStatus } : user,
          ),
        );
      }

      writeAudit(auditActor, {
        action: nextStatus === "Active" ? "User activated" : "User deactivated",
        module: "Users",
        detail: existing.name,
        previousValue: existing.status,
        newValue: nextStatus,
      });
      return { ok: true };
    },
    [users, persistUsers, writeAudit, auditActor, currentUser],
  );

  const setUserPassword = useCallback(
    async (userId: string, password: string): Promise<MutateResult> => {
      const existing = users.find((user) => user.id === userId);
      if (!existing || !currentUser) {
        return { ok: false, error: "User not found." };
      }
      if (!canMutateStaffUser(currentUser, existing)) {
        return { ok: false, error: "You cannot reset this account's password." };
      }

      if (getAccessToken()) {
        try {
          await updateStaffDirectoryUser(userId, { password });
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : "Could not reset password.",
          };
        }
      }

      persistUsers(
        users.map((user) => (user.id === userId ? { ...user, password } : user)),
      );
      writeAudit(auditActor, {
        action: "Access reset",
        module: "Users",
        detail: `${existing.name} · password reset`,
      });
      return { ok: true };
    },
    [users, persistUsers, writeAudit, auditActor, currentUser],
  );

  const deleteUser = useCallback(
    async (userId: string): Promise<MutateResult> => {
      const existing = users.find((user) => user.id === userId);
      if (!existing || !currentUser) {
        return { ok: false, error: "User not found." };
      }
      if (!canDeleteStaffUser(currentUser, existing)) {
        return { ok: false, error: "Only Super Administrators can delete users." };
      }
      if (
        existing.roleId === "super_administrator" &&
        isLastActiveSuperAdministrator(users, userId)
      ) {
        return {
          ok: false,
          error: "The last Super Administrator cannot be deleted.",
        };
      }

      if (getAccessToken()) {
        try {
          await deleteStaffDirectoryUser(userId);
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : "Could not delete user.",
          };
        }
      }

      persistUsers(users.filter((user) => user.id !== userId));
      writeAudit(auditActor, {
        action: "User deleted",
        module: "Users",
        detail: `${existing.name} · ${existing.email}`,
        previousValue: getRole(existing.roleId)?.name ?? existing.roleId,
      });
      return { ok: true };
    },
    [users, persistUsers, writeAudit, auditActor, currentUser],
  );

  const value = useMemo(
    () => ({
      ready,
      users,
      currentUser,
      login,
      logout,
      refreshDirectory,
      addUser,
      updateUser,
      updateUserRole,
      toggleUserStatus,
      setUserPassword,
      deleteUser,
    }),
    [
      ready,
      users,
      currentUser,
      login,
      logout,
      refreshDirectory,
      addUser,
      updateUser,
      updateUserRole,
      toggleUserStatus,
      setUserPassword,
      deleteUser,
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
