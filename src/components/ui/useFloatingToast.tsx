"use client";

import { useCallback, useState } from "react";

export function useFloatingToast() {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3000);
  }, []);

  const toast =
    message !== null ? (
      <div className="fixed right-4 bottom-4 z-[80] rounded-xl bg-brand px-4 py-3 text-sm text-white shadow-lg">
        {message}
      </div>
    ) : null;

  return { showToast, toast };
}
