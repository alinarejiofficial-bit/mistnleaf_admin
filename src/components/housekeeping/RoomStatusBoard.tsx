"use client";

import { useHousekeeping, statusStyles } from "@/components/housekeeping/HousekeepingProvider";
import type { HousekeepingRoomStatus } from "@/lib/housekeeping-data";

const groups: HousekeepingRoomStatus[] = [
  "Dirty",
  "Cleaning Required",
  "Cleaning in Progress",
  "Clean",
  "Inspected",
  "Ready",
];

const groupDescriptions: Record<HousekeepingRoomStatus, string> = {
  Dirty: "Just vacated — needs to enter cleaning queue",
  "Cleaning Required": "Needs attention before the next guest",
  "Cleaning in Progress": "Currently being serviced",
  Clean: "Cleaning complete — awaiting inspection",
  Inspected: "Inspected — ready to mark available",
  Ready: "Available for check-in",
};

export function RoomStatusBoard({ scope = "mine" }: { scope?: "mine" | "property" }) {
  const { myRooms, allRooms } = useHousekeeping();
  const rooms = scope === "property" ? allRooms : myRooms;

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {groups.map((status) => {
        const items = rooms.filter((r) => r.status === status);
        return (
          <div
            key={status}
            className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg text-foreground">{status}</h3>
                <p className="mt-0.5 text-xs text-muted">{groupDescriptions[status]}</p>
              </div>
              <span
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-sm font-semibold ${statusStyles[status]}`}
              >
                {items.length}
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {items.slice(0, 6).map((room) => (
                <li
                  key={room.id}
                  className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-muted/40 px-3.5 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{room.roomNumber}</p>
                    <p className="text-xs text-muted">{room.roomType}</p>
                  </div>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-medium ${statusStyles[status]}`}
                  >
                    {room.priority}
                  </span>
                </li>
              ))}
              {items.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border-subtle px-3.5 py-6 text-center text-sm text-muted">
                  No rooms in this status
                </li>
              ) : null}
              {items.length > 6 ? (
                <li className="text-center text-xs text-muted">
                  +{items.length - 6} more
                </li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
