interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export function EmptyState({ title, description, icon = "📋", onReset, resetLabel = "Сбросить фильтры" }: EmptyStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 text-4xl" role="img" aria-hidden>
        {icon}
      </span>
      <h2 className="font-heading text-[var(--text-h2)] font-semibold text-tg-text">{title}</h2>
      {description && <p className="mt-2 max-w-xs text-[var(--text-sm)] text-tg-hint">{description}</p>}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary mt-6 min-h-[48px] rounded-[var(--radius-button)] px-6 py-3"
        >
          {resetLabel}
        </button>
      )}
    </div>
  );
}
