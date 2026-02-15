/** Normalize to digits-only for storage; display can add +7. Max 15 digits (E.164). */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    return "7" + digits.slice(1);
  }
  if (digits.length === 10 && /^[79]/.test(digits) === false) {
    return "7" + digits;
  }
  return digits.slice(0, 15);
}

export function isPhoneValid(normalized: string): boolean {
  return normalized.length >= 10 && /^\d+$/.test(normalized) === true;
}
