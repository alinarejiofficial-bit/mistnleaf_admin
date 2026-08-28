"use client";

import { WebsiteCmsManager } from "@/components/cms/WebsiteCmsManager";
import type { CmsRouteSection } from "@/lib/cms-data";

export function WebsiteCmsSectionPage({ section }: { section: CmsRouteSection }) {
  return (
    <WebsiteCmsManager initialSection={section} showInternalNav compactHeader />
  );
}
