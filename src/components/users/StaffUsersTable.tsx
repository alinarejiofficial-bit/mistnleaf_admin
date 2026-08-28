import {
  getRole,
  roleBadgeClass,
  staffUsers,
  type StaffUser,
} from "@/lib/roles";

const statusStyles = {
  Active: "bg-brand-soft text-brand",
  Invited: "bg-accent-soft text-[#8a6a2f]",
  Disabled: "bg-surface-muted text-muted",
};

/** Static snapshot table (used only if needed outside the live manager). */
export function StaffUsersTable() {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface shadow-sm">
      <div className="border-b border-border-subtle px-5 py-4 sm:px-6">
        <h2 className="font-display text-xl text-foreground">Staff accounts</h2>
        <p className="mt-1 text-sm text-muted">
          Users and their assigned access levels
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-5 py-3 font-medium sm:px-6">User</th>
              <th className="px-5 py-3 font-medium sm:px-6">Role</th>
              <th className="px-5 py-3 font-medium sm:px-6">Status</th>
              <th className="px-5 py-3 font-medium sm:px-6">Last active</th>
            </tr>
          </thead>
          <tbody>
            {staffUsers.map((user) => (
              <StaffRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StaffRow({ user }: { user: StaffUser }) {
  const role = getRole(user.roleId);

  return (
    <tr className="border-t border-border-subtle transition hover:bg-surface-muted/40">
      <td className="px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xs font-semibold text-white">
            {user.initials}
          </span>
          <div>
            <div className="font-medium text-foreground">{user.name}</div>
            <div className="text-xs text-muted">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 sm:px-6">
        <span
          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${roleBadgeClass[user.roleId]}`}
        >
          {role?.name}
        </span>
      </td>
      <td className="px-5 py-4 sm:px-6">
        <span
          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${statusStyles[user.status]}`}
        >
          {user.status}
        </span>
      </td>
      <td className="px-5 py-4 text-muted sm:px-6">{user.lastActive}</td>
    </tr>
  );
}
