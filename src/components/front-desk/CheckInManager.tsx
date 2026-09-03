"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useOps } from "@/components/ops/OpsProvider";
import { formatINR } from "@/lib/ops-data";
import { formatDisplayDate } from "@/lib/data";
import {
  reservationStatusStyles,
  type Reservation,
} from "@/lib/reservations";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Badge, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

export function CheckInManager() {
  const { checkInQueue, today, saveBooking, recordPayment } = useOps();
  const [done, setDone] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queue = checkInQueue.filter((item) => !done.includes(item.id));

  async function completeCheckIn(id: string) {
    await saveBooking(id, { status: "Checked-in" });
    setDone((prev) => [...prev, id]);
    setExpandedId(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-in"
        description={`Process arriving guests for ${formatDisplayDate(today)}.`}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatPill label="Expected today" value={checkInQueue.length} tone="brand" />
        <StatPill label="Waiting" value={queue.length} tone="warning" />
        <StatPill label="Checked in" value={done.length} tone="success" />
      </div>

      <SectionCard
        title="Arrival queue"
        description="Website and desk bookings due today — confirm check-in to update the room board"
      >
        <div className="divide-y divide-border-subtle">
          {queue.map((item) => (
            <ArrivalRow
              key={item.id}
              reservation={item}
              expanded={expandedId === item.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === item.id ? null : item.id))
              }
              onCheckIn={() => void completeCheckIn(item.id)}
              onCollect={() => void recordPayment(item.id)}
            />
          ))}
          {queue.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              All expected arrivals have been checked in.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}

function ArrivalRow({
  reservation,
  expanded,
  onToggle,
  onCheckIn,
  onCollect,
}: {
  reservation: Reservation;
  expanded: boolean;
  onToggle: () => void;
  onCheckIn: () => void;
  onCollect: () => void;
}) {
  const balance = Math.max(0, reservation.amount - reservation.paidAmount);

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{reservation.guest}</p>
            <Badge className={reservationStatusStyles[reservation.status]}>
              {reservation.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            {reservation.id} · {reservation.room} · {reservation.adults} adults
            {reservation.children ? `, ${reservation.children} children` : ""}
          </p>
          <p className="mt-1 text-xs text-muted">
            Balance: {formatINR(balance)} · {reservation.phone}
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
              onClick={onCheckIn}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              Confirm check-in
            </button>
          </PermissionGate>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-border-subtle bg-surface-muted/40 p-4 sm:grid-cols-2">
          <ChecklistItem label="Guest verified" detail={`${reservation.email} · ${reservation.phone}`} />
          <ChecklistItem label="Payment status" detail={`${reservation.paymentStatus} · ${formatINR(reservation.paidAmount)} paid`} />
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
