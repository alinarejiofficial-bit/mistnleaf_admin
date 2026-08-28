"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { canEditCmsContent } from "@/lib/cms-api-auth";
import {
  getPublicSiteSection,
  type PublicSiteSectionId,
} from "@/lib/public-site-sections";

type PublicSiteSectionProps = {
  sectionId: PublicSiteSectionId;
  children: React.ReactNode;
  className?: string;
};

export function PublicSiteSection({ sectionId, children, className = "" }: PublicSiteSectionProps) {
  const { currentUser } = useAuth();
  const config = getPublicSiteSection(sectionId);
  const canEdit = currentUser && canEditCmsContent(currentUser.roleId);

  if (!config) return <section className={className}>{children}</section>;

  return (
    <section id={config.id} className={`relative scroll-mt-24 ${className}`}>
      {canEdit ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-4 sm:p-6">
          <Link
            href={`/website/${config.cmsSection}`}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#9dceb8]/40 bg-[#0f1a14]/90 px-4 py-2 text-sm font-medium text-[#9dceb8] shadow-lg backdrop-blur-sm transition hover:border-[#9dceb8] hover:bg-[#1b4d3e]/80 hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit {config.label}
          </Link>
        </div>
      ) : null}
      {children}
    </section>
  );
}
