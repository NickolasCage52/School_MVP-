/** SVG gradient blob for course/direction theme. No external assets. */
export function CourseCoverBlob({ directionSlug, className = "h-20 w-full" }: { directionSlug?: string; className?: string }) {
  const gradients: Record<string, [string, string]> = {
    marketing: ["#0d9488", "#f59e0b"],
    design: ["#ec4899", "#14b8a6"],
    programming: ["#6366f1", "#14b8a6"],
    analytics: ["#14b8a6", "#0d9488"],
  };
  const pair = (gradients[directionSlug ?? ""] ?? gradients.marketing) as [string, string];
  const [c1, c2] = pair;

  return (
    <svg
      className={className}
      viewBox="0 0 320 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={`blob-${directionSlug ?? "def"}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.35" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="50" rx="140" ry="45" fill={`url(#blob-${directionSlug ?? "def"})`} />
      <ellipse cx="200" cy="35" rx="80" ry="25" fill={c1} fillOpacity="0.12" />
    </svg>
  );
}
