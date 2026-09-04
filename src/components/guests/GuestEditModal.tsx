"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Guest } from "@/lib/ops-data";

const guestStatuses: Guest["status"][] = ["Active", "VIP", "Blacklisted"];

type GuestEditModalProps = {
  open: boolean;
  guest: Guest | null;
  onClose: () => void;
  onSave: (guest: Guest) => void | Promise<void>;
};

type GuestForm = {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  status: Guest["status"];
  notes: string;
};

function formFromGuest(guest: Guest): GuestForm {
  return {
    name: guest.name,
    email: guest.email,
    phone: guest.phone,
    nationality: guest.nationality,
    status: guest.status,
    notes: guest.notes ?? "",
  };
}

export function GuestEditModal({ open, guest, onClose, onSave }: GuestEditModalProps) {
  const [form, setForm] = useState<GuestForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open || !guest) return;
    setForm(formFromGuest(guest));
    setFormError("");
    setSaving(false);
  }, [open, guest]);

  if (!open || !guest || !form) return null;

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
            <h2 className="font-display text-xl text-foreground">Edit guest</h2>
            <p className="mt-1 text-sm text-muted">
              {guest.name} · {guest.id}
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
            const name = form.name.trim();
            const email = form.email.trim();
            const phone = form.phone.trim();
            if (!name || !email || !phone) {
              setFormError("Name, email, and phone are required.");
              return;
            }
            setSaving(true);
            setFormError("");
            void Promise.resolve(
              onSave({
                ...guest,
                name,
                email,
                phone,
                nationality: form.nationality.trim(),
                status: form.status,
                notes: form.notes.trim() || undefined,
              }),
            )
              .then(() => onClose())
              .catch((err: unknown) => {
                setFormError(err instanceof Error ? err.message : "Could not save guest.");
              })
              .finally(() => setSaving(false));
          }}
        >
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Full name</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
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
                className="field-input h-11"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Phone</span>
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="field-input h-11"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Nationality</span>
              <input
                value={form.nationality}
                onChange={(event) => setForm({ ...form, nationality: event.target.value })}
                className="field-input h-11"
                placeholder="e.g. India"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as Guest["status"] })
                }
                className="field-input h-11"
              >
                {guestStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="field-input min-h-24"
                rows={3}
                placeholder="Preferences, alerts, or internal notes"
              />
            </label>
          </div>

          {formError ? (
            <p className="mt-4 rounded-xl border border-danger/20 bg-[#f8e9e6] px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          ) : null}

          <div className="mt-5 flex justify-end gap-2 border-t border-border-subtle pt-4">
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
              {saving ? "Saving…" : "Save guest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
