import { HousekeepingShell } from "@/components/housekeeping/HousekeepingShell";
import { CleaningTasksView } from "@/components/housekeeping/CleaningTasksView";

export const metadata = { title: "Cleaning Tasks" };

export default function CleaningTasksPage() {
  return (
    <HousekeepingShell>
      <CleaningTasksView />
    </HousekeepingShell>
  );
}
