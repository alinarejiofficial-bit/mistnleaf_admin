"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { roomStatuses, type Room, type RoomStatus } from "@/lib/rooms";

type RoomStatusModalProps = {
  open: boolean;
  room: Room | null;
  onClose: () => void;
  onSave: (room: Room) => void;
};

export function RoomStatusModal({ open, room, onClose, onSave }: RoomStatusModalProps) {
  const [status, setStatus] = useState<RoomStatus>("Available");

  useEffect(() => {
    if (open && room) setStatus(room.status);
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
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-border-subtle bg-surface shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-foreground">Update room status</h2>
            <p className="mt-1 text-sm text-muted">
              {room.name} · {room.id}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          className="space-y-4 px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave({ ...room, status });
            onClose();
          }}
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as RoomStatus)}
              className="field-input h-11"
            >
              {roomStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
            >
              Save status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
