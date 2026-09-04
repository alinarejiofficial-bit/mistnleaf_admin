"use client";

import { useMemo, useState } from "react";
import {
  BedDouble,
  CalendarRange,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useOps } from "@/components/ops/OpsProvider";
import { RoomInventoryModal } from "@/components/rooms/RoomInventoryModal";
import { RoomStatusModal } from "@/components/rooms/RoomStatusModal";
import { useFloatingToast } from "@/components/ui/useFloatingToast";
import { formatINR } from "@/lib/data";
import { getRoomLinkedData } from "@/lib/room-details";
import {
  paymentStatusStyles,
  reservationStatusStyles,
} from "@/lib/reservations";
import {
  getRoomStatusCounts,
  roomStatusStyles,
  roomTypes as fallbackRoomTypes,
  type Room,
  type RoomStatus,
  type RoomType,
} from "@/lib/rooms";
import { PageHeader } from "@/components/ui/PageHeader";

type StatusFilter = "All" | RoomStatus;

const statusFilters: StatusFilter[] = [
  "All",
  "Available",
  "Occupied",
  "Reserved",
  "Cleaning",
  "Maintenance",
];

export function RoomsManager() {
  const {
    rooms,
    bookings,
    hkTasks,
    maintenance,
    roomTypeNames,
    addRoom,
    saveRoom,
    saveRoomStatus,
    error,
  } = useOps();
  const types = roomTypeNames.length ? roomTypeNames : fallbackRoomTypes;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [type, setType] = useState<"All" | RoomType>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roomModal, setRoomModal] = useState<Room | "new" | null>(null);
  const [statusModalRoom, setStatusModalRoom] = useState<Room | null>(null);
  const { showToast, toast } = useFloatingToast();

  const counts = getRoomStatusCounts(rooms);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter((room) => {
      if (status !== "All" && room.status !== status) return false;
      if (type !== "All" && room.type !== type) return false;
      if (!q) return true;
      return (
        room.name.toLowerCase().includes(q) ||
        room.number.includes(q) ||
        room.type.toLowerCase().includes(q) ||
        room.guest?.toLowerCase().includes(q) ||
        room.id.toLowerCase().includes(q)
      );
    });
  }, [query, status, type, rooms]);

  const selected =
    filtered.find((room) => room.id === selectedId) ??
    filtered[0] ??
    rooms.find((room) => room.id === selectedId) ??
    null;

  function openAddRoom() {
    setRoomModal("new");
  }

  function openEditRoom(room: Room) {
    setRoomModal(room);
  }

  async function persistRoom(room: Room) {
    const isUpdate = rooms.some((item) => item.id === room.id);
    try {
      if (isUpdate) await saveRoom(room);
      else await addRoom(room);
      setSelectedId(room.id);
      showToast(isUpdate ? "Room updated." : "Room added.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save room.";
      showToast(message, "error");
      throw err instanceof Error ? err : new Error(message);
    }
  }

  async function persistRoomStatus(room: Room) {
    try {
      await saveRoomStatus(room);
      showToast(`${room.name} marked as ${room.status}.`);
    } catch {
      showToast("Could not update room status.", "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms"
        description="Add rooms under a type (e.g. filter Mist Cottage, then Add room for the next unit). Manage rates and availability."
        action={
          <PermissionGate action="rooms.create">
            <button
              type="button"
              onClick={openAddRoom}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              {type !== "All" ? `Add ${type} room` : "Add room"}
            </button>
          </PermissionGate>
        }
      />

      {error ? (
        <p className="rounded-2xl border border-danger/20 bg-[#f8e9e6]/80 px-5 py-3 text-sm text-danger">
          {error} Use Sign out, then sign in again at the login page while Django is on port 3001.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatPill label="Total" value={counts.total} />
        <StatPill label="Available" value={counts.available} tone="success" />
        <StatPill label="Occupied" value={counts.occupied} tone="brand" />
        <StatPill label="Reserved" value={counts.reserved} tone="info" />
        <StatPill label="Cleaning" value={counts.cleaning} tone="warning" />
        <StatPill label="Maintenance" value={counts.maintenance} tone="danger" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search room, guest, or type..."
            className="h-11 w-full rounded-xl border border-border bg-surface pr-3 pl-10 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as "All" | RoomType)
            }
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
          >
            <option value="All">All types</option>
            {types.map((roomType) => (
              <option key={roomType} value={roomType}>
                {roomType}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatus(filter)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              status === filter
                ? "bg-brand text-white"
                : "border border-border bg-surface text-foreground hover:bg-surface-muted"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <div className="border-b border-border-subtle px-5 py-4">
            <h2 className="font-display text-xl text-foreground">Rooms</h2>
            <p className="mt-1 text-sm text-muted">
              Showing {filtered.length} of {rooms.length} rooms
              {type !== "All"
                ? ` · ${type} has ${rooms.filter((room) => room.type === type).length} unit(s)`
                : ""}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Rate</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((room) => (
                  <tr
                    key={room.id}
                    onClick={() => setSelectedId(room.id)}
                    className={`cursor-pointer border-t border-border-subtle transition hover:bg-surface-muted/50 ${
                      selected?.id === room.id ? "bg-brand-soft/40" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">{room.name}</div>
                      <div className="text-xs text-muted">
                        Floor {room.floor} · {room.id}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-foreground">{room.type}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-foreground">
                      {formatINR(room.rate)}
                      <span className="text-xs font-normal text-muted"> / night</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${roomStatusStyles[room.status]}`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {room.guest ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <PermissionGate action="rooms.edit">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditRoom(room);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-muted"
                    >
                      No rooms match your filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <RoomDetailsPanel
          room={selected}
          onEdit={openEditRoom}
          onUpdateStatus={setStatusModalRoom}
          bookings={bookings}
          hkTasks={hkTasks}
          maintenance={maintenance}
        />
      </div>

      <RoomInventoryModal
        open={roomModal !== null}
        room={roomModal === "new" ? null : roomModal}
        isNew={roomModal === "new"}
        existingRooms={rooms}
        roomTypesList={types}
        preferredType={type !== "All" ? type : undefined}
        onClose={() => setRoomModal(null)}
        onSave={persistRoom}
      />

      <RoomStatusModal
        open={statusModalRoom !== null}
        room={statusModalRoom}
        onClose={() => setStatusModalRoom(null)}
        onSave={persistRoomStatus}
      />

      {toast}
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "brand" | "info" | "warning" | "danger";
}) {
  const tones = {
    default: "border-border-subtle bg-surface",
    success: "border-success/20 bg-[#e8f3ec]/70",
    brand: "border-brand/20 bg-brand-soft/70",
    info: "border-info/20 bg-[#e7f0f5]/80",
    warning: "border-accent/30 bg-accent-soft/70",
    danger: "border-danger/20 bg-[#f8e9e6]/80",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${tones[tone]}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl text-foreground">{value}</p>
    </div>
  );
}

function RoomDetailsPanel({
  room,
  onEdit,
  onUpdateStatus,
  bookings,
  hkTasks,
  maintenance,
}: {
  room: Room | null;
  onEdit: (room: Room) => void;
  onUpdateStatus: (room: Room) => void;
  bookings: import("@/lib/reservations").Reservation[];
  hkTasks: import("@/lib/ops-data").HousekeepingTask[];
  maintenance: import("@/lib/ops-data").MaintenanceTicket[];
}) {
  if (!room) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-surface/70 p-6 text-center text-sm text-muted">
        Select a room to view details.
      </section>
    );
  }

  const linked = getRoomLinkedData(room, bookings, hkTasks, maintenance);
  const { reservation } = linked;

  return (
    <section className="max-h-[calc(100vh-12rem)] overflow-y-auto rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-brand-mid uppercase">
            Room details
          </p>
          <h2 className="mt-1 font-display text-3xl tracking-tight text-foreground">
            {room.name}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {room.id} · Room {room.number} · Floor {room.floor}
          </p>
        </div>
        <span
          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${roomStatusStyles[room.status]}`}
        >
          {room.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <DetailStat
          icon={<BedDouble className="h-4 w-4" />}
          label="Type"
          value={room.type}
        />
        <DetailStat
          icon={<Users className="h-4 w-4" />}
          label="Capacity"
          value={`${room.capacity} guests`}
        />
        <DetailStat label="Beds" value={room.beds} />
        <DetailStat label="Size" value={`${room.sizeSqFt} sq ft`} />
        <DetailStat label="View" value={linked.view} />
        <DetailStat label="Nightly rate" value={formatINR(room.rate)} />
        <DetailStat label="Last cleaned" value={linked.lastCleaned} />
        <DetailStat label="Smoking" value="Non-smoking" />
      </div>

      {reservation ? (
        <div className="mt-5 rounded-xl border border-brand/20 bg-brand-soft/30 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-brand-mid uppercase">
                Active stay
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {reservation.guest}
              </p>
              <p className="mt-0.5 text-xs text-muted">{reservation.id}</p>
            </div>
            <span
              className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${reservationStatusStyles[reservation.status]}`}
            >
              {reservation.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted">Check-in</p>
              <p className="mt-0.5 font-medium text-foreground">
                {linked.formatCheckIn}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Check-out</p>
              <p className="mt-0.5 font-medium text-foreground">
                {linked.formatCheckOut}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Nights</p>
              <p className="mt-0.5 font-medium text-foreground">
                {reservation.nights}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Guests</p>
              <p className="mt-0.5 font-medium text-foreground">
                {reservation.adults} adult{reservation.adults !== 1 ? "s" : ""}
                {reservation.children > 0
                  ? `, ${reservation.children} child${reservation.children !== 1 ? "ren" : ""}`
                  : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Source</p>
              <p className="mt-0.5 font-medium text-foreground">
                {reservation.source}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Payment</p>
              <span
                className={`mt-0.5 inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${paymentStatusStyles[reservation.paymentStatus]}`}
              >
                {reservation.paymentStatus}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-brand/15 pt-3 text-sm">
            <span className="text-muted">Stay total</span>
            <span className="font-display text-lg text-foreground">
              {formatINR(reservation.amount)}
            </span>
          </div>

          <div className="mt-4 space-y-2 border-t border-brand/15 pt-3">
            <ContactRow icon={<Mail className="h-3.5 w-3.5" />} value={reservation.email} />
            <ContactRow icon={<Phone className="h-3.5 w-3.5" />} value={reservation.phone} />
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-border-subtle bg-surface-muted/40 px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarRange className="h-4 w-4 text-muted" />
            No active reservation
          </div>
          <p className="mt-1 text-sm text-muted">
            {room.status === "Available"
              ? "Room is ready for the next booking."
              : room.status === "Reserved"
                ? "Awaiting guest arrival."
                : "No guest currently assigned to this room."}
          </p>
        </div>
      )}

      {(linked.activeHousekeeping || linked.openMaintenance) && (
        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Operations</h3>

          {linked.activeHousekeeping ? (
            <div className="rounded-xl border border-border-subtle bg-surface-muted/40 px-3.5 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-brand-mid" />
                Housekeeping
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted">Task</p>
                  <p className="font-medium text-foreground">
                    {linked.activeHousekeeping.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Assignee</p>
                  <p className="font-medium text-foreground">
                    {linked.activeHousekeeping.assignee}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Status</p>
                  <p className="font-medium text-foreground">
                    {linked.activeHousekeeping.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Due</p>
                  <p className="font-medium text-foreground">
                    {linked.activeHousekeeping.due}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {linked.openMaintenance ? (
            <div className="rounded-xl border border-danger/20 bg-[#f8e9e6]/50 px-3.5 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Wrench className="h-4 w-4 text-danger" />
                Maintenance
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="col-span-2">
                  <p className="text-xs text-muted">Issue</p>
                  <p className="font-medium text-foreground">
                    {linked.openMaintenance.issue}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Priority</p>
                  <p className="font-medium text-foreground">
                    {linked.openMaintenance.priority}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Status</p>
                  <p className="font-medium text-foreground">
                    {linked.openMaintenance.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Reported by</p>
                  <p className="font-medium text-foreground">
                    {linked.openMaintenance.reportedBy}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Reported on</p>
                  <p className="font-medium text-foreground">
                    {linked.openMaintenance.reportedAt}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">Amenities</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {room.amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-lg border border-border-subtle bg-surface-muted/60 px-2.5 py-1 text-xs text-foreground"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {room.notes ? (
        <div className="mt-5 rounded-xl border border-border-subtle bg-surface-muted/50 px-3.5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Notes</h3>
          <p className="mt-1 text-sm text-muted">{room.notes}</p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
        <PermissionGate action="rooms.edit">
          <button
            type="button"
            onClick={() => onEdit(room)}
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
          >
            Edit room
          </button>
        </PermissionGate>
        <PermissionGate action="rooms.updateStatus">
          <button
            type="button"
            onClick={() => onUpdateStatus(room)}
            className="rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Update status
          </button>
        </PermissionGate>
      </div>
    </section>
  );
}

function ContactRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      {icon}
      <span>{value}</span>
    </div>
  );
}

function DetailStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-muted/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
