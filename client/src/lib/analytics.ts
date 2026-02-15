const API = "/api";
const isProd = import.meta.env.PROD;

export type EventName =
  | "catalog_view"
  | "search_use"
  | "filter_change"
  | "program_open"
  | "package_select"
  | "lead_start"
  | "lead_step_complete"
  | "lead_submit_success"
  | "lead_submit_error";

export function trackEvent(
  name: EventName,
  payload?: Record<string, unknown>
) {
  const meta = {
    ...payload,
    timestamp: new Date().toISOString(),
  };
  console.log("[Analytics]", name, meta);
  if (typeof (window as unknown as { gtag?: (a: string, b: string, c: object) => void }).gtag === "function") {
    (window as unknown as { gtag: (a: string, b: string, c: object) => void }).gtag("event", name, meta);
  }
  if (isProd) {
    fetch(API + "/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, payload: meta }),
    }).catch(() => {});
  }
}

/** @deprecated use trackEvent */
export function track(name: EventName, payload?: Record<string, unknown>) {
  trackEvent(name, payload);
}
