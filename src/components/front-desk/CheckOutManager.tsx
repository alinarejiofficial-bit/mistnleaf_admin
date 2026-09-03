"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { queueRoomForCleaningAfterCheckout } from "@/lib/checkout-cleaning";
import { formatINR } from "@/lib/ops-data";
import { useOps } from "@/components/ops/OpsProvider";
import { formatDisplayDate } from "@/lib/data";
import { type Reservation } from "@/lib/reservations";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useFloatingToast } from "@/components/ui/useFloatingToast";
import { SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

export function CheckOutManager() {
  const { checkOutQueue, today, saveBooking, recordPayment, rooms, updateHousekeeping } = useOps();
  const [queue, setQueue] = useState(checkOutQueue);
  const [completed, setCompleted] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cleaningQueued, setCleaningQueued] = useState<string[]>([]);
  const { showToast, toast } = useFloatingToast();

  useEffect(() => {
    setQueue(checkOutQueue);
  }, [checkOutQueue]);

  async function completeCheckOut(id: string, room: string) {
    const booking = queue.find((item) => item.id === id);
    if (booking && booking.paidAmount < booking.amount) {
      await recordPayment(id);
    }
    await saveBooking(id, { status: "Checked-out" });
    const match = rooms.find((item) => item.name === room);
    if (match) {
      await updateHousekeeping(match.id, { status: "dirty", housekeeping_status: "dirty" });
    }
    setCompleted((prev) => prev + 1);
    setCleaningQueued((prev) => [...prev, room]);
    queueRoomForCleaningAfterCheckout(room);
    setConfirmId(null);
    setExpandedId(null);
    showToast(`${room} queued for housekeeping cleaning.`);
  }

  const pendingBalance = queue.reduce(
    (sum, item) => sum + Math.max(0, item.amount - item.paidAmount),
    0,
  );

  const confirmReservation = queue.find((item) => item.id === confirmId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-out"
        description={`Settle bills and release rooms for ${formatDisplayDate(today)}.`}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatPill label="Due today" value={checkOutQueue.length} tone="info" />
        <StatPill label="Pending checkout" value={queue.length} tone="warning" />
        <StatPill
          label="Outstanding collect"
          value={formatINR(pendingBalance)}
          tone="danger"
        />
      </div>
      <p className="text-sm text-muted">{completed} departures completed today.</p>

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
        description="Review folio, collect balances, generate invoice, and release room"
      >
        <div className="divide-y divide-border-subtle">
          {queue.map((item) => (
            <DepartureRow
              key={item.id}
              reservation={item}
              expanded={expandedId === item.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === item.id ? null : item.id))
              }
              onCheckOut={() => setConfirmId(item.id)}
              onNotify={showToast}
              onCollect={() => void recordPayment(item.id)}
            />
          ))}
          {queue.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              No pending check-outs right now.
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
            completeCheckOut(confirmReservation.id, confirmReservation.room);
          }
        }}
      />

      {toast}
    </div>
  );
}

function DepartureRow({
  reservation,
  expanded,
  onToggle,
  onCheckOut,
  onNotify,
  onCollect,
}: {
  reservation: Reservation;
  expanded: boolean;
  onToggle: () => void;
  onCheckOut: () => void;
  onNotify: (message: string) => void;
  onCollect: () => void;
}) {
  const [paidAmount, setPaidAmount] = useState(reservation.paidAmount);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const balance = Math.max(0, reservation.amount - paidAmount);

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-medium text-foreground">{reservation.guest}</p>
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
              onClick={onCheckOut}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              {balance > 0 ? "Collect & check out" : "Complete check-out"}
            </button>
          </PermissionGate>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-3 rounded-xl border border-border-subtle bg-surface-muted/40 p-4">
          <FolioLine label="Room charges" value={formatINR(reservation.amount * 0.85)} />
          <FolioLine label="Add-ons & extras" value={formatINR(reservation.amount * 0.1)} />
          <FolioLine label="Taxes" value={formatINR(reservation.amount * 0.05)} />
          <FolioLine label="Amount paid" value={formatINR(paidAmount)} />
          <FolioLine label="Balance due" value={formatINR(balance)} highlight={balance > 0} />
          {invoiceId ? (
            <p className="text-xs text-muted">Invoice: {invoiceId}</p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            {balance > 0 ? (
              <PermissionGate action="payments.record">
                <button
                  type="button"
                  onClick={() => {
                    setPaidAmount(reservation.amount);
                    onCollect();
                    onNotify(`Final payment collected from ${reservation.guest}.`);
                  }}
                  className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
                >
                  Process final payment
                </button>
              </PermissionGate>
            ) : null}
            <PermissionGate action="invoices.generate">
              <button
                type="button"
                onClick={() => {
                  const id = `INV-${reservation.id.replace("RSV-", "")}`;
                  setInvoiceId(id);
                  onNotify(`Invoice ${id} generated.`);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface"
              >
                {invoiceId ? "Regenerate invoice" : "Generate invoice"}
              </button>
            </PermissionGate>
            <PermissionGate action="invoices.download">
              <button
                type="button"
                onClick={() => {
                  const id = invoiceId ?? `INV-${reservation.id.replace("RSV-", "")}`;
                  onNotify(`Downloading ${id} PDF…`);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface"
              >
                Download PDF
              </button>
            </PermissionGate>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FolioLine({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={highlight ? "font-semibold text-danger" : "font-medium text-foreground"}>
        {value}
      </span>
    </div>
  );
}
