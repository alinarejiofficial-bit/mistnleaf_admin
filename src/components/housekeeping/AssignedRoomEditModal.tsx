"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { AssignedRoom, HousekeepingRoomStatus } from "@/lib/housekeeping-data";

const statuses: HousekeepingRoomStatus[] = [
  "Dirty",
  "Cleaning Required",
  "Cleaning in Progress",
  "Clean",
  "Inspected",
  "Ready",
];

const priorities: AssignedRoom["priority"][] = ["High", "Medium", "Low"];

const taskTypes: AssignedRoom["taskType"][] = [
  "Checkout clean",
  "Stayover",
  "Deep clean",
  "Turndown",
];

type AssignedRoomEditModalProps = {
  open: boolean;
  room: AssignedRoom | null;
  onClose: () => void;
  onSave: (roomId: string, patch: Partial<AssignedRoom>) => void | Promise<void>;
};

export function AssignedRoomEditModal({
  open,
  room,
  onClose,
  onSave,
}: AssignedRoomEditModalProps) {
  const [status, setStatus] = useState<HousekeepingRoomStatus>("Cleaning Required");
  const [priority, setPriority] = useState<AssignedRoom["priority"]>("Medium");
  const [taskType, setTaskType] = useState<AssignedRoom["taskType"]>("Stayover");
  const [checkoutTime, setCheckoutTime] = useState("");
  const [checkinTime, setCheckinTime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open || !room) return;
    setStatus(room.status);
    setPriority(room.priority);
    setTaskType(room.taskType);
    setCheckoutTime(room.checkoutTime ?? "");
    setCheckinTime(room.checkinTime ?? "");
    setNotes(room.notes ?? "");
    setFormError("");
    setSaving(false);
  }, [open, room]);

  if (!open || !room) return null;

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
            <h2 className="font-display text-xl text-foreground">Edit room task</h2>
            <p className="mt-1 text-sm text-muted">
              {room.roomNumber} · {room.roomType}
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

        <form
          className="space-y-4 overflow-y-auto px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSaving(true);
            setFormError("");
            void Promise.resolve(
              onSave(room.id, {
                status,
                priority,
                taskType,
                checkoutTime: checkoutTime.trim(),
                checkinTime: checkinTime.trim(),
                notes: notes.trim(),
              }),
            )
              .then(() => onClose())
              .catch((err: unknown) => {
                setFormError(
                  err instanceof Error ? err.message : "Could not save room updates.",
                );
              })
              .finally(() => setSaving(false));
          }}
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as HousekeepingRoomStatus)}
              className="field-input h-11"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Priority</span>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as AssignedRoom["priority"])
                }
                className="field-input h-11"
              >
                {priorities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Task type</span>
              <select
                value={taskType}
                onChange={(event) =>
                  setTaskType(event.target.value as AssignedRoom["taskType"])
                }
                className="field-input h-11"
              >
                {taskTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">
                Check-out (guest leaving)
              </span>
              <input
                value={checkoutTime}
                onChange={(event) => setCheckoutTime(event.target.value)}
                placeholder="e.g. 11:00 AM or 4 Sept"
                className="field-input h-11"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">
                Check-in (next arrival)
              </span>
              <input
                value={checkinTime}
                onChange={(event) => setCheckinTime(event.target.value)}
                placeholder="e.g. 3:00 PM or 5 Sept"
                className="field-input h-11"
              />
            </label>
          </div>
          <p className="text-xs text-muted">
            Times/dates show on My Rooms. Leave blank to clear. Booking dates fill in
            automatically when available.
          </p>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Special instructions, supplies needed, etc."
              className="field-input min-h-[5.5rem] resize-y py-2.5"
            />
          </label>

          {formError ? (
            <p className="rounded-xl border border-danger/20 bg-[#f8e9e6] px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-border-subtle pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
