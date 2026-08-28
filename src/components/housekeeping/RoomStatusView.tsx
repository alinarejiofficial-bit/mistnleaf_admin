"use client";

import { HousekeepingGreeting } from "@/components/housekeeping/HousekeepingGreeting";
import { RoomStatusBoard } from "@/components/housekeeping/RoomStatusBoard";

export function RoomStatusView() {
  return (
    <div className="space-y-6">
      <HousekeepingGreeting />
      <RoomStatusBoard scope="mine" />
    </div>
  );
}
