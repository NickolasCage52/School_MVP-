import { useEffect } from "react";
import { X } from "lucide-react";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function FilterSheet({ open, onClose, title, children }: FilterSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-auto rounded-t-3xl bg-tg-bg shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-sheet-up safe-area-bottom"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-tg-secondary/50 bg-tg-bg px-4 py-3">
          <h2 className="font-heading text-[var(--text-h2)] font-semibold text-tg-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-tg-hint transition-colors hover:bg-tg-secondary hover:text-tg-text focus:outline-none focus-visible:ring-2 focus-visible:ring-tg-link/50"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}
