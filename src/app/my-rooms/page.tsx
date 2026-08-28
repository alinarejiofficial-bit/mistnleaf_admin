import { HousekeepingShell } from "@/components/housekeeping/HousekeepingShell";
import { AssignedRoomsList } from "@/components/housekeeping/AssignedRoomsList";
import { HousekeepingGreeting } from "@/components/housekeeping/HousekeepingGreeting";

export const metadata = { title: "My Rooms" };

export default function MyRoomsPage() {
  return (
    <HousekeepingShell>
      <div className="space-y-6">
        <HousekeepingGreeting />
        <AssignedRoomsList />
      </div>
    </HousekeepingShell>
  );
}
