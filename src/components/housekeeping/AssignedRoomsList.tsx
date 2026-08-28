"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AssignedRoomEditModal } from "@/components/housekeeping/AssignedRoomEditModal";
import {
  priorityStyles,
  statusStyles,
  useHousekeeping,
} from "@/components/housekeeping/HousekeepingProvider";
import { useFloatingToast } from "@/components/ui/useFloatingToast";
import { getActionForStatus } from "@/lib/housekeeping-data";
import type { AssignedRoom } from "@/lib/housekeeping-data";

type AssignedRoomsListProps = {
  rooms?: AssignedRoom[];
  title?: string;
  description?: string;
  compact?: boolean;
};

const actionLabels: Record<string, string> = {
  "Start Cleaning": "Start Cleaning",
  "Mark Clean": "Mark Clean",
  "Send for Inspection": "Send for Inspection",
  "Mark Ready": "Mark Ready",
};

export function AssignedRoomsList({
  rooms: roomsProp,
  title = "My Assigned Rooms",
  description = "Rooms assigned to you today — update status or edit details.",
  compact = false,
}: AssignedRoomsListProps) {
  const { myRooms, updateRoomStatus, updateRoom } = useHousekeeping();
  const [editingRoom, setEditingRoom] = useState<AssignedRoom | null>(null);
  const { showToast, toast } = useFloatingToast();
  const rooms = roomsProp ?? myRooms;

  if (rooms.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border-subtle bg-surface/80 p-10 text-center">
        <p className="font-display text-xl text-foreground">No rooms assigned</p>
        <p className="mt-2 text-sm text-muted">
          Your supervisor will assign rooms when they become available.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
        <div className="border-b border-border-subtle px-5 py-4 sm:px-6">
          <h2 className="font-display text-xl text-foreground">{title}</h2>
          {!compact ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/50 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3.5 font-medium">Room</th>
                <th className="px-5 py-3.5 font-medium">Type</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Priority</th>
                <th className="px-5 py-3.5 font-medium">Check-out / Check-in</th>
                <th className="px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const action = getActionForStatus(room.status);
                return (
                  <tr
                    key={room.id}
                    className="border-t border-border-subtle transition hover:bg-surface-muted/30"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{room.roomNumber}</p>
                      <p className="text-xs text-muted">{room.taskType}</p>
                      {room.notes ? (
                        <p className="mt-1 text-xs text-muted italic">{room.notes}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-foreground">{room.roomType}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium ${statusStyles[room.status]}`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${priorityStyles[room.priority]}`}
                      >
                        {room.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {room.checkoutTime ? (
                        <span className="block">Out {room.checkoutTime}</span>
                      ) : null}
                      {room.checkinTime ? (
                        <span className="block">In {room.checkinTime}</span>
                      ) : null}
                      {!room.checkoutTime && !room.checkinTime ? "—" : null}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <RoomActionButton
                          room={room}
                          action={action}
                          onAction={updateRoomStatus}
                        />
                        <PermissionGate action="housekeeping.update">
                          <button
                            type="button"
                            onClick={() => setEditingRoom(room)}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                            title="Edit room details"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <AssignedRoomEditModal
        open={Boolean(editingRoom)}
        room={editingRoom}
        onClose={() => setEditingRoom(null)}
        onSave={(roomId, patch) => {
          updateRoom(roomId, patch);
          showToast("Room details updated.");
        }}
      />

      {toast}
    </>
  );
}

function RoomActionButton({
  room,
  action,
  onAction,
}: {
  room: AssignedRoom;
  action: string;
  onAction: (id: string, action: string) => void;
}) {
  if (action === "View") {
    return <span className="text-xs text-muted">Ready for guests</span>;
  }

  const permission =
    action === "Mark Ready" ? "housekeeping.markReady" : "housekeeping.update";

  return (
    <PermissionGate action={permission}>
      <button
        type="button"
        onClick={() => onAction(room.id, action)}
        className={`min-h-10 min-w-[7.5rem] rounded-xl px-4 py-2.5 text-sm font-medium transition ${
          room.priority === "High"
            ? "bg-brand text-white hover:bg-brand-hover"
            : "border border-border bg-surface hover:bg-surface-muted"
        }`}
      >
        {actionLabels[action] ?? action}
      </button>
    </PermissionGate>
  );
}
