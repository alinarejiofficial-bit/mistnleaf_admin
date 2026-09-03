"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useCms } from "@/components/cms/CmsProvider";
import {
  MediaUrlField,
  PreviewButton,
  PublishStatusField,
  ToastPortal,
  useToast,
} from "@/components/cms/CmsShared";
import type { CmsHomepage } from "@/lib/cms-data";

type PreviewHandler = (section: string, data?: unknown) => void;

export function HomepageHeroEditor({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveHomepage } = useCms();
  const { toast, showSuccess, clearToast } = useToast();
  const [homepage, setHomepage] = useState<CmsHomepage>(content.homepage);

  useEffect(() => {
    setHomepage(content.homepage);
  }, [content.homepage]);

  function save() {
    saveHomepage({ ...homepage, updatedAt: new Date().toISOString().slice(0, 10) });
    showSuccess("Hero banner saved. Check http://localhost:3001 (Ctrl+F5) — status must be Published.");
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

      <PublishStatusField
        status={homepage.status}
        onChange={(status) => setHomepage({ ...homepage, status })}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Save changes
        </button>
      </div>

      <ToastPortal toast={toast} onClose={clearToast} />
    </div>
  );
}
