"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MistnLeafLogo } from "@/components/brand/MistnLeafLogo";
import { filterByRouteAccess } from "@/lib/route-access";
import { getNavSectionsForRole } from "@/lib/nav";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const roleId = currentUser?.roleId;

  const baseSections = roleId ? getNavSectionsForRole(roleId) : [];

  const visibleSections = baseSections
    .map((section) => ({
      ...section,
      items: roleId
        ? filterByRouteAccess(roleId, section.items, currentUser?.permissions)
        : section.items,
    }))
    .filter((section) => section.items.length > 0);

  const isFrontDesk = roleId === "front_desk";
  const isHousekeeping = roleId === "housekeeping";
  const isAccountant = roleId === "accountant";
  const isWebsiteContentManager = roleId === "website_content_manager";
  const isSuperAdmin = roleId === "super_administrator";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px] transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border-subtle bg-sidebar text-sidebar-text transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[4.5rem] items-center justify-between border-b border-border-subtle px-3">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center"
            onClick={onClose}
            aria-label="MistnLeaf home"
          >
            <MistnLeafLogo priority className="min-w-0 flex-1" />
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-sidebar-text hover:bg-surface-muted lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          {visibleSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? "mt-4" : ""}>
              {sectionIndex > 0 && (
                <div className="mb-3 border-t border-border-subtle" />
              )}
              {section.title ? (
                <p className="mb-2 px-3 text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
                  {section.title}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          active
                            ? "bg-sidebar-active font-medium text-brand shadow-[inset_3px_0_0_0_var(--brand-mid)]"
                            : "text-sidebar-text hover:bg-surface-muted hover:text-foreground"
                        }`}
                      >
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 ${
                            active ? "text-brand-mid" : "text-muted"
                          }`}
                          strokeWidth={1.9}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border-subtle p-4">
          <div className="rounded-xl bg-surface-muted px-3 py-3 ring-1 ring-border-subtle">
            <p className="font-display text-sm text-foreground">
              {isSuperAdmin
                ? "System administration"
                : isWebsiteContentManager
                ? "Website CMS"
                : isAccountant
                ? "Finance"
                : isHousekeeping
                  ? "Housekeeping"
                  : isFrontDesk
                    ? "Front desk"
                    : "Property ops"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {isSuperAdmin
                ? "Full control of users, roles, operations, CMS, and system settings."
                : isWebsiteContentManager
                ? "Homepage, rooms, gallery, offers, and public content."
                : isAccountant
                ? "Payments, invoices, refunds, and financial reports."
                : isHousekeeping
                  ? "Assigned rooms, cleaning status, and maintenance reports."
                  : isFrontDesk
                    ? "Bookings, guests, check-in/out, and payments."
                    : "Live front-desk overview for MistnLeaf stays."}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
