import {
  Building2,
  ConciergeBell,
  Globe,
  IndianRupee,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  permissionLabels,
  roles,
  accountantModuleAccess,
  frontDeskModuleAccess,
  housekeepingModuleAccess,
  resortManagerModuleAccess,
  superAdminModuleAccess,
  websiteContentManagerModuleAccess,
  type Permission,
  type Role,
  type RoleId,
} from "@/lib/roles";

const featuredRoleIds: RoleId[] = [
  "super_administrator",
  "resort_manager",
  "front_desk",
  "housekeeping",
  "accountant",
  "website_content_manager",
];

type Accent = "brand" | "accent" | "info" | "success" | "finance" | "cms";

const accentStyles: Record<
  Accent,
  {
    border: string;
    header: string;
    icon: string;
    eyebrow: string;
    badge: string;
    dot: string;
  }
> = {
  brand: {
    border: "border-brand/20",
    header: "bg-gradient-to-br from-brand-soft via-surface to-accent-soft",
    icon: "bg-brand",
    eyebrow: "text-brand-mid",
    badge: "bg-brand",
    dot: "bg-brand",
  },
  accent: {
    border: "border-accent/30",
    header: "bg-gradient-to-br from-accent-soft via-surface to-brand-soft",
    icon: "bg-[#8f7350]",
    eyebrow: "text-[#8a6a2f]",
    badge: "bg-[#8f7350]",
    dot: "bg-accent",
  },
  info: {
    border: "border-info/25",
    header: "bg-gradient-to-br from-[#e7f0f5] via-surface to-brand-soft",
    icon: "bg-info",
    eyebrow: "text-info",
    badge: "bg-info",
    dot: "bg-info",
  },
  success: {
    border: "border-success/25",
    header: "bg-gradient-to-br from-[#e8f3ec] via-surface to-accent-soft",
    icon: "bg-success",
    eyebrow: "text-success",
    badge: "bg-success",
    dot: "bg-success",
  },
  finance: {
    border: "border-[#4a5d6a]/25",
    header: "bg-gradient-to-br from-[#e8eef1] via-surface to-accent-soft",
    icon: "bg-[#4a5d6a]",
    eyebrow: "text-[#4a5d6a]",
    badge: "bg-[#4a5d6a]",
    dot: "bg-[#4a5d6a]",
  },
  cms: {
    border: "border-[#5c7a6e]/25",
    header: "bg-gradient-to-br from-[#e6efe9] via-surface to-accent-soft",
    icon: "bg-[#5c7a6e]",
    eyebrow: "text-[#5c7a6e]",
    badge: "bg-[#5c7a6e]",
    dot: "bg-[#5c7a6e]",
  },
};

export function SuperAdminRoleCard() {
  const role = roles.find((item) => item.id === "super_administrator")!;

  return (
    <section className="overflow-hidden rounded-2xl border border-brand/20 bg-surface shadow-sm">
      <div className="bg-gradient-to-br from-brand-soft via-surface to-accent-soft px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-sm">
            <ShieldCheck className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-[0.14em] text-brand-mid uppercase">
              System role
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-tight text-foreground">
              {role.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{role.description}</p>
          </div>
          <span className="rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
            Full access
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <h3 className="text-sm font-semibold text-foreground">Module access</h3>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border-subtle">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Permission</th>
              </tr>
            </thead>
            <tbody>
              {superAdminModuleAccess.map((row) => (
                <tr key={row.module} className="border-t border-border-subtle">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.module}
                  </td>
                  <td className="px-4 py-3 text-muted">{row.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          {role.permissions.length} granular permissions enabled across all modules.
        </p>
      </div>
    </section>
  );
}

export function ResortManagerRoleCard() {
  const role = roles.find((item) => item.id === "resort_manager")!;

  return (
    <section className="overflow-hidden rounded-2xl border border-accent/30 bg-surface shadow-sm">
      <div className="bg-gradient-to-br from-accent-soft via-surface to-brand-soft px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8f7350] text-white shadow-sm">
            <Building2 className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-[0.14em] text-[#8a6a2f] uppercase">
              Management role
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-tight text-foreground">
              {role.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{role.description}</p>
            {role.note ? (
              <p className="mt-2 max-w-xl text-sm text-muted italic">{role.note}</p>
            ) : null}
          </div>
          <span className="rounded-xl bg-[#8f7350] px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
            Operations
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <h3 className="text-sm font-semibold text-foreground">Module access</h3>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border-subtle">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Permission</th>
              </tr>
            </thead>
            <tbody>
              {resortManagerModuleAccess.map((row) => (
                <tr key={row.module} className="border-t border-border-subtle">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.module}
                  </td>
                  <td className="px-4 py-3 text-muted">{row.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          {role.permissions.length} granular permissions enabled for property operations.
        </p>
      </div>
    </section>
  );
}

export function FrontDeskRoleCard() {
  const role = roles.find((item) => item.id === "front_desk")!;

  return (
    <section className="overflow-hidden rounded-2xl border border-info/25 bg-surface shadow-sm">
      <div className="bg-gradient-to-br from-[#e7f0f5] via-surface to-brand-soft px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-info text-white shadow-sm">
            <ConciergeBell className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-[0.14em] text-info uppercase">
              Reception role
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-tight text-foreground">
              {role.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{role.description}</p>
            {role.note ? (
              <p className="mt-2 max-w-xl text-sm text-muted italic">{role.note}</p>
            ) : null}
          </div>
          <span className="rounded-xl bg-info px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
            Front desk
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <h3 className="text-sm font-semibold text-foreground">Module access</h3>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border-subtle">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Permission</th>
              </tr>
            </thead>
            <tbody>
              {frontDeskModuleAccess.map((row) => (
                <tr key={row.module} className="border-t border-border-subtle">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.module}
                  </td>
                  <td className="px-4 py-3 text-muted">{row.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          {role.permissions.length} granular permissions enabled for reception operations.
        </p>
      </div>
    </section>
  );
}

export function HousekeepingRoleCard() {
  const role = roles.find((item) => item.id === "housekeeping")!;

  return (
    <section className="overflow-hidden rounded-2xl border border-success/25 bg-surface shadow-sm">
      <div className="bg-gradient-to-br from-[#e8f3ec] via-surface to-brand-soft px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-success text-white shadow-sm">
            <Sparkles className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-[0.14em] text-success uppercase">
              Operations role
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-tight text-foreground">
              {role.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{role.description}</p>
            {role.note ? (
              <p className="mt-2 max-w-xl text-sm text-muted italic">{role.note}</p>
            ) : null}
          </div>
          <span className="rounded-xl bg-success px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
            Housekeeping
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <h3 className="text-sm font-semibold text-foreground">Module access</h3>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border-subtle">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Permission</th>
              </tr>
            </thead>
            <tbody>
              {housekeepingModuleAccess.map((row) => (
                <tr key={row.module} className="border-t border-border-subtle">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.module}
                  </td>
                  <td className="px-4 py-3 text-muted">{row.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          {role.permissions.length} granular permissions for cleaning operations.
        </p>
      </div>
    </section>
  );
}

export function AccountantRoleCard() {
  const role = roles.find((item) => item.id === "accountant")!;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#4a5d6a]/25 bg-surface shadow-sm">
      <div className="bg-gradient-to-br from-[#e8eef1] via-surface to-brand-soft px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4a5d6a] text-white shadow-sm">
            <IndianRupee className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-[0.14em] text-[#4a5d6a] uppercase">
              Finance role
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-tight text-foreground">
              {role.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{role.description}</p>
            {role.note ? (
              <p className="mt-2 max-w-xl text-sm text-muted italic">{role.note}</p>
            ) : null}
          </div>
          <span className="rounded-xl bg-[#4a5d6a] px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
            Finance
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <h3 className="text-sm font-semibold text-foreground">Module access</h3>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border-subtle">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Permission</th>
              </tr>
            </thead>
            <tbody>
              {accountantModuleAccess.map((row) => (
                <tr key={row.module} className="border-t border-border-subtle">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.module}
                  </td>
                  <td className="px-4 py-3 text-muted">{row.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          {role.permissions.length} granular permissions for finance operations.
        </p>
      </div>
    </section>
  );
}

export function WebsiteContentManagerRoleCard() {
  const role = roles.find((item) => item.id === "website_content_manager")!;

  return (
    <section className="overflow-hidden rounded-2xl border border-brand/20 bg-surface shadow-sm">
      <div className="border-b border-border-subtle bg-brand-soft/40 px-5 py-6 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5c7a6e] text-white shadow-sm">
            <Globe className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-[0.14em] text-brand-mid uppercase">
              CMS role
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-tight text-foreground">
              {role.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{role.description}</p>
            {role.note ? (
              <p className="mt-2 max-w-xl text-sm text-muted/90 italic">{role.note}</p>
            ) : null}
          </div>
          <span className="rounded-xl bg-[#5c7a6e] px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
            Website
          </span>
        </div>
      </div>
      <div className="px-5 py-6 sm:px-6">
        <h3 className="text-sm font-medium text-foreground">Module access</h3>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border-subtle">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Access</th>
              </tr>
            </thead>
            <tbody>
              {websiteContentManagerModuleAccess.map((row) => (
                <tr key={row.module} className="border-t border-border-subtle">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.module}
                  </td>
                  <td className="px-4 py-3 text-muted">{row.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          {role.permissions.length} granular permissions for website content only.
        </p>
      </div>
    </section>
  );
}

function FeaturedRoleCard({
  role,
  eyebrow,
  badge,
  icon,
  accent,
  canLabel = "Permissions",
}: {
  role: Role;
  eyebrow: string;
  badge: string;
  icon: React.ReactNode;
  accent: Accent;
  canLabel?: string;
}) {
  const styles = accentStyles[accent];

  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-surface shadow-sm ${styles.border}`}
    >
      <div className={`border-b border-border-subtle px-5 py-6 sm:px-6 ${styles.header}`}>
        <div className="flex flex-wrap items-start gap-4">
          <span
            className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm ${styles.icon}`}
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={`text-xs font-medium tracking-[0.14em] uppercase ${styles.eyebrow}`}
            >
              {eyebrow}
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-tight text-foreground">
              {role.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{role.description}</p>
            {role.note ? (
              <p className="mt-2 max-w-xl text-sm text-muted/90 italic">{role.note}</p>
            ) : null}
          </div>
          <span
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase ${styles.badge}`}
          >
            {badge}
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <h3 className="text-sm font-semibold text-foreground">{canLabel}</h3>
        <PermissionList permissions={role.permissions} dotClassName={styles.dot} />
      </div>
    </section>
  );
}

export function RoleSummaryCards() {
  const remaining = roles.filter((role) => !featuredRoleIds.includes(role.id));

  if (remaining.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {remaining.map((role) => (
        <RoleSummaryCard key={role.id} role={role} />
      ))}
    </div>
  );
}

function RoleSummaryCard({ role }: { role: Role }) {
  return (
    <article className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <h3 className="font-display text-xl text-foreground">{role.name}</h3>
      <p className="mt-1.5 text-sm text-muted">{role.description}</p>
      <p className="mt-4 text-xs font-medium tracking-wide text-muted uppercase">
        {role.permissions.length} permissions
      </p>
    </article>
  );
}

export function PermissionList({
  permissions,
  dotClassName = "bg-brand",
}: {
  permissions: Permission[];
  dotClassName?: string;
}) {
  return (
    <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
      {permissions.map((permission) => (
        <li
          key={permission}
          className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-muted/50 px-3.5 py-3 text-sm text-foreground"
        >
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClassName}`}
            aria-hidden
          />
          <span>{permissionLabels[permission]}</span>
        </li>
      ))}
    </ul>
  );
}
