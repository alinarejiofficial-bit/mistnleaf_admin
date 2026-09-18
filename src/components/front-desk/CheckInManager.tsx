"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useOps } from "@/components/ops/OpsProvider";
import { formatINR } from "@/lib/ops-data";
import { formatDisplayDate } from "@/lib/data";
import {
  paymentStatusStyles,
  reservationStatusStyles,
  type PaymentStatus,
  type Reservation,
} from "@/lib/reservations";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useFloatingToast } from "@/components/ui/useFloatingToast";
import { Badge, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

const paymentStatusOptions: PaymentStatus[] = [
  "Paid",
  "Partial",
  "Pending",
  "Refunded",
];

function paidAmountForStatus(
  booking: Reservation,
  paymentStatus: PaymentStatus,
): number {
  if (paymentStatus === "Paid") return booking.amount;
  if (paymentStatus === "Pending" || paymentStatus === "Refunded") return 0;
  if (booking.paidAmount > 0 && booking.paidAmount < booking.amount) {
    return booking.paidAmount;
  }
  return Math.max(1, Math.floor(booking.amount / 2));
}

export function CheckInManager() {
  const {
    checkInQueue,
    upcomingCheckIns,
    checkedInToday,
    today,
    saveBooking,
    recordPayment,
    refresh,
    bookings,
    ready,
  } = useOps();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { showToast, toast } = useFloatingToast();

  const overdue = useMemo(
    () => checkInQueue.filter((item) => item.checkIn < today),
    [checkInQueue, today],
  );
  const dueToday = useMemo(
    () => checkInQueue.filter((item) => item.checkIn === today),
    [checkInQueue, today],
  );

  async function completeCheckIn(id: string) {
    setBusyId(id);
    try {
      await saveBooking(id, { status: "Checked-in" });
      setExpandedId(null);
      showToast("Guest checked in.");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not complete check-in.",
        "error",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return;
    setBusyId(id);
    try {
      await saveBooking(id, {
        paymentStatus,
        paidAmount: paidAmountForStatus(booking, paymentStatus),
      });
      showToast(`Payment marked ${paymentStatus}.`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update payment status.",
        "error",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-in"
        description={`Live arrivals for ${formatDisplayDate(today)} — includes overdue stays still waiting.`}
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
        <StatPill label="Due / overdue" value={checkInQueue.length} tone="brand" />
        <StatPill label="Due today" value={dueToday.length} tone="warning" />
        <StatPill label="Overdue" value={overdue.length} tone="danger" />
        <StatPill label="Checked in today" value={checkedInToday.length} tone="success" />
      </div>

      {!ready ? (
        <p className="text-sm text-muted">Loading arrivals…</p>
      ) : null}

      <SectionCard
        title="Arrival queue"
        description={`${checkInQueue.length} guest(s) ready to check in · ${bookings.length} total bookings loaded`}
      >
        <div className="divide-y divide-border-subtle">
          {checkInQueue.map((item) => (
            <ArrivalRow
              key={item.id}
              reservation={item}
              today={today}
              expanded={expandedId === item.id}
              busy={busyId === item.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === item.id ? null : item.id))
              }
              onCheckIn={() => void completeCheckIn(item.id)}
              onCollect={() => void recordPayment(item.id)}
              onPaymentStatus={(status) => void updatePaymentStatus(item.id, status)}
            />
          ))}
          {checkInQueue.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              No pending arrivals for today or earlier. Upcoming stays appear below.
            </p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Upcoming arrivals"
        description="Confirmed or pending stays in the next 7 days"
      >
        <div className="divide-y divide-border-subtle">
          {upcomingCheckIns.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div>
                <p className="font-medium text-foreground">{item.guest}</p>
                <p className="text-sm text-muted">
                  {item.id} · {item.room} · arrives {formatDisplayDate(item.checkIn)}
                </p>
              </div>
              <Badge className={reservationStatusStyles[item.status]}>{item.status}</Badge>
            </div>
          ))}
          {upcomingCheckIns.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              No upcoming arrivals in the next week.
            </p>
          ) : null}
        </div>
      </SectionCard>

      {toast}
    </div>
  );
}

function ArrivalRow({
  reservation,
  today,
  expanded,
  busy,
  onToggle,
  onCheckIn,
  onCollect,
  onPaymentStatus,
}: {
  reservation: Reservation;
  today: string;
  expanded: boolean;
  busy: boolean;
  onToggle: () => void;
  onCheckIn: () => void;
  onCollect: () => void;
  onPaymentStatus: (status: PaymentStatus) => void;
}) {
  const balance = Math.max(0, reservation.amount - reservation.paidAmount);
  const overdue = reservation.checkIn < today;

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{reservation.guest}</p>
            <Badge className={reservationStatusStyles[reservation.status]}>
              {reservation.status}
            </Badge>
            <Badge className={paymentStatusStyles[reservation.paymentStatus]}>
              {reservation.paymentStatus}
            </Badge>
            {overdue ? (
              <Badge className="bg-[#f8e9e6] text-danger">Overdue arrival</Badge>
            ) : (
              <Badge className="bg-[#e8f3ec] text-success">Due today</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {reservation.id} · {reservation.room} · {reservation.adults} adults
            {reservation.children ? `, ${reservation.children} children` : ""}
          </p>
          <p className="mt-1 text-xs text-muted">
            Check-in {formatDisplayDate(reservation.checkIn)} →{" "}
            {formatDisplayDate(reservation.checkOut)} · Balance: {formatINR(balance)} ·{" "}
            {reservation.phone}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
          >
            {expanded ? "Hide details" : "Open booking"}
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <PermissionGate action="checkin.manage">
            <button
              type="button"
              disabled={busy}
              onClick={onCheckIn}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
            >
              {busy ? "Checking in…" : "Confirm check-in"}
            </button>
          </PermissionGate>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-border-subtle bg-surface-muted/40 p-4 sm:grid-cols-2">
          <ChecklistItem
            label="Guest verified"
            detail={`${reservation.email} · ${reservation.phone}`}
          />
          <div className="rounded-lg bg-surface px-3 py-2.5">
            <p className="text-xs font-medium text-brand-mid">Payment status</p>
            <PermissionGate
              action="payments.record"
              fallback={
                <p className="mt-1 text-sm text-foreground">
                  {reservation.paymentStatus} · {formatINR(reservation.paidAmount)} paid
                </p>
              }
            >
              <select
                value={reservation.paymentStatus}
                disabled={busy}
                onChange={(event) =>
                  onPaymentStatus(event.target.value as PaymentStatus)
                }
                className="field-input mt-1.5 h-10 w-full"
              >
                {paymentStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">
                {formatINR(reservation.paidAmount)} paid of {formatINR(reservation.amount)}
              </p>
            </PermissionGate>
          </div>
          <ChecklistItem label="Room assigned" detail={reservation.room} />
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
        </div>
      ) : null}
    </div>
  );
}

function ChecklistItem({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2.5">
      <p className="text-xs font-medium text-brand-mid">{label}</p>
      <p className="mt-1 text-sm text-foreground">{detail}</p>
    </div>
  );
}
