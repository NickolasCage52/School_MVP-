import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="page-bg flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
          <span className="mb-4 text-4xl" role="img" aria-hidden>⚠️</span>
          <h1 className="font-heading text-[var(--text-h2)] font-semibold text-tg-text">Что-то пошло не так</h1>
          <p className="mt-2 max-w-sm text-[var(--text-body)] text-tg-hint">
            Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться в каталог.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-cta min-h-[48px] rounded-[var(--radius-button)] px-6 py-3 font-semibold text-white"
            >
              Обновить страницу
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = "/"; }}
              className="btn-secondary min-h-[48px] rounded-[var(--radius-button)] px-6 py-3"
            >
              В каталог
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
