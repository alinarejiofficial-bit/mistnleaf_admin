"use client";

import { useMemo, useState } from "react";
import { todayISO } from "@/lib/ops-live";
import { formatINR, type BookingSource, type Reservation } from "@/lib/reservations";
import { availableRoomsForType, type Room } from "@/lib/rooms";

const bookingSources: BookingSource[] = [
  "Walk-in",
  "Direct website",
  "OTA / Booking.com",
  "Travel agent",
];

type NewBookingModalProps = {
  roomTypes: string[];
  rooms: Room[];
  bookings: Reservation[];
  onClose: () => void;
  onCreate: (input: {
    guest: string;
    email: string;
    phone: string;
    roomType: string;
    roomId?: string;
    roomName?: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    children?: number;
    source?: string;
  }) => Promise<void>;
};

export function NewBookingModal({
  roomTypes,
  rooms,
  bookings,
  onClose,
  onCreate,
}: NewBookingModalProps) {
  const today = todayISO();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    guest: "",
    email: "",
    phone: "",
    roomType: roomTypes[0] ?? "",
    roomId: "",
    checkIn: today,
    checkOut: "",
    adults: "2",
    children: "0",
    source: "Walk-in" as BookingSource,
  });

  const availableRooms = useMemo(
    () =>
      availableRoomsForType(
        rooms,
        form.roomType,
        form.checkIn,
        form.checkOut,
        bookings,
      ),
    [rooms, form.roomType, form.checkIn, form.checkOut, bookings],
  );

  const roomsOfType = useMemo(
    () =>
      rooms
        .filter(
          (room) =>
            room.type.trim().toLowerCase() === form.roomType.trim().toLowerCase(),
        )
        .sort((a, b) =>
          a.number.localeCompare(b.number, undefined, { numeric: true }),
        ),
    [rooms, form.roomType],
  );

  const selectedRoom =
    availableRooms.find((room) => room.id === form.roomId) ?? null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border-subtle bg-surface p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <h2 className="font-display text-xl text-foreground">New booking</h2>
        <p className="mt-1 text-sm text-muted">
          Pick a room type, dates, then choose an available room under that type.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (
              !form.guest.trim() ||
              !form.email.trim() ||
              !form.phone.trim() ||
              !form.roomType ||
              !form.checkIn ||
              !form.checkOut
            ) {
              setError("Guest, contact, room type, and dates are required.");
              return;
            }
            if (form.checkOut <= form.checkIn) {
              setError("Check-out must be after check-in.");
              return;
            }
            if (!selectedRoom) {
              setError(
                availableRooms.length === 0
                  ? `No available ${form.roomType} rooms for these dates.`
                  : "Select an available room.",
              );
              return;
            }
            setBusy(true);
            setError("");
            void onCreate({
              guest: form.guest.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              roomType: form.roomType,
              roomId: selectedRoom.id,
              roomName: selectedRoom.name,
              checkIn: form.checkIn,
              checkOut: form.checkOut,
              adults: Number(form.adults) || 1,
              children: Number(form.children) || 0,
              source: form.source,
            }).finally(() => setBusy(false));
          }}
        >
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <input
            required
            value={form.guest}
            onChange={(event) => setForm((prev) => ({ ...prev, guest: event.target.value }))}
            placeholder="Guest name"
            className="field-input h-11 w-full"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
              className="field-input h-11 w-full"
            />
            <input
              required
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Phone"
              className="field-input h-11 w-full"
            />
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Room type</span>
            <select
              value={form.roomType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  roomType: event.target.value,
                  roomId: "",
                }))
              }
              className="field-input h-11 w-full"
            >
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-muted">
              {roomsOfType.length} room{roomsOfType.length === 1 ? "" : "s"} in inventory
              for this type.
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Check-in</span>
              <input
                required
                type="date"
                value={form.checkIn}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    checkIn: event.target.value,
                    roomId: "",
                  }))
                }
                className="field-input h-11 w-full"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Check-out</span>
              <input
                required
                type="date"
                value={form.checkOut}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    checkOut: event.target.value,
                    roomId: "",
                  }))
                }
                className="field-input h-11 w-full"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">
              Available {form.roomType || "rooms"}
            </span>
            {!form.checkIn || !form.checkOut || form.checkOut <= form.checkIn ? (
              <p className="rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted">
                Choose check-in and check-out to see available rooms.
              </p>
            ) : availableRooms.length === 0 ? (
              <p className="rounded-xl border border-danger/20 bg-[#f8e9e6]/70 px-3 py-3 text-sm text-danger">
                No {form.roomType} rooms are free for these dates
                {roomsOfType.length
                  ? ` (${roomsOfType.length} total in inventory).`
                  : ". Add rooms under this type on the Rooms page."}
              </p>
            ) : (
              <select
                value={form.roomId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, roomId: event.target.value }))
                }
                className="field-input h-11 w-full"
                required
              >
                <option value="">
                  Select a room ({availableRooms.length} available)
                </option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} · {room.number} · {formatINR(room.rate)}/night
                  </option>
                ))}
              </select>
            )}
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="number"
              min={1}
              value={form.adults}
              onChange={(event) => setForm((prev) => ({ ...prev, adults: event.target.value }))}
              className="field-input h-11 w-full"
              aria-label="Adults"
            />
            <input
              type="number"
              min={0}
              value={form.children}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, children: event.target.value }))
              }
              className="field-input h-11 w-full"
              aria-label="Children"
            />
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
          </div>
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
              {busy ? "Saving…" : "Create booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
