"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useCms } from "@/components/cms/CmsProvider";
import {
  ImageUploadField,
  PreviewButton,
  PublishStatusField,
  RichTextEditor,
  ToastPortal,
  useToast,
} from "@/components/cms/CmsShared";
import type { CmsAbout } from "@/lib/cms-data";

type PreviewHandler = (section: string, data?: unknown) => void;

export function HomepageAboutEditor({ onPreview }: { onPreview: PreviewHandler }) {
  const { content, saveAbout } = useCms();
  const { toast, showSuccess, clearToast } = useToast();
  const [about, setAbout] = useState<CmsAbout>(content.about);

  function save() {
    saveAbout({ ...about, updatedAt: new Date().toISOString().slice(0, 10) });
    showSuccess("Homepage about section saved.");
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
          <h2 className="font-display text-2xl text-foreground">About section</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            The about band on the homepage — eyebrow, headline, intro text, image, and
            &ldquo;Read our story&rdquo; link. Also used on the standalone{" "}
            <Link href="/website/about" className="text-brand-mid hover:underline">
              About page
            </Link>
            .
          </p>
        </div>
        <PreviewButton onClick={() => onPreview("about", about)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Eyebrow</span>
          <input
            value={about.eyebrow}
            onChange={(e) => setAbout({ ...about, eyebrow: e.target.value })}
            placeholder="About Mistnleaf"
            className="field-input h-11"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">Headline</span>
          <input
            value={about.title}
            onChange={(e) => setAbout({ ...about, title: e.target.value })}
            placeholder="Soft light, quiet rooms, forest air"
            className="field-input h-11"
          />
        </label>
      </div>

      <RichTextEditor
        label="Intro text"
        value={about.content}
        onChange={(content) => setAbout({ ...about, content })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">CTA link label</span>
          <input
            value={about.ctaLabel}
            onChange={(e) => setAbout({ ...about, ctaLabel: e.target.value })}
            placeholder="Read our story"
            className="field-input h-11"
          />
        </label>
      </div>

      <ImageUploadField
        label="Section image"
        value={about.imageUrl}
        onChange={(imageUrl) => setAbout({ ...about, imageUrl })}
        hint="Shown on the right side of the homepage about band. Recommended: landscape lodge or valley photo."
      />

      <PublishStatusField
        status={about.status}
        onChange={(status) => setAbout({ ...about, status })}
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
