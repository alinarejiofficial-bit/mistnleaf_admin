"use client";

import { useMemo, useState } from "react";
import { GripVertical, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { createId, useCms } from "@/components/cms/CmsProvider";
import { OfferEditModal } from "@/components/cms/OfferEditModal";
import {
  ConfirmDialog,
  CmsModal,
  EmptyState,
  FilterSelect,
  FormActions,
  ImageUploadField,
  PreviewButton,
  PublishBadge,
  PublishListButton,
  PublishStatusField,
  RichTextEditor,
  SearchField,
  stripHtml,
  ToastPortal,
  useToast,
} from "@/components/cms/CmsShared";
import { formatDisplayDate } from "@/lib/data";
import {
  togglePublishStatus,
  type CmsFaq,
  type CmsGalleryCategory,
  type CmsGalleryImage,
  type CmsOffersSection,
  type CmsTestimonial,
  type CmsWebsiteOffer,
  type PublishStatus,
} from "@/lib/cms-data";

type PreviewHandler = (section: string, data?: unknown) => void;

export function GallerySection({ onPreview }: { onPreview: PreviewHandler }) {
  const {
    content,
    saveGalleryCategory,
    deleteGalleryCategory,
    saveGalleryImage,
    deleteGalleryImage,
    reorderGalleryImages,
  } = useCms();
  const { toast, showSuccess, clearToast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [catModal, setCatModal] = useState<CmsGalleryCategory | "new" | null>(null);
  const [imgModal, setImgModal] = useState<CmsGalleryImage | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "cat" | "img"; id: string } | null>(
    null,
  );
  const [catForm, setCatForm] = useState({ name: "", status: "Published" as PublishStatus });
  const [imgForm, setImgForm] = useState<Omit<CmsGalleryImage, "id">>(emptyImage());

  const images = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...content.galleryImages]
      .filter((img) => {
        if (categoryFilter !== "All" && img.categoryId !== categoryFilter) return false;
        if (!q) return true;
        return img.title.toLowerCase().includes(q);
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [content.galleryImages, categoryFilter, query]);

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ordered = [...images];
    const from = ordered.findIndex((item) => item.id === dragId);
    const to = ordered.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    reorderGalleryImages(
      ordered.map((item, index) => ({ ...item, sortOrder: index })),
    );
    setDragId(null);
    showSuccess("Gallery order updated.");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">Gallery management</h2>
          <p className="mt-1 text-sm text-muted">
            Upload images, manage categories, and reorder with drag and drop.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setCatForm({ name: "", status: "Published" });
              setCatModal("new");
            }}
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
          >
            New category
          </button>
          <button
            type="button"
            onClick={() => {
              setImgForm(emptyImage(content.galleryCategories[0]?.id ?? ""));
              setImgModal("new");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Upload image
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {content.galleryCategories.map((cat) => (
          <span
            key={cat.id}
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface px-3 py-1.5 text-sm"
          >
            {cat.name}
            <PublishBadge status={cat.status} />
            <PublishListButton
              status={cat.status}
              onToggle={() =>
                saveGalleryCategory({
                  ...cat,
                  status: togglePublishStatus(cat.status),
                })
              }
            />
            <button
              type="button"
              onClick={() => {
                setCatForm(cat);
                setCatModal(cat);
              }}
              className="text-muted hover:text-foreground"
              aria-label={`Edit ${cat.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchField value={query} onChange={setQuery} placeholder="Search gallery…" />
        <FilterSelect
          label="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: "All", label: "All categories" },
            ...content.galleryCategories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            })),
          ]}
        />
      </div>

      {images.length === 0 ? (
        <EmptyState
          title="No gallery images"
          description="Upload images and assign them to a category."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDragId(img.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(img.id)}
              className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-soft to-accent-soft">
                {img.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
                <span className="absolute top-2 left-2 rounded-lg bg-foreground/60 p-1.5 text-white">
                  <GripVertical className="h-4 w-4" />
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{img.title}</p>
                    <p className="mt-1 text-xs text-muted">{img.caption}</p>
                  </div>
                  <PublishBadge status={img.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <PreviewButton onClick={() => onPreview("gallery", img)} />
                  <button
                    type="button"
                    onClick={() => {
                      setImgForm(img);
                      setImgModal(img);
                    }}
                    className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveGalleryImage({
                        ...img,
                        status: togglePublishStatus(img.status),
                      })
                    }
                    className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted"
                  >
                    {img.status === "Published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: "img", id: img.id })}
                    className="rounded-lg border border-border p-1 hover:bg-surface-muted"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CmsModal
        open={catModal !== null}
        title={catModal === "new" ? "New category" : "Edit category"}
        onClose={() => setCatModal(null)}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveGalleryCategory({
              id: catModal === "new" ? createId("gal-cat") : (catModal as CmsGalleryCategory).id,
              ...catForm,
            });
            setCatModal(null);
            showSuccess("Category saved.");
          }}
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Name</span>
            <input
              value={catForm.name}
              onChange={(e) => setCatForm((prev) => ({ ...prev, name: e.target.value }))}
              className="field-input h-11"
            />
          </label>
          <PublishStatusField
            status={catForm.status}
            onChange={(status) => setCatForm((prev) => ({ ...prev, status }))}
          />
          <FormActions onCancel={() => setCatModal(null)} />
        </form>
      </CmsModal>

      <CmsModal
        open={imgModal !== null}
        title={imgModal === "new" ? "Upload image" : "Edit image"}
        wide
        onClose={() => setImgModal(null)}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveGalleryImage({
              ...imgForm,
              id: imgModal === "new" ? createId("gal") : (imgModal as CmsGalleryImage).id,
            });
            setImgModal(null);
            showSuccess("Image saved.");
          }}
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Category</span>
            <select
              value={imgForm.categoryId}
              onChange={(e) =>
                setImgForm((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              className="field-input h-11"
            >
              {content.galleryCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Title</span>
            <input
              value={imgForm.title}
              onChange={(e) => setImgForm((prev) => ({ ...prev, title: e.target.value }))}
              className="field-input h-11"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Caption</span>
            <input
              value={imgForm.caption}
              onChange={(e) => setImgForm((prev) => ({ ...prev, caption: e.target.value }))}
              className="field-input h-11"
            />
          </label>
          <ImageUploadField
            label="Image"
            value={imgForm.imageUrl}
            onChange={(imageUrl) => setImgForm((prev) => ({ ...prev, imageUrl }))}
          />
          <PublishStatusField
            status={imgForm.status}
            onChange={(status) => setImgForm((prev) => ({ ...prev, status }))}
          />
          <FormActions onCancel={() => setImgModal(null)} />
        </form>
      </CmsModal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete gallery item?"
        message="This action cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === "img") deleteGalleryImage(deleteTarget.id);
          else deleteGalleryCategory(deleteTarget.id);
          setDeleteTarget(null);
          showSuccess("Deleted.");
        }}
      />
      <ToastPortal toast={toast} onClose={clearToast} />
    </div>
  );
}

function emptyImage(categoryId = ""): Omit<CmsGalleryImage, "id"> {
  return {
    categoryId,
    title: "",
    caption: "",
    imageUrl: "",
    sortOrder: 0,
    status: "Draft",
  };
}

export function OffersCmsSection({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveOffer, deleteOffer, saveOffersSection } = useCms();
  const { toast, showSuccess, clearToast } = useToast();
  const [sectionDraft, setSectionDraft] = useState<CmsOffersSection | null>(null);
  const [offerModal, setOfferModal] = useState<CmsWebsiteOffer | "new" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const section = sectionDraft ?? content.offersSection;
  const allOffers = [...content.offers].sort((a, b) => a.sortOrder - b.sortOrder);
  const publishedOffers = allOffers.filter(
    (offer) => offer.status === "Published" && offer.active,
  );

  function saveSection() {
    saveOffersSection({ ...section, updatedAt: new Date().toISOString().slice(0, 10) });
    setSectionDraft(null);
    showSuccess("Offers section saved.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">Offers & Packages</h2>
          <p className="mt-1 text-sm text-muted">
            Edit the Offers page header and full package catalog. Homepage package picks are
            managed separately under Homepage → Offers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PreviewButton onClick={() => onPreview("offers", { section, offers: publishedOffers })} />
          {sectionDraft ? (
            <>
              <button
                type="button"
                onClick={() => setSectionDraft(null)}
                className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={saveSection}
                className="rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
              >
                Save section header
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSectionDraft({ ...content.offersSection })}
              className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
            >
              Edit section header
            </button>
          )}
          <button
            type="button"
            onClick={() => setOfferModal("new")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Add package
          </button>
        </div>
      </div>

      {sectionDraft ? (
        <div className="grid gap-4 rounded-2xl border border-border-subtle bg-surface p-5 sm:grid-cols-2">
          <OfferSectionField
            label="Eyebrow (e.g. PACKAGES)"
            value={section.eyebrow}
            onChange={(eyebrow) => setSectionDraft((prev) => prev && { ...prev, eyebrow })}
          />
          <OfferSectionField
            label="Section title"
            value={section.title}
            onChange={(title) => setSectionDraft((prev) => prev && { ...prev, title })}
          />
          <OfferSectionField
            label="Subtitle"
            value={section.subtitle}
            onChange={(subtitle) => setSectionDraft((prev) => prev && { ...prev, subtitle })}
            className="sm:col-span-2"
          />
          <OfferSectionField
            label="View-all link label"
            value={section.viewAllLabel}
            onChange={(viewAllLabel) => setSectionDraft((prev) => prev && { ...prev, viewAllLabel })}
          />
          <OfferSectionField
            label="View-all link URL"
            value={section.viewAllHref}
            onChange={(viewAllHref) => setSectionDraft((prev) => prev && { ...prev, viewAllHref })}
          />
          <div className="sm:col-span-2">
            <PublishStatusField
              status={section.status}
              onChange={(status) => setSectionDraft((prev) => prev && { ...prev, status })}
            />
          </div>
        </div>
      ) : null}

      {allOffers.length === 0 ? (
        <EmptyState
          title="No packages yet"
          description="Add your first offer package for the public website."
          action={
            <button
              type="button"
              onClick={() => setOfferModal("new")}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              Add package
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Package</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allOffers.map((offer, index) => (
                <tr key={offer.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-xs text-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="font-medium text-foreground">{offer.title}</div>
                        <div className="mt-1 max-w-md text-xs text-muted">{offer.description}</div>
                        {offer.terms.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {offer.terms.map((term) => (
                              <span
                                key={term}
                                className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-muted"
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-xs text-muted">{offer.priceLabel}</span>
                    <div className="font-medium">
                      ₹{offer.priceFrom.toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1.5">
                      <PublishBadge status={offer.status} />
                      {!offer.active ? (
                        <span className="w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setOfferModal(offer)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
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
                          })
                        }
                        className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted"
                      >
                        {offer.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => saveOffer({ ...offer, active: !offer.active })}
                        className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted"
                      >
                        {offer.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(offer.id)}
                        className="rounded-lg border border-border p-1.5 hover:bg-surface-muted"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OfferEditModal
        open={offerModal !== null}
        offer={offerModal === "new" ? null : offerModal}
        isNew={offerModal === "new"}
        onClose={() => setOfferModal(null)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete offer?"
        message="This removes the package from the website CMS."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteOffer(deleteId);
          setDeleteId(null);
          showSuccess("Offer deleted.");
        }}
      />
      <ToastPortal toast={toast} onClose={clearToast} />
    </div>
  );
}

function OfferSectionField({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1.5 block font-medium text-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input h-11"
      />
    </label>
  );
}

export function TestimonialsSection({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveTestimonial, deleteTestimonial } = useCms();
  const { toast, showSuccess, clearToast } = useToast();
  const [modal, setModal] = useState<CmsTestimonial | "new" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CmsTestimonial>(emptyTestimonial());

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">Testimonials</h2>
          <p className="mt-1 text-sm text-muted">Guest reviews displayed on the public site.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(emptyTestimonial());
            setModal("new");
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" />
          Add testimonial
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {content.testimonials.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{item.guestName}</p>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-3.5 w-3.5 ${
                        index < item.rating
                          ? "fill-accent text-accent"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <PublishBadge status={item.status} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">&ldquo;{item.content}&rdquo;</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <PreviewButton onClick={() => onPreview("testimonial", item)} />
              <button
                type="button"
                onClick={() => {
                  setForm({ ...item });
                  setModal(item);
                }}
                className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() =>
                  saveTestimonial({
                    ...item,
                    status: togglePublishStatus(item.status),
                  })
                }
                className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted"
              >
                {item.status === "Published" ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteId(item.id)}
                className="rounded-lg border border-border p-1 hover:bg-surface-muted"
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </button>
            </div>
          </article>
        ))}
      </div>

      <CmsModal
        open={modal !== null}
        title={modal === "new" ? "Add testimonial" : "Edit testimonial"}
        onClose={() => setModal(null)}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveTestimonial({
              ...form,
              id: modal === "new" ? createId("tst") : form.id,
            });
            setModal(null);
            showSuccess("Testimonial saved.");
          }}
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Guest name</span>
            <input
              value={form.guestName}
              onChange={(e) => setForm((prev) => ({ ...prev, guestName: e.target.value }))}
              className="field-input h-11"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Testimonial</span>
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="field-input"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Rating</span>
            <select
              value={form.rating}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
              }
              className="field-input h-11"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
          </label>
          <PublishStatusField
            status={form.status}
            onChange={(status) => setForm((prev) => ({ ...prev, status }))}
          />
          <FormActions onCancel={() => setModal(null)} />
        </form>
      </CmsModal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Remove testimonial?"
        message="This will delete the testimonial from the website."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteTestimonial(deleteId);
          setDeleteId(null);
          showSuccess("Testimonial removed.");
        }}
      />
      <ToastPortal toast={toast} onClose={clearToast} />
    </div>
  );
}

function emptyTestimonial(): CmsTestimonial {
  return {
    id: "",
    guestName: "",
    guestLocation: "",
    initials: "",
    content: "",
    rating: 5,
    status: "Draft",
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export function FaqsContactSection({
  onPreview,
  focus = "all",
}: {
  onPreview: PreviewHandler;
  focus?: "all" | "faqs" | "contact";
}) {
  const { content, saveFaq, deleteFaq, saveContact, reorderFaqs } = useCms();
  const { toast, showSuccess, clearToast } = useToast();
  const [faqModal, setFaqModal] = useState<CmsFaq | "new" | null>(null);
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState<CmsFaq>(emptyFaq());
  const [contactDraft, setContactDraft] = useState(content.contact);
  const [editingContact, setEditingContact] = useState(false);

  const faqs = [...content.faqs].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-8">
      {focus !== "contact" ? (
      <div>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-foreground">FAQs</h2>
            <p className="mt-1 text-sm text-muted">Manage questions and answers on the website.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFaqForm(emptyFaq(faqs.length));
              setFaqModal("new");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </button>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{faq.question}</p>
                  <p className="mt-2 text-sm text-muted">{faq.answer}</p>
                </div>
                <PublishBadge status={faq.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <PreviewButton onClick={() => onPreview("faq", faq)} />
                <button
                  type="button"
                  onClick={() => {
                    setFaqForm({ ...faq });
                    setFaqModal(faq);
                  }}
                  className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted"
                >
                  Edit
                </button>
                <PublishListButton
                  status={faq.status}
                  onToggle={() =>
                    saveFaq({ ...faq, status: togglePublishStatus(faq.status) })
                  }
                />
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...faqs];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    reorderFaqs(next.map((item, i) => ({ ...item, sortOrder: i })));
                  }}
                  className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted disabled:opacity-40"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteFaqId(faq.id)}
                  className="rounded-lg border border-border p-1 hover:bg-surface-muted"
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      ) : null}

      {focus !== "faqs" ? (
      <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-foreground">Contact information</h2>
            <p className="mt-1 text-sm text-muted">Phone, email, address, and guest notes.</p>
          </div>
          <PreviewButton onClick={() => onPreview("contact", contactDraft)} />
        </div>

        {editingContact ? (
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              saveContact(contactDraft);
              setEditingContact(false);
              showSuccess("Contact information saved.");
            }}
          >
            {(
              [
                ["phone", "Phone"],
                ["email", "Email"],
                ["whatsapp", "WhatsApp"],
                ["address", "Address"],
                ["checkInNote", "Reception note"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm sm:col-span-2">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input
                  value={contactDraft[key]}
                  onChange={(e) =>
                    setContactDraft((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="field-input h-11"
                />
              </label>
            ))}
            <div className="sm:col-span-2">
              <PublishStatusField
                status={contactDraft.status}
                onChange={(status) => setContactDraft((prev) => ({ ...prev, status }))}
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setContactDraft(content.contact);
                  setEditingContact(false);
                }}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
              >
                Save contact info
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Phone" value={content.contact.phone} />
            <InfoRow label="Email" value={content.contact.email} />
            <InfoRow label="WhatsApp" value={content.contact.whatsapp} />
            <InfoRow label="Address" value={content.contact.address} />
            <InfoRow label="Reception note" value={content.contact.checkInNote} />
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
              <PublishBadge status={content.contact.status} />
              <PublishListButton
                status={content.contact.status}
                onToggle={() =>
                  saveContact({
                    ...content.contact,
                    status: togglePublishStatus(content.contact.status),
                  })
                }
              />
            </div>
            <button
              type="button"
              onClick={() => setEditingContact(true)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted sm:col-span-2 sm:w-fit"
            >
              Edit contact information
            </button>
          </div>
        )}
      </div>
      ) : null}

      {focus !== "contact" ? (
      <>
      <CmsModal
        open={faqModal !== null}
        title={faqModal === "new" ? "Add FAQ" : "Edit FAQ"}
        onClose={() => setFaqModal(null)}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveFaq({
              ...faqForm,
              id: faqModal === "new" ? createId("faq") : faqForm.id,
            });
            setFaqModal(null);
            showSuccess("FAQ saved.");
          }}
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Question</span>
            <input
              value={faqForm.question}
              onChange={(e) => setFaqForm((prev) => ({ ...prev, question: e.target.value }))}
              className="field-input h-11"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Answer</span>
            <textarea
              value={faqForm.answer}
              onChange={(e) => setFaqForm((prev) => ({ ...prev, answer: e.target.value }))}
              rows={4}
              className="field-input"
            />
          </label>
          <PublishStatusField
            status={faqForm.status}
            onChange={(status) => setFaqForm((prev) => ({ ...prev, status }))}
          />
          <FormActions onCancel={() => setFaqModal(null)} />
        </form>
      </CmsModal>

      <ConfirmDialog
        open={deleteFaqId !== null}
        title="Delete FAQ?"
        message="This FAQ will be removed from the website."
        onCancel={() => setDeleteFaqId(null)}
        onConfirm={() => {
          if (deleteFaqId) deleteFaq(deleteFaqId);
          setDeleteFaqId(null);
          showSuccess("FAQ deleted.");
        }}
      />

      </>
      ) : null}
      <ToastPortal toast={toast} onClose={clearToast} />
    </div>
  );
}

function emptyFaq(sortOrder = 0): CmsFaq {
  return {
    id: "",
    question: "",
    answer: "",
    sortOrder,
    status: "Draft",
  };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-muted/40 px-3 py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
