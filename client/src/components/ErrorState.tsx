interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ message, onRetry, retryLabel = "Повторить" }: ErrorStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 text-4xl" role="img" aria-hidden>
        ⚠️
      </span>
      <p className="text-[var(--text-body)] text-tg-text">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-cta mt-6 min-h-[48px] rounded-[var(--radius-button)] px-6 py-3 font-semibold"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
