/**
 * Maps API/network errors to user-friendly Russian messages.
 * Ensures we never show raw "Failed to load program" or "HTTP 500" to users.
 */
export function getFriendlyErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  const lower = msg.toLowerCase();
  if (lower.includes("not found") || lower.includes("не найден") || msg === "Program not found") {
    return "Программа не найдена";
  }
  if (lower.includes("failed to load") || lower.includes("не удалось загрузить")) {
    return "Не удалось загрузить данные. Проверьте интернет и попробуйте снова.";
  }
  if (lower.includes("http 500") || lower.includes("500")) {
    return "Временная ошибка сервера. Попробуйте позже.";
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("networkerror")) {
    return "Нет подключения к интернету. Проверьте сеть и попробуйте снова.";
  }
  if (msg.trim().length > 0 && msg.length < 120) {
    return msg;
  }
  return "Что-то пошло не так. Попробуйте ещё раз.";
}
