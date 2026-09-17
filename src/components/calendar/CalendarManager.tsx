"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useOps } from "@/components/ops/OpsProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { addDaysISO, calendarFromOps } from "@/lib/ops-live";

const cellStyles = {
  free: "border-[#cfe6d7] bg-[#e8f3ec] text-success",
  occupied: "border-brand/25 bg-brand-soft text-brand",
  reserved: "border-info/25 bg-[#e7f0f5] text-info",
  blocked: "border-danger/25 bg-[#f8e9e6] text-danger",
};

const labels = {
  free: "Free",
  occupied: "Occ",
  reserved: "Res",
  blocked: "OOO",
};

const legend = [
  { key: "free", label: "Free", className: cellStyles.free },
  { key: "occupied", label: "Occupied", className: cellStyles.occupied },
  { key: "reserved", label: "Reserved", className: cellStyles.reserved },
  { key: "blocked", label: "Out of order", className: cellStyles.blocked },
] as const;

type RoomFilter = "All" | string;

function weekdayShort(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
  });
}

function monthDay(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
  });
}

function rangeTitle(from: string, to: string) {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return start.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }
  return `${start.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  })} – ${end.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function isWeekend(iso: string) {
  const day = new Date(`${iso}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

export function CalendarManager() {
  const { rooms, bookings, today } = useOps();
  const [weekStart, setWeekStart] = useState(today);
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("All");

  const calendar = useMemo(
    () => calendarFromOps(rooms, bookings, weekStart),
    [rooms, bookings, weekStart],
  );

  const roomNames = calendar.grid.map((row) => row.room);
  const filtered =
    roomFilter === "All"
      ? calendar.grid
      : calendar.grid.filter((row) => row.room === roomFilter);

  const isoDays = calendar.isoDays ?? calendar.days.map((_, index) => addDaysISO(weekStart, index));
  const weekEnd = isoDays[isoDays.length - 1] ?? weekStart;
  const title = rangeTitle(weekStart, weekEnd);

  function goPrevWeek() {
    setWeekStart((prev) => addDaysISO(prev, -7));
  }

  function goNextWeek() {
    setWeekStart((prev) => addDaysISO(prev, 7));
  }

  function goToday() {
    setWeekStart(today);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Weekly room occupancy — navigate weeks like a booking calendar."
      />

      <div className="flex flex-wrap items-center gap-2">
        {legend.map((item) => (
          <span
            key={item.key}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${item.className}`}
          >
            <span className="h-2 w-2 rounded-full bg-current opacity-70" />
            {item.label}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-muted/40 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={goPrevWeek}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition hover:bg-surface-muted"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNextWeek}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition hover:bg-surface-muted"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground transition hover:bg-surface-muted"
            >
              Today
            </button>
          </div>

          <div className="text-center">
            <h2 className="font-display text-xl text-foreground sm:text-2xl">{title}</h2>
            <p className="mt-0.5 text-xs text-muted">
              {new Date(`${weekStart}T12:00:00`).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}{" "}
              –{" "}
              {new Date(`${weekEnd}T12:00:00`).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roomFilter}
              onChange={(event) => setRoomFilter(event.target.value)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
            >
              <option value="All">All rooms</option>
              {roomNames.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
            <PermissionGate action="calendar.assignRoom">
              <p className="hidden text-sm text-muted xl:block">
                Assign rooms from Reservations
              </p>
            </PermissionGate>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 min-w-[140px] border-b border-r border-border-subtle bg-surface px-4 py-3 text-left text-xs font-medium tracking-wide text-muted uppercase">
                  Room
                </th>
                {isoDays.map((iso) => {
                  const weekend = isWeekend(iso);
                  const isToday = iso === today;
                  return (
                    <th
                      key={iso}
                      className={`min-w-[88px] border-b border-border-subtle px-2 py-3 text-center ${
                        weekend ? "bg-surface-muted/50" : "bg-surface"
                      } ${isToday ? "bg-brand-soft/50" : ""}`}
                    >
                      <div
                        className={`mx-auto flex w-14 flex-col items-center rounded-2xl px-1 py-1.5 ${
                          isToday ? "bg-brand text-white shadow-sm" : ""
                        }`}
                      >
                        <span
                          className={`text-[11px] font-medium uppercase tracking-wide ${
                            isToday ? "text-white/80" : weekend ? "text-muted" : "text-muted"
                          }`}
                        >
                          {weekdayShort(iso)}
                        </span>
                        <span
                          className={`font-display text-xl leading-none ${
                            isToday ? "text-white" : "text-foreground"
                          }`}
                        >
                          {monthDay(iso)}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.room} className="group">
                  <td className="sticky left-0 z-10 border-b border-r border-border-subtle bg-surface px-4 py-2.5 font-medium text-foreground group-hover:bg-surface-muted/40">
                    {row.room}
                  </td>
                  {row.days.map((cell, index) => {
                    const iso = isoDays[index];
                    const weekend = iso ? isWeekend(iso) : false;
                    const isToday = iso === today;
                    return (
                      <td
                        key={`${row.room}-${iso ?? index}`}
                        className={`border-b border-border-subtle p-1.5 ${
                          weekend ? "bg-surface-muted/30" : ""
                        } ${isToday ? "bg-brand-soft/20" : ""}`}
                      >
                        <div
                          className={`flex min-h-[52px] flex-col items-center justify-center rounded-xl border px-1.5 py-2 text-center ${cellStyles[cell]}`}
                          title={`${row.room} · ${iso ?? ""} · ${labels[cell]}`}
                        >
                          <span className="text-[11px] font-semibold uppercase tracking-wide">
                            {labels[cell]}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={(isoDays.length || 7) + 1}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    No rooms loaded from the backend yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
