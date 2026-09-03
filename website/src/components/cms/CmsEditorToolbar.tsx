"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, Pencil } from "lucide-react";
import { getCmsAdminBase } from "@/lib/cms/fetch";

export function CmsEditorToolbar() {
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "1";

  if (!editMode) return null;

  const adminBase = getCmsAdminBase();

  return (
    <div className="border-b border-pine/20 bg-pine text-fog">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2 text-sm">
          <Pencil className="h-4 w-4 text-leaf" />
          <span>Website content edit mode — click a section to edit in the admin CMS</span>
        </div>
        <Link
          href={`${adminBase}/website/homepage`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-fog/25 px-3 py-1.5 text-xs font-medium hover:bg-fog/10 sm:text-sm"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Open CMS dashboard
        </Link>
      </div>
    </div>
  );
}
