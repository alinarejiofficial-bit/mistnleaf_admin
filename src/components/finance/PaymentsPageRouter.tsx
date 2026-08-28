"use client";

import { usePermissions } from "@/components/auth/usePermissions";
import { PaymentsManager } from "@/components/finance/PaymentsManager";
import { FinancePaymentsManager } from "@/components/finance/FinancePaymentsManager";

export function PaymentsPageRouter() {
  const { isAccountant } = usePermissions();
  if (isAccountant) return <FinancePaymentsManager />;
  return <PaymentsManager />;
}
