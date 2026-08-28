import { HousekeepingShell } from "@/components/housekeeping/HousekeepingShell";
import { StaffMaintenanceView } from "@/components/housekeeping/StaffMaintenanceView";

export const metadata = { title: "Maintenance Issues" };

export default function MaintenanceIssuesPage() {
  return (
    <HousekeepingShell>
      <StaffMaintenanceView />
    </HousekeepingShell>
  );
}
