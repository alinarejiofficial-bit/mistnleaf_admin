"use client";

import { useState } from "react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { calendarDays, calendarGrid } from "@/lib/ops-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

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
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("All");
  const rooms = calendarGrid.map((row) => row.room);
  const filtered =
    roomFilter === "All"
      ? calendarGrid
      : calendarGrid.filter((row) => row.room === roomFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="7-day occupancy board across rooms and stay statuses."
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
          <button
            type="button"
            onClick={() => window.alert("Assign room from calendar (demo).")}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Assign room
          </button>
        </PermissionGate>
      </div>

      <SectionCard
        title="Room calendar · 20–26 Aug 2026"
        description="Reserved cells indicate potential conflicts — assign from Reservations or here"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Room</th>
                {calendarDays.map((day) => (
                  <th key={day} className="px-3 py-3 text-center font-medium">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.room} className="border-t border-border-subtle">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">
                    {row.room}
                  </td>
                  {row.days.map((status, index) => (
                    <td key={`${row.room}-${index}`} className="px-2 py-2">
                      <span
                        className={`flex h-9 items-center justify-center rounded-lg text-[11px] font-semibold ${cellStyles[status]}`}
                        title={
                          status === "blocked"
                            ? "Out of order / conflict"
                            : undefined
                        }
                      >
                        {labels[status]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
