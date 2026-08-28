export function LegalPage({
  title,
  updatedNote,
  children,
}: {
  title: string;
  updatedNote?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">{title}</h1>
      <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
        <strong>Placeholder content.</strong> This page uses generic template text and has not been
        reviewed by legal counsel. Replace it with policy text specific to this business before
        launch.
      </div>
      {updatedNote && <p className="mt-4 text-xs text-muted">{updatedNote}</p>}
      <div className="mt-8 max-w-none space-y-6 text-sm text-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-2 [&_p]:text-muted [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted">
        {children}
      </div>
    </div>
  );
}
