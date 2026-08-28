"use client";

import { AssignedRoomsList } from "@/components/housekeeping/AssignedRoomsList";
import { HousekeepingGreeting } from "@/components/housekeeping/HousekeepingGreeting";
import { useHousekeeping } from "@/components/housekeeping/HousekeepingProvider";

export function CleaningTasksView() {
  const { myRooms } = useHousekeeping();
  const active = myRooms.filter((r) => r.status !== "Ready");

  return (
    <div className="space-y-6">
      <HousekeepingGreeting />
      <AssignedRoomsList
        rooms={active}
        title="Cleaning tasks"
        description="Active tasks requiring your attention today."
      />
    </div>
  );
}
