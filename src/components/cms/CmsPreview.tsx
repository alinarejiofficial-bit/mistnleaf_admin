"use client";

import { X } from "lucide-react";
import { useCms } from "@/components/cms/CmsProvider";
import { stripHtml } from "@/components/cms/CmsShared";
import type { CmsContent, CmsContact, CmsFaq, CmsGalleryImage, CmsHomepage, CmsRoomContent, CmsTestimonial, CmsWebsiteOffer } from "@/lib/cms-data";

type PreviewState = {
  section: string;
  data?: unknown;
} | null;

export function CmsPreviewPanel({
  preview,
  onClose,
}: {
  preview: PreviewState;
  onClose: () => void;
}) {
  const { content } = useCms();

  if (!preview) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border-subtle bg-surface shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-brand-mid uppercase">
              Website preview
            </p>
            <h2 className="font-display text-xl text-foreground capitalize">
              {preview.section.replace("-", " ")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto">
          <div className="bg-gradient-to-br from-brand via-brand-mid to-[#2a5548] px-6 py-8 text-white">
            <p className="text-xs tracking-[0.2em] uppercase opacity-80">MistnLeaf Resort</p>
            <div className="mt-4">{renderPreview(preview, content)}</div>
          </div>
          <div className="bg-accent-soft/40 px-6 py-5 text-sm text-muted">
            Draft preview — changes appear on the public site after publishing.
          </div>
        </div>
      </div>
    </div>
  );
}

function renderPreview(
  preview: NonNullable<PreviewState>,
  content: CmsContent,
) {
  switch (preview.section) {
    case "homepage": {
      const data = preview.data as CmsHomepage;
      return (
        <div>
          <h3 className="font-display text-3xl leading-tight">{data.heroHeadline}</h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90">
            {data.heroDescription}
          </p>
        </div>
      );
    }
    case "room": {
      const data = preview.data as CmsRoomContent;
      return (
        <div>
          <h3 className="font-display text-2xl">{data.name}</h3>
          <p className="mt-2 text-sm text-white/90">{stripHtml(data.description)}</p>
          <p className="mt-3 text-xs text-white/75">
            {data.capacity} guests · {data.amenities.join(" · ")}
          </p>
        </div>
      );
    }
    case "gallery": {
      const data = preview.data as CmsGalleryImage;
      return (
        <div>
          <h3 className="font-display text-2xl">{data.title}</h3>
          <p className="mt-2 text-sm text-white/90">{data.caption}</p>
        </div>
      );
    }
    case "offer": {
      const data = preview.data as CmsWebsiteOffer;
      return (
        <div>
          <h3 className="font-display text-2xl">{data.title}</h3>
          <p className="mt-2 text-sm text-white/90">{data.description}</p>
          <p className="mt-3 text-xs font-medium tracking-wide uppercase">
            {data.code} · {data.discount}
          </p>
        </div>
      );
    }
    case "testimonial": {
      const data = preview.data as CmsTestimonial;
      return (
        <div>
          <p className="text-lg leading-relaxed italic">&ldquo;{data.content}&rdquo;</p>
          <p className="mt-4 text-sm font-medium">— {data.guestName}</p>
        </div>
      );
    }
    case "faq": {
      const data = preview.data as CmsFaq;
      return (
        <div>
          <h3 className="font-display text-xl">{data.question}</h3>
          <p className="mt-2 text-sm text-white/90">{data.answer}</p>
        </div>
      );
    }
    case "contact": {
      const data = preview.data as CmsContact;
      return (
        <div className="space-y-2 text-sm text-white/90">
          <p>{data.phone}</p>
          <p>{data.email}</p>
          <p>{data.address}</p>
        </div>
      );
    }
    default:
      return <p className="text-sm text-white/90">Preview not available.</p>;
  }
}

export type { PreviewState };
