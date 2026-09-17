"use client";

import { useEffect, useState } from "react";
import { createId, useCms } from "@/components/cms/CmsProvider";
import {
  CmsModal,
  FormActions,
  PublishStatusField,
  RichTextEditor,
  useToast,
} from "@/components/cms/CmsShared";
import type { CmsWebsiteOffer } from "@/lib/cms-data";
import { roomTypes as defaultRoomTypes } from "@/lib/rooms";

export function emptyOffer(): CmsWebsiteOffer {
  return {
    id: "",
    title: "",
    code: "",
    description: "",
    details: "",
    discount: "Package",
    priceFrom: 0,
    priceLabel: "FROM",
    terms: [],
    bookCtaLabel: "Book package →",
    bookCtaHref: "#contact",
    sortOrder: 0,
    validFrom: "",
    validTo: "",
    active: true,
    status: "Published",
    updatedAt: new Date().toISOString().slice(0, 10),
    appliesTo: "all_rooms",
    roomTypes: [],
  };
}

type OfferEditModalProps = {
  open: boolean;
  offer: CmsWebsiteOffer | null;
  isNew?: boolean;
  onClose: () => void;
  onSaved?: (offer: CmsWebsiteOffer) => void;
};

export function OfferEditModal({
  open,
  offer,
  isNew = false,
  onClose,
  onSaved,
}: OfferEditModalProps) {
  const { saveOffer } = useCms();
  const { showSuccess } = useToast();
  const [form, setForm] = useState<CmsWebsiteOffer>(emptyOffer());

  useEffect(() => {
    if (open && offer) {
      setForm({
        ...offer,
        appliesTo: offer.appliesTo ?? "all_rooms",
        roomTypes: offer.roomTypes ?? [],
      });
    }
    if (open && isNew) setForm(emptyOffer());
  }, [open, offer, isNew]);

  return (
    <CmsModal
      open={open}
      title={isNew ? "Create offer" : "Edit offer"}
      wide
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (form.appliesTo === "selected_rooms" && !(form.roomTypes ?? []).length) {
            return;
          }
          const next: CmsWebsiteOffer = {
            ...form,
            id: isNew ? createId("cms-offer") : form.id,
            updatedAt: new Date().toISOString().slice(0, 10),
            roomTypes:
              form.appliesTo === "selected_rooms" ? form.roomTypes ?? [] : [],
          };
          saveOffer(next);
          onSaved?.(next);
          onClose();
          showSuccess("Offer saved.");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Package title"
            value={form.title}
            onChange={(title) => setForm((prev) => ({ ...prev, title }))}
          />
          <TextField
            label="Internal code"
            value={form.code}
            onChange={(code) => setForm((prev) => ({ ...prev, code: code.toUpperCase() }))}
          />
        </div>
        <TextField
          label="Short description"
          value={form.description}
          onChange={(description) => setForm((prev) => ({ ...prev, description }))}
        />
        <TextField
          label="Terms / tags (comma-separated, shown as labels)"
          value={form.terms.join(", ")}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              terms: value
                .split(",")
                .map((item) => item.trim().toUpperCase())
                .filter(Boolean),
            }))
          }
          placeholder="VALID WEEKDAYS, EXCLUDES PEAK WEEKENDS"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Price label"
            value={form.priceLabel}
            onChange={(priceLabel) => setForm((prev) => ({ ...prev, priceLabel }))}
          />
          <TextField
            label="Price from (₹)"
            type="number"
            value={String(form.priceFrom)}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, priceFrom: Number(value) || 0 }))
            }
          />
          <TextField
            label="Display order"
            type="number"
            value={String(form.sortOrder)}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, sortOrder: Number(value) || 0 }))
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Book button label"
            value={form.bookCtaLabel}
            onChange={(bookCtaLabel) => setForm((prev) => ({ ...prev, bookCtaLabel }))}
          />
          <TextField
            label="Book button link"
            value={form.bookCtaHref}
            onChange={(bookCtaHref) => setForm((prev) => ({ ...prev, bookCtaHref }))}
            placeholder="#contact"
          />
        </div>
        <RichTextEditor
          label="Additional details (optional)"
          value={form.details}
          onChange={(details) => setForm((prev) => ({ ...prev, details }))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Valid from"
            type="date"
            value={form.validFrom}
            onChange={(validFrom) => setForm((prev) => ({ ...prev, validFrom }))}
          />
          <TextField
            label="Valid to"
            type="date"
            value={form.validTo}
            onChange={(validTo) => setForm((prev) => ({ ...prev, validTo }))}
          />
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Applies to</span>
          <select
            value={form.appliesTo ?? "all_rooms"}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                appliesTo: event.target.value as CmsWebsiteOffer["appliesTo"],
                roomTypes:
                  event.target.value === "selected_rooms" ? prev.roomTypes : [],
              }))
            }
            className="field-input h-11"
          >
            <option value="all_rooms">All rooms</option>
            <option value="selected_rooms">Selected rooms</option>
            <option value="packages">Packages</option>
          </select>
        </label>
        {form.appliesTo === "selected_rooms" ? (
          <fieldset className="rounded-xl border border-border-subtle px-3 py-3">
            <legend className="px-1 text-sm font-medium text-foreground">Room types</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {defaultRoomTypes.map((type) => {
                const checked = (form.roomTypes ?? []).includes(type);
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-surface-muted"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          roomTypes: checked
                            ? (prev.roomTypes ?? []).filter((item) => item !== type)
                            : [...(prev.roomTypes ?? []), type],
                        }))
                      }
                      className="h-4 w-4 rounded border-border-subtle text-brand"
                    />
                    {type}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
            />
            Active on website
          </label>
        </div>
        <PublishStatusField
          status={form.status}
          onChange={(status) => setForm((prev) => ({ ...prev, status }))}
        />
        <FormActions onCancel={onClose} />
      </form>
    </CmsModal>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="field-input h-11"
      />
    </label>
  );
}
