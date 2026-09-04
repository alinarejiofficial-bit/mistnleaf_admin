"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { StaffEnquiry } from "@/lib/staff-api-client";

const statuses: StaffEnquiry["status"][] = ["New", "In progress", "Closed"];
const channels: StaffEnquiry["channel"][] = ["Website", "Phone", "Email"];

type EnquiryEditModalProps = {
  open: boolean;
  enquiry: StaffEnquiry | null;
  onClose: () => void;
  onSave: (enquiry: StaffEnquiry) => void | Promise<void>;
};

type EnquiryForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  channel: StaffEnquiry["channel"];
  status: StaffEnquiry["status"];
  staff_notes: string;
};

function formFromEnquiry(enquiry: StaffEnquiry): EnquiryForm {
  return {
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    subject: enquiry.subject,
    message: enquiry.message,
    channel: enquiry.channel,
    status: enquiry.status,
    staff_notes: enquiry.staff_notes ?? "",
  };
}

export function EnquiryEditModal({
  open,
  enquiry,
  onClose,
  onSave,
}: EnquiryEditModalProps) {
  const [form, setForm] = useState<EnquiryForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open || !enquiry) return;
    setForm(formFromEnquiry(enquiry));
    setFormError("");
    setSaving(false);
  }, [open, enquiry]);

  if (!open || !enquiry || !form) return null;

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
            <h2 className="font-display text-xl text-foreground">Edit enquiry</h2>
            <p className="mt-1 text-sm text-muted">
              Update requester details, message, status, and staff notes.
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
            const subject = form.subject.trim();
            const message = form.message.trim();
            if (!name || !email || !subject || !message) {
              setFormError("Name, email, subject, and message are required.");
              return;
            }
            setSaving(true);
            setFormError("");
            void Promise.resolve(
              onSave({
                ...enquiry,
                name,
                email,
                phone: form.phone.trim(),
                subject,
                message,
                channel: form.channel,
                status: form.status,
                staff_notes: form.staff_notes.trim() || undefined,
              }),
            )
              .then(() => onClose())
              .catch((err: unknown) => {
                setFormError(
                  err instanceof Error ? err.message : "Could not save enquiry.",
                );
              })
              .finally(() => setSaving(false));
          }}
        >
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="field-input h-11"
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
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
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Subject</span>
              <input
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                className="field-input h-11"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Message</span>
              <textarea
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                className="field-input min-h-28"
                rows={4}
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-foreground">Channel</span>
                <select
                  value={form.channel}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      channel: event.target.value as StaffEnquiry["channel"],
                    })
                  }
                  className="field-input h-11"
                >
                  {channels.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-foreground">Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as StaffEnquiry["status"],
                    })
                  }
                  className="field-input h-11"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Staff notes</span>
              <textarea
                value={form.staff_notes}
                onChange={(event) =>
                  setForm({ ...form, staff_notes: event.target.value })
                }
                className="field-input min-h-20"
                rows={3}
                placeholder="Internal follow-up notes"
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
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
