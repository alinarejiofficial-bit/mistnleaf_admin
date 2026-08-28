"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { WebsiteCmsManager } from "@/components/cms/WebsiteCmsManager";
import { usePermissions } from "@/components/auth/usePermissions";

export function WebsitePageRouter() {
  const router = useRouter();
  const { isWebsiteContentManager } = usePermissions();

  useEffect(() => {
    if (isWebsiteContentManager) {
      router.replace("/website/homepage");
    }
  }, [isWebsiteContentManager, router]);

  if (isWebsiteContentManager) return null;

  return <WebsiteCmsManager showInternalNav />;
}
