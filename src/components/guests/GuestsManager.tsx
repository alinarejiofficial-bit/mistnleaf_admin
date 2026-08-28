"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { guests, formatINR, payments, type Guest } from "@/lib/ops-data";
import { formatDisplayDate } from "@/lib/data";
import { reservations } from "@/lib/reservations";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, EmptyRow, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";

const statusStyles = {
  Active: "bg-brand-soft text-brand",
  VIP: "bg-accent-soft text-[#8a6a2f]",
  Blacklisted: "bg-[#f8e9e6] text-danger",
};

export function GuestsManager() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(guests[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        g.id.toLowerCase().includes(q),
    );
  }, [query]);

  const selected =
    filtered.find((g) => g.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guests"
        description="Guest profiles, preferences, stay history, and spend."
        action={
          <PermissionGate action="guests.create">
            <button
              type="button"
              onClick={() => window.alert("New guest form (demo).")}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              Add guest
            </button>
          </PermissionGate>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Total guests" value={guests.length} />
        <StatPill
          label="VIP guests"
          value={guests.filter((g) => g.status === "VIP").length}
          tone="warning"
        />
        <StatPill
          label="Active"
          value={guests.filter((g) => g.status === "Active").length}
          tone="success"
        />
        <StatPill
          label="Lifetime spend"
          value={formatINR(guests.reduce((s, g) => s + g.totalSpend, 0))}
          tone="brand"
        />
      </div>

      <label className="relative block max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guests..."
          className="h-11 w-full rounded-xl border border-border bg-surface pr-3 pl-10 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
        />
      </label>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionCard title="Guest directory" description={`${filtered.length} profiles`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Stays</th>
                  <th className="px-5 py-3 font-medium">Spend</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((guest) => (
                  <tr
                    key={guest.id}
                    onClick={() => setSelectedId(guest.id)}
                    className={`cursor-pointer border-t border-border-subtle hover:bg-surface-muted/50 ${
                      selected?.id === guest.id ? "bg-brand-soft/40" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">{guest.name}</div>
                      <div className="text-xs text-muted">{guest.email}</div>
                    </td>
                    <td className="px-5 py-3.5">{guest.stays}</td>
                    <td className="px-5 py-3.5 font-medium">
                      {formatINR(guest.totalSpend)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={statusStyles[guest.status]}>
                        {guest.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <EmptyRow colSpan={4} label="No guests found." />
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <GuestPanel guest={selected} />
      </div>
    </div>
  );
}

function GuestPanel({ guest }: { guest: Guest | null }) {
  if (!guest) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
        Select a guest to view details.
      </div>
    );
  }

  const guestBookings = reservations.filter((r) => r.guest === guest.name);
  const guestPayments = payments.filter((p) => p.guest === guest.name);
  const currentBooking = guestBookings.find(
    (r) => r.status === "Checked-in" || r.status === "Confirmed",
  );

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <p className="text-xs font-medium tracking-wide text-brand-mid uppercase">
        Guest profile
      </p>
      <h2 className="mt-1 font-display text-3xl text-foreground">{guest.name}</h2>
      <p className="mt-1 text-sm text-muted">{guest.id}</p>
      <div className="mt-5 space-y-3 text-sm">
        <Row label="Email" value={guest.email} />
        <Row label="Phone" value={guest.phone} />
        <Row label="Nationality" value={guest.nationality} />
        <Row label="Last stay" value={guest.lastStay} />
        <Row label="Total spend" value={formatINR(guest.totalSpend)} />
        <Row label="Status" value={guest.status} />
        {guest.notes ? <Row label="Notes" value={guest.notes} /> : null}
      </div>

      {currentBooking ? (
        <div className="mt-5 rounded-xl border border-brand/20 bg-brand-soft/30 px-3.5 py-3">
          <p className="text-xs font-medium text-brand-mid uppercase">Current booking</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {currentBooking.id} · {currentBooking.room}
          </p>
          <p className="text-xs text-muted">
            {formatDisplayDate(currentBooking.checkIn)} →{" "}
            {formatDisplayDate(currentBooking.checkOut)}
          </p>
        </div>
      ) : null}

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">Booking history</h3>
        <ul className="mt-2 space-y-2">
          {guestBookings.slice(0, 4).map((booking) => (
            <li
              key={booking.id}
              className="rounded-lg border border-border-subtle bg-surface-muted/40 px-3 py-2 text-sm"
            >
              <span className="font-medium">{booking.id}</span>
              <span className="text-muted"> · {booking.status} · {booking.room}</span>
            </li>
          ))}
          {guestBookings.length === 0 ? (
            <li className="text-sm text-muted">No booking history.</li>
          ) : null}
        </ul>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">Payment history</h3>
        <ul className="mt-2 space-y-2">
          {guestPayments.slice(0, 4).map((payment) => (
            <li
              key={payment.id}
              className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-muted/40 px-3 py-2 text-sm"
            >
              <span>
                {payment.id} · {payment.method}
              </span>
              <span className="font-medium">{formatINR(payment.amount)}</span>
            </li>
          ))}
          {guestPayments.length === 0 ? (
            <li className="text-sm text-muted">No payments recorded.</li>
          ) : null}
        </ul>
      </div>

      <PermissionGate action="guests.edit">
        <button
          type="button"
          onClick={() => window.alert("Edit guest (demo).")}
          className="mt-5 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
        >
          Edit guest
        </button>
      </PermissionGate>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-surface-muted/50 px-3 py-2.5">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
