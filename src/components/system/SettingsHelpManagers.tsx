"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard, StatPill } from "@/components/ui/ModulePrimitives";
import { hasPermission } from "@/lib/roles";

export function SettingsManager() {
  const { currentUser } = useAuth();
  const canManageSettings = currentUser
    ? hasPermission(currentUser.roleId, "manage_settings")
    : false;
  const hasLimitedSettings = currentUser
    ? hasPermission(currentUser.roleId, "view_limited_settings")
    : false;
  const readOnlyCritical = !canManageSettings && hasLimitedSettings;

  const [property, setProperty] = useState({
    name: "MistnLeaf Resort",
    timezone: "Asia/Kolkata",
    currency: "INR",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    taxPercent: "12",
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description={
          readOnlyCritical
            ? "Limited operational settings. Critical system configuration is managed by Super Administrator."
            : "Property details, taxes, policies, and operational defaults."
        }
        action={
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Save changes
          </button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatPill label="Currency" value={property.currency} tone="brand" />
        <StatPill label="Check-in" value={property.checkInTime} tone="info" />
        <StatPill label="Check-out" value={property.checkOutTime} tone="warning" />
      </div>
      {saved ? (
        <p className="text-sm font-medium text-success">Settings saved locally.</p>
      ) : null}

      {readOnlyCritical ? (
        <div className="rounded-2xl border border-accent/30 bg-accent-soft/50 px-5 py-4 text-sm text-muted">
          You have limited settings access as Resort Manager. Integrations and
          system-level configuration require Super Administrator approval.
        </div>
      ) : null}

      <SectionCard title="Property configuration">
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          {(
            [
              ["name", "Property name", true],
              ["timezone", "Timezone", true],
              ["currency", "Currency", false],
              ["checkInTime", "Check-in time", false],
              ["checkOutTime", "Check-out time", false],
              ["taxPercent", "Tax %", true],
            ] as const
          ).map(([key, label, critical]) => (
            <label key={key} className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">{label}</span>
              <input
                value={property[key]}
                disabled={readOnlyCritical && critical}
                onChange={(e) =>
                  setProperty((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="h-11 w-full rounded-xl border border-border bg-surface px-3 outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft disabled:cursor-not-allowed disabled:bg-surface-muted/60"
              />
            </label>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function HelpManager() {
  const topics = [
    {
      title: "Front desk flow",
      body: "Use Reservations → Check-in → Payments → Check-out for the daily guest journey.",
    },
    {
      title: "Room readiness",
      body: "Housekeeping updates cleaning status; Maintenance tracks out-of-order rooms.",
    },
    {
      title: "User access",
      body: "Super Administrators create staff accounts with passwords on the Users page.",
    },
    {
      title: "Website content",
      body: "Website Content Managers update CMS pages, offers, and facilities from Website CMS.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help"
        description="Guides for MistnLeaf admin workflows."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <article
            key={topic.title}
            className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm"
          >
            <h2 className="font-display text-xl text-foreground">{topic.title}</h2>
            <p className="mt-2 text-sm text-muted">{topic.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
