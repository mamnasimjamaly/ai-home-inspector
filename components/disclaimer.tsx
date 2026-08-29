export function Disclaimer({ className }: { className?: string }) {
  return (
    <p
      className={
        className ??
        "rounded-sm border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground"
      }
      role="note"
    >
      AI visual assessment only. This does not replace a professional home
      inspection.
    </p>
  );
}
