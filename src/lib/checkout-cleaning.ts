import {
  assignedRoomsSeed,
  HK_STORAGE_KEY,
  type AssignedRoom,
  type HousekeepingRoomStatus,
} from "@/lib/housekeeping-data";

/** Queue a room for housekeeping after front-desk check-out. */
export function queueRoomForCleaningAfterCheckout(
  roomName: string,
  assignee = "Sofia Fernandes",
): void {
  if (typeof window === "undefined") return;

  let rooms: AssignedRoom[] = assignedRoomsSeed;
  try {
    const raw = window.localStorage.getItem(HK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AssignedRoom[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        rooms = parsed;
      }
    }
  } catch {
    // use seed
  }

  const existing = rooms.find((room) => room.roomNumber === roomName);
  if (existing) {
    const updated = rooms.map((room) =>
      room.roomNumber === roomName
        ? {
            ...room,
            status: "Dirty" as HousekeepingRoomStatus,
            taskType: "Checkout clean" as const,
            priority: "High" as const,
          }
        : room,
    );
    window.localStorage.setItem(HK_STORAGE_KEY, JSON.stringify(updated));
    return;
  }

  const newRoom: AssignedRoom = {
    id: `AR-${Date.now().toString().slice(-4)}`,
    roomNumber: roomName,
    roomType: roomName.split(" ")[0] ?? "Room",
    status: "Dirty",
    priority: "High",
    taskType: "Checkout clean",
    assignee,
    checkoutTime: new Date().toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };

  window.localStorage.setItem(HK_STORAGE_KEY, JSON.stringify([newRoom, ...rooms]));
}
