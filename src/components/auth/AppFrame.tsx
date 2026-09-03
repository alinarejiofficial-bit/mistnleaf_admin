"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AdminShell } from "@/components/layout/AdminShell";
import { canEditCmsContent } from "@/lib/cms-api-auth";
import { canAccessRoute, getDefaultRoute } from "@/lib/route-access";

const isPublicSiteMode = process.env.NEXT_PUBLIC_PUBLIC_SITE === "true";

function isCmsEditRoute(pathname: string) {
  return pathname === "/website" || pathname.startsWith("/website/");
}

function isPublicRoute(pathname: string) {
  if (isPublicSiteMode) {
    if (isCmsEditRoute(pathname)) return false;
    return (
      pathname === "/" ||
      pathname === "/login" ||
      pathname.startsWith("/site") ||
      pathname === "/about"
    );
  }
  return pathname === "/login" || pathname.startsWith("/site") || pathname === "/about";
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, currentUser } = useAuth();
  const isLogin = pathname === "/login";
  const isPublic = isPublicRoute(pathname);
  const isPublicSiteCmsEdit =
    isPublicSiteMode &&
    isCmsEditRoute(pathname) &&
    !!currentUser &&
    canEditCmsContent(currentUser.roleId, currentUser.permissions);

  useEffect(() => {
    if (!ready) return;
    if (!currentUser && !isPublic) {
      router.replace("/login");
      return;
    }
    if (currentUser && isLogin) {
      const destination =
        isPublicSiteMode && canEditCmsContent(currentUser.roleId, currentUser.permissions)
          ? "/"
          : getDefaultRoute(currentUser.roleId, currentUser.permissions);
      router.replace(destination);
      return;
    }
    if (
      currentUser &&
      !isLogin &&
      !isPublic &&
      !canAccessRoute(currentUser.roleId, pathname, currentUser.permissions)
    ) {
      router.replace(getDefaultRoute(currentUser.roleId, currentUser.permissions));
    }
  }, [ready, currentUser, isLogin, isPublic, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted">
        Loading MistnLeaf Admin…
      </div>
    );
  }

  if (isPublic) {
    return <>{children}</>;
  }

  if (isPublicSiteCmsEdit) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6">{children}</div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted">
        Redirecting to login…
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
