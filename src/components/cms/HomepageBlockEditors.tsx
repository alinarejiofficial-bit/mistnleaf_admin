"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createId, useCms } from "@/components/cms/CmsProvider";
import {
  CmsModal,
  ConfirmDialog,
  FormActions,
  ImageUploadField,
  PublishBadge,
  PublishStatusField,
  ToastPortal,
  useToast,
} from "@/components/cms/CmsShared";
import type {
  CmsGalleryImage,
  CmsHomepage,
  CmsHomepageLocationBand,
  CmsHomepageSectionBand,
  CmsWebsiteOffer,
  PublishStatus,
} from "@/lib/cms-data";
import { togglePublishStatus } from "@/lib/cms-data";
import { OfferEditModal } from "@/components/cms/OfferEditModal";

type PreviewHandler = (section: string, data?: unknown) => void;

function HomepageEditorShell({
  title,
  description,
  manageHref,
  manageLabel,
  children,
  onSave,
  saveLabel = "Save homepage section",
  saveDisabled = false,
  saveHint,
}: {
  title: string;
  description: ReactNode;
  manageHref?: string;
  manageLabel?: string;
  children: ReactNode;
  onSave: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  saveHint?: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/website/homepage"
          className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to homepage sections
        </Link>
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>

      {manageHref && manageLabel ? (
        <p className="rounded-xl border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-muted">
          To add, edit, publish, or delete items, open the{" "}
          <Link href={manageHref} className="font-medium text-brand-mid hover:underline">
            {manageLabel}
          </Link>
          . This screen only controls the homepage section heading and which items are featured.
        </p>
      ) : null}

      {children}

      <div className="flex flex-col items-end gap-2">
        {saveHint ? <p className="text-sm text-amber-800">{saveHint}</p> : null}
        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

function SectionBandFields({
  band,
  onChange,
  showViewAll = true,
}: {
  band: CmsHomepageSectionBand;
  onChange: (band: CmsHomepageSectionBand) => void;
  showViewAll?: boolean;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-4">
      <h3 className="text-sm font-medium text-foreground">Section heading on homepage</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Eyebrow</span>
          <input
            value={band.eyebrow}
            onChange={(e) => onChange({ ...band, eyebrow: e.target.value })}
            className="field-input h-11"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Title</span>
          <input
            value={band.title}
            onChange={(e) => onChange({ ...band, title: e.target.value })}
            className="field-input h-11"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-foreground">Intro text</span>
        <textarea
          value={band.lead}
          onChange={(e) => onChange({ ...band, lead: e.target.value })}
          rows={2}
          className="field-input"
        />
      </label>
      {showViewAll ? (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">&ldquo;View all&rdquo; link label</span>
          <input
            value={band.viewAllLabel}
            onChange={(e) => onChange({ ...band, viewAllLabel: e.target.value })}
            className="field-input h-11"
          />
        </label>
      ) : null}
      <PublishStatusField
        status={band.status}
        onChange={(status) => onChange({ ...band, status })}
      />
    </div>
  );
}

function FeaturedPicker({
  label,
  hint,
  maxItems,
  requiredCount,
  items,
  selectedIds,
  onChange,
  emptyLabel = "No items available.",
  itemNoun = "item",
}: {
  label: string;
  hint?: string;
  maxItems?: number;
  /** When set, exactly this many items must be selected. */
  requiredCount?: number;
  items: Array<{ id: string; title: string; status: PublishStatus }>;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  emptyLabel?: string;
  itemNoun?: string;
}) {
  const limit = requiredCount ?? maxItems;

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((itemId) => itemId !== id));
      return;
    }
    if (limit && selectedIds.length >= limit) return;
    onChange([...selectedIds, id]);
  }

  const remaining = requiredCount ? Math.max(requiredCount - selectedIds.length, 0) : 0;
  const requirementMet = !requiredCount || selectedIds.length === requiredCount;

  return (
    <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface p-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          {requiredCount ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-900 uppercase">
              Required · select {requiredCount}
            </span>
          ) : null}
        </div>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const checked = selectedIds.includes(item.id);
            const atLimit = !checked && limit !== undefined && selectedIds.length >= limit;
            const draftBlocked = item.status !== "Published" && !checked;
            const disabled = atLimit || draftBlocked;
            return (
              <li key={item.id}>
                <label
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    checked
                      ? "cursor-pointer border-brand/40 bg-brand/5"
                      : disabled
                        ? "cursor-not-allowed border-border-subtle opacity-60"
                        : "cursor-pointer border-border-subtle hover:border-brand/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggle(item.id)}
                    className="h-4 w-4 rounded border-border-subtle text-brand"
                  />
                  <span className="flex-1 text-sm text-foreground">
                    {item.title || "Untitled"}
                    {draftBlocked ? (
                      <span className="mt-0.5 block text-xs text-muted">
                        Publish this {itemNoun} to feature it on the homepage.
                      </span>
                    ) : null}
                  </span>
                  <PublishBadge status={item.status} />
                </label>
              </li>
            );
          })}
        </ul>
      )}
      {limit ? (
        <p className={`text-xs ${requirementMet ? "text-muted" : "font-medium text-amber-800"}`}>
          {selectedIds.length} of {limit} selected
          {requiredCount
            ? requirementMet
              ? " — required selection complete."
              : ` — select ${remaining} more ${itemNoun}${remaining === 1 ? "" : "s"} to save.`
            : selectedIds.length === 0
              ? " — defaults apply when none are chosen."
              : ""}
        </p>
      ) : null}
    </div>
  );
}

function useHomepageEditor(initial: CmsHomepage) {
  const { content, saveHomepage } = useCms();
  const { toast, showSuccess, showError, clearToast } = useToast();
  const [homepage, setHomepage] = useState(initial);

  // Keep featured picks in sync when experiences/rooms are published elsewhere.
  useEffect(() => {
    setHomepage((prev) => ({
      ...prev,
      featuredExperienceIds: content.homepage.featuredExperienceIds ?? prev.featuredExperienceIds,
      featuredRoomIds: content.homepage.featuredRoomIds ?? prev.featuredRoomIds,
      featuredOfferIds: content.homepage.featuredOfferIds ?? prev.featuredOfferIds,
      featuredAmenityIds: content.homepage.featuredAmenityIds ?? prev.featuredAmenityIds,
      featuredTestimonialIds:
        content.homepage.featuredTestimonialIds ?? prev.featuredTestimonialIds,
      homepageGalleryImageIds:
        content.homepage.homepageGalleryImageIds ?? prev.homepageGalleryImageIds,
      homepageFaqIds: content.homepage.homepageFaqIds ?? prev.homepageFaqIds,
    }));
  }, [
    content.homepage.featuredExperienceIds,
    content.homepage.featuredRoomIds,
    content.homepage.featuredOfferIds,
    content.homepage.featuredAmenityIds,
    content.homepage.featuredTestimonialIds,
    content.homepage.homepageGalleryImageIds,
    content.homepage.homepageFaqIds,
  ]);

  function save(message: string) {
    saveHomepage({ ...homepage, updatedAt: new Date().toISOString().slice(0, 10) });
    showSuccess(message);
  }

  return { homepage, setHomepage, save, toast, clearToast, showError, showSuccess };
}

export function HomepageFeaturedRoomsEditor(_props: { onPreview: PreviewHandler }) {
  const { content } = useCms();
  const { homepage, setHomepage, save, toast, clearToast, showError } = useHomepageEditor(
    content.homepage,
  );
  const rooms = [...content.rooms].sort((a, b) => a.name.localeCompare(b.name));
  const publishedCount = rooms.filter((room) => room.status === "Published").length;
  const selectedCount = homepage.featuredRoomIds.length;
  const requiredCount = 3;
  const canMeetRequirement = publishedCount >= requiredCount;
  const selectionValid = selectedCount === requiredCount;

  function handleSave() {
    if (!selectionValid) {
      showError(
        canMeetRequirement
          ? "Select exactly 3 published rooms for the homepage."
          : "Publish at least 3 rooms before featuring them on the homepage.",
      );
      return;
    }
    save("Homepage featured rooms saved.");
  }

  return (
    <>
      <HomepageEditorShell
        title="Featured rooms"
        description="Choose which rooms appear on the homepage and edit the section heading. Room names, photos, and rates are managed on the Rooms page."
        manageHref="/website/rooms"
        manageLabel="Rooms page"
        onSave={handleSave}
        saveDisabled={!selectionValid}
        saveHint={
          selectionValid
            ? undefined
            : canMeetRequirement
              ? `You must select exactly ${requiredCount} rooms before saving.`
              : `Publish at least ${requiredCount} rooms on the Rooms page first.`
        }
      >
        <SectionBandFields
          band={homepage.bands.rooms}
          onChange={(roomsBand) =>
            setHomepage({ ...homepage, bands: { ...homepage.bands, rooms: roomsBand } })
          }
        />
        <FeaturedPicker
          label="Rooms shown on homepage"
          hint="You must select exactly 3 published rooms. The homepage always shows these three featured rooms."
          requiredCount={requiredCount}
          itemNoun="room"
          emptyLabel="No rooms yet. Add rooms on the Rooms page."
          items={rooms.map((room) => ({
            id: room.id,
            title: room.name,
            status: room.status,
          }))}
          selectedIds={homepage.featuredRoomIds}
          onChange={(featuredRoomIds) => setHomepage({ ...homepage, featuredRoomIds })}
        />
      </HomepageEditorShell>
      <ToastPortal toast={toast} onClose={clearToast} />
    </>
  );
}

export function HomepageExperiencesEditor(_props: { onPreview: PreviewHandler }) {
  const { content } = useCms();
  const { homepage, setHomepage, save, toast, clearToast, showError } = useHomepageEditor(
    content.homepage,
  );
  const experiences = [...content.experiences].sort((a, b) => a.sortOrder - b.sortOrder);
  const publishedCount = experiences.filter((item) => item.status === "Published").length;
  const selectedCount = (homepage.featuredExperienceIds ?? []).length;
  const requiredCount = 4;
  const canMeetRequirement = publishedCount >= requiredCount;
  const selectionValid = selectedCount === requiredCount;

  function handleSave() {
    if (!selectionValid) {
      showError(
        canMeetRequirement
          ? "Select exactly 4 published experiences for the homepage."
          : "Publish at least 4 experiences before featuring them on the homepage.",
      );
      return;
    }
    save("Homepage experiences section saved.");
  }

  return (
    <>
      <HomepageEditorShell
        title="Experiences band"
        description="Edit the homepage experiences heading and choose which four experiences to highlight. Full experience content is managed on the Experiences page."
        manageHref="/website/experiences"
        manageLabel="Experiences page"
        onSave={handleSave}
        saveDisabled={!selectionValid}
        saveHint={
          selectionValid
            ? undefined
            : canMeetRequirement
              ? `You must select exactly ${requiredCount} experiences before saving.`
              : `Publish at least ${requiredCount} experiences on the Experiences page first.`
        }
      >
        <SectionBandFields
          band={homepage.bands.experiences}
          onChange={(experiencesBand) =>
            setHomepage({
              ...homepage,
              bands: { ...homepage.bands, experiences: experiencesBand },
            })
          }
        />
        <FeaturedPicker
          label="Experiences shown on homepage"
          hint="You must select exactly 4 published experiences. The homepage always shows these four featured experiences."
          requiredCount={requiredCount}
          itemNoun="experience"
          emptyLabel="No experiences yet. Add one on the Experiences page."
          items={experiences.map((item) => ({
            id: item.id,
            title: item.title,
            status: item.status,
          }))}
          selectedIds={homepage.featuredExperienceIds ?? []}
          onChange={(featuredExperienceIds) => setHomepage({ ...homepage, featuredExperienceIds })}
        />
      </HomepageEditorShell>
      <ToastPortal toast={toast} onClose={clearToast} />
    </>
  );
}

export function HomepageAmenitiesEditor(_props: { onPreview: PreviewHandler }) {
  const { content } = useCms();
  const { homepage, setHomepage, save, toast, clearToast, showError } = useHomepageEditor(
    content.homepage,
  );
  const amenities = [...content.amenities].sort((a, b) => a.sortOrder - b.sortOrder);
  const publishedCount = amenities.filter((item) => item.status === "Published").length;
  const selectedCount = (homepage.featuredAmenityIds ?? []).length;
  const requiredCount = 3;
  const canMeetRequirement = publishedCount >= requiredCount;
  const selectionValid = selectedCount === requiredCount;

  function handleSave() {
    if (!selectionValid) {
      showError(
        canMeetRequirement
          ? "Select exactly 3 published amenities for the homepage."
          : "Publish at least 3 amenities before featuring them on the homepage.",
      );
      return;
    }
    save("Homepage amenities section saved.");
  }

  return (
    <>
      <HomepageEditorShell
        title="Amenities band"
        description="Edit the homepage amenities heading and choose which three amenities to show. Full amenity content is managed on the Amenities page."
        manageHref="/website/amenities"
        manageLabel="Amenities page"
        onSave={handleSave}
        saveDisabled={!selectionValid}
        saveHint={
          selectionValid
            ? undefined
            : canMeetRequirement
              ? `You must select exactly ${requiredCount} amenities before saving.`
              : `Publish at least ${requiredCount} amenities on the Amenities page first.`
        }
      >
        <SectionBandFields
          band={homepage.bands.amenities}
          onChange={(amenitiesBand) =>
            setHomepage({
              ...homepage,
              bands: { ...homepage.bands, amenities: amenitiesBand },
            })
          }
        />
        <FeaturedPicker
          label="Amenities shown on homepage"
          hint="You must select exactly 3 published amenities. The homepage always shows these three featured amenities."
          requiredCount={requiredCount}
          itemNoun="amenity"
          emptyLabel="No amenities yet. Add some on the Amenities page."
          items={amenities.map((item) => ({
            id: item.id,
            title: item.title,
            status: item.status,
          }))}
          selectedIds={homepage.featuredAmenityIds ?? []}
          onChange={(featuredAmenityIds) => setHomepage({ ...homepage, featuredAmenityIds })}
        />
      </HomepageEditorShell>
      <ToastPortal toast={toast} onClose={clearToast} />
    </>
  );
}

export function HomepageGalleryEditor(_props: { onPreview: PreviewHandler }) {
  const { content, saveGalleryImage, deleteGalleryImage, reorderGalleryImages } = useCms();
  const { homepage, setHomepage, save, toast, clearToast, showError, showSuccess } =
    useHomepageEditor(content.homepage);
  const [imgModal, setImgModal] = useState<CmsGalleryImage | "new" | null>(null);
  const [imgForm, setImgForm] = useState<CmsGalleryImage>(() => emptyHomepageGalleryImage());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const galleryImages = [...content.galleryImages].sort((a, b) => a.sortOrder - b.sortOrder);
  const selectedIds = homepage.homepageGalleryImageIds ?? [];
  const selectedCount = selectedIds.length;
  const publishedSelected = selectedIds.filter((id) =>
    galleryImages.some((item) => item.id === id && item.status === "Published"),
  ).length;
  const canMeetRequirement = galleryImages.filter((item) => item.status === "Published").length >= 3;
  const isValidSelection = publishedSelected >= 3 && selectedCount <= 7;

  function toggleFeatured(id: string) {
    if (selectedIds.includes(id)) {
      setHomepage({
        ...homepage,
        homepageGalleryImageIds: selectedIds.filter((itemId) => itemId !== id),
      });
      return;
    }
    if (selectedIds.length >= 7) return;
    setHomepage({
      ...homepage,
      homepageGalleryImageIds: [...selectedIds, id],
    });
  }

  function moveUp(index: number) {
    if (index <= 0) return;
    const next = [...galleryImages];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    reorderGalleryImages(next.map((row, i) => ({ ...row, sortOrder: i })));
  }

  function openNew() {
    setImgForm(
      emptyHomepageGalleryImage(
        galleryImages.length,
        content.galleryCategories[0]?.id ?? "gal-cat-1",
      ),
    );
    setImgModal("new");
  }

  function openEdit(image: CmsGalleryImage) {
    setImgForm({ ...image });
    setImgModal(image);
  }

  function handleSaveImage(event: React.FormEvent) {
    event.preventDefault();
    if (!imgForm.title.trim()) {
      showError("Add a title for this gallery image.");
      return;
    }
    if (!imgForm.imageUrl.trim()) {
      showError("Upload an image before saving.");
      return;
    }

    const id = imgModal === "new" ? createId("gal") : imgForm.id;
    const nextImage: CmsGalleryImage = {
      ...imgForm,
      id,
      title: imgForm.title.trim(),
      caption: imgForm.caption.trim(),
      status: imgForm.status || "Published",
    };
    saveGalleryImage(nextImage);
    setImgModal(null);
    showSuccess(imgModal === "new" ? "Gallery image added." : "Gallery image updated.");
  }

  function handleSaveSection() {
    if (!isValidSelection) {
      showError(
        canMeetRequirement
          ? "Select between 3 and 7 published gallery images for the homepage."
          : "Add and publish at least 3 gallery images first.",
      );
      return;
    }
    save("Homepage gallery section saved.");
  }

  return (
    <>
      <HomepageEditorShell
        title="Gallery band"
        description="Update homepage gallery images here — upload photos, edit titles, reorder, and choose which 3–7 appear in the mosaic."
        manageHref="/website/gallery"
        manageLabel="full Gallery page"
        onSave={handleSaveSection}
        saveDisabled={!isValidSelection}
        saveHint={
          isValidSelection
            ? undefined
            : "Select 3 to 7 published images (with uploaded photos) before saving."
        }
      >
        <SectionBandFields
          band={homepage.bands.gallery}
          onChange={(gallery) =>
            setHomepage({ ...homepage, bands: { ...homepage.bands, gallery } })
          }
        />

        <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">Gallery images on homepage</h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-900 uppercase">
                  Required · select 3–7
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Check images to show on the homepage. Use Edit, Publish, Move up, or Delete like
                other CMS sections.
              </p>
            </div>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              Add image
            </button>
          </div>

          {galleryImages.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-subtle px-4 py-8 text-center text-sm text-muted">
              No gallery images yet. Click Add image to upload the first one.
            </p>
          ) : (
            <ul className="space-y-3">
              {galleryImages.map((item, index) => {
                const checked = selectedIds.includes(item.id);
                const atLimit = !checked && selectedIds.length >= 7;
                const draftBlocked = item.status !== "Published" && !checked;
                const disabled = atLimit || draftBlocked;
                return (
                  <li
                    key={item.id}
                    className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center ${
                      checked ? "border-brand/40 bg-brand/5" : "border-border-subtle"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleFeatured(item.id)}
                        className="h-4 w-4 shrink-0 rounded border-border-subtle text-brand"
                        aria-label={`Show ${item.title} on homepage`}
                      />
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-muted">
                            No photo
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.title || "Untitled image"}
                        </p>
                        {item.caption ? (
                          <p className="mt-0.5 truncate text-xs text-muted">{item.caption}</p>
                        ) : null}
                        {!item.imageUrl ? (
                          <p className="mt-0.5 text-xs text-amber-800">
                            Upload a photo to use this on the homepage.
                          </p>
                        ) : null}
                        {draftBlocked ? (
                          <p className="mt-0.5 text-xs text-muted">
                            Publish to feature on the homepage.
                          </p>
                        ) : null}
                      </div>
                      <PublishBadge status={item.status} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          saveGalleryImage({
                            ...item,
                            status: togglePublishStatus(item.status),
                          })
                        }
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface-muted"
                      >
                        {item.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                      {index > 0 ? (
                        <button
                          type="button"
                          onClick={() => moveUp(index)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface-muted"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                          Move up
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setDeleteId(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-surface-muted"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <p
            className={`text-xs ${
              isValidSelection ? "text-muted" : "font-medium text-amber-800"
            }`}
          >
            {selectedCount} of 7 selected
            {isValidSelection
              ? " — ready to save."
              : ` — select at least ${Math.max(3 - publishedSelected, 0)} more published images.`}
          </p>
        </div>
      </HomepageEditorShell>

      <CmsModal
        open={imgModal !== null}
        title={imgModal === "new" ? "Add gallery image" : "Edit gallery image"}
        wide
        onClose={() => setImgModal(null)}
      >
        <form className="space-y-4" onSubmit={handleSaveImage}>
          <ImageUploadField
            label="Photo"
            value={imgForm.imageUrl}
            onChange={(imageUrl) => setImgForm((prev) => ({ ...prev, imageUrl }))}
            hint="Upload the image that should appear in the homepage mosaic."
          />
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Title</span>
            <input
              value={imgForm.title}
              onChange={(e) => setImgForm((prev) => ({ ...prev, title: e.target.value }))}
              className="field-input h-11"
              placeholder="Morning mist over the valley"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Caption</span>
            <input
              value={imgForm.caption}
              onChange={(e) => setImgForm((prev) => ({ ...prev, caption: e.target.value }))}
              className="field-input h-11"
              placeholder="Optional short caption"
            />
          </label>
          <PublishStatusField
            status={imgForm.status}
            onChange={(status) => setImgForm((prev) => ({ ...prev, status }))}
          />
          <FormActions
            onCancel={() => setImgModal(null)}
            submitLabel={imgModal === "new" ? "Add image" : "Save image"}
          />
        </form>
      </CmsModal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete gallery image?"
        message="Remove this image from the gallery and homepage."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteGalleryImage(deleteId);
            setHomepage({
              ...homepage,
              homepageGalleryImageIds: selectedIds.filter((id) => id !== deleteId),
            });
          }
          setDeleteId(null);
          showSuccess("Gallery image deleted.");
        }}
      />

      <ToastPortal toast={toast} onClose={clearToast} />
    </>
  );
}

function emptyHomepageGalleryImage(
  sortOrder = 0,
  categoryId = "gal-cat-1",
): CmsGalleryImage {
  return {
    id: "",
    categoryId,
    title: "",
    caption: "",
    imageUrl: "",
    sortOrder,
    status: "Published",
  };
}

export function HomepageOffersEditor(_props: { onPreview: PreviewHandler }) {
  const { content, saveOffer } = useCms();
  const { homepage, setHomepage, save, toast, clearToast, showError, showSuccess } =
    useHomepageEditor(content.homepage);
  const [offerModal, setOfferModal] = useState<CmsWebsiteOffer | "new" | null>(null);

  const offers = [...content.offers].sort((a, b) => a.sortOrder - b.sortOrder);
  const selectedIds = homepage.featuredOfferIds ?? [];
  const selectedCount = selectedIds.length;
  const requiredCount = 3;
  const publishedCount = offers.filter(
    (offer) => offer.status === "Published" && offer.active !== false,
  ).length;
  const canMeetRequirement = publishedCount >= requiredCount;
  const selectionValid = selectedCount === requiredCount;

  function toggleFeatured(id: string) {
    if (selectedIds.includes(id)) {
      setHomepage({
        ...homepage,
        featuredOfferIds: selectedIds.filter((itemId) => itemId !== id),
      });
      return;
    }
    if (selectedIds.length >= requiredCount) return;
    setHomepage({
      ...homepage,
      featuredOfferIds: [...selectedIds, id],
    });
  }

  function handleSaveSection() {
    if (!selectionValid) {
      showError(
        canMeetRequirement
          ? "Select exactly 3 published packages for the homepage."
          : "Publish at least 3 packages first.",
      );
      return;
    }
    save("Homepage offers section saved.");
  }

  return (
    <>
      <HomepageEditorShell
        title="Offers band"
        description="Homepage only — edit package copy and choose which 3 packages appear on the public homepage. The Offers page still lists the full catalog."
        manageHref="/website/offers"
        manageLabel="Offers page"
        onSave={handleSaveSection}
        saveDisabled={!selectionValid}
        saveHint={
          selectionValid
            ? undefined
            : canMeetRequirement
              ? `You must select exactly ${requiredCount} packages before saving.`
              : `Add and publish at least ${requiredCount} packages first.`
        }
      >
        <SectionBandFields
          band={homepage.bands.offers}
          onChange={(offersBand) =>
            setHomepage({ ...homepage, bands: { ...homepage.bands, offers: offersBand } })
          }
        />

        <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">Packages shown on homepage</h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-900 uppercase">
                  Required · select {requiredCount}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Check 3 packages for the homepage. Use Edit to change title, description, price, or
                terms — those updates show on the public homepage after save.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOfferModal("new")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              Add package
            </button>
          </div>

          {offers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-subtle px-4 py-8 text-center text-sm text-muted">
              No packages yet. Click Add package to create one.
            </p>
          ) : (
            <ul className="space-y-3">
              {offers.map((offer) => {
                const checked = selectedIds.includes(offer.id);
                const selectable =
                  offer.status === "Published" && offer.active !== false;
                const atLimit = !checked && selectedIds.length >= requiredCount;
                const disabled = atLimit || (!selectable && !checked);
                return (
                  <li
                    key={offer.id}
                    className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center ${
                      checked ? "border-brand/40 bg-brand/5" : "border-border-subtle"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleFeatured(offer.id)}
                        className="h-4 w-4 shrink-0 rounded border-border-subtle text-brand"
                        aria-label={`Show ${offer.title} on homepage`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {offer.title || "Untitled package"}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                          {offer.description || "No description yet."}
                        </p>
                        <p className="mt-1 text-xs font-medium text-foreground">
                          From ₹{offer.priceFrom.toLocaleString("en-IN")}
                        </p>
                        {!selectable ? (
                          <p className="mt-0.5 text-xs text-muted">
                            Publish and activate this package to feature it on the homepage.
                          </p>
                        ) : null}
                      </div>
                      <PublishBadge status={offer.status} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setOfferModal(offer)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          saveOffer({
                            ...offer,
                            status: togglePublishStatus(offer.status),
                            updatedAt: new Date().toISOString().slice(0, 10),
                          })
                        }
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface-muted"
                      >
                        {offer.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <p
            className={`text-xs ${
              selectionValid ? "text-muted" : "font-medium text-amber-800"
            }`}
          >
            {selectedCount} of {requiredCount} selected
            {selectionValid
              ? " — ready to save."
              : ` — select ${Math.max(requiredCount - selectedCount, 0)} more published package${
                  requiredCount - selectedCount === 1 ? "" : "s"
                }.`}
          </p>
        </div>
      </HomepageEditorShell>

      <OfferEditModal
        open={offerModal !== null}
        offer={offerModal === "new" || offerModal === null ? null : offerModal}
        isNew={offerModal === "new"}
        onClose={() => setOfferModal(null)}
        onSaved={(offer) => {
          if (
            offer.status === "Published" &&
            offer.active !== false &&
            !selectedIds.includes(offer.id) &&
            selectedIds.length < requiredCount
          ) {
            setHomepage({
              ...homepage,
              featuredOfferIds: [...selectedIds, offer.id],
            });
          }
          showSuccess("Package updated. Refresh the public homepage to see it.");
        }}
      />

      <ToastPortal toast={toast} onClose={clearToast} />
    </>
  );
}

export function HomepageTestimonialsEditor(_props: { onPreview: PreviewHandler }) {
  const { content } = useCms();
  const { homepage, setHomepage, save, toast, clearToast, showError } = useHomepageEditor(
    content.homepage,
  );
  const testimonials = [...content.testimonials];
  const publishedCount = testimonials.filter((item) => item.status === "Published").length;
  const selectedCount = (homepage.featuredTestimonialIds ?? []).length;
  const requiredCount = 3;
  const canMeetRequirement = publishedCount >= requiredCount;
  const selectionValid = selectedCount === requiredCount;

  function handleSave() {
    if (!selectionValid) {
      showError(
        canMeetRequirement
          ? "Select exactly 3 published testimonials for the homepage."
          : "Publish at least 3 testimonials on the Testimonials page first.",
      );
      return;
    }
    save("Homepage testimonials section saved.");
  }

  return (
    <>
      <HomepageEditorShell
        title="Testimonials band"
        description="Edit the homepage testimonials heading and choose which three guest quotes appear. Full testimonial content is managed on the Testimonials page."
        manageHref="/website/testimonials"
        manageLabel="Testimonials page"
        onSave={handleSave}
        saveDisabled={!selectionValid}
        saveHint={
          selectionValid
            ? undefined
            : canMeetRequirement
              ? `You must select exactly ${requiredCount} testimonials before saving.`
              : `Publish at least ${requiredCount} testimonials on the Testimonials page first.`
        }
      >
        <SectionBandFields
          band={{
            ...homepage.bands.testimonials,
            viewAllLabel: "",
          }}
          onChange={(testimonialsBand) =>
            setHomepage({
              ...homepage,
              bands: {
                ...homepage.bands,
                testimonials: {
                  eyebrow: testimonialsBand.eyebrow,
                  title: testimonialsBand.title,
                  lead: testimonialsBand.lead,
                  status: testimonialsBand.status,
                },
              },
            })
          }
          showViewAll={false}
        />
        <FeaturedPicker
          label="Testimonials shown on homepage"
          hint="You must select exactly 3 published testimonials. The homepage always shows these three featured quotes."
          requiredCount={requiredCount}
          itemNoun="testimonial"
          emptyLabel="No testimonials yet. Add some on the Testimonials page."
          items={testimonials.map((item) => ({
            id: item.id,
            title: `${item.guestName} — ${item.content.slice(0, 72)}${
              item.content.length > 72 ? "…" : ""
            }`,
            status: item.status,
          }))}
          selectedIds={homepage.featuredTestimonialIds ?? []}
          onChange={(featuredTestimonialIds) =>
            setHomepage({ ...homepage, featuredTestimonialIds })
          }
        />
      </HomepageEditorShell>
      <ToastPortal toast={toast} onClose={clearToast} />
    </>
  );
}

export function HomepageLocationEditor(_props: { onPreview: PreviewHandler }) {
  const { content } = useCms();
  const { homepage, setHomepage, save, toast, clearToast } = useHomepageEditor(content.homepage);
  const band = homepage.bands.location;

  function updateBand(location: CmsHomepageLocationBand) {
    setHomepage({ ...homepage, bands: { ...homepage.bands, location } });
  }

  return (
    <>
      <HomepageEditorShell
        title="Location band"
        description="Edit the homepage location band copy. Address, map, and directions are managed on the Location page."
        manageHref="/website/location"
        manageLabel="Location page"
        onSave={() => save("Homepage location section saved.")}
      >
        <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-4">
          <h3 className="text-sm font-medium text-foreground">Section copy on homepage</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Eyebrow</span>
              <input
                value={band.eyebrow}
                onChange={(e) => updateBand({ ...band, eyebrow: e.target.value })}
                className="field-input h-11"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Title</span>
              <input
                value={band.title}
                onChange={(e) => updateBand({ ...band, title: e.target.value })}
                className="field-input h-11"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Intro text</span>
            <textarea
              value={band.lead}
              onChange={(e) => updateBand({ ...band, lead: e.target.value })}
              rows={2}
              className="field-input"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Directions link label</span>
            <input
              value={band.directionsLabel}
              onChange={(e) => updateBand({ ...band, directionsLabel: e.target.value })}
              className="field-input h-11"
            />
          </label>
        </div>
        <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-muted px-4 py-3 text-sm text-muted">
          <p className="font-medium text-foreground">Shown from Location page (read-only here)</p>
          <p className="mt-2">{content.location.address.replace(/\n/g, ", ")}</p>
          <p className="mt-1">{content.location.airportNote}</p>
        </div>
      </HomepageEditorShell>
      <ToastPortal toast={toast} onClose={clearToast} />
    </>
  );
}

export function HomepageFaqsEditor(_props: { onPreview: PreviewHandler }) {
  const { content } = useCms();
  const { homepage, setHomepage, save, toast, clearToast } = useHomepageEditor(content.homepage);
  const published = content.faqs.filter((item) => item.status === "Published");

  return (
    <>
      <HomepageEditorShell
        title="FAQs band"
        description="Edit the homepage FAQ heading and choose up to four questions to show. Full FAQ content is managed on the FAQs page."
        manageHref="/website/faqs"
        manageLabel="FAQs page"
        onSave={() => save("Homepage FAQs section saved.")}
      >
        <SectionBandFields
          band={homepage.bands.faqs}
          onChange={(faqs) =>
            setHomepage({ ...homepage, bands: { ...homepage.bands, faqs } })
          }
        />
        <FeaturedPicker
          label="FAQs shown on homepage"
          hint="Select up to 4 published FAQs. Leave empty to show the first four."
          maxItems={4}
          items={published.map((item) => ({
            id: item.id,
            title: item.question,
            status: item.status,
          }))}
          selectedIds={homepage.homepageFaqIds}
          onChange={(homepageFaqIds) => setHomepage({ ...homepage, homepageFaqIds })}
        />
      </HomepageEditorShell>
      <ToastPortal toast={toast} onClose={clearToast} />
    </>
  );
}
