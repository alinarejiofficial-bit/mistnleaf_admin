"use client";

import { Play, Sparkles, ClipboardCheck, Wrench } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useHousekeeping } from "@/components/housekeeping/HousekeepingProvider";

export function HousekeepingQuickActions({
  onReportIssue,
}: {
  onReportIssue?: () => void;
}) {
  const { myRooms, updateRoomStatus } = useHousekeeping();

  const nextQueued = myRooms.find(
    (r) => r.status === "Dirty" || r.status === "Cleaning Required",
  );
  const inProgress = myRooms.find((r) => r.status === "Cleaning in Progress");
  const clean = myRooms.find((r) => r.status === "Clean");

  return (
    <section className="rounded-2xl border border-border-subtle bg-gradient-to-br from-brand-soft/40 via-surface to-accent-soft/30 p-5 shadow-sm">
      <h2 className="font-display text-xl text-foreground">Quick actions</h2>
      <p className="mt-1 text-sm text-muted">One tap to move your next room forward</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PermissionGate action="housekeeping.update">
          <QuickAction
            icon={<Play className="h-4 w-4" />}
            label="Start Cleaning"
            detail={nextQueued?.roomNumber ?? "No queued rooms"}
            disabled={!nextQueued}
            onClick={() =>
              nextQueued && updateRoomStatus(nextQueued.id, "Start Cleaning")
            }
          />
        </PermissionGate>
        <PermissionGate action="housekeeping.update">
          <QuickAction
            icon={<Sparkles className="h-4 w-4" />}
            label="Mark Clean"
            detail={inProgress?.roomNumber ?? "Nothing in progress"}
            disabled={!inProgress}
            onClick={() =>
              inProgress && updateRoomStatus(inProgress.id, "Mark Clean")
            }
          />
        </PermissionGate>
        <PermissionGate action="housekeeping.markReady">
          <QuickAction
            icon={<ClipboardCheck className="h-4 w-4" />}
            label="Send for Inspection"
            detail={clean?.roomNumber ?? "No rooms awaiting inspection"}
            disabled={!clean}
            onClick={() =>
              clean && updateRoomStatus(clean.id, "Send for Inspection")
            }
          />
        </PermissionGate>
        <PermissionGate action="housekeeping.reportIssue">
          <QuickAction
            icon={<Wrench className="h-4 w-4" />}
            label="Report Maintenance Issue"
            detail="Plumbing, AC, electrical…"
            onClick={onReportIssue}
          />
        </PermissionGate>
      </div>
    </section>
  );
}

function QuickAction({
  icon,
  label,
  detail,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-[5.5rem] flex-col items-start rounded-xl border border-border-subtle bg-surface/90 px-4 py-3.5 text-left shadow-sm transition hover:border-brand/25 hover:bg-brand-soft/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="text-brand-mid">{icon}</span>
      <span className="mt-2 text-sm font-medium text-foreground">{label}</span>
      <span className="mt-0.5 text-xs text-muted">{detail}</span>
    </button>
  );
}
