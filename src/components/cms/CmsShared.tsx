"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { canEditCmsContent } from "@/lib/cms-api-auth";
import { uploadCmsMediaFile } from "@/lib/cms-api-client";
import {
  AlertTriangle,
  Bold,
  CheckCircle2,
  Eye,
  ImageIcon,
  Italic,
  List,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import type { PublishStatus } from "@/lib/cms-data";
import { togglePublishStatus } from "@/lib/cms-data";

export function PublishBadge({ status }: { status: PublishStatus }) {
  return (
    <span
      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${
        status === "Published"
          ? "bg-[#e8f3ec] text-success"
          : "bg-accent-soft text-[#8a6a2f]"
      }`}
    >
      {status === "Published" ? "Published" : "Draft"}
    </span>
  );
}

/** Publish / unpublish control for CMS edit forms and section editors. */
export function PublishStatusField({
  status,
  onChange,
}: {
  status: PublishStatus;
  onChange: (status: PublishStatus) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-muted/30 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">Visibility</p>
        <p className="text-xs text-muted">
          {status === "Published"
            ? "Live on the public website."
            : "Draft — hidden from the public site until published."}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <PublishBadge status={status} />
        <button
          type="button"
          onClick={() => onChange(togglePublishStatus(status))}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-surface-muted"
        >
          {status === "Published" ? "Unpublish" : "Publish"}
        </button>
      </div>
    </div>
  );
}

/** Compact publish / unpublish button for list rows and cards. */
export function PublishListButton({
  status,
  onToggle,
}: {
  status: PublishStatus;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-muted"
    >
      {status === "Published" ? "Unpublish" : "Publish"}
    </button>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${
        active ? "bg-[#e8f3ec] text-success" : "bg-surface-muted text-muted"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted/30 px-6 py-14 text-center">
      <p className="font-display text-xl text-foreground">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Loading content…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-surface px-6 py-16 text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function Toast({
  message,
  tone = "success",
  onClose,
}: {
  message: string;
  tone?: "success" | "error";
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(onClose, 2800);
    return () => window.clearTimeout(timer);
  }, [onClose, message]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-live="polite"
      aria-labelledby="cms-toast-title"
      aria-describedby="cms-toast-message"
    >
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
      />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border-subtle bg-surface p-5 text-center shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <span
          className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full ${
            tone === "success" ? "bg-[#e8f3ec] text-success" : "bg-[#f8e9e6] text-danger"
          }`}
        >
          {tone === "success" ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <AlertTriangle className="h-6 w-6" />
          )}
        </span>
        <h3 id="cms-toast-title" className="mt-3 font-display text-xl text-foreground">
          {tone === "success" ? "Saved" : "Something went wrong"}
        </h3>
        <p id="cms-toast-message" className="mt-2 text-sm text-muted">
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
        >
          OK
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function ToastPortal({
  toast,
  onClose,
}: {
  toast: { message: string; tone: "success" | "error" } | null;
  onClose: () => void;
}) {
  if (!toast) return null;
  return <Toast message={toast.message} tone={toast.tone} onClose={onClose} />;
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-border bg-surface pr-3 pl-10 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
      />
    </label>
  );
}

export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <label className="text-sm">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CmsModal({
  open,
  title,
  description,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
      />
      <div
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border-subtle bg-surface shadow-xl sm:rounded-2xl ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-foreground">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  confirmTone = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmTone?: "danger" | "brand";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
              confirmTone === "danger"
                ? "bg-[#f8e9e6] text-danger"
                : "bg-brand-soft text-brand"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-xl text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 ${
              confirmTone === "danger" ? "bg-danger" : "bg-brand hover:bg-brand-hover"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    // Avoid resetting the DOM while the user is typing — that jumps the caret to the start.
    if (document.activeElement === el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  function emitChange() {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  }

  function exec(command: string) {
    editorRef.current?.focus();
    document.execCommand(command, false);
    emitChange();
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex flex-wrap gap-1 border-b border-border-subtle bg-surface-muted/50 px-2 py-1.5">
          <ToolbarButton onClick={() => exec("bold")} label="Bold">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("italic")} label="Italic">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec("insertUnorderedList")} label="Bullet list">
            <List className="h-4 w-4" />
          </ToolbarButton>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          data-placeholder={placeholder}
          className="cms-editor min-h-[120px] px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none"
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-foreground"
    >
      {children}
    </button>
  );
}

export function ImageUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  const { currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;

    if (!currentUser || !canEditCmsContent(currentUser.roleId, currentUser.permissions)) {
      setUploadError("Log in as Website Content Manager to upload images.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadCmsMediaFile(file, currentUser.roleId, currentUser.id);
      onChange(url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className="rounded-xl border border-border-subtle bg-surface-muted/30 p-3">
        {value ? (
          <div className="relative mb-3 overflow-hidden rounded-xl border border-border-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-40 w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 rounded-lg bg-foreground/70 p-1.5 text-white"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mb-3 flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-surface">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-brand-mid" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted/50" />
            )}
          </div>
        )}
        <label
          className={`inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted ${
            uploading ? "pointer-events-none opacity-60" : "cursor-pointer"
          }`}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              void handleFile(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
        </label>
        {uploadError ? (
          <p className="mt-2 text-xs text-danger">{uploadError}</p>
        ) : null}
        {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
      </div>
    </div>
  );
}

export function MediaUrlField({
  label,
  value,
  onChange,
  mediaType,
  onMediaTypeChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mediaType: "image" | "video";
  onMediaTypeChange: (type: "image" | "video") => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["image", "video"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onMediaTypeChange(type)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium capitalize transition ${
              mediaType === type
                ? "bg-brand text-white"
                : "border border-border bg-surface text-foreground hover:bg-surface-muted"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      {mediaType === "image" ? (
        <ImageUploadField label={label} value={value} onChange={onChange} />
      ) : (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Video URL
          </span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://…"
            className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
          />
        </label>
      )}
    </div>
  );
}

export function PreviewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
    >
      <Eye className="h-4 w-4" />
      Preview
    </button>
  );
}

export function FormActions({
  onCancel,
  submitLabel = "Save changes",
  loading,
}: {
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </button>
    </div>
  );
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  const clearToast = useCallback(() => setToast(null), []);

  return {
    toast,
    showSuccess: (message: string) => setToast({ message, tone: "success" }),
    showError: (message: string) => setToast({ message, tone: "error" }),
    clearToast,
  };
}
