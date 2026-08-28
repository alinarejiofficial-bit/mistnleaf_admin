"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  emptyHousekeepingStaffMember,
  type HousekeepingStaffMember,
} from "@/lib/housekeeping-data";

type HousekeepingStaffModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (member: HousekeepingStaffMember) => void;
  existingStaff: HousekeepingStaffMember[];
};

export function HousekeepingStaffModal({
  open,
  onClose,
  onSave,
  existingStaff,
}: HousekeepingStaffModalProps) {
  const [form, setForm] = useState<HousekeepingStaffMember>(
    emptyHousekeepingStaffMember(existingStaff),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(emptyHousekeepingStaffMember(existingStaff));
    setError("");
  }, [open, existingStaff]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border-subtle bg-surface shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-foreground">Add housekeeping member</h2>
            <p className="mt-1 text-sm text-muted">
              New staff can be assigned to cleaning tasks immediately.
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
            const name = form.name.trim();
            const email = form.email.trim().toLowerCase();

            if (!name) {
              setError("Name is required.");
              return;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              setError("Enter a valid email address.");
              return;
            }
            if (existingStaff.some((member) => member.email === email)) {
              setError("A staff member with this email already exists.");
              return;
            }

            onSave({ ...form, name, email });
            onClose();
          }}
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Full name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Meera Iyer"
              className="field-input h-11"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="name@mistnleaf.com"
              className="field-input h-11"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Shift status</span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value as HousekeepingStaffMember["status"],
                })
              }
              className="field-input h-11"
            >
              <option value="On duty">On duty</option>
              <option value="Off duty">Off duty</option>
            </select>
          </label>

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
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
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
            >
              Add member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
