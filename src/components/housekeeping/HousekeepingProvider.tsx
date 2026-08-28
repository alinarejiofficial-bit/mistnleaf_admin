"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  assignedRoomsSeed,
  countByStatus,
  nextStatus,
  staffMaintenanceReportsSeed,
  HK_REPORTS_KEY,
  HK_STORAGE_KEY,
  type AssignedRoom,
  type HousekeepingRoomStatus,
  type MaintenanceIssueCategory,
  type StaffMaintenanceReport,
} from "@/lib/housekeeping-data";

type HousekeepingContextValue = {
  myRooms: AssignedRoom[];
  allRooms: AssignedRoom[];
  summary: ReturnType<typeof countByStatus>;
  propertySummary: ReturnType<typeof countByStatus>;
  reports: StaffMaintenanceReport[];
  updateRoomStatus: (roomId: string, action: string) => void;
  updateRoom: (roomId: string, patch: Partial<AssignedRoom>) => void;
  reportIssue: (input: {
    room: string;
    category: MaintenanceIssueCategory;
    description: string;
  }) => void;
};

const HousekeepingContext = createContext<HousekeepingContextValue | null>(null);

function loadRooms(): AssignedRoom[] {
  if (typeof window === "undefined") return assignedRoomsSeed;
  try {
    const raw = window.localStorage.getItem(HK_STORAGE_KEY);
    if (!raw) return assignedRoomsSeed;
    const parsed = JSON.parse(raw) as AssignedRoom[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : assignedRoomsSeed;
  } catch {
    return assignedRoomsSeed;
  }
}

function loadReports(): StaffMaintenanceReport[] {
  if (typeof window === "undefined") return staffMaintenanceReportsSeed;
  try {
    const raw = window.localStorage.getItem(HK_REPORTS_KEY);
    if (!raw) return staffMaintenanceReportsSeed;
    const parsed = JSON.parse(raw) as StaffMaintenanceReport[];
    return Array.isArray(parsed) ? parsed : staffMaintenanceReportsSeed;
  } catch {
    return staffMaintenanceReportsSeed;
  }
}

export function HousekeepingProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [rooms, setRooms] = useState<AssignedRoom[]>(assignedRoomsSeed);
  const [reports, setReports] = useState<StaffMaintenanceReport[]>(
    staffMaintenanceReportsSeed,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRooms(loadRooms());
    setReports(loadReports());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(HK_STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(HK_REPORTS_KEY, JSON.stringify(reports));
  }, [reports, hydrated]);

  const staffName = currentUser?.name ?? "";

  const myRooms = useMemo(
    () =>
      rooms.filter(
        (room) =>
          room.assignee === staffName ||
          room.assignee.split(" ")[0] === staffName.split(" ")[0],
      ),
    [rooms, staffName],
  );

  const updateRoomStatus = useCallback((roomId: string, action: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, status: nextStatus(room.status, action) }
          : room,
      ),
    );
  }, []);

  const updateRoom = useCallback((roomId: string, patch: Partial<AssignedRoom>) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, ...patch } : room)),
    );
  }, []);

  const reportIssue = useCallback(
    (input: {
      room: string;
      category: MaintenanceIssueCategory;
      description: string;
    }) => {
      const report: StaffMaintenanceReport = {
        id: `SMR-${Date.now().toString().slice(-5)}`,
        room: input.room,
        category: input.category,
        description: input.description,
        reportedBy: staffName || "Housekeeping Staff",
        reportedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        status: "Submitted",
      };
      setReports((prev) => [report, ...prev]);
    },
    [staffName],
  );

  const value = useMemo(
    () => ({
      myRooms,
      allRooms: rooms,
      summary: countByStatus(myRooms),
      propertySummary: countByStatus(rooms),
      reports: reports.filter(
        (r) =>
          r.reportedBy === staffName ||
          r.reportedBy.split(" ")[0] === staffName.split(" ")[0],
      ),
      updateRoomStatus,
      updateRoom,
      reportIssue,
    }),
    [myRooms, rooms, reports, staffName, updateRoomStatus, updateRoom, reportIssue],
  );

  return (
    <HousekeepingContext.Provider value={value}>{children}</HousekeepingContext.Provider>
  );
}

export function useHousekeeping() {
  const ctx = useContext(HousekeepingContext);
  if (!ctx) {
    throw new Error("useHousekeeping must be used within HousekeepingProvider");
  }
  return ctx;
}

export function useHousekeepingOptional() {
  return useContext(HousekeepingContext);
}

export const statusStyles: Record<HousekeepingRoomStatus, string> = {
  Dirty: "bg-[#f8e9e6] text-danger border-danger/20",
  "Cleaning Required": "bg-accent-soft text-[#8a6a2f] border-accent/25",
  "Cleaning in Progress": "bg-[#e7f0f5] text-info border-info/20",
  Clean: "bg-brand-soft/60 text-brand border-brand/20",
  Inspected: "bg-brand-soft text-brand border-brand/20",
  Ready: "bg-[#e8f3ec] text-success border-success/20",
};

export const priorityStyles: Record<AssignedRoom["priority"], string> = {
  High: "bg-[#f8e9e6] text-danger",
  Medium: "bg-accent-soft text-[#8a6a2f]",
  Low: "bg-surface-muted text-muted",
};
