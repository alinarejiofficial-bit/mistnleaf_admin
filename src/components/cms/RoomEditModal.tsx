"use client";

import { useEffect, useState } from "react";
import { createId, useCms } from "@/components/cms/CmsProvider";
import {
  CmsModal,
  FormActions,
  ImageUploadField,
  PublishStatusField,
  RichTextEditor,
  useToast,
} from "@/components/cms/CmsShared";
import type { CmsRoomContent } from "@/lib/cms-data";

export function emptyRoom(): CmsRoomContent {
  return {
    id: "",
    name: "",
    tagline: "",
    description: "",
    priceFrom: 0,
    images: [],
    amenities: [],
    capacity: 2,
    status: "Draft",
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

type RoomEditModalProps = {
  open: boolean;
  room: CmsRoomContent | null;
  isNew?: boolean;
  onClose: () => void;
};

export function RoomEditModal({ open, room, isNew = false, onClose }: RoomEditModalProps) {
  const { saveRoom } = useCms();
  const { showSuccess } = useToast();
  const [form, setForm] = useState<CmsRoomContent>(emptyRoom());

  useEffect(() => {
    if (open && room) setForm({ ...room });
    if (open && isNew) setForm(emptyRoom());
  }, [open, room, isNew]);

  return (
    <CmsModal
      open={open}
      title={isNew ? "Add room" : "Edit room"}
      wide
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          saveRoom({
            ...form,
            id: isNew ? createId("cms-room") : form.id,
            updatedAt: new Date().toISOString().slice(0, 10),
          });
          onClose();
          showSuccess("Room content saved.");
        }}
      >
        <TextField
          label="Room name"
          value={form.name}
          onChange={(name) => setForm((prev) => ({ ...prev, name }))}
        />
        <TextField
          label="Tagline"
          value={form.tagline}
          onChange={(tagline) => setForm((prev) => ({ ...prev, tagline }))}
        />
        <TextField
          label="Price from (₹)"
          type="number"
          value={String(form.priceFrom)}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, priceFrom: Number(value) || 0 }))
          }
        />
        <RichTextEditor
          label="Description"
          value={form.description}
          onChange={(description) => setForm((prev) => ({ ...prev, description }))}
        />
        <TextField
          label="Capacity"
          type="number"
          value={String(form.capacity)}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, capacity: Number(value) || 1 }))
          }
        />
        <TextField
          label="Amenities (comma-separated)"
          value={form.amenities.join(", ")}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              amenities: value.split(",").map((item) => item.trim()).filter(Boolean),
            }))
          }
        />
        <ImageUploadField
          label="Room image"
          value={form.images[0] ?? ""}
          onChange={(url) =>
            setForm((prev) => ({
              ...prev,
              images: url ? [url, ...prev.images.slice(1)] : prev.images.slice(1),
            }))
          }
        />
        {form.images.length > 1 ? (
          <ImageUploadField
            label="Additional image (optional)"
            value={form.images[1] ?? ""}
            onChange={(url) =>
              setForm((prev) => {
                const images = [...prev.images];
                if (url) images[1] = url;
                else images.splice(1, 1);
                return { ...prev, images };
              })
            }
          />
        ) : (
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, images: [...prev.images, ""] }))}
            className="text-sm font-medium text-brand-mid hover:text-brand"
          >
            + Add another image
          </button>
        )}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input h-11"
      />
    </label>
  );
}
