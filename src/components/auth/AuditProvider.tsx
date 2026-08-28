"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loadAuditLogs,
  recordAudit,
  saveAuditLogs,
  type AuditActor,
  type AuditLogEntry,
} from "@/lib/audit-log";

type AuditContextValue = {
  entries: AuditLogEntry[];
  log: (input: {
    action: string;
    module: string;
    detail: string;
    previousValue?: string;
    newValue?: string;
  }) => void;
};

const AuditContext = createContext<AuditContextValue | null>(null);

export function AuditProvider({
  children,
  actor,
}: {
  children: React.ReactNode;
  actor: AuditActor | null;
}) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(loadAuditLogs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveAuditLogs(entries);
  }, [entries, hydrated]);

  const log = useCallback(
    (input: {
      action: string;
      module: string;
      detail: string;
      previousValue?: string;
      newValue?: string;
    }) => {
      if (!actor) return;
      setEntries((prev) => recordAudit(prev, actor, input));
    },
    [actor],
  );

  const value = useMemo(() => ({ entries, log }), [entries, log]);

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAuditLog() {
  const ctx = useContext(AuditContext);
  if (!ctx) {
    throw new Error("useAuditLog must be used within AuditProvider");
  }
  return ctx;
}

export function useAuditLogOptional() {
  return useContext(AuditContext);
}
