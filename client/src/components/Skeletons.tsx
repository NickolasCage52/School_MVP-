export function CatalogSkeleton() {
  return (
    <div className="page-bg min-h-screen space-y-4 px-4 py-4">
      <div className="h-24 rounded-t-3xl skeleton-shimmer" />
      <div className="flex gap-2 px-4">
        <div className="h-9 w-24 rounded-xl skeleton-shimmer" />
        <div className="h-9 w-11 rounded-xl skeleton-shimmer" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="overflow-hidden rounded-[var(--radius-card)] border border-tg-secondary/80 bg-tg-bg shadow-card">
          <div className="h-20 w-full rounded-t-[var(--radius-card)] skeleton-shimmer" />
          <div className="p-4">
            <div className="mb-2 h-3 w-24 rounded skeleton-shimmer" />
            <div className="mb-2 h-5 w-4/5 rounded skeleton-shimmer" />
            <div className="h-4 w-2/3 rounded skeleton-shimmer" />
            <div className="mt-3 flex gap-2">
              <div className="h-6 w-16 rounded-full skeleton-shimmer" />
              <div className="h-6 w-20 rounded-full skeleton-shimmer" />
              <div className="h-6 w-14 rounded-full skeleton-shimmer" />
            </div>
            <div className="mt-3 h-5 w-28 rounded skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgramSkeleton() {
  return (
    <div className="page-bg min-h-screen px-4 pb-32 pt-4">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-tg-secondary/80 bg-tg-bg shadow-card">
        <div className="h-28 w-full rounded-t-[var(--radius-card)] skeleton-shimmer" />
        <div className="p-4">
          <div className="h-3 w-20 rounded skeleton-shimmer" />
          <div className="mt-2 h-6 w-4/5 rounded skeleton-shimmer" />
          <div className="mt-2 h-4 w-2/3 rounded skeleton-shimmer" />
          <div className="mt-3 flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-24 rounded skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 h-4 w-full rounded skeleton-shimmer" />
      <div className="mt-8 h-5 w-40 rounded skeleton-shimmer" />
      <div className="mt-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-full rounded skeleton-shimmer" />
        ))}
      </div>
      <div className="mt-8 flex gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 flex-1 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}
