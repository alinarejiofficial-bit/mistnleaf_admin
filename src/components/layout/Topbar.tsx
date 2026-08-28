"use client";

import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePermissions } from "@/components/auth/usePermissions";
import { getNotificationsForRole } from "@/lib/notifications";
import { getRole } from "@/lib/roles";

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { can, isHousekeeping, isAccountant, isWebsiteContentManager } = usePermissions();
  const role = currentUser ? getRole(currentUser.roleId) : null;
  const profileHref = can("users.view") ? "/users" : "/profile";

  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return getNotificationsForRole(currentUser.roleId).filter((n) => !n.read).length;
  }, [currentUser]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border-subtle bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition hover:bg-surface-muted lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className={`hidden min-w-0 flex-1 md:block ${isHousekeeping || isAccountant || isWebsiteContentManager ? "lg:hidden" : ""}`}>
        <label className="relative block max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder={
              isWebsiteContentManager
                ? "Search website content…"
                : "Search reservations, guests, rooms..."
            }
            className="h-10 w-full rounded-xl border border-border bg-surface-muted/70 pr-3 pl-10 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-brand-mid focus:bg-surface focus:ring-2 focus:ring-brand-soft"
          />
        </label>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/notifications"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-muted transition hover:border-border hover:bg-surface-muted hover:text-foreground"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white ring-2 ring-surface">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Link>

        <Link
          href="/help"
          className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-surface-muted hover:text-foreground sm:inline-flex"
        >
          <HelpCircle className="h-4 w-4" />
          Help
        </Link>

        <Link
          href={profileHref}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-sm transition hover:bg-surface-muted"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-[11px] font-semibold tracking-wide text-white">
            {currentUser?.initials ?? "—"}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block font-medium leading-tight text-foreground">
              {currentUser?.name ?? "User"}
            </span>
            <span className="block text-[11px] leading-tight text-muted">
              {role?.name}
            </span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-muted sm:inline" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-sm text-muted transition hover:bg-surface-muted hover:text-foreground"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
