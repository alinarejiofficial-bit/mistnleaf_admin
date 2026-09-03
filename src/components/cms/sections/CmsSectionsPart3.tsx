"use client";

import { useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { createId, useCms } from "@/components/cms/CmsProvider";
import {
  ConfirmDialog,
  CmsModal,
  FormActions,
  ImageUploadField,
  PreviewButton,
  PublishBadge,
  PublishListButton,
  PublishStatusField,
  RichTextEditor,
  ToastPortal,
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
  const { toast, showSuccess, clearToast } = useToast();
  const [draft, setDraft] = useState<CmsAbout | null>(null);
  const about = draft ?? content.about;

  function update(patch: Partial<CmsAbout>) {
    setDraft({ ...about, ...patch });
  }

  function updatePillar(index: number, patch: Partial<CmsAbout["pillars"][number]>) {
    const pillars = about.pillars.map((pillar, i) =>
      i === index ? { ...pillar, ...patch } : pillar,
    );
    update({ pillars });
  }

  function updateMosaic(index: number, patch: Partial<CmsAbout["mosaic"][number]>) {
    const mosaic = about.mosaic.map((item, i) => (i === index ? { ...item, ...patch } : item));
    update({ mosaic });
  }

  return (
    <SectionShell
      title="About page"
      description="Edit every block on the public /about page — the same section structure as the live website. Homepage about band still uses the shared title, intro, image, and CTA."
      onPreview={() => onPreview("about", about)}
      editing={!!draft}
      onEdit={() => setDraft({ ...content.about })}
      onDiscard={() => setDraft(null)}
      onSave={() => {
        saveAbout({ ...about, updatedAt: new Date().toISOString().slice(0, 10) });
        setDraft(null);
        showSuccess("About page saved. Changes appear on the public website.");
      }}
    >
      {draft ? (
        <div className="space-y-8">
          <AboutBlock title="Page hero" hint="Top of /about — eyebrow, title, lead, and hero image.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Page eyebrow"
                value={about.pageEyebrow}
                onChange={(pageEyebrow) => update({ pageEyebrow })}
              />
              <TextInput
                label="Title"
                value={about.title}
                onChange={(title) => update({ title })}
              />
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Lead</span>
              <textarea
                value={about.lead}
                onChange={(e) => update({ lead: e.target.value })}
                rows={3}
                className="field-input"
              />
            </label>
            <ImageUploadField
              label="Hero image"
              value={about.imageUrl}
              onChange={(imageUrl) => update({ imageUrl })}
              hint="Also used on the homepage about band."
            />
          </AboutBlock>

          <AboutBlock title="Story" hint="Beginnings section with story copy and side image.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Story eyebrow"
                value={about.storyEyebrow}
                onChange={(storyEyebrow) => update({ storyEyebrow })}
              />
              <TextInput
                label="Story title"
                value={about.storyTitle}
                onChange={(storyTitle) => update({ storyTitle })}
              />
            </div>
            <RichTextEditor
              label="Story content"
              value={about.storyHtml || about.content}
              onChange={(storyHtml) => update({ storyHtml })}
            />
            <ImageUploadField
              label="Story image"
              value={about.storyImageUrl}
              onChange={(storyImageUrl) => update({ storyImageUrl })}
            />
          </AboutBlock>

          <AboutBlock title="Pillars" hint="Three hosting pillars shown in a row.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Section eyebrow"
                value={about.pillarsEyebrow}
                onChange={(pillarsEyebrow) => update({ pillarsEyebrow })}
              />
              <TextInput
                label="Section title"
                value={about.pillarsTitle}
                onChange={(pillarsTitle) => update({ pillarsTitle })}
              />
            </div>
            <div className="space-y-4">
              {about.pillars.map((pillar, index) => (
                <div
                  key={pillar.id}
                  className="space-y-3 rounded-xl border border-border-subtle bg-surface-muted/20 p-4"
                >
                  <p className="text-xs font-medium tracking-wide text-muted uppercase">
                    Pillar {String(index + 1).padStart(2, "0")}
                  </p>
                  <TextInput
                    label="Title"
                    value={pillar.title}
                    onChange={(title) => updatePillar(index, { title })}
                  />
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium">Copy</span>
                    <textarea
                      value={pillar.copy}
                      onChange={(e) => updatePillar(index, { copy: e.target.value })}
                      rows={2}
                      className="field-input"
                    />
                  </label>
                </div>
              ))}
            </div>
          </AboutBlock>

          <AboutBlock title="Atmosphere" hint="Mosaic of three images with captions.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Section eyebrow"
                value={about.atmosphereEyebrow}
                onChange={(atmosphereEyebrow) => update({ atmosphereEyebrow })}
              />
              <TextInput
                label="Section title"
                value={about.atmosphereTitle}
                onChange={(atmosphereTitle) => update({ atmosphereTitle })}
              />
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Lead</span>
              <textarea
                value={about.atmosphereLead}
                onChange={(e) => update({ atmosphereLead: e.target.value })}
                rows={2}
                className="field-input"
              />
            </label>
            <div className="space-y-4">
              {about.mosaic.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-3 rounded-xl border border-border-subtle bg-surface-muted/20 p-4"
                >
                  <p className="text-xs font-medium tracking-wide text-muted uppercase">
                    Mosaic {String(index + 1).padStart(2, "0")}
                  </p>
                  <TextInput
                    label="Caption"
                    value={item.caption}
                    onChange={(caption) => updateMosaic(index, { caption })}
                  />
                  <ImageUploadField
                    label="Image"
                    value={item.imageUrl}
                    onChange={(imageUrl) => updateMosaic(index, { imageUrl })}
                  />
                </div>
              ))}
            </div>
          </AboutBlock>

          <AboutBlock title="Find us" hint="Place panel near the bottom of the About page.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Section eyebrow"
                value={about.placeEyebrow}
                onChange={(placeEyebrow) => update({ placeEyebrow })}
              />
              <TextInput
                label="Section title"
                value={about.placeTitle}
                onChange={(placeTitle) => update({ placeTitle })}
              />
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Address / lead</span>
              <textarea
                value={about.placeLead}
                onChange={(e) => update({ placeLead: e.target.value })}
                rows={3}
                className="field-input"
                placeholder="Leave blank to use Contact address from the Contact page."
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Hours / meta"
                value={about.placeMeta}
                onChange={(placeMeta) => update({ placeMeta })}
              />
              <TextInput
                label="Primary CTA"
                value={about.placeCtaLabel}
                onChange={(placeCtaLabel) => update({ placeCtaLabel })}
              />
              <TextInput
                label="Directions label"
                value={about.placeDirectionsLabel}
                onChange={(placeDirectionsLabel) => update({ placeDirectionsLabel })}
              />
              <TextInput
                label="Homepage CTA label"
                value={about.ctaLabel}
                onChange={(ctaLabel) => update({ ctaLabel })}
              />
            </div>
            <ImageUploadField
              label="Place image"
              value={about.placeImageUrl}
              onChange={(placeImageUrl) => update({ placeImageUrl })}
            />
          </AboutBlock>

          <AboutBlock title="Homepage about band" hint="Shared fields used on the homepage about section.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Homepage eyebrow"
                value={about.eyebrow}
                onChange={(eyebrow) => update({ eyebrow })}
              />
              <TextInput
                label="Homepage CTA"
                value={about.ctaLabel}
                onChange={(ctaLabel) => update({ ctaLabel })}
              />
            </div>
            <RichTextEditor
              label="Homepage intro"
              value={about.content}
              onChange={(content) => update({ content })}
            />
          </AboutBlock>

          <PublishStatusField
            status={about.status}
            onChange={(status) => update({ status })}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <PublishBadge status={about.status} />
            <span className="text-xs text-muted">
              {about.status === "Published" ? "Live on /about" : "Hidden from the public site"}
            </span>
          </div>

          <div className="space-y-2 rounded-2xl border border-border-subtle bg-surface-muted/20 p-4">
            <p className="text-xs tracking-wide text-muted uppercase">{about.pageEyebrow}</p>
            <p className="font-display text-2xl text-foreground">{about.title}</p>
            <p className="text-sm text-muted">{about.lead}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs tracking-wide text-muted uppercase">{about.storyEyebrow}</p>
            <p className="text-sm font-medium text-foreground">{about.storyTitle}</p>
            <div
              className="prose prose-sm max-w-none text-muted"
              dangerouslySetInnerHTML={{ __html: about.storyHtml || about.content }}
            />
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">{about.pillarsEyebrow}</p>
              <p className="mt-1 text-sm font-medium">{about.pillarsTitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(about.pillars ?? []).map((pillar, index) => (
                <div key={pillar.id} className="rounded-xl border border-border-subtle p-3">
                  <p className="text-[11px] text-muted">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-1 text-sm font-medium">{pillar.title}</p>
                  <p className="mt-1 text-xs text-muted">{pillar.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-border-subtle p-4">
            <p className="text-xs tracking-wide text-muted uppercase">{about.atmosphereEyebrow}</p>
            <p className="text-sm font-medium">{about.atmosphereTitle}</p>
            <p className="text-xs text-muted">{about.atmosphereLead}</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {(about.mosaic ?? []).map((item) => (
                <li key={item.id}>• {item.caption || "Untitled mosaic image"}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1 rounded-2xl border border-border-subtle p-4">
            <p className="text-xs tracking-wide text-muted uppercase">{about.placeEyebrow}</p>
            <p className="text-sm font-medium">{about.placeTitle}</p>
            <p className="whitespace-pre-line text-xs text-muted">
              {about.placeLead || "Uses Contact address when blank."}
            </p>
            <p className="text-xs text-muted">{about.placeMeta}</p>
          </div>
        </div>
      )}
      <ToastPortal toast={toast} onClose={clearToast} />
    </SectionShell>
  );
}

function AboutBlock({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface-muted/10 p-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted">{hint}</p>
      </div>
      {children}
    </div>
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
          onTogglePublish={() =>
            saveAmenity({ ...item, status: togglePublishStatus(item.status) })
          }
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
          <PublishStatusField
            status={form.status}
            onChange={(status) => setForm((p) => ({ ...p, status }))}
          />
          <FormActions onCancel={() => setModal(null)} />
        </form>
      </CmsModal>
      <ConfirmDialog open={deleteId !== null} title="Delete amenity?" message="Remove this amenity from the website." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteAmenity(deleteId); setDeleteId(null); showSuccess("Amenity deleted."); }} />
    </ListSectionShell>
  );
}

export function ExperiencesSection({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveExperience, deleteExperience, reorderExperiences } = useCms();
  const { toast, showSuccess, clearToast } = useToast();
  const [modal, setModal] = useState<CmsExperience | "new" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CmsExperience>(emptyExperience());

  const items = [...content.experiences].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <ListSectionShell
      title="Experiences"
      description="Optional rituals and activities for guests. Published items appear on the public site and homepage."
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
          onTogglePublish={() =>
            saveExperience({ ...item, status: togglePublishStatus(item.status) })
          }
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
          <PublishStatusField
            status={form.status}
            onChange={(status) => setForm((p) => ({ ...p, status }))}
          />
          <FormActions onCancel={() => setModal(null)} />
        </form>
      </CmsModal>
      <ConfirmDialog open={deleteId !== null} title="Delete experience?" message="Remove this experience from the website." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteExperience(deleteId); setDeleteId(null); showSuccess("Experience deleted."); }} />
      <ToastPortal toast={toast} onClose={clearToast} />
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
          <PublishStatusField
            status={location.status}
            onChange={(status) => setDraft({ ...location, status })}
          />
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
          <PublishStatusField
            status={social.status}
            onChange={(status) => setDraft({ ...social, status })}
          />
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

          <PublishStatusField
            status={footer.status}
            onChange={(status) => setDraft({ ...footer, status })}
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
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-border p-0.5">
            <button
              type="button"
              onClick={() => {
                if (editing) onDiscard();
                else onPreview();
              }}
              className={`inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-medium ${
                !editing
                  ? "bg-brand text-white"
                  : "text-foreground hover:bg-surface-muted"
              }`}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={onEdit}
              className={`inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-medium ${
                editing
                  ? "bg-brand text-white"
                  : "text-foreground hover:bg-surface-muted"
              }`}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </div>
          {editing ? (
            <>
              <button
                type="button"
                onClick={onDiscard}
                className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
              >
                Save & publish
              </button>
            </>
          ) : null}
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
  onTogglePublish,
  onMoveUp,
}: {
  title: string;
  detail: string;
  status: PublishStatus;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
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
        <PublishListButton status={status} onToggle={onTogglePublish} />
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

function emptyAmenity(sortOrder = 0): CmsAmenity {
  return { id: "", title: "", description: "", imageUrl: "", sortOrder, status: "Draft" };
}

function emptyExperience(sortOrder = 0): CmsExperience {
  return {
    id: "",
    title: "",
    description: "",
    duration: "",
    imageUrl: "",
    sortOrder,
    status: "Published",
  };
}
