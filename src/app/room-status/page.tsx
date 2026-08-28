import { HousekeepingShell } from "@/components/housekeeping/HousekeepingShell";
import { RoomStatusView } from "@/components/housekeeping/RoomStatusView";

export const metadata = { title: "Room Status" };

export default function RoomStatusPage() {
  return (
    <HousekeepingShell>
      <RoomStatusView />
    </HousekeepingShell>
  );
}
