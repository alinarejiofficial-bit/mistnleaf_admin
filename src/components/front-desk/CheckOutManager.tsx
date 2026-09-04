"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { queueRoomForCleaningAfterCheckout } from "@/lib/checkout-cleaning";
import { formatINR } from "@/lib/ops-data";
import { useOps } from "@/components/ops/OpsProvider";
import { formatDisplayDate } from "@/lib/data";
import {
  reservationStatusStyles,
  type Reservation,
} from "@/lib/reservations";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useFloatingToast } from "@/components/ui/useFloatingToast";
import { Badge, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

export function CheckOutManager() {
  const {
    checkOutQueue,
    upcomingCheckOuts,
    checkedOutToday,
    today,
    saveBooking,
    recordPayment,
    rooms,
    updateHousekeeping,
    refresh,
    bookings,
    ready,
  } = useOps();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cleaningQueued, setCleaningQueued] = useState<string[]>([]);
  const { showToast, toast } = useFloatingToast();

  const overdue = useMemo(
    () => checkOutQueue.filter((item) => item.checkOut < today),
    [checkOutQueue, today],
  );
  const dueToday = useMemo(
    () => checkOutQueue.filter((item) => item.checkOut === today),
    [checkOutQueue, today],
  );

  const pendingBalance = checkOutQueue.reduce(
    (sum, item) => sum + Math.max(0, item.amount - item.paidAmount),
    0,
  );

  const confirmReservation = checkOutQueue.find((item) => item.id === confirmId);

  async function completeCheckOut(id: string, room: string) {
    setBusyId(id);
    try {
      const booking = checkOutQueue.find((item) => item.id === id);
      if (booking && booking.paidAmount < booking.amount) {
        await recordPayment(id);
      }
      await saveBooking(id, { status: "Checked-out" });
      const match = rooms.find(
        (item) =>
          item.name === room ||
          item.number === room ||
          room.includes(item.number) ||
          room.includes(item.name),
      );
      if (match) {
        await updateHousekeeping(match.id, {
          status: "dirty",
          housekeeping_status: "dirty",
        });
      }
      setCleaningQueued((prev) => [...prev, room]);
      queueRoomForCleaningAfterCheckout(room);
      setConfirmId(null);
      setExpandedId(null);
      showToast(`${room} checked out and queued for cleaning.`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not complete check-out.",
        "error",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-out"
        description={`Live departures for ${formatDisplayDate(today)} — includes overdue in-house stays.`}
        action={
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-muted"
          >
            Refresh
          </button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Due / overdue" value={checkOutQueue.length} tone="info" />
        <StatPill label="Due today" value={dueToday.length} tone="warning" />
        <StatPill label="Overdue" value={overdue.length} tone="danger" />
        <StatPill
          label="Outstanding collect"
          value={formatINR(pendingBalance)}
          tone="danger"
        />
      </div>
      <p className="text-sm text-muted">
        {checkedOutToday.length} departure{checkedOutToday.length === 1 ? "" : "s"}{" "}
        completed today · {bookings.filter((b) => b.status === "Checked-in").length}{" "}
        currently in-house
      </p>

      {!ready ? <p className="text-sm text-muted">Loading departures…</p> : null}

      {cleaningQueued.length > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-success/25 bg-[#e8f3ec]/60 px-4 py-3 text-sm">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <p className="text-foreground">
            {cleaningQueued[cleaningQueued.length - 1]} queued for housekeeping cleaning
            after check-out.
          </p>
        </div>
      ) : null}

      <SectionCard
        title="Departure queue"
        description="Checked-in guests whose check-out is today or earlier"
      >
        <div className="divide-y divide-border-subtle">
          {checkOutQueue.map((item) => (
            <DepartureRow
              key={item.id}
              reservation={item}
              today={today}
              expanded={expandedId === item.id}
              busy={busyId === item.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === item.id ? null : item.id))
              }
              onCheckOut={() => setConfirmId(item.id)}
              onNotify={showToast}
              onCollect={() => void recordPayment(item.id)}
            />
          ))}
          {checkOutQueue.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              No check-outs due yet. Guests must be checked in first; upcoming
              departures appear below.
            </p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Upcoming departures"
        description="In-house guests checking out in the next 7 days"
      >
        <div className="divide-y divide-border-subtle">
          {upcomingCheckOuts.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <div>
                <p className="font-medium text-foreground">{item.guest}</p>
                <p className="text-sm text-muted">
                  {item.id} · {item.room} · departs {formatDisplayDate(item.checkOut)}
                </p>
              </div>
              <Badge className={reservationStatusStyles[item.status]}>{item.status}</Badge>
            </div>
          ))}
          {upcomingCheckOuts.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              No upcoming departures in the next week.
            </p>
          ) : null}
        </div>
      </SectionCard>

      <ConfirmDialog
        open={Boolean(confirmId && confirmReservation)}
        title="Complete check-out?"
        description={
          confirmReservation
            ? `${confirmReservation.guest} · ${confirmReservation.room} will be released and sent to the cleaning workflow.`
            : ""
        }
        confirmLabel="Complete check-out"
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmReservation) {
            void completeCheckOut(confirmReservation.id, confirmReservation.room);
          }
        }}
      />

      {toast}
    </div>
  );
}

function DepartureRow({
  reservation,
  today,
  expanded,
  busy,
  onToggle,
  onCheckOut,
  onNotify,
  onCollect,
}: {
  reservation: Reservation;
  today: string;
  expanded: boolean;
  busy: boolean;
  onToggle: () => void;
  onCheckOut: () => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
  onCollect: () => void;
}) {
  const balance = Math.max(0, reservation.amount - reservation.paidAmount);
  const overdue = reservation.checkOut < today;
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{reservation.guest}</p>
            {overdue ? (
              <Badge className="bg-[#f8e9e6] text-danger">Overdue departure</Badge>
            ) : (
              <Badge className="bg-[#e7f0f5] text-info">Due today</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {reservation.id} · {reservation.room} ·{" "}
            {formatDisplayDate(reservation.checkIn)} →{" "}
            {formatDisplayDate(reservation.checkOut)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Folio {formatINR(reservation.amount)} · Balance {formatINR(balance)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
          >
            {expanded ? "Hide folio" : "Open folio"}
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <PermissionGate action="checkout.manage">
            <button
              type="button"
              disabled={busy}
              onClick={onCheckOut}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
            >
              {busy ? "Processing…" : "Check out"}
            </button>
          </PermissionGate>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-3 rounded-xl border border-border-subtle bg-surface-muted/40 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <FolioStat label="Room charges" value={formatINR(reservation.amount)} />
            <FolioStat label="Paid" value={formatINR(reservation.paidAmount)} />
            <FolioStat label="Balance" value={formatINR(balance)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {balance > 0 ? (
              <PermissionGate action="payments.record">
                <button
                  type="button"
                  onClick={onCollect}
                  className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
                >
                  Collect {formatINR(balance)}
                </button>
              </PermissionGate>
            ) : null}
            <button
              type="button"
              onClick={() => {
                const id = `INV-${reservation.id.replace("RSV-", "")}`;
                setInvoiceId(id);
                onNotify(`Invoice ${id} generated for ${reservation.guest}.`);
              }}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
            >
              Generate invoice
            </button>
          </div>
          {invoiceId ? (
            <p className="text-sm text-success">Invoice {invoiceId} ready.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FolioStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
