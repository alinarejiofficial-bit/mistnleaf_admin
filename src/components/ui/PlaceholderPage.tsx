import { PageHeader } from "@/components/ui/PageHeader";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="rounded-2xl border border-dashed border-border bg-surface/70 px-6 py-16 text-center">
        <p className="font-display text-2xl text-foreground">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Module scaffolded and ready to connect to your booking backend, PMS, or CMS APIs.
        </p>
      </div>
    </div>
  );
}
