import { useEffect, useState } from "react";
import { Download, Copy, ExternalLink, X } from "lucide-react";
import {
  getAdminLeads,
  getAdminPrograms,
  patchLeadStatus,
  fetchExportCsv,
} from "../lib/api";
import type { Lead } from "../types/api";

const token = import.meta.env.VITE_ADMIN_TOKEN ?? "";
const PAGE_SIZE = 50;

const STATUS_STYLES: Record<string, string> = {
  New: "bg-brand-primary/15 text-brand-primary border-brand-primary/30",
  "In work": "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
  Done: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  Invalid: "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400",
};

function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-tg-secondary text-tg-hint border-tg-secondary/50";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

export function Admin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [programs, setPrograms] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [filterProgram, setFilterProgram] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [enteredToken, setEnteredToken] = useState("");

  const effectiveToken = token || enteredToken;

  const load = () => {
    if (!effectiveToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    Promise.all([
      getAdminLeads(
        {
          programId: filterProgram || undefined,
          status: filterStatus || undefined,
          from: filterFrom || undefined,
          to: filterTo || undefined,
          page,
        },
        effectiveToken
      ),
      getAdminPrograms(effectiveToken),
    ])
      .then(([leadsRes, programsRes]) => {
        setLeads(leadsRes.leads);
        setTotal(leadsRes.total);
        setPrograms(programsRes.programs);
      })
      .catch((e) => {
        setError(e.message);
        setUnauthorized(e.message === "Unauthorized");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveToken, filterProgram, filterStatus, filterFrom, filterTo, page]);

  const handleStatusChange = (leadId: string, newStatus: string) => {
    if (!effectiveToken) return;
    patchLeadStatus(leadId, newStatus, effectiveToken)
      .then(() => {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
        if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status: newStatus });
      })
      .catch(() => setError("Не удалось обновить статус"));
  };

  const handleExportCsv = () => {
    if (!effectiveToken) return;
    fetchExportCsv(
      { programId: filterProgram || undefined, status: filterStatus || undefined },
      effectiveToken
    )
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "leads.csv";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => setError("Ошибка экспорта"));
  };

  if (!effectiveToken) {
    return (
      <div className="page-bg min-h-screen p-4 safe-area-top">
        <h1 className="text-xl font-bold text-tg-text">Админ-панель</h1>
        <p className="mt-2 text-sm text-tg-hint">Введите токен доступа (из .env ADMIN_TOKEN)</p>
        <input
          type="password"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="ADMIN_TOKEN"
          className="mt-2 w-full max-w-md rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-4 py-3 text-tg-text focus:border-tg-link focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setEnteredToken(tokenInput)}
          className="btn-cta mt-4 min-h-[48px] rounded-2xl px-6 py-3 font-semibold text-white"
        >
          Войти
        </button>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="page-bg flex min-h-screen flex-col items-center justify-center p-6 text-center safe-area-top">
        <p className="text-lg font-medium text-tg-text">Нет доступа</p>
        <p className="mt-2 text-sm text-tg-hint">Токен неверный или истёк. Проверьте ADMIN_TOKEN.</p>
        <button
          type="button"
          onClick={() => { setEnteredToken(""); setTokenInput(""); setUnauthorized(false); }}
          className="mt-6 min-h-[48px] rounded-2xl border-2 border-tg-secondary bg-tg-bg px-6 py-3 font-medium text-tg-text hover:bg-tg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-tg-link/50"
        >
          Ввести другой токен
        </button>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen p-4 safe-area-top pb-8">
      <h1 className="text-xl font-bold text-tg-text">Заявки</h1>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
          className="rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-3 py-2 text-sm text-tg-text focus:border-tg-link focus:outline-none"
        >
          <option value="">Все программы</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-3 py-2 text-sm text-tg-text focus:border-tg-link focus:outline-none"
        >
          <option value="">Все статусы</option>
          <option value="New">New</option>
          <option value="In work">In work</option>
          <option value="Done">Done</option>
          <option value="Invalid">Invalid</option>
        </select>
        <input
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          className="rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-3 py-2 text-sm text-tg-text focus:border-tg-link focus:outline-none"
        />
        <input
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          className="rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-3 py-2 text-sm text-tg-text focus:border-tg-link focus:outline-none"
        />
        <button
          type="button"
          onClick={handleExportCsv}
          className="btn-cta inline-flex min-h-[44px] items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" aria-hidden />
          CSV
        </button>
      </div>

      {error && !unauthorized && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="mt-4 text-tg-hint">Загрузка…</p>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="mt-4 space-y-3 md:hidden">
            {leads.map((l) => (
              <div
                key={l.id}
                className="rounded-[var(--radius-card)] border border-tg-secondary/80 bg-tg-bg p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-tg-text">{l.programName}</p>
                    <p className="mt-0.5 text-sm text-tg-hint">
                      {l.clientName || l.phone || l.email || l.telegramUsername || "—"}
                    </p>
                    <p className="mt-1 text-xs text-tg-hint">
                      {new Date(l.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <StatusPill status={l.status} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={l.status}
                    onChange={(e) => handleStatusChange(l.id, e.target.value)}
                    className="rounded-[var(--radius-input)] border border-tg-secondary bg-tg-bg px-2 py-1.5 text-xs text-tg-text focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="In work">In work</option>
                    <option value="Done">Done</option>
                    <option value="Invalid">Invalid</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSelectedLead(l)}
                    className="text-sm font-medium text-tg-link"
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            ))}
            {leads.length === 0 && <p className="py-8 text-center text-tg-hint">Нет заявок</p>}
          </div>

          {/* Desktop: table */}
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-tg-secondary text-left text-tg-hint">
                  <th className="p-3">Дата</th>
                  <th className="p-3">Программа</th>
                  <th className="p-3">Контакт</th>
                  <th className="p-3">Статус</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-tg-secondary/50 transition-colors hover:bg-tg-secondary/30">
                    <td className="p-3 text-tg-text">{new Date(l.createdAt).toLocaleDateString("ru-RU")}</td>
                    <td className="p-3 text-tg-text">{l.programName}</td>
                    <td className="p-3 text-tg-text">
                      {l.clientName || l.phone || l.email || l.telegramUsername || "—"}
                    </td>
                    <td className="p-3">
                      <select
                        value={l.status}
                        onChange={(e) => handleStatusChange(l.id, e.target.value)}
                        className="rounded-[var(--radius-input)] border border-tg-secondary bg-tg-bg px-2 py-1.5 text-tg-text focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="In work">In work</option>
                        <option value="Done">Done</option>
                        <option value="Invalid">Invalid</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setSelectedLead(l)}
                        className="font-medium text-tg-link hover:underline"
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && <p className="py-8 text-center text-tg-hint">Нет заявок</p>}
          </div>

          {total > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between text-sm text-tg-hint">
              <span>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} из {total}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-3 py-2 font-medium text-tg-text disabled:opacity-50 focus:outline-none"
                >
                  Назад
                </button>
                <button
                  type="button"
                  disabled={(page + 1) * PAGE_SIZE >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-3 py-2 font-medium text-tg-text disabled:opacity-50 focus:outline-none"
                >
                  Вперёд
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lead detail modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-auto rounded-[var(--radius-card)] bg-tg-bg p-6 shadow-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-tg-text">Заявка</h2>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-tg-hint hover:bg-tg-secondary hover:text-tg-text"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2">
              <StatusPill status={selectedLead.status} />
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-tg-hint">Дата</dt>
                <dd className="text-tg-text">{new Date(selectedLead.createdAt).toLocaleString("ru-RU")}</dd>
              </div>
              <div>
                <dt className="text-tg-hint">Программа</dt>
                <dd className="text-tg-text">{selectedLead.programName}</dd>
              </div>
              <div>
                <dt className="text-tg-hint">Тариф</dt>
                <dd className="text-tg-text">{selectedLead.selectedPackage || "—"}</dd>
              </div>
              <div>
                <dt className="text-tg-hint">Имя</dt>
                <dd className="text-tg-text">{selectedLead.clientName || "—"}</dd>
              </div>
              <div>
                <dt className="text-tg-hint">Email</dt>
                <dd className="text-tg-text">{selectedLead.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-tg-hint">Телефон</dt>
                <dd className="flex items-center gap-2 text-tg-text">
                  {selectedLead.phone || "—"}
                  {selectedLead.phone && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedLead.phone!)}
                      className="inline-flex items-center gap-1 text-tg-link hover:underline"
                    >
                      <Copy className="h-3.5 w-3.5" /> Копировать
                    </button>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-tg-hint">Telegram</dt>
                <dd className="flex items-center gap-2 text-tg-text">
                  {[selectedLead.telegramUsername, selectedLead.telegramUserId].filter(Boolean).join(" / ") || "—"}
                  {selectedLead.telegramUsername && (
                    <a
                      href={"https://t.me/" + selectedLead.telegramUsername.replace(/^@/, "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-tg-link hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Ссылка
                    </a>
                  )}
                </dd>
              </div>
              {selectedLead.answers && (
                <div>
                  <dt className="text-tg-hint">Ответы</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-tg-text">
                    {(() => {
                      try {
                        const a = JSON.parse(selectedLead.answers) as Record<string, string>;
                        return Object.entries(a).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n") || "—";
                      } catch {
                        return selectedLead.answers;
                      }
                    })()}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-tg-hint">UTM</dt>
                <dd className="text-tg-text">
                  {[selectedLead.utmSource, selectedLead.utmMedium, selectedLead.utmCampaign].filter(Boolean).join(", ") || "—"}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <select
                value={selectedLead.status}
                onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                className="rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-3 py-2 text-sm text-tg-text focus:outline-none"
              >
                <option value="New">New</option>
                <option value="In work">In work</option>
                <option value="Done">Done</option>
                <option value="Invalid">Invalid</option>
              </select>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="flex-1 rounded-2xl border-2 border-tg-secondary bg-tg-bg py-2.5 font-medium text-tg-text hover:bg-tg-secondary"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
