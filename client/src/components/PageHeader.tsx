import { useEffect } from "react";
import { ChevronLeft, Menu, Home } from "lucide-react";

interface PageHeaderProps {
  /** Текст или элемент слева (кнопка «Назад») */
  onBack?: () => void;
  backLabel?: string;
  /** Заголовок по центру */
  title?: string;
  /** Показать кнопку меню (гамбургер) */
  showMenu?: boolean;
  onMenuClick?: () => void;
  /** Дополнительный класс для контейнера */
  className?: string;
}

export function PageHeader({
  onBack,
  backLabel = "Назад",
  title,
  showMenu = false,
  onMenuClick,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={`safe-area-top sticky top-0 z-20 flex min-h-[48px] items-center justify-between gap-3 border-b border-tg-secondary/50 bg-tg-bg/95 px-4 py-2 backdrop-blur ${className}`}
      role="banner"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 items-center gap-1 rounded-xl px-2 py-2.5 text-tg-text transition-colors hover:bg-tg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-tg-link/50"
            aria-label={backLabel}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
            <span className="hidden text-[var(--text-body)] font-medium sm:inline">{backLabel}</span>
          </button>
        ) : (
          <span className="w-10 shrink-0" aria-hidden />
        )}
        {title && (
          <h1 className="font-heading min-w-0 truncate text-lg font-semibold text-tg-text">
            {title}
          </h1>
        )}
      </div>
      {showMenu && onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-tg-hint transition-colors hover:bg-tg-secondary hover:text-tg-text focus:outline-none focus-visible:ring-2 focus-visible:ring-tg-link/50"
          aria-label="Меню"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      )}
    </header>
  );
}

interface NavMenuSheetProps {
  open: boolean;
  onClose: () => void;
  onGoToCatalog: () => void;
}

export function NavMenuSheet({ open, onClose, onGoToCatalog }: NavMenuSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleCatalog = () => {
    onGoToCatalog();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 max-h-[50vh] rounded-t-3xl border-t border-tg-secondary/50 bg-tg-bg shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-sheet-up safe-area-bottom"
        role="dialog"
        aria-modal="true"
        aria-label="Меню"
      >
        <div className="p-4">
          <h2 className="font-heading mb-3 text-sm font-semibold uppercase tracking-wide text-tg-hint">
            Навигация
          </h2>
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handleCatalog}
              className="flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 text-left text-[var(--text-body)] font-medium text-tg-text transition-colors hover:bg-tg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-tg-link/50"
            >
              <Home className="h-5 w-5 text-brand-primary" aria-hidden />
              В каталог
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
