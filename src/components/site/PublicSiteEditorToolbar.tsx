"use client";

import Link from "next/link";
import { LayoutGrid, LogOut, Pencil } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { canEditCmsContent } from "@/lib/cms-api-auth";

export function PublicSiteEditorToolbar() {
  const { currentUser, logout } = useAuth();

  if (!currentUser || !canEditCmsContent(currentUser.roleId)) return null;

  return (
    <div className="border-b border-[#9dceb8]/25 bg-[#1b4d3e]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2 text-sm">
          <Pencil className="h-4 w-4 text-[#9dceb8]" />
          <span>
            Editing as <span className="font-medium">{currentUser.name}</span>
          </span>
          <span className="hidden text-white/55 sm:inline">· click any section to edit</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/website/homepage"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/10 sm:text-sm"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            CMS dashboard
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/10 sm:text-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
