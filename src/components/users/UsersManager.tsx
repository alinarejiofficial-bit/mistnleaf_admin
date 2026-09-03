"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Plus, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  canDeleteStaffUser,
  canMutateStaffUser,
  getAssignableRolesFor,
  getRole,
  hasPermission,
  isLastActiveSuperAdministrator,
  roleBadgeClass,
  type RoleId,
} from "@/lib/roles";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResortManagerRoleCard } from "@/components/users/RoleCards";

const statusStyles = {
  Active: "bg-brand-soft text-brand",
  Invited: "bg-accent-soft text-[#8a6a2f]",
  Disabled: "bg-surface-muted text-muted",
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  roleId: "resort_manager" as RoleId,
  password: "",
  confirmPassword: "",
};

export function UsersManager() {
  const {
    users,
    currentUser,
    addUser,
    updateUser,
    updateUserRole,
    toggleUserStatus,
    setUserPassword,
    deleteUser,
  } = useAuth();

  const livePermissions = currentUser?.permissions;
  const canManageUsers = currentUser
    ? hasPermission(currentUser.roleId, "manage_users", livePermissions)
    : false;
  const canManageStaff = currentUser
    ? hasPermission(currentUser.roleId, "manage_staff", livePermissions)
    : false;
  const canManageRoles = currentUser
    ? hasPermission(currentUser.roleId, "manage_roles", livePermissions)
    : false;
  const canManageAccounts = canManageUsers || canManageStaff;
  const assignableRoleOptions = currentUser
    ? getAssignableRolesFor(currentUser.roleId, livePermissions)
    : [];

  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [passwordModalUserId, setPasswordModalUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const selectedRole = useMemo(() => getRole(form.roleId), [form.roleId]);
  const passwordModalUser = users.find((user) => user.id === passwordModalUserId);
  const viewUser = users.find((user) => user.id === viewUserId);
  const editUser = users.find((user) => user.id === editUserId);
  const deleteTarget = users.find((user) => user.id === deleteUserId);
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    phone: string;
    roleId: RoleId;
    status: "Active" | "Invited" | "Disabled";
  }>({
    name: "",
    email: "",
    phone: "",
    roleId: "resort_manager",
    status: "Active",
  });

  function closeModal() {
    setOpen(false);
    setForm(emptyForm);
    setError("");
  }

  function closePasswordModal() {
    setPasswordModalUserId(null);
    setPasswordForm({ password: "", confirmPassword: "" });
    setPasswordError("");
  }

  useEffect(() => {
    if (!editUser) return;
    setEditForm({
      name: editUser.name,
      email: editUser.email,
      phone: editUser.phone ?? "",
      roleId: editUser.roleId,
      status: editUser.status,
    });
  }, [editUser]);

  function validatePassword(password: string, confirmPassword: string) {
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageAccounts) {
      setError("You do not have permission to add users.");
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    const passwordIssue = validatePassword(form.password, form.confirmPassword);
    if (passwordIssue) {
      setError(passwordIssue);
      return;
    }

    setSaving(true);
    const result = await addUser({
      name,
      email,
      phone: form.phone.trim() || undefined,
      roleId: form.roleId,
      password: form.password,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    closeModal();
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordModalUserId || !canManageAccounts) return;

    const passwordIssue = validatePassword(
      passwordForm.password,
      passwordForm.confirmPassword,
    );
    if (passwordIssue) {
      setPasswordError(passwordIssue);
      return;
    }

    setSaving(true);
    const result = await setUserPassword(passwordModalUserId, passwordForm.password);
    setSaving(false);
    if (!result.ok) {
      setPasswordError(result.error);
      return;
    }
    closePasswordModal();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & roles"
        description={
          canManageUsers
            ? "Super Administrators can create, edit, deactivate, and delete staff accounts for every role."
            : "Resort Managers can create and manage operational staff accounts."
        }
        action={
          <div className="flex flex-wrap gap-2">
            {canManageRoles ? (
              <Link
                href="/roles"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
              >
                <ShieldCheck className="h-4 w-4" />
                Roles & permissions
              </Link>
            ) : null}
            {canManageAccounts ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
              >
                <UserPlus className="h-4 w-4" />
                Add user
              </button>
            ) : null}
          </div>
        }
      />

      <div className="rounded-2xl border border-brand/20 bg-brand-soft/50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">
              Signed in as {currentUser?.name} ·{" "}
              {currentUser ? getRole(currentUser.roleId)?.name : "—"}
            </p>
            <p className="mt-1 text-sm text-muted">
              Set a password when adding users so they can sign in at the login
              page. Lower-level roles cannot modify Super Administrator accounts
              or system-level permissions.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border-subtle bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl text-foreground">Staff accounts</h2>
            <p className="mt-1 text-sm text-muted">
              {users.length} users · each account has a login password
            </p>
          </div>
          {canManageAccounts ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
            >
              <Plus className="h-4 w-4" />
              New staff
            </button>
          ) : null}
        </div>

        {actionError ? (
          <p className="border-b border-border-subtle px-5 py-3 text-sm text-danger sm:px-6" role="alert">
            {actionError}
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium sm:px-6">User</th>
                <th className="px-5 py-3 font-medium sm:px-6">Role</th>
                <th className="px-5 py-3 font-medium sm:px-6">Department</th>
                <th className="px-5 py-3 font-medium sm:px-6">Status</th>
                <th className="px-5 py-3 font-medium sm:px-6">Last active</th>
                <th className="px-5 py-3 font-medium sm:px-6">Created</th>
                {canManageAccounts ? (
                  <th className="px-5 py-3 font-medium sm:px-6">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const role = getRole(user.roleId);
                const isSelf = user.id === currentUser?.id;
                const canEditUser = currentUser
                  ? canMutateStaffUser(currentUser, user)
                  : false;
                const isLastSuperAdmin = isLastActiveSuperAdministrator(users, user.id);
                const canChangeRole = canEditUser && !isLastSuperAdmin;
                const canRemoveUser =
                  Boolean(currentUser && canDeleteStaffUser(currentUser, user)) &&
                  !isLastSuperAdmin;
                const canDisableUser = canEditUser && !isLastSuperAdmin;

                return (
                  <tr
                    key={user.id}
                    className="border-t border-border-subtle transition hover:bg-surface-muted/40"
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xs font-semibold text-white">
                          {user.initials}
                        </span>
                        <div>
                          <div className="font-medium text-foreground">
                            {user.name}
                            {isSelf ? (
                              <span className="ml-2 text-xs font-normal text-muted">
                                (you)
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-muted">{user.email}</div>
                          {user.phone ? (
                            <div className="text-xs text-muted">{user.phone}</div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      {canChangeRole ? (
                        <select
                          value={user.roleId}
                          onChange={(event) => {
                            void updateUserRole(user.id, event.target.value as RoleId).then(
                              (result) => {
                                setActionError(result.ok ? "" : result.error);
                              },
                            );
                          }}
                          className="h-9 max-w-[220px] rounded-lg border border-border bg-surface px-2 text-xs font-medium text-foreground outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                        >
                          {assignableRoleOptions.map((assignable) => (
                            <option key={assignable.id} value={assignable.id}>
                              {assignable.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${roleBadgeClass[user.roleId]}`}
                        >
                          {role?.name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted sm:px-6">{user.department}</td>
                    <td className="px-5 py-4 sm:px-6">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${statusStyles[user.status]}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted sm:px-6">
                      {user.lastActive}
                    </td>
                    <td className="px-5 py-4 text-muted sm:px-6">
                      {user.createdAt}
                    </td>
                    {canManageAccounts ? (
                      <td className="px-5 py-4 sm:px-6">
                        {canEditUser ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setViewUserId(user.id)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-brand-mid hover:text-brand"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditUserId(user.id)}
                              className="text-sm font-medium text-muted hover:text-foreground"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setPasswordModalUserId(user.id)}
                              className="text-sm font-medium text-brand-mid hover:text-brand"
                            >
                              Reset access
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void toggleUserStatus(user.id).then((result) => {
                                  setActionError(result.ok ? "" : result.error);
                                });
                              }}
                              disabled={!canDisableUser}
                              className="text-sm font-medium text-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {user.status === "Disabled" ? "Enable" : "Disable"}
                            </button>
                            {canRemoveUser ? (
                              <button
                                type="button"
                                onClick={() => setDeleteUserId(user.id)}
                                className="inline-flex items-center gap-1 text-sm font-medium text-danger hover:text-[#c45a4a]"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-muted">
                            {isSelf
                              ? "Protected"
                              : isLastSuperAdmin
                                ? "Last Super Administrator"
                                : "View only"}
                          </span>
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {canManageStaff && !canManageRoles ? <ResortManagerRoleCard /> : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 p-4 backdrop-blur-[2px] sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-subtle bg-surface shadow-md"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
              <div>
                <h2
                  id="add-user-title"
                  className="font-display text-2xl text-foreground"
                >
                  Add staff user
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Create login credentials and assign a role.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-muted transition hover:bg-surface-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Full name
                </span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="e.g. Priya Shah"
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="name@mistnleaf.com"
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Phone
                </span>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="+91 98765 43210"
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Password
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Minimum 8 characters"
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Confirm password
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Re-enter password"
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Role
                </span>
                <select
                  value={form.roleId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      roleId: event.target.value as RoleId,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                >
                  {assignableRoleOptions.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedRole ? (
                <div className="rounded-xl border border-border-subtle bg-surface-muted/60 px-3.5 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {selectedRole.name}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {selectedRole.description}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {selectedRole.permissions.length} permissions included
                  </p>
                </div>
              ) : null}

              {error ? (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
                  {saving ? "Saving…" : "Add user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {passwordModalUser ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 p-4 backdrop-blur-[2px] sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
            className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface shadow-md"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
              <div>
                <h2
                  id="reset-password-title"
                  className="font-display text-2xl text-foreground"
                >
                  Reset password
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {passwordModalUser.name} · {passwordModalUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className="rounded-lg p-1.5 text-muted transition hover:bg-surface-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  New password
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.password}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Confirm password
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              {passwordError ? (
                <p className="text-sm text-danger" role="alert">
                  {passwordError}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {viewUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-5 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-foreground">{viewUser.name}</h2>
                <p className="mt-1 text-sm text-muted">{getRole(viewUser.roleId)?.name}</p>
              </div>
              <button type="button" onClick={() => setViewUserId(null)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Email</dt><dd>{viewUser.email}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Phone</dt><dd>{viewUser.phone ?? "—"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Department</dt><dd>{viewUser.department}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Status</dt><dd>{viewUser.status}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Last active</dt><dd>{viewUser.lastActive}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Created</dt><dd>{viewUser.createdAt}</dd></div>
            </dl>
          </div>
        </div>
      ) : null}

      {editUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4">
          <form
            className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-5 shadow-md"
            onSubmit={(event) => {
              event.preventDefault();
              setSaving(true);
              void updateUser(editUser.id, {
                name: editForm.name.trim(),
                email: editForm.email.trim(),
                phone: editForm.phone.trim() || undefined,
                roleId: editForm.roleId,
                status: editForm.status,
              }).then((result) => {
                setSaving(false);
                if (!result.ok) {
                  setActionError(result.error);
                  return;
                }
                setActionError("");
                setEditUserId(null);
              });
            }}
          >
            <h2 className="font-display text-2xl text-foreground">Edit user</h2>
            <div className="mt-4 space-y-3">
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="field-input h-11" placeholder="Name" required />
              <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="field-input h-11" placeholder="Email" required />
              <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="field-input h-11" placeholder="Phone" />
              <select
                value={editForm.roleId}
                onChange={(e) => setEditForm({ ...editForm, roleId: e.target.value as RoleId })}
                disabled={isLastActiveSuperAdministrator(users, editUser.id)}
                className="field-input h-11"
              >
                {assignableRoleOptions.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as typeof editForm.status })}
                disabled={isLastActiveSuperAdministrator(users, editUser.id)}
                className="field-input h-11"
              >
                <option value="Active">Active</option>
                <option value="Invited">Invited</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
            {actionError ? (
              <p className="mt-3 text-sm text-danger" role="alert">{actionError}</p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditUserId(null)} className="rounded-xl border border-border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-brand px-4 py-2 text-sm text-white disabled:opacity-60">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user?"
        description={
          deleteTarget
            ? `Permanently remove ${deleteTarget.name} (${deleteTarget.email}). This cannot be undone.`
            : ""
        }
        confirmLabel="Delete user"
        danger
        loading={saving}
        onCancel={() => setDeleteUserId(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          setSaving(true);
          void deleteUser(deleteTarget.id).then((result) => {
            setSaving(false);
            if (!result.ok) {
              setActionError(result.error);
              return;
            }
            setActionError("");
            setDeleteUserId(null);
          });
        }}
      />
    </div>
  );
}
