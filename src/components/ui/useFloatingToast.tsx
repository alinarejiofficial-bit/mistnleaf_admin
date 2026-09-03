"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2 } from "lucide-react";

export function useFloatingToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clear = useCallback(() => setMessage(null), []);

  const showToast = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2800);
  }, []);

  useEffect(() => {
    if (!message) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") clear();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [message, clear]);

  const toast =
    mounted && message !== null
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-live="polite"
          >
            <button
              type="button"
              aria-label="Dismiss"
              onClick={clear}
              className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
            />
            <div
              className="relative z-10 w-full max-w-sm rounded-2xl border border-border-subtle bg-surface p-5 text-center shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f3ec] text-success">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-display text-xl text-foreground">Saved</h3>
              <p className="mt-2 text-sm text-muted">{message}</p>
              <button
                type="button"
                onClick={clear}
                className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
              >
                OK
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return { showToast, toast };
}
