"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createId, useCms } from "@/components/cms/CmsProvider";
import {
  ConfirmDialog,
  CmsModal,
  FormActions,
  ImageUploadField,
  PreviewButton,
  PublishBadge,
  RichTextEditor,
  useToast,
} from "@/components/cms/CmsShared";
import {
  togglePublishStatus,
  type CmsAbout,
  type CmsAmenity,
  type CmsExperience,
  type CmsFooter,
  type CmsFooterLink,
  type CmsLocation,
  type CmsSocialLinks,
  type PublishStatus,
} from "@/lib/cms-data";

type PreviewHandler = (section: string, data?: unknown) => void;

export function AboutSection({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveAbout } = useCms();
  const { showSuccess } = useToast();
  const [draft, setDraft] = useState<CmsAbout | null>(null);
  const about = draft ?? content.about;

  return (
    <SectionShell
      title="About page"
      description="Standalone About page — not part of the homepage scroll. Visitors open it from the main navigation."
      onPreview={() => onPreview("about", about)}
      editing={!!draft}
      onEdit={() => setDraft({ ...content.about })}
      onDiscard={() => setDraft(null)}
      onSave={() => {
        saveAbout(about);
        setDraft(null);
        showSuccess("About section saved and published.");
      }}
    >
      {draft ? (
        <div className="space-y-4">
          <TextInput label="Eyebrow" value={about.eyebrow} onChange={(v) => setDraft({ ...about, eyebrow: v })} />
          <TextInput label="Title" value={about.title} onChange={(v) => setDraft({ ...about, title: v })} />
          <RichTextEditor label="Content" value={about.content} onChange={(content) => setDraft({ ...about, content })} />
          <ImageUploadField label="Image" value={about.imageUrl} onChange={(imageUrl) => setDraft({ ...about, imageUrl })} />
          <TextInput label="CTA label" value={about.ctaLabel} onChange={(v) => setDraft({ ...about, ctaLabel: v })} />
          <PublishToggle status={about.status} onToggle={() => setDraft({ ...about, status: togglePublishStatus(about.status) })} />
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-xs tracking-wide text-muted uppercase">{about.eyebrow}</p>
          <p className="font-display text-xl">{about.title}</p>
          <PublishBadge status={about.status} />
        </div>
      )}
    </SectionShell>
  );
}

export function AmenitiesSection({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveAmenity, deleteAmenity, reorderAmenities } = useCms();
  const { showSuccess } = useToast();
  const [modal, setModal] = useState<CmsAmenity | "new" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CmsAmenity>(emptyAmenity());

  const items = [...content.amenities].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <ListSectionShell
      title="Amenities"
      description="Comforts and shared spaces on the public website."
      onPreview={() => onPreview("amenities", items)}
      onAdd={() => {
        setForm(emptyAmenity(items.length));
        setModal("new");
      }}
    >
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.title}
          detail={item.description}
          status={item.status}
          onEdit={() => {
            setForm({ ...item });
            setModal(item);
          }}
          onDelete={() => setDeleteId(item.id)}
          onMoveUp={
            index > 0
              ? () => {
                  const next = [...items];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  reorderAmenities(next.map((row, i) => ({ ...row, sortOrder: i })));
                }
              : undefined
          }
        />
      ))}
      <CmsModal open={modal !== null} title={modal === "new" ? "Add amenity" : "Edit amenity"} onClose={() => setModal(null)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveAmenity({ ...form, id: modal === "new" ? createId("amen") : form.id });
            setModal(null);
            showSuccess("Amenity saved.");
          }}
        >
          <TextInput label="Title" value={form.title} onChange={(title) => setForm((p) => ({ ...p, title }))} />
          <TextInput label="Description" value={form.description} onChange={(description) => setForm((p) => ({ ...p, description }))} />
          <ImageUploadField label="Image" value={form.imageUrl} onChange={(imageUrl) => setForm((p) => ({ ...p, imageUrl }))} />
          <FormActions onCancel={() => setModal(null)} />
        </form>
      </CmsModal>
      <ConfirmDialog open={deleteId !== null} title="Delete amenity?" message="Remove this amenity from the website." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteAmenity(deleteId); setDeleteId(null); showSuccess("Amenity deleted."); }} />
    </ListSectionShell>
  );
}

export function ExperiencesSection({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveExperience, deleteExperience, reorderExperiences } = useCms();
  const { showSuccess } = useToast();
  const [modal, setModal] = useState<CmsExperience | "new" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CmsExperience>(emptyExperience());

  const items = [...content.experiences].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <ListSectionShell
      title="Experiences"
      description="Optional rituals and activities for guests."
      onPreview={() => onPreview("experiences", items)}
      onAdd={() => {
        setForm(emptyExperience(items.length));
        setModal("new");
      }}
    >
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.title}
          detail={`${item.duration} · ${item.description}`}
          status={item.status}
          onEdit={() => {
            setForm({ ...item });
            setModal(item);
          }}
          onDelete={() => setDeleteId(item.id)}
          onMoveUp={
            index > 0
              ? () => {
                  const next = [...items];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  reorderExperiences(next.map((row, i) => ({ ...row, sortOrder: i })));
                }
              : undefined
          }
        />
      ))}
      <CmsModal open={modal !== null} title={modal === "new" ? "Add experience" : "Edit experience"} onClose={() => setModal(null)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveExperience({ ...form, id: modal === "new" ? createId("exp") : form.id });
            setModal(null);
            showSuccess("Experience saved.");
          }}
        >
          <TextInput label="Title" value={form.title} onChange={(title) => setForm((p) => ({ ...p, title }))} />
          <TextInput label="Duration" value={form.duration} onChange={(duration) => setForm((p) => ({ ...p, duration }))} />
          <TextInput label="Description" value={form.description} onChange={(description) => setForm((p) => ({ ...p, description }))} />
          <ImageUploadField label="Image" value={form.imageUrl} onChange={(imageUrl) => setForm((p) => ({ ...p, imageUrl }))} />
          <FormActions onCancel={() => setModal(null)} />
        </form>
      </CmsModal>
      <ConfirmDialog open={deleteId !== null} title="Delete experience?" message="Remove this experience from the website." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteExperience(deleteId); setDeleteId(null); showSuccess("Experience deleted."); }} />
    </ListSectionShell>
  );
}

export function LocationSection({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveLocation } = useCms();
  const { showSuccess } = useToast();
  const [draft, setDraft] = useState<CmsLocation | null>(null);
  const location = draft ?? content.location;

  return (
    <SectionShell
      title="Location"
      description="Address, directions, and map details."
      onPreview={() => onPreview("location", location)}
      editing={!!draft}
      onEdit={() => setDraft({ ...content.location })}
      onDiscard={() => setDraft(null)}
      onSave={() => {
        saveLocation(location);
        setDraft(null);
        showSuccess("Location saved.");
      }}
    >
      {draft ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Title" value={location.title} onChange={(v) => setDraft({ ...location, title: v })} />
          <TextInput label="Airport note" value={location.airportNote} onChange={(v) => setDraft({ ...location, airportNote: v })} />
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium">Description</span>
            <textarea value={location.description} onChange={(e) => setDraft({ ...location, description: e.target.value })} rows={3} className="field-input" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium">Address</span>
            <textarea value={location.address} onChange={(e) => setDraft({ ...location, address: e.target.value })} rows={2} className="field-input" />
          </label>
          <TextInput label="Directions URL" value={location.directionsUrl} onChange={(v) => setDraft({ ...location, directionsUrl: v })} />
          <TextInput label="Map embed URL" value={location.mapEmbedUrl} onChange={(v) => setDraft({ ...location, mapEmbedUrl: v })} />
          <PublishToggle status={location.status} onToggle={() => setDraft({ ...location, status: togglePublishStatus(location.status) })} />
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="font-medium">{location.title}</p>
          <p className="text-muted whitespace-pre-line">{location.address}</p>
          <p className="text-muted">{location.airportNote}</p>
          <PublishBadge status={location.status} />
        </div>
      )}
    </SectionShell>
  );
}

export function SocialSection({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveSocial } = useCms();
  const { showSuccess } = useToast();
  const [draft, setDraft] = useState<CmsSocialLinks | null>(null);
  const social = draft ?? content.social;

  return (
    <SectionShell
      title="Social media"
      description="Links shown in the website footer and contact areas."
      onPreview={() => onPreview("social", social)}
      editing={!!draft}
      onEdit={() => setDraft({ ...content.social })}
      onDiscard={() => setDraft(null)}
      onSave={() => {
        saveSocial(social);
        setDraft(null);
        showSuccess("Social links saved.");
      }}
    >
      {draft ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {(["instagram", "facebook", "twitter", "youtube", "linkedin"] as const).map((key) => (
            <TextInput key={key} label={key} value={social[key]} onChange={(v) => setDraft({ ...social, [key]: v })} />
          ))}
          <PublishToggle status={social.status} onToggle={() => setDraft({ ...social, status: togglePublishStatus(social.status) })} />
        </div>
      ) : (
        <div className="space-y-1 text-sm text-muted">
          {social.instagram ? <p>Instagram: {social.instagram}</p> : null}
          {social.facebook ? <p>Facebook: {social.facebook}</p> : null}
          <PublishBadge status={social.status} />
        </div>
      )}
    </SectionShell>
  );
}

export function FooterSection({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveFooter } = useCms();
  const { showSuccess } = useToast();
  const [draft, setDraft] = useState<CmsFooter | null>(null);
  const footer = draft ?? content.footer;

  return (
    <SectionShell
      title="Footer"
      description="Brand text, navigation links, policies, and copyright shown at the bottom of every page."
      onPreview={() => onPreview("footer", footer)}
      editing={!!draft}
      onEdit={() => setDraft({ ...content.footer })}
      onDiscard={() => setDraft(null)}
      onSave={() => {
        saveFooter(footer);
        setDraft(null);
        showSuccess("Footer saved.");
      }}
    >
      {draft ? (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Brand column</h3>
            <TextInput
              label="Brand eyebrow"
              value={footer.brandEyebrow}
              onChange={(brandEyebrow) => setDraft({ ...footer, brandEyebrow })}
            />
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Brand description</span>
              <textarea
                value={footer.brandDescription}
                onChange={(event) =>
                  setDraft({ ...footer, brandDescription: event.target.value })
                }
                rows={3}
                className="field-input min-h-[88px] resize-y py-2.5"
              />
            </label>
            <TextInput
              label="Copyright"
              value={footer.copyright}
              onChange={(copyright) => setDraft({ ...footer, copyright })}
            />
          </div>

          <FooterLinkGroupEditor
            title="Explore links"
            links={footer.exploreLinks}
            onChange={(exploreLinks) => setDraft({ ...footer, exploreLinks })}
          />
          <FooterLinkGroupEditor
            title="Plan links"
            links={footer.planLinks}
            onChange={(planLinks) => setDraft({ ...footer, planLinks })}
          />
          <FooterLinkGroupEditor
            title="Policy links"
            links={footer.policyLinks}
            onChange={(policyLinks) => setDraft({ ...footer, policyLinks })}
          />

          <div className="space-y-4 rounded-xl border border-border-subtle bg-surface-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground">Staff login</h3>
            <p className="text-xs text-muted">
              Shown at the bottom of the Policies column on the public site.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Staff login label"
                value={footer.staffLoginLabel}
                onChange={(staffLoginLabel) => setDraft({ ...footer, staffLoginLabel })}
              />
              <TextInput
                label="Staff login URL"
                value={footer.staffLoginHref}
                onChange={(staffLoginHref) => setDraft({ ...footer, staffLoginHref })}
              />
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border-subtle bg-surface-muted/20 p-4 text-sm">
            <h3 className="font-medium text-foreground">Contact column</h3>
            <p className="mt-1 text-xs text-muted">
              Address, email, and phone in the footer come from the Contact section.
            </p>
            <div className="mt-3 space-y-1 text-xs text-muted">
              <p>{content.contact.address}</p>
              <p>{content.contact.email}</p>
              <p>{content.contact.phone}</p>
            </div>
          </div>

          <PublishToggle
            status={footer.status}
            onToggle={() => setDraft({ ...footer, status: togglePublishStatus(footer.status) })}
          />
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-[11px] tracking-wide text-muted uppercase">{footer.brandEyebrow}</p>
            <p className="mt-2 leading-relaxed text-foreground">{footer.brandDescription}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FooterLinkSummary title="Explore" links={footer.exploreLinks} />
            <FooterLinkSummary title="Plan" links={footer.planLinks} />
            <FooterLinkSummary title="Policies" links={footer.policyLinks} />
          </div>
          <p className="text-muted">{footer.copyright}</p>
          <PublishBadge status={footer.status} />
        </div>
      )}
    </SectionShell>
  );
}

function FooterLinkGroupEditor({
  title,
  links,
  onChange,
}: {
  title: string;
  links: CmsFooterLink[];
  onChange: (links: CmsFooterLink[]) => void;
}) {
  function updateLink(index: number, patch: Partial<CmsFooterLink>) {
    onChange(links.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={() => onChange([...links, { label: "", href: "" }])}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-surface-muted"
        >
          <Plus className="h-3.5 w-3.5" />
          Add link
        </button>
      </div>
      <div className="space-y-2">
        {links.map((link, index) => (
          <div
            key={`${title}-${index}`}
            className="grid gap-2 rounded-xl border border-border-subtle bg-surface-muted/20 p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input
              value={link.label}
              onChange={(event) => updateLink(index, { label: event.target.value })}
              placeholder="Label"
              className="field-input h-10"
            />
            <input
              value={link.href}
              onChange={(event) => updateLink(index, { href: event.target.value })}
              placeholder="URL or #section"
              className="field-input h-10"
            />
            <button
              type="button"
              onClick={() => onChange(links.filter((_, i) => i !== index))}
              className="rounded-lg border border-border p-2 hover:bg-surface-muted sm:self-center"
              aria-label="Remove link"
            >
              <Trash2 className="h-4 w-4 text-danger" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FooterLinkSummary({ title, links }: { title: string; links: CmsFooterLink[] }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{title}</p>
      <ul className="mt-2 space-y-1 text-muted">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>{link.label}</li>
        ))}
      </ul>
    </div>
  );
}

function SectionShell({
  title,
  description,
  onPreview,
  editing,
  onEdit,
  onDiscard,
  onSave,
  children,
}: {
  title: string;
  description: string;
  onPreview: () => void;
  editing: boolean;
  onEdit: () => void;
  onDiscard: () => void;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PreviewButton onClick={onPreview} />
          {editing ? (
            <>
              <button type="button" onClick={onDiscard} className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted">Discard</button>
              <button type="button" onClick={onSave} className="rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover">Save & publish</button>
            </>
          ) : (
            <button type="button" onClick={onEdit} className="rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover">Edit</button>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">{children}</div>
    </div>
  );
}

function ListSectionShell({
  title,
  description,
  onPreview,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  onPreview: () => void;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <div className="flex gap-2">
          <PreviewButton onClick={onPreview} />
          <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ItemCard({
  title,
  detail,
  status,
  onEdit,
  onDelete,
  onMoveUp,
}: {
  title: string;
  detail: string;
  status: PublishStatus;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted">{detail}</p>
        </div>
        <PublishBadge status={status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button type="button" onClick={onEdit} className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted">Edit</button>
        {onMoveUp ? (
          <button type="button" onClick={onMoveUp} className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted">Move up</button>
        ) : null}
        <button type="button" onClick={onDelete} className="rounded-lg border border-border p-1 hover:bg-surface-muted">
          <Trash2 className="h-4 w-4 text-danger" />
        </button>
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium capitalize">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="field-input h-11" />
    </label>
  );
}

function PublishToggle({ status, onToggle }: { status: PublishStatus; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted sm:col-span-2 sm:w-fit">
      {status === "Published" ? "Unpublish" : "Publish"}
    </button>
  );
}

function emptyAmenity(sortOrder = 0): CmsAmenity {
  return { id: "", title: "", description: "", imageUrl: "", sortOrder, status: "Draft" };
}

function emptyExperience(sortOrder = 0): CmsExperience {
  return { id: "", title: "", description: "", duration: "", imageUrl: "", sortOrder, status: "Draft" };
}
