export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-7 w-44 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-muted/70" />
      </div>

      <div className="rounded-2xl border bg-card/95 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`skeleton-stat-${index}`}
              className="space-y-2 rounded-xl border bg-background/70 p-4"
            >
              <div className="h-3 w-20 animate-pulse rounded bg-muted/70" />
              <div className="h-7 w-28 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3 rounded-xl border border-dashed p-4">
          <div className="h-4 w-40 animate-pulse rounded bg-muted/70" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-input-${index}`}
                className="h-9 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
          <div className="flex justify-end">
            <div className="h-9 w-36 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
