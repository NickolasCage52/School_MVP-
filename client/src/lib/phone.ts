/** Format for display: +7 (999) 123-45-67 */
export function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("8")) {
    return "+7 (" + d.slice(1, 4) + ") " + d.slice(4, 7) + "-" + d.slice(7, 9) + "-" + d.slice(9);
  }
  if (d.length >= 10) {
    const rest = d.slice(-10);
    return "+7 (" + rest.slice(0, 3) + ") " + rest.slice(3, 6) + "-" + rest.slice(6, 8) + "-" + rest.slice(8);
  }
  return digits;
}

/** Normalize input: digits only, 11 chars max for RU */
export function normalizePhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 11 && digits.startsWith("8")) return "7" + digits.slice(1);
  if (digits.length === 10) return "7" + digits;
  return digits;
}

export function maskPhoneInput(value: string): string {
  const d = normalizePhoneInput(value);
  if (d.length === 0) return "";
  if (d.length <= 1) return "+" + (d === "7" ? "7" : "7");
  return "+7 " + (d.slice(1).replace(/(\d{3})(\d{0,3})(\d{0,2})(\d{0,2})/, "($1) $2-$3-$4").replace(/[()-]$/, "").trim());
}
