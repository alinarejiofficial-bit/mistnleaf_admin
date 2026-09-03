"use client";

import { useState } from "react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useOps } from "@/components/ops/OpsProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard, StatPill } from "@/components/ui/ModulePrimitives";
import { formatDisplayDate } from "@/lib/data";

const cellStyles = {
  free: "bg-[#e8f3ec] text-success",
  occupied: "bg-brand-soft text-brand",
  reserved: "bg-[#e7f0f5] text-info",
  blocked: "bg-[#f8e9e6] text-danger",
};

const labels = {
  free: "Free",
  occupied: "Occ",
  reserved: "Res",
  blocked: "OOO",
};

type RoomFilter = "All" | string;

export function CalendarManager() {
  const { calendar, today } = useOps();
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("All");
  const rooms = calendar.grid.map((row) => row.room);
  const filtered =
    roomFilter === "All"
      ? calendar.grid
      : calendar.grid.filter((row) => row.room === roomFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="7-day occupancy board from live bookings and room status."
      />
      <div className="grid gap-3 sm:grid-cols-4">
        <StatPill label="Free" value="Open inventory" tone="success" />
        <StatPill label="Occupied" value="In-house" tone="brand" />
        <StatPill label="Reserved" value="Future hold" tone="info" />
        <StatPill label="Blocked" value="OOO / clean" tone="danger" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={roomFilter}
          onChange={(e) => setRoomFilter(e.target.value)}
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
        >
          <option value="All">All rooms</option>
          {rooms.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
        <PermissionGate action="calendar.assignRoom">
          <p className="text-sm text-muted">Assign rooms from Reservations or Rooms.</p>
        </PermissionGate>
      </div>

      <SectionCard
        title={`Room calendar · from ${formatDisplayDate(today)}`}
        description="Occupied and reserved cells come from website and desk bookings"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Room</th>
                {calendar.days.map((day) => (
                  <th key={day} className="px-3 py-3 text-center font-medium">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.room} className="border-t border-border-subtle">
                  <td className="px-4 py-3 font-medium text-foreground">{row.room}</td>
                  {row.days.map((cell, index) => (
                    <td key={`${row.room}-${index}`} className="px-2 py-2 text-center">
                      <span
                        className={`inline-flex min-w-12 justify-center rounded-lg px-2 py-1 text-xs font-medium ${cellStyles[cell]}`}
                      >
                        {labels[cell]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted">
                    No rooms loaded from the backend yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
