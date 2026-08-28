export function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "brand" | "info" | "warning" | "danger";
}) {
  const tones = {
    default: "border-border-subtle bg-surface",
    success: "border-success/20 bg-[#e8f3ec]/70",
    brand: "border-brand/20 bg-brand-soft/70",
    info: "border-info/20 bg-[#e7f0f5]/80",
    warning: "border-accent/30 bg-accent-soft/70",
    danger: "border-danger/20 bg-[#f8e9e6]/80",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${tones[tone]}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 truncate font-display text-xl text-foreground sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div>
          <h2 className="font-display text-xl text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center text-sm text-muted">
        {label}
      </td>
    </tr>
  );
}
