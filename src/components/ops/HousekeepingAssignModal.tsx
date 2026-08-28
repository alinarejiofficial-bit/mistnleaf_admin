"use client";

import { useEffect, useState } from "react";
import { Plus, UserRound, X } from "lucide-react";
import type { HousekeepingStaffMember } from "@/lib/housekeeping-data";
import type { HousekeepingTask } from "@/lib/ops-data";

type HousekeepingAssignModalProps = {
  open: boolean;
  task: HousekeepingTask | null;
  staff: HousekeepingStaffMember[];
  onClose: () => void;
  onAssign: (taskId: string, staffName: string) => void;
  onAddMember: () => void;
};

export function HousekeepingAssignModal({
  open,
  task,
  staff,
  onClose,
  onAssign,
  onAddMember,
}: HousekeepingAssignModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState("");

  useEffect(() => {
    if (!open || !task) return;
    const current = staff.find((member) => member.name === task.assignee);
    setSelectedStaffId(current?.id ?? "");
  }, [open, task, staff]);

  if (!open || !task) return null;

  const activeTask = task;
  const onDutyStaff = staff.filter((member) => member.status === "On duty");
  const offDutyStaff = staff.filter((member) => member.status === "Off duty");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const member = staff.find((item) => item.id === selectedStaffId);
    if (!member) return;
    onAssign(activeTask.id, member.name);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border-subtle bg-surface shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-foreground">Assign housekeeping staff</h2>
            <p className="mt-1 text-sm text-muted">
              {task.room} · {task.type}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="rounded-xl border border-border-subtle bg-surface-muted/30 px-4 py-3 text-sm">
            <p className="text-xs tracking-wide text-muted uppercase">Current assignee</p>
            <p className="mt-1 font-medium text-foreground">{task.assignee}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">Select staff member</p>
            <button
              type="button"
              onClick={onAddMember}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface-muted"
            >
              <Plus className="h-3.5 w-3.5" />
              Add member
            </button>
          </div>

          {onDutyStaff.length > 0 ? (
            <div className="space-y-2">
              {onDutyStaff.map((member) => (
                <StaffOption
                  key={member.id}
                  member={member}
                  selected={selectedStaffId === member.id}
                  onSelect={() => setSelectedStaffId(member.id)}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-muted">
              No on-duty staff yet. Add a member to assign this task.
            </p>
          )}

          {offDutyStaff.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                Off duty
              </p>
              {offDutyStaff.map((member) => (
                <StaffOption
                  key={member.id}
                  member={member}
                  selected={selectedStaffId === member.id}
                  onSelect={() => setSelectedStaffId(member.id)}
                  disabled
                />
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStaffId}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
            >
              Assign staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StaffOption({
  member,
  selected,
  onSelect,
  disabled = false,
}: {
  member: HousekeepingStaffMember;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
        disabled
          ? "cursor-not-allowed border-border-subtle bg-surface-muted/20 opacity-60"
          : selected
            ? "border-brand bg-brand-soft/40"
            : "border-border-subtle bg-surface hover:bg-surface-muted/40"
      }`}
    >
      <input
        type="radio"
        name="housekeeping-staff"
        value={member.id}
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
      />
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-white">
        <UserRound className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">{member.name}</span>
        <span className="block text-xs text-muted">{member.email}</span>
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
          member.status === "On duty"
            ? "bg-[#e8f3ec] text-success"
            : "bg-surface-muted text-muted"
        }`}
      >
        {member.status}
      </span>
    </label>
  );
}
