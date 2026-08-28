"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getRole, roleBadgeClass } from "@/lib/roles";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/ModulePrimitives";

export function ProfileManager() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const role = currentUser ? getRole(currentUser.roleId) : null;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (!currentUser) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
        Sign in to view your profile.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your MistnLeaf staff account and role assignment."
      />

      <SectionCard title="Account details">
        <div className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-xl font-semibold text-white">
              {currentUser.initials}
            </span>
            <div>
              <h2 className="font-display text-3xl text-foreground">{currentUser.name}</h2>
              <p className="mt-1 text-sm text-muted">{currentUser.email}</p>
              <span
                className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${roleBadgeClass[currentUser.roleId]}`}
              >
                {role?.name}
              </span>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <ProfileRow label="Staff ID" value={currentUser.id} />
            <ProfileRow label="Status" value={currentUser.status} />
            <ProfileRow label="Last active" value={currentUser.lastActive} />
            <ProfileRow label="Role" value={role?.name ?? "—"} />
          </dl>

          {role?.description ? (
            <p className="rounded-xl border border-border-subtle bg-surface-muted/50 px-4 py-3 text-sm text-muted">
              {role.description}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-muted/40 px-3.5 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
