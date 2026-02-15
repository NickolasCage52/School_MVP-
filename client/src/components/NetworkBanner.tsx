import { useState, useEffect } from "react";

export function NetworkBanner() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!offline || dismissed) return null;

  const handleRetry = () => {
    setDismissed(true);
    window.location.reload();
  };

  return (
    <div className="safe-area-top sticky top-0 z-50 flex items-center justify-between gap-2 bg-amber-500/95 px-4 py-2 text-sm text-black">
      <span className="min-w-0">Проблемы с сетью. Проверьте подключение.</span>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={handleRetry}
          className="rounded px-2 py-1 font-medium underline hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
        >
          Обновить
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded px-2 py-1 hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
}
