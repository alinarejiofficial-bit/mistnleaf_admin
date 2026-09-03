"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ImageUploadField } from "@/components/cms/CmsShared";
import {
  emptyRoom,
  roomStatuses,
  roomTypes,
  type Room,
  type RoomStatus,
  type RoomType,
} from "@/lib/rooms";

type RoomInventoryModalProps = {
  open: boolean;
  room: Room | null;
  isNew?: boolean;
  existingRooms: Room[];
  roomTypesList?: string[];
  onClose: () => void;
  onSave: (room: Room) => void | Promise<void>;
};

export function RoomInventoryModal({
  open,
  room,
  isNew = false,
  existingRooms,
  roomTypesList,
  onClose,
  onSave,
}: RoomInventoryModalProps) {
  const typeOptions = roomTypesList?.length ? roomTypesList : roomTypes;
  const [form, setForm] = useState<Room>(emptyRoom(existingRooms));
  const [amenitiesText, setAmenitiesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (room) {
      setForm({ ...room });
      setAmenitiesText(room.amenities.join(", "));
    } else if (isNew) {
      const draft = emptyRoom(existingRooms);
      draft.type = typeOptions[0] ?? draft.type;
      setForm(draft);
      setAmenitiesText(draft.amenities.join(", "));
    }
  }, [open, room, isNew, existingRooms, typeOptions.join("|")]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border-subtle bg-surface shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-foreground">
              {isNew ? "Add room" : "Edit room"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {isNew
                ? "Create a new room in the property inventory."
                : "Update room details, rate, and availability status."}
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
          className="overflow-y-auto px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSaving(true);
            setFormError("");
            void Promise.resolve(
              onSave({
                ...form,
                amenities: amenitiesText
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              }),
            )
              .then(() => onClose())
              .catch((err: unknown) => {
                setFormError(err instanceof Error ? err.message : "Could not save room.");
              })
              .finally(() => setSaving(false));
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Room ID">
              <input
                value={form.id}
                onChange={(event) => setForm({ ...form, id: event.target.value })}
                className="field-input h-11"
                required
                disabled={!isNew}
              />
            </Field>
            <Field label="Room number">
              <input
                value={form.number}
                onChange={(event) => setForm({ ...form, number: event.target.value })}
                className="field-input h-11"
                required
              />
            </Field>
            <Field label="Display name" className="sm:col-span-2">
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="field-input h-11"
                required
              />
            </Field>
            <Field label="Room type">
              <input
                list="mistnleaf-room-types"
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value as RoomType })
                }
                placeholder="Canopy Suite"
                className="field-input h-11"
                required
              />
              <datalist id="mistnleaf-room-types">
                {typeOptions.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
              <span className="mt-1 block text-xs text-muted">
                Pick an existing type or type a new name to create one.
              </span>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as RoomStatus })
                }
                className="field-input h-11"
              >
                {roomStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Floor">
              <input
                type="number"
                min={1}
                value={form.floor}
                onChange={(event) =>
                  setForm({ ...form, floor: Number(event.target.value) || 1 })
                }
                className="field-input h-11"
                required
              />
            </Field>
            <Field label="Capacity (guests)">
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(event) =>
                  setForm({ ...form, capacity: Number(event.target.value) || 1 })
                }
                className="field-input h-11"
                required
              />
            </Field>
            <Field label="Beds">
              <input
                value={form.beds}
                onChange={(event) => setForm({ ...form, beds: event.target.value })}
                className="field-input h-11"
                required
              />
            </Field>
            <Field label="Nightly rate (₹)">
              <input
                type="number"
                min={0}
                step={100}
                value={form.rate}
                onChange={(event) =>
                  setForm({ ...form, rate: Number(event.target.value) || 0 })
                }
                className="field-input h-11"
                required
              />
            </Field>
            <Field label="Size (sq ft)">
              <input
                type="number"
                min={0}
                value={form.sizeSqFt}
                onChange={(event) =>
                  setForm({ ...form, sizeSqFt: Number(event.target.value) || 0 })
                }
                className="field-input h-11"
                required
              />
            </Field>
            <Field label="Amenities (comma-separated)" className="sm:col-span-2">
              <input
                value={amenitiesText}
                onChange={(event) => setAmenitiesText(event.target.value)}
                placeholder="AC, Wi-Fi, Ensuite"
                className="field-input h-11"
              />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <textarea
                value={form.notes ?? ""}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                rows={3}
                className="field-input min-h-[88px] resize-y py-2.5"
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border-subtle pt-4">
            {formError ? (
              <p className="mr-auto text-sm text-danger" role="alert">
                {formError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            >
              {saving ? "Saving…" : isNew ? "Add room" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1.5 block font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
