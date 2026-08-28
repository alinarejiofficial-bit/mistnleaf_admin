"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MistnLeafLogo } from "@/components/brand/MistnLeafLogo";
import { PublicSiteEditorToolbar } from "@/components/site/PublicSiteEditorToolbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { canEditCmsContent } from "@/lib/cms-api-auth";
import { getPublicNavHref, getPublicSiteBasePath } from "@/lib/public-site-nav";
import { publicSiteNavSections } from "@/lib/public-site-sections";

export function PublicSiteHeader() {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const isEditor = currentUser && canEditCmsContent(currentUser.roleId);
  const homeHref = getPublicSiteBasePath() || "/";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f1a14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={homeHref}>
            <MistnLeafLogo variant="compact" className="max-w-[140px]" />
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-white/75 md:flex">
            {publicSiteNavSections.map((section) => {
              const href = getPublicNavHref(section);
              const isActive =
                section.standalonePage && pathname === href;

              return (
                <Link
                  key={section.id}
                  href={href}
                  className={isActive ? "font-medium text-white" : "hover:text-white"}
                >
                  {section.navLabel}
                </Link>
              );
            })}
          </nav>
          {isEditor ? (
            <span className="rounded-full border border-[#9dceb8]/30 bg-[#1b4d3e]/50 px-4 py-2 text-sm font-medium text-[#9dceb8]">
              Content editor
            </span>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Staff login
            </Link>
          )}
        </div>
      </header>
      <PublicSiteEditorToolbar />
    </>
  );
}
