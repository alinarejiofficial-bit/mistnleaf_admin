"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Download, Plus, Search, Users } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useOps } from "@/components/ops/OpsProvider";
import { NewBookingModal } from "@/components/reservations/NewBookingModal";
import {
  formatDisplayDate,
  formatINR,
  getBalanceDue,
  getReservationCounts,
  paymentStatusStyles,
  reservationStatusStyles,
  type BookingSource,
  type Reservation,
  type ReservationStatus,
} from "@/lib/reservations";

import { todayISO } from "@/lib/ops-live";
import { roomTypes as fallbackRoomTypes } from "@/lib/rooms";
import { PageHeader } from "@/components/ui/PageHeader";
import { useFloatingToast } from "@/components/ui/useFloatingToast";

type StatusFilter = "All" | ReservationStatus;

const statusFilters: StatusFilter[] = [
  "All",
  "Pending",
  "Confirmed",
  "Checked-in",
  "Checked-out",
  "Cancelled",
];

const sources: Array<"All" | BookingSource> = [
  "All",
  "Direct website",
  "OTA / Booking.com",
  "Walk-in",
  "Travel agent",
];

export function ReservationsManager() {
  const {
    bookings: reservations,
    saveBooking,
    createBooking,
    rooms,
    roomTypeNames,
    source: dataSource,
  } = useOps();
  const sourceLabel =
    dataSource === "api"
      ? `${reservations.length} bookings from the website backend`
      : "No website bookings yet";
  const { showToast, toast } = useFloatingToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [source, setSource] = useState<"All" | BookingSource>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  async function updateReservation(id: string, patch: Partial<Reservation>) {
    try {
      await saveBooking(id, patch);
    } catch {
      showToast("Could not save booking change to the backend.", "error");
    }
  }

  const counts = getReservationCounts(reservations);
  const allReservations = reservations;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations.filter((reservation) => {
      if (status !== "All" && reservation.status !== status) return false;
      if (source !== "All" && reservation.source !== source) return false;
      if (dateFrom && reservation.checkIn < dateFrom) return false;
      if (dateTo && reservation.checkOut > dateTo) return false;
      if (!q) return true;
      return (
        reservation.guest.toLowerCase().includes(q) ||
        reservation.id.toLowerCase().includes(q) ||
        reservation.room.toLowerCase().includes(q) ||
        reservation.email.toLowerCase().includes(q) ||
        reservation.phone.toLowerCase().includes(q)
      );
    });
  }, [query, status, source, dateFrom, dateTo, reservations]);

  const selected =
    filtered.find((item) => item.id === selectedId) ??
    filtered[0] ??
    reservations.find((item) => item.id === selectedId) ??
    null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        description={sourceLabel}
        action={
          <div className="flex flex-wrap gap-2">
            <PermissionGate action="bookings.export">
              <button
                type="button"
                onClick={() => showToast("Booking export prepared (CSV download).")}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </PermissionGate>
            <PermissionGate action="bookings.create">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
              >
                <Plus className="h-4 w-4" />
                New booking
              </button>
            </PermissionGate>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <StatPill label="Total bookings" value={String(counts.total)} />
        <StatPill label="Today's bookings" value={String(counts.today)} tone="brand" />
        <StatPill label="Upcoming" value={String(counts.upcoming)} tone="info" />
        <StatPill label="Pending" value={String(counts.pending)} tone="warning" />
        <StatPill label="Confirmed" value={String(counts.confirmed)} tone="success" />
        <StatPill label="Checked-in" value={String(counts.checkedIn)} tone="info" />
        <StatPill label="Cancelled" value={String(counts.cancelled)} tone="danger" />
        <StatPill
          label="Collected"
          value={formatINR(counts.revenue)}
          tone="success"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <OverviewCard
          title="Today's arrivals"
          value={String(
            allReservations.filter(
              (r) =>
                r.checkIn === todayISO() &&
                (r.status === "Confirmed" || r.status === "Pending"),
            ).length,
          )}
          hint="Expected check-ins today"
        />
        <OverviewCard
          title="In-house stays"
          value={String(counts.checkedIn)}
          hint="Currently checked in"
        />
        <OverviewCard
          title="Pending payments"
          value={String(
            allReservations.filter(
              (r) =>
                r.paymentStatus === "Pending" || r.paymentStatus === "Partial",
            ).length,
          )}
          hint="Need collection or follow-up"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search guest, booking ID, room, phone..."
            className="h-11 w-full rounded-xl border border-border bg-surface pr-3 pl-10 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
          />
        </label>

        <select
          value={source}
          onChange={(event) =>
            setSource(event.target.value as "All" | BookingSource)
          }
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
        >
          {sources.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All sources" : item}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="Check-in from"
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
        />
        <span className="text-sm text-muted">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="Check-out to"
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
        />
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="rounded-xl border border-border px-3 py-2 text-sm text-muted hover:bg-surface-muted"
          >
            Clear dates
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatus(filter)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              status === filter
                ? "bg-brand text-white"
                : "border border-border bg-surface text-foreground hover:bg-surface-muted"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <div className="border-b border-border-subtle px-5 py-4">
            <h2 className="font-display text-xl text-foreground">
              Booking list
            </h2>
            <p className="mt-1 text-sm text-muted">
              Showing {filtered.length} of {allReservations.length} reservations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Dates</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((reservation) => (
                  <tr
                    key={reservation.id}
                    onClick={() => setSelectedId(reservation.id)}
                    className={`cursor-pointer border-t border-border-subtle transition hover:bg-surface-muted/50 ${
                      selected?.id === reservation.id ? "bg-brand-soft/40" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">
                        {reservation.guest}
                      </div>
                      <div className="text-xs text-muted">{reservation.id}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-foreground">
                      {reservation.room}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                      {formatDisplayDate(reservation.checkIn)} →{" "}
                      {formatDisplayDate(reservation.checkOut)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${reservationStatusStyles[reservation.status]}`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-foreground">
                      {formatINR(reservation.amount)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-muted"
                    >
                      No reservations match your filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <ReservationDetailsPanel
          reservation={selected}
          rooms={rooms}
          onUpdate={updateReservation}
          onNotify={showToast}
        />
      </div>

      {createOpen ? (
        <NewBookingModal
          roomTypes={roomTypeNames.length ? roomTypeNames : fallbackRoomTypes}
          rooms={rooms}
          bookings={reservations}
          onClose={() => setCreateOpen(false)}
          onCreate={async (input) => {
            try {
              await createBooking(input);
              setCreateOpen(false);
              showToast("Booking created.");
            } catch (err) {
              showToast(
                err instanceof Error ? err.message : "Could not create booking.",
                "error",
              );
            }
          }}
        />
      ) : null}

      {toast}
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "brand" | "info" | "warning" | "danger";
}) {
  const tones = {
    default: "border-border-subtle bg-surface",
    success: "border-success/20 bg-[#e8f3ec]/70",
    brand: "border-brand/20 bg-brand-soft/70",
    info: "border-info/20 bg-[#e7f0f5]/80",
    warning: "border-accent/30 bg-accent-soft/70",
    danger: "border-danger/20 bg-[#f8e9e6]/80",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${tones[tone]}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 truncate font-display text-xl text-foreground sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface px-5 py-4 shadow-sm">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-1 font-display text-3xl text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

function ReservationDetailsPanel({
  reservation,
  rooms,
  onUpdate,
  onNotify,
}: {
  reservation: Reservation | null;
  rooms: { name: string }[];
  onUpdate: (id: string, patch: Partial<Reservation>) => void;
  onNotify: (message: string) => void;
}) {
  if (!reservation) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-surface/70 p-6 text-center text-sm text-muted">
        Select a reservation to view details.
      </section>
    );
  }

  const balance = getBalanceDue(reservation);

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-brand-mid uppercase">
            Reservation details
          </p>
          <h2 className="mt-1 font-display text-3xl tracking-tight text-foreground">
            {reservation.guest}
          </h2>
          <p className="mt-1 text-sm text-muted">{reservation.id}</p>
        </div>
        <span
          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${reservationStatusStyles[reservation.status]}`}
        >
          {reservation.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <DetailStat
          icon={<CalendarRange className="h-4 w-4" />}
          label="Check-in"
          value={formatDisplayDate(reservation.checkIn)}
        />
        <DetailStat
          icon={<CalendarRange className="h-4 w-4" />}
          label="Check-out"
          value={formatDisplayDate(reservation.checkOut)}
        />
        <DetailStat label="Nights" value={`${reservation.nights}`} />
        <DetailStat
          icon={<Users className="h-4 w-4" />}
          label="Guests"
          value={`${reservation.adults} adults${reservation.children ? `, ${reservation.children} children` : ""}`}
        />
        <DetailStat label="Room" value={reservation.room} />
        <DetailStat label="Room type" value={reservation.roomType} />
        <DetailStat label="Source" value={reservation.source} />
        <DetailStat label="Phone" value={reservation.phone} />
      </div>

      <div className="mt-5 rounded-xl border border-border-subtle bg-surface-muted/50 px-3.5 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Payment</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {formatINR(reservation.paidAmount)} of{" "}
              {formatINR(reservation.amount)}
            </p>
          </div>
          <span
            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${paymentStatusStyles[reservation.paymentStatus]}`}
          >
            {reservation.paymentStatus}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">
          Balance due: {formatINR(balance)}
        </p>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">Contact</h3>
        <p className="mt-1 text-sm text-muted">{reservation.email}</p>
        <p className="text-sm text-muted">{reservation.phone}</p>
      </div>

      {reservation.notes ? (
        <div className="mt-5 rounded-xl border border-border-subtle bg-surface-muted/50 px-3.5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Notes</h3>
          <p className="mt-1 text-sm text-muted">{reservation.notes}</p>
        </div>
      ) : null}

      <ReservationActions
        reservation={reservation}
        rooms={rooms}
        onUpdate={onUpdate}
        onNotify={onNotify}
      />
    </section>
  );
}

function ReservationActions({
  reservation,
  rooms,
  onUpdate,
  onNotify,
}: {
  reservation: Reservation;
  rooms: { name: string }[];
  onUpdate: (id: string, patch: Partial<Reservation>) => void;
  onNotify: (message: string) => void;
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [roomChoice, setRoomChoice] = useState(reservation.room);

  return (
    <>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
        <PermissionGate action="bookings.edit">
          <ActionButton
            label="Edit booking"
            onClick={() => onNotify("Booking details updated in the reservation panel.")}
          />
        </PermissionGate>
        <PermissionGate action="bookings.confirm">
          {reservation.status === "Pending" ? (
            <ActionButton
              label="Confirm"
              primary
              onClick={() => {
                onUpdate(reservation.id, { status: "Confirmed" });
                onNotify("Booking confirmed.");
              }}
            />
          ) : null}
        </PermissionGate>
        <PermissionGate action="bookings.assignRoom">
          <ActionButton label="Assign room" onClick={() => setAssignOpen(true)} />
        </PermissionGate>
        <PermissionGate action="checkin.manage">
          {reservation.status === "Confirmed" ? (
            <ActionButton
              label="Check in"
              primary
              onClick={() => {
                onUpdate(reservation.id, { status: "Checked-in" });
                onNotify("Guest checked in.");
              }}
            />
          ) : null}
        </PermissionGate>
        <PermissionGate action="bookings.cancel">
          {reservation.status !== "Cancelled" ? (
            <ActionButton
              label="Cancel"
              danger
              onClick={() => setConfirmCancel(true)}
            />
          ) : null}
        </PermissionGate>
      </div>

      {assignOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setAssignOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-5 shadow-xl">
            <h3 className="font-display text-xl text-foreground">Assign room</h3>
            <p className="mt-1 text-sm text-muted">{reservation.guest} · {reservation.id}</p>
            <label className="mt-4 block text-sm">
              <span className="mb-1.5 block font-medium">Room</span>
              <select
                value={roomChoice}
                onChange={(event) => setRoomChoice(event.target.value)}
                className="field-input h-11 w-full"
              >
                {rooms.map((room) => (
                  <option key={room.name} value={room.name}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdate(reservation.id, { room: roomChoice });
                  onNotify(`Room assigned: ${roomChoice}`);
                  setAssignOpen(false);
                }}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white"
              >
                Save assignment
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel booking?"
        description={`This will cancel ${reservation.id} for ${reservation.guest}. This action cannot be undone.`}
        confirmLabel="Cancel booking"
        danger
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          setConfirmCancel(false);
          onUpdate(reservation.id, { status: "Cancelled" });
          onNotify("Booking cancelled.");
        }}
      />
    </>
  );
}

function ActionButton({
  label,
  onClick,
  primary,
  danger,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
        primary
          ? "bg-brand text-white hover:bg-brand-hover"
          : danger
            ? "border border-danger/30 text-danger hover:bg-[#f8e9e6]"
            : "border border-border text-foreground hover:bg-surface-muted"
      }`}
    >
      {label}
    </button>
  );
}

function DetailStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-muted/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
