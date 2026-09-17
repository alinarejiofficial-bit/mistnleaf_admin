"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  type BookingSource,
  type Reservation,
} from "@/lib/reservations";

const bookingSources: BookingSource[] = [
  "Walk-in",
  "Direct website",
  "OTA / Booking.com",
  "Travel agent",
];

function dayAfter(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

type EditBookingModalProps = {
  open: boolean;
  reservation: Reservation | null;
  onClose: () => void;
  onSave: (patch: Partial<Reservation>) => void | Promise<void>;
};

export function EditBookingModal({
  open,
  reservation,
  onClose,
  onSave,
}: EditBookingModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    guest: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "2",
    source: "Walk-in" as BookingSource,
    notes: "",
  });

  useEffect(() => {
    if (!open || !reservation) return;
    setForm({
      guest: reservation.guest,
      email: reservation.email,
      phone: reservation.phone,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guests: String(Math.max(1, reservation.adults || 1)),
      source: reservation.source,
      notes: reservation.notes ?? "",
    });
    setError("");
    setBusy(false);
  }, [open, reservation]);

  if (!open || !reservation) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border-subtle bg-surface p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-foreground">Edit booking</h2>
            <p className="mt-1 text-sm text-muted">
              {reservation.id} · {reservation.room || reservation.roomType}
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
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const guest = form.guest.trim();
            const email = form.email.trim();
            const phone = form.phone.trim();
            if (!guest || !email || !phone || !form.checkIn || !form.checkOut) {
              setError("Guest, contact, and dates are required.");
              return;
            }
            if (form.checkOut <= form.checkIn) {
              setError("Check-out must be after check-in.");
              return;
            }
            const nights = nightsBetween(form.checkIn, form.checkOut);
            const adults = Math.max(1, Number(form.guests) || 1);
            setBusy(true);
            setError("");
            void Promise.resolve(
              onSave({
                guest,
                email,
                phone,
                checkIn: form.checkIn,
                checkOut: form.checkOut,
                nights,
                adults,
                children: 0,
                source: form.source,
                notes: form.notes.trim() || undefined,
              }),
            )
              .then(() => onClose())
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Could not save booking.");
              })
              .finally(() => setBusy(false));
          }}
        >
          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Guest name</span>
            <input
              required
              value={form.guest}
              onChange={(event) => setForm((prev) => ({ ...prev, guest: event.target.value }))}
              className="field-input h-11 w-full"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="field-input h-11 w-full"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Phone</span>
              <input
                required
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="field-input h-11 w-full"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Check-in</span>
              <input
                required
                type="date"
                value={form.checkIn}
                onChange={(event) => {
                  const nextCheckIn = event.target.value;
                  const minOut = nextCheckIn ? dayAfter(nextCheckIn) : "";
                  setForm((prev) => ({
                    ...prev,
                    checkIn: nextCheckIn,
                    checkOut:
                      !prev.checkOut || !nextCheckIn || prev.checkOut <= nextCheckIn
                        ? minOut
                        : prev.checkOut,
                  }));
                }}
                className="field-input h-11 w-full"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Check-out</span>
              <input
                required
                type="date"
                min={form.checkIn ? dayAfter(form.checkIn) : undefined}
                value={form.checkOut}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, checkOut: event.target.value }))
                }
                className="field-input h-11 w-full"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Guests</span>
              <input
                type="number"
                min={1}
                value={form.guests}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, guests: event.target.value }))
                }
                className="field-input h-11 w-full"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Source</span>
              <select
                value={form.source}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    source: event.target.value as BookingSource,
                  }))
                }
                className="field-input h-11 w-full"
              >
                {bookingSources.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              rows={3}
              className="field-input min-h-[88px] w-full resize-y py-2.5"
              placeholder="Special requests or internal notes"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
