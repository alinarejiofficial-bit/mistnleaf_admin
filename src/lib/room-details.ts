import { formatDisplayDate } from "@/lib/data";
import { reservations } from "@/lib/reservations";
import type { HousekeepingTask, MaintenanceTicket } from "@/lib/ops-data";
import type { Room } from "@/lib/rooms";

export function getRoomView(room: Room) {
  return (
    room.amenities.find((amenity) => amenity.toLowerCase().includes("view")) ??
    "Courtyard"
  );
}

export function getRoomLastCleaned(room: Room) {
  if (room.status === "Cleaning") return "Cleaning in progress";
  if (room.status === "Maintenance") return "On hold — maintenance";
  if (room.status === "Occupied") return "Stayover service scheduled";
  if (room.status === "Reserved") return "Pre-arrival prep pending";
  return "Today";
}

export function getRoomLinkedData(
  room: Room,
  bookings = reservations,
  housekeeping: HousekeepingTask[] = [],
  maintenance: MaintenanceTicket[] = [],
) {
  const reservation =
    (room.reservationId
      ? bookings.find((item) => item.id === room.reservationId)
      : undefined) ??
    bookings.find((item) => item.room === room.name);

  const housekeepingForRoom = housekeeping.filter((task) => task.room === room.name);
  const maintenanceForRoom = maintenance.filter((ticket) => ticket.room === room.name);
  const activeHousekeeping =
    housekeepingForRoom.find((task) => task.status !== "Done") ?? housekeepingForRoom[0];
  const openMaintenance =
    maintenanceForRoom.find((ticket) => ticket.status !== "Resolved") ?? maintenanceForRoom[0];

  return {
    reservation,
    view: getRoomView(room),
    lastCleaned: getRoomLastCleaned(room),
    activeHousekeeping,
    openMaintenance,
    formatCheckIn: reservation ? formatDisplayDate(reservation.checkIn) : null,
    formatCheckOut: reservation ? formatDisplayDate(reservation.checkOut) : null,
  };
}
