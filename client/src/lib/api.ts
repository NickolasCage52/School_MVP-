const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "/api";

async function get<T>(path: string): Promise<T> {
  const url = API_BASE + path;
  if (import.meta.env.DEV) {
    console.log("[api] GET", url);
  }
  const r = await fetch(url);
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    const message = (err as { error?: string }).error ?? `HTTP ${r.status}`;
    if (import.meta.env.DEV) {
      console.warn("[api] GET failed", url, r.status, message);
    }
    throw new Error(message);
  }
  return r.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${r.status}`);
  }
  return r.json();
}

export const api = {
  catalog: () => get<import("../types/api").CatalogResponse>("/catalog"),
  program: (id: string) => get<import("../types/api").ProgramDetail>(`/programs/${id}`),
  createLead: (payload: import("../types/api").LeadPayload) =>
    post<{ id: string; ok: boolean }>("/leads", payload),
};

function adminToken(override?: string) {
  return override ?? import.meta.env.VITE_ADMIN_TOKEN ?? "";
}

export function getAdminLeads(
  params: { programId?: string; status?: string; from?: string; to?: string; page?: number },
  tokenOverride?: string
) {
  const q = new URLSearchParams();
  if (params.programId) q.set("programId", params.programId);
  if (params.status) q.set("status", params.status);
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.page != null) q.set("page", String(params.page));
  return fetch(API_BASE + "/admin/leads?" + q.toString(), {
    headers: { Authorization: "Bearer " + adminToken(tokenOverride) },
  }).then((r) => {
    if (!r.ok) throw new Error(r.status === 401 ? "Unauthorized" : "Error");
    return r.json() as Promise<{ leads: import("../types/api").Lead[]; total: number; page: number; pageSize: number }>;
  });
}

export function getAdminPrograms(tokenOverride?: string) {
  return fetch(API_BASE + "/admin/programs", {
    headers: { Authorization: "Bearer " + adminToken(tokenOverride) },
  }).then((r) => {
    if (!r.ok) throw new Error("Unauthorized or error");
    return r.json() as Promise<{ programs: { id: string; title: string }[] }>;
  });
}

export function patchLeadStatus(id: string, status: string, tokenOverride?: string) {
  return fetch(API_BASE + "/admin/leads/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + adminToken(tokenOverride),
    },
    body: JSON.stringify({ status }),
  }).then((r) => {
    if (!r.ok) throw new Error("Update failed");
    return r.json();
  });
}

export function getExportCsvUrl(params: { programId?: string; status?: string }) {
  const q = new URLSearchParams(params as Record<string, string>);
  return API_BASE + "/admin/leads/export?" + q.toString();
}

export function fetchExportCsv(params: { programId?: string; status?: string }, tokenOverride?: string) {
  const url = getExportCsvUrl(params);
  return fetch(url, { headers: { Authorization: "Bearer " + adminToken(tokenOverride) } });
}
