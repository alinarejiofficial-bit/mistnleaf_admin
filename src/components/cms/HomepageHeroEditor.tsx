"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useCms } from "@/components/cms/CmsProvider";
import {
  MediaUrlField,
  PreviewButton,
  PublishBadge,
  useToast,
} from "@/components/cms/CmsShared";
import { togglePublishStatus, type CmsHomepage } from "@/lib/cms-data";

type PreviewHandler = (section: string, data?: unknown) => void;

export function HomepageHeroEditor({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveHomepage } = useCms();
  const { toast, showSuccess } = useToast();
  const [homepage, setHomepage] = useState<CmsHomepage>(content.homepage);

  function save() {
    saveHomepage({ ...homepage, updatedAt: new Date().toISOString().slice(0, 10) });
    showSuccess("Hero banner saved.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/website/homepage"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to homepage sections
          </Link>
          <h2 className="font-display text-2xl text-foreground">Hero banner</h2>
          <p className="mt-1 text-sm text-muted">
            Headline, description, hero image, and call-to-action buttons.
          </p>
        </div>
        <PreviewButton onClick={() => onPreview("homepage", homepage)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Hero eyebrow</span>
          <input
            value={homepage.heroEyebrow}
            onChange={(e) => setHomepage({ ...homepage, heroEyebrow: e.target.value })}
            className="field-input h-11"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Hero headline</span>
          <input
            value={homepage.heroHeadline}
            onChange={(e) => setHomepage({ ...homepage, heroHeadline: e.target.value })}
            className="field-input h-11"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-foreground">Hero description</span>
        <textarea
          value={homepage.heroDescription}
          onChange={(e) => setHomepage({ ...homepage, heroDescription: e.target.value })}
          rows={3}
          className="field-input"
        />
      </label>

      <MediaUrlField
        label="Hero media"
        value={homepage.heroMediaUrl}
        onChange={(heroMediaUrl) => setHomepage({ ...homepage, heroMediaUrl })}
        mediaType={homepage.heroMediaType}
        onMediaTypeChange={(heroMediaType) =>
          setHomepage({ ...homepage, heroMediaType, heroMediaUrl: "" })
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Primary button</span>
          <input
            value={homepage.heroCtaPrimary}
            onChange={(e) => setHomepage({ ...homepage, heroCtaPrimary: e.target.value })}
            className="field-input h-11"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Secondary button</span>
          <input
            value={homepage.heroCtaSecondary}
            onChange={(e) => setHomepage({ ...homepage, heroCtaSecondary: e.target.value })}
            className="field-input h-11"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-4">
        <span className="text-sm font-medium text-foreground">Publish status</span>
        <PublishBadge status={homepage.status} />
        <button
          type="button"
          onClick={() =>
            setHomepage({
              ...homepage,
              status: togglePublishStatus(homepage.status),
            })
          }
          className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
        >
          {homepage.status === "Published" ? "Unpublish" : "Publish"}
        </button>
        <button
          type="button"
          onClick={save}
          className="ml-auto rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Save changes
        </button>
      </div>

      {toast ? (
        <div className="fixed right-4 bottom-4 z-[70] rounded-xl bg-brand px-4 py-3 text-sm text-white shadow-lg">
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
