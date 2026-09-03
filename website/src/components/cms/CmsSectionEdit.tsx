"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { getCmsAdminBase } from "@/lib/cms/fetch";

type CmsSectionEditProps = {
  section: string;
  label: string;
  className?: string;
  /** Override admin CMS path (e.g. homepage?edit=about). */
  adminPath?: string;
};

export function CmsSectionEdit({
  section,
  label,
  className = "",
  adminPath,
}: CmsSectionEditProps) {
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "1";

  if (!editMode) return null;

  const adminBase = getCmsAdminBase();
  const href = adminPath
    ? `${adminBase}${adminPath.startsWith("/") ? adminPath : `/${adminPath}`}`
    : `${adminBase}/website/${section}`;

  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end p-4 sm:p-6 ${className}`}>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-pine/30 bg-fog/95 px-4 py-2 text-sm font-medium text-pine shadow-lg backdrop-blur-sm transition hover:bg-white"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit {label}
      </Link>
    </div>
  );
}
