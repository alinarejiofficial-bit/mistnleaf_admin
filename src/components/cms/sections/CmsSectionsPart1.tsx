"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { HomepageHeroEditor } from "@/components/cms/HomepageHeroEditor";
import { HomepageAboutEditor } from "@/components/cms/HomepageAboutEditor";
import {
  HomepageAmenitiesEditor,
  HomepageExperiencesEditor,
  HomepageFaqsEditor,
  HomepageFeaturedRoomsEditor,
  HomepageGalleryEditor,
  HomepageLocationEditor,
  HomepageOffersEditor,
  HomepageTestimonialsEditor,
} from "@/components/cms/HomepageBlockEditors";
import { HomepageSectionsOverview } from "@/components/cms/HomepageSectionsOverview";
import { RoomEditModal } from "@/components/cms/RoomEditModal";
import { useCms } from "@/components/cms/CmsProvider";
import {
  ConfirmDialog,
  EmptyState,
  FilterSelect,
  PreviewButton,
  PublishBadge,
  SearchField,
  stripHtml,
  ToastPortal,
  useToast,
} from "@/components/cms/CmsShared";
import { formatDisplayDate } from "@/lib/data";
import {
  togglePublishStatus,
  type CmsRoomContent,
  type PublishStatus,
} from "@/lib/cms-data";

type PreviewHandler = (section: string, data?: unknown) => void;

export function HomepageSection({ onPreview }: { onPreview: PreviewHandler }) {
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit");

  if (editMode === "hero") {
    return <HomepageHeroEditor onPreview={onPreview} />;
  }

  if (editMode === "about") {
    return <HomepageAboutEditor onPreview={onPreview} />;
  }

  if (editMode === "rooms") {
    return <HomepageFeaturedRoomsEditor onPreview={onPreview} />;
  }

  if (editMode === "experiences") {
    return <HomepageExperiencesEditor onPreview={onPreview} />;
  }

  if (editMode === "amenities") {
    return <HomepageAmenitiesEditor onPreview={onPreview} />;
  }

  if (editMode === "gallery") {
    return <HomepageGalleryEditor onPreview={onPreview} />;
  }

  if (editMode === "offers") {
    return <HomepageOffersEditor onPreview={onPreview} />;
  }

  if (editMode === "testimonials") {
    return <HomepageTestimonialsEditor onPreview={onPreview} />;
  }

  if (editMode === "location") {
    return <HomepageLocationEditor onPreview={onPreview} />;
  }

  if (editMode === "faqs") {
    return <HomepageFaqsEditor onPreview={onPreview} />;
  }

  return <HomepageSectionsOverview />;
}

export function RoomContentSection({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveRoom, deleteRoom } = useCms();
  const { toast, showSuccess, clearToast } = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PublishStatus>("All");
  const [modal, setModal] = useState<CmsRoomContent | "new" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.rooms.filter((room) => {
      if (statusFilter !== "All" && room.status !== statusFilter) return false;
      if (!q) return true;
      return room.name.toLowerCase().includes(q);
    });
  }, [content.rooms, query, statusFilter]);

  function openNew() {
    setModal("new");
  }

  function openEdit(room: CmsRoomContent) {
    setModal(room);
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Room content"
        description="Manage public room pages — descriptions, images, amenities, and capacity. Published rooms sync to the live website at localhost:3001/rooms/."
        actions={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Add room
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchField value={query} onChange={setQuery} placeholder="Search rooms…" />
        <FilterSelect
          label="Status filter"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "All", label: "All statuses" },
            { value: "Published", label: "Published" },
            { value: "Draft", label: "Draft" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No rooms found"
          description="Add room content or adjust your filters."
          action={
            <button
              type="button"
              onClick={openNew}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              Add room
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Room</th>
                <th className="px-5 py-3 font-medium">Capacity</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((room) => (
                <tr key={room.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{room.name}</div>
                    <div className="text-xs text-muted">
                      {stripHtml(room.description).slice(0, 60)}…
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{room.capacity} guests</td>
                  <td className="px-5 py-3.5 text-muted">
                    {formatDisplayDate(room.updatedAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <PublishBadge status={room.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <RowActions
                      onPreview={() => onPreview("room", room)}
                      onEdit={() => openEdit(room)}
                      onDelete={() => setDeleteId(room.id)}
                      onTogglePublish={() =>
                        saveRoom({
                          ...room,
                          status: togglePublishStatus(room.status),
                        })
                      }
                      published={room.status === "Published"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RoomEditModal
        open={modal !== null}
        room={modal === "new" ? null : modal}
        isNew={modal === "new"}
        onClose={() => setModal(null)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete room content?"
        message="This removes the room from the public website catalogue."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteRoom(deleteId);
          setDeleteId(null);
          showSuccess("Room deleted.");
        }}
      />
      <ToastPortal toast={toast} onClose={clearToast} />
    </div>
  );
}

function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

function RowActions({
  onPreview,
  onEdit,
  onDelete,
  onTogglePublish,
  published,
}: {
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  published: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={onPreview}
        className="rounded-lg border border-border p-1.5 hover:bg-surface-muted"
        aria-label="Preview"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg border border-border p-1.5 hover:bg-surface-muted"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onTogglePublish}
        className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted"
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-border p-1.5 hover:bg-surface-muted"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4 text-danger" />
      </button>
    </div>
  );
}
