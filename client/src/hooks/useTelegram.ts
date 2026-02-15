import { useEffect, useMemo, useCallback } from "react";

function applyThemeParams(params: Record<string, string | undefined>) {
  const root = document.documentElement;
  const map: [string, string][] = [
    ["bg_color", "--tg-theme-bg-color"],
    ["text_color", "--tg-theme-text-color"],
    ["hint_color", "--tg-theme-hint-color"],
    ["link_color", "--tg-theme-link-color"],
    ["button_color", "--tg-theme-button-color"],
    ["button_text_color", "--tg-theme-button-text-color"],
    ["secondary_bg_color", "--tg-theme-secondary-bg-color"],
  ];
  map.forEach(([key, cssVar]) => {
    const v = params[key as keyof typeof params];
    if (v) root.style.setProperty(cssVar, v);
  });
}

export function useTelegram() {
  const twa = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.Telegram?.WebApp ?? null;
  }, []);

  useEffect(() => {
    if (!twa) return;
    twa.ready();
    twa.expand();
    document.documentElement.setAttribute("data-theme", twa.colorScheme ?? "light");
    if (twa.themeParams && typeof twa.themeParams === "object") {
      const p = twa.themeParams as Record<string, string | undefined>;
      applyThemeParams(p);
    }
  }, [twa]);

  const theme = twa?.colorScheme ?? "light";
  const user = twa?.initDataUnsafe?.user;

  const haptic = useCallback((type: "light" | "medium" | "heavy" | "success" | "error" = "light") => {
    const t = twa ?? typeof window !== "undefined" ? window.Telegram?.WebApp : null;
    if (!t?.HapticFeedback) return;
    if (type === "success" || type === "error") {
      t.HapticFeedback.notificationOccurred?.(type);
    } else {
      t.HapticFeedback.impactOccurred?.(type);
    }
  }, [twa]);

  return {
    twa,
    theme,
    user: user
      ? {
          id: String(user.id),
          firstName: user.first_name ?? "",
          lastName: user.last_name ?? "",
          username: user.username ?? "",
        }
      : null,
    initData: twa?.initData ?? "",
    haptic,
  };
}

export function useTelegramBackButton(visible: boolean, onBack: () => void) {
  const twa = useTelegram().twa;
  useEffect(() => {
    if (!twa) return;
    if (visible) {
      twa.BackButton.show();
      twa.BackButton.onClick(onBack);
      return () => {
        twa.BackButton.offClick(onBack);
        twa.BackButton.hide();
      };
    } else {
      twa.BackButton.hide();
    }
  }, [twa, visible, onBack]);
}

export function useTelegramMainButton(
  visible: boolean,
  text: string,
  onClick: () => void,
  options?: { disabled?: boolean }
) {
  const twa = useTelegram().twa;
  useEffect(() => {
    if (!twa) return;
    if (visible) {
      twa.MainButton.setText(text);
      if (options?.disabled) twa.MainButton.disable();
      else twa.MainButton.enable();
      twa.MainButton.show();
      twa.MainButton.onClick(onClick);
      return () => {
        twa.MainButton.offClick(onClick);
        twa.MainButton.hide();
      };
    } else {
      twa.MainButton.hide();
    }
  }, [twa, visible, text, onClick, options?.disabled]);
}
