import type { AssignedRoom, HousekeepingRoomStatus } from "@/lib/housekeeping-data";
import { formatDisplayDate } from "@/lib/data";
import type { Reservation } from "@/lib/reservations";
import { bookingMatchesRoom } from "@/lib/rooms";

export const HK_ROOM_OVERLAYS_KEY = "mistnleaf_hk_room_overlays_v1";

export type HkRoomOverlay = {
  id: string;
  priority?: AssignedRoom["priority"];
  taskType?: AssignedRoom["taskType"];
  checkoutTime?: string;
  checkinTime?: string;
  notes?: string;
  status?: HousekeepingRoomStatus;
};

export function loadHkRoomOverlays(): HkRoomOverlay[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HK_ROOM_OVERLAYS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HkRoomOverlay[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHkRoomOverlays(overlays: HkRoomOverlay[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HK_ROOM_OVERLAYS_KEY, JSON.stringify(overlays));
  } catch {
    // ignore quota errors
  }
}

export function upsertHkRoomOverlay(
  overlays: HkRoomOverlay[],
  next: HkRoomOverlay,
): HkRoomOverlay[] {
  return [...overlays.filter((item) => item.id !== next.id), next];
}

export function applyHkRoomOverlays(
  rooms: AssignedRoom[],
  overlays: HkRoomOverlay[],
): AssignedRoom[] {
  if (!overlays.length) return rooms;
  return rooms.map((room) => {
    const overlay = overlays.find((item) => item.id === room.id);
    if (!overlay) return room;
    return {
      ...room,
      priority: overlay.priority ?? room.priority,
      taskType: overlay.taskType ?? room.taskType,
      checkoutTime:
        overlay.checkoutTime !== undefined ? overlay.checkoutTime || undefined : room.checkoutTime,
      checkinTime:
        overlay.checkinTime !== undefined ? overlay.checkinTime || undefined : room.checkinTime,
      notes: overlay.notes !== undefined ? overlay.notes || undefined : room.notes,
      status: overlay.status ?? room.status,
    };
  });
}

/** Fill check-in / check-out display from live bookings when overlay has no times. */
export function enrichAssignedRoomsWithBookings(
  rooms: AssignedRoom[],
  bookings: Reservation[],
): AssignedRoom[] {
  if (!bookings.length) return rooms;
  return rooms.map((room) => {
    const related = bookings.filter((booking) =>
      bookingMatchesRoom(booking, {
        id: room.id,
        number: room.roomNumber,
        name: room.roomNumber,
        type: room.roomType,
        floor: 1,
        capacity: 2,
        beds: "",
        rate: 0,
        sizeSqFt: 0,
        amenities: [],
        status: "Available",
      }),
    );
    if (!related.length) return room;

    const active =
      related.find((booking) => booking.status === "Checked-in") ??
      related.find(
        (booking) => booking.status === "Confirmed" || booking.status === "Pending",
      ) ??
      related[0];

    const nextArrival = related
      .filter(
        (booking) =>
          (booking.status === "Confirmed" || booking.status === "Pending") &&
          (!active || booking.id !== active.id),
      )
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];

    return {
      ...room,
      checkoutTime:
        room.checkoutTime ||
        (active ? formatDisplayDate(active.checkOut) : undefined),
      checkinTime:
        room.checkinTime ||
        (nextArrival
          ? formatDisplayDate(nextArrival.checkIn)
          : active
            ? formatDisplayDate(active.checkIn)
            : undefined),
      taskType:
        room.taskType ||
        (active?.status === "Checked-in" ? "Stayover" : "Checkout clean"),
    };
  });
}
