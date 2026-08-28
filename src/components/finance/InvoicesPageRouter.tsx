"use client";

import { usePermissions } from "@/components/auth/usePermissions";
import { InvoicesManager } from "@/components/finance/InvoicesManager";
import { FinanceInvoicesManager } from "@/components/finance/FinanceInvoicesManager";

export function InvoicesPageRouter() {
  const { isAccountant } = usePermissions();
  if (isAccountant) return <FinanceInvoicesManager />;
  return <InvoicesManager />;
}
