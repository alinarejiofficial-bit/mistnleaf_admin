import { formatDisplayDate } from "@/lib/data";
import {
  housekeepingTasks,
  maintenanceTickets,
} from "@/lib/ops-data";
import { reservations } from "@/lib/reservations";
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

  const doneTask = housekeepingTasks.find(
    (task) => task.room === room.name && task.status === "Done",
  );
  if (doneTask) return doneTask.due;

  if (room.status === "Occupied") return "Stayover service scheduled";
  if (room.status === "Reserved") return "Pre-arrival prep pending";
  return "Today 09:30";
}

export function getRoomLinkedData(room: Room) {
  const reservation =
    (room.reservationId
      ? reservations.find((item) => item.id === room.reservationId)
      : undefined) ??
    reservations.find((item) => item.room === room.name);

  const housekeeping = housekeepingTasks.filter((task) => task.room === room.name);
  const maintenance = maintenanceTickets.filter((ticket) => ticket.room === room.name);
  const activeHousekeeping =
    housekeeping.find((task) => task.status !== "Done") ?? housekeeping[0];
  const openMaintenance =
    maintenance.find((ticket) => ticket.status !== "Resolved") ?? maintenance[0];

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
