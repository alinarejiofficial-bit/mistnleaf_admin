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
import { useOps } from "@/components/ops/OpsProvider";
import {
  countByStatus,
  nextStatus,
  type AssignedRoom,
  type HousekeepingRoomStatus,
  type MaintenanceIssueCategory,
  type StaffMaintenanceReport,
} from "@/lib/housekeeping-data";
import {
  applyHkRoomOverlays,
  enrichAssignedRoomsWithBookings,
  loadHkRoomOverlays,
  saveHkRoomOverlays,
  upsertHkRoomOverlay,
  type HkRoomOverlay,
} from "@/lib/ops-hk-local";
import { housekeepingPatchFromStatus } from "@/lib/ops-live";

type HousekeepingContextValue = {
  myRooms: AssignedRoom[];
  allRooms: AssignedRoom[];
  summary: ReturnType<typeof countByStatus>;
  propertySummary: ReturnType<typeof countByStatus>;
  reports: StaffMaintenanceReport[];
  updateRoomStatus: (roomId: string, action: string) => Promise<void>;
  updateRoom: (roomId: string, patch: Partial<AssignedRoom>) => Promise<void>;
  reportIssue: (input: {
    room: string;
    category: MaintenanceIssueCategory;
    description: string;
  }) => void;
};

const HousekeepingContext = createContext<HousekeepingContextValue | null>(null);

export function HousekeepingProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const ops = useOps();
  const staffName = currentUser?.name ?? "";
  const [overlays, setOverlays] = useState<HkRoomOverlay[]>([]);

  useEffect(() => {
    setOverlays(loadHkRoomOverlays());
  }, []);

  const allRooms = useMemo(() => {
    const enriched = enrichAssignedRoomsWithBookings(ops.hkRooms, ops.bookings);
    return applyHkRoomOverlays(enriched, overlays);
  }, [ops.hkRooms, ops.bookings, overlays]);

  const myRooms = useMemo(() => {
    const mine = allRooms.filter(
      (room) =>
        room.assignee === staffName ||
        room.assignee.split(" ")[0] === staffName.split(" ")[0],
    );
    return mine.length ? mine : allRooms;
  }, [allRooms, staffName]);

  const reports: StaffMaintenanceReport[] = useMemo(
    () =>
      ops.maintenance.map((ticket) => ({
        id: ticket.id,
        room: ticket.room,
        category: "Other" as MaintenanceIssueCategory,
        description: ticket.issue,
        reportedBy: ticket.reportedBy,
        reportedAt: ticket.reportedAt,
        status: ticket.status === "Resolved" ? "Acknowledged" : "Submitted",
      })),
    [ops.maintenance],
  );

  const persistOverlay = useCallback((roomId: string, patch: Partial<AssignedRoom>) => {
    setOverlays((prev) => {
      const existing = prev.find((item) => item.id === roomId);
      const next: HkRoomOverlay = {
        id: roomId,
        priority: patch.priority ?? existing?.priority,
        taskType: patch.taskType ?? existing?.taskType,
        checkoutTime:
          patch.checkoutTime !== undefined
            ? patch.checkoutTime
            : existing?.checkoutTime,
        checkinTime:
          patch.checkinTime !== undefined ? patch.checkinTime : existing?.checkinTime,
        notes: patch.notes !== undefined ? patch.notes : existing?.notes,
        status: patch.status ?? existing?.status,
      };
      const merged = upsertHkRoomOverlay(prev, next);
      saveHkRoomOverlays(merged);
      return merged;
    });
  }, []);

  const updateRoomStatus = useCallback(
    async (roomId: string, action: string) => {
      const room = allRooms.find((item) => item.id === roomId);
      if (!room) return;
      const next = nextStatus(room.status, action);
      persistOverlay(roomId, { status: next });
      await ops.updateHousekeeping(roomId, housekeepingPatchFromStatus(next));
    },
    [allRooms, ops, persistOverlay],
  );

  const updateRoom = useCallback(
    async (roomId: string, patch: Partial<AssignedRoom>) => {
      persistOverlay(roomId, patch);

      const apiPatch: {
        status?: string;
        housekeeping_status?: string;
        assignee?: string;
        notes?: string;
        dashboardStatus?: string;
      } = {};

      if (patch.status) {
        Object.assign(apiPatch, housekeepingPatchFromStatus(patch.status));
      }
      if (patch.assignee) apiPatch.assignee = patch.assignee;
      if (patch.notes !== undefined) apiPatch.notes = patch.notes ?? "";

      if (Object.keys(apiPatch).length > 0) {
        await ops.updateHousekeeping(roomId, apiPatch);
      }
    },
    [ops, persistOverlay],
  );

  const reportIssue = useCallback(
    (input: {
      room: string;
      category: MaintenanceIssueCategory;
      description: string;
    }) => {
      const match = allRooms.find((room) => room.roomNumber === input.room);
      void ops.reportMaintenance({
        room: input.room,
        roomId: match?.id,
        issue: input.description,
        category: input.category,
        reportedBy: staffName || "Housekeeping Staff",
      });
    },
    [allRooms, ops, staffName],
  );

  const value = useMemo(
    () => ({
      myRooms,
      allRooms,
      summary: countByStatus(myRooms),
      propertySummary: countByStatus(allRooms),
      reports,
      updateRoomStatus,
      updateRoom,
      reportIssue,
    }),
    [myRooms, allRooms, reports, updateRoomStatus, updateRoom, reportIssue],
  );

  return <HousekeepingContext.Provider value={value}>{children}</HousekeepingContext.Provider>;
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
