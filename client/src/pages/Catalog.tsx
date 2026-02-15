import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, SlidersHorizontal, Menu } from "lucide-react";
import { api } from "../lib/api";
import { mockCatalog } from "../data/mockCatalog";
import { trackEvent } from "../lib/analytics";
import { useTelegram, useTelegramBackButton } from "../hooks/useTelegram";
import { CatalogSkeleton } from "../components/Skeletons";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { CourseCoverBlob } from "../components/CourseCoverBlob";
import { FilterSheet } from "../components/FilterSheet";
import { NavMenuSheet } from "../components/PageHeader";
import type { CatalogResponse, ProgramSummary } from "../types/api";

type SortKey = "default" | "price" | "date";

type FlatProgram = ProgramSummary & { directionId: string; directionName: string; directionSlug: string };

const DRAFT_DEBOUNCE_MS = 300;
const BRAND_NAME = "SkillUp Academy";
const PROMISE_LINE = "Прокачай навык за 6–10 недель";

/** Placeholder "from" price when API has no price in summary (e.g. 12k–18k by direction). */
function fromPricePlaceholder(_program: FlatProgram): number {
  return 12_000;
}

export function Catalog() {
  const navigate = useNavigate();
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [error] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [filterDirection, setFilterDirection] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { haptic } = useTelegram();

  useTelegramBackButton(false, () => {});

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    trackEvent("catalog_view");
    api
      .catalog()
      .then(setData)
      .catch(() => {
        // Режим презентации (GitHub Pages без бэкенда) — моковые данные
        setData(mockCatalog);
      });
  }, []);

  const flatPrograms = useMemo((): FlatProgram[] => {
    if (!data?.directions) return [];
    return data.directions.flatMap((d) =>
      (d.programs as ProgramSummary[]).map((p) => ({ ...p, directionId: d.id, directionName: d.name, directionSlug: d.slug }))
    );
  }, [data]);

  const filteredAndSorted = useMemo(() => {
    let list = flatPrograms;
    const q = searchDebounced.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.shortDesc ?? "").toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
      trackEvent("search_use", { query: q, results: list.length });
    }
    if (filterDirection) list = list.filter((p) => p.directionId === filterDirection);
    if (filterLevel) list = list.filter((p) => (p.level ?? "").toLowerCase().includes(filterLevel.toLowerCase()));
    if (filterDuration) list = list.filter((p) => (p.duration ?? "").includes(filterDuration));
    if (sort === "date") list = [...list].sort((a, b) => ((b as { startDate?: string }).startDate ?? "").localeCompare((a as { startDate?: string }).startDate ?? ""));
    return list;
  }, [flatPrograms, searchDebounced, filterDirection, filterLevel, filterDuration, sort]);

  const directions = data?.directions ?? [];
  const hasFilters = filterDirection || filterLevel || filterDuration || sort !== "default";

  const applyFilters = (dir: string, lvl: string, dur: string, s: SortKey) => {
    setFilterDirection(dir);
    setFilterLevel(lvl);
    setFilterDuration(dur);
    setSort(s);
    setFilterSheetOpen(false);
    trackEvent("filter_change", { filter: "sheet", direction: dir, level: lvl, duration: dur, sort: s });
  };

  if (error) {
    return (
      <div className="page-bg min-h-screen">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }
  if (!data) return <CatalogSkeleton />;

  if (directions.length === 0) {
    return (
      <div className="page-bg min-h-screen">
        <EmptyState title="Программы пока не добавлены" description="Скоро здесь появится каталог." />
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen pb-6 animate-fade-in">
      {/* Hero */}
      <div className="safe-area-top hero-gradient-animate bg-gradient-hero bg-[length:200%_200%] px-4 pt-5 pb-4">
        <h1 className="font-heading text-[var(--text-h1)] font-bold tracking-tight text-tg-text">{BRAND_NAME}</h1>
        <p className="mt-2 text-[var(--text-sm)] text-tg-hint">{PROMISE_LINE}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {directions.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                haptic("light");
                setFilterDirection((prev) => (prev === d.id ? "" : d.id));
                trackEvent("filter_change", { filter: "chip", value: d.id });
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filterDirection === d.id
                  ? "bg-brand-primary text-white"
                  : "bg-tg-secondary text-tg-hint hover:bg-tg-secondary/80 hover:text-tg-text"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="sticky top-0 z-10 border-b border-tg-secondary/50 bg-tg-bg/95 px-4 py-3 backdrop-blur safe-area-top">
        <div className="relative flex items-center gap-2">
          <Search className="absolute left-3 h-5 w-5 shrink-0 text-tg-hint" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию, тегам..."
            className="input-focus-ring w-full rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg py-3 pl-10 pr-10 text-[var(--text-body)] text-tg-text placeholder:text-tg-hint transition-all duration-200 focus:outline-none"
            aria-label="Поиск"
            style={{ fontSize: "16px" }}
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setSearchDebounced(""); }}
              className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-tg-hint hover:bg-tg-secondary hover:text-tg-text"
              aria-label="Очистить"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => { haptic("light"); setFilterSheetOpen(true); }}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
              hasFilters ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-tg-secondary text-tg-hint hover:border-tg-link/50"
            }`}
            aria-label="Фильтры"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => { haptic("light"); setMenuOpen(true); }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-tg-secondary text-tg-hint transition-colors hover:border-tg-link/50 hover:text-tg-text focus:outline-none focus-visible:ring-2 focus-visible:ring-tg-link/50"
            aria-label="Меню"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <NavMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onGoToCatalog={() => setMenuOpen(false)}
      />

      <FilterSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} title="Фильтры">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-tg-hint">Направление</label>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              className="input-focus-ring w-full rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-4 py-3 text-tg-text focus:outline-none"
            >
              <option value="">Все направления</option>
              {directions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-tg-hint">Уровень</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="input-focus-ring w-full rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-4 py-3 text-tg-text focus:outline-none"
            >
              <option value="">Любой</option>
              <option value="Начальный">Начальный</option>
              <option value="Средний">Средний</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-tg-hint">Длительность</label>
            <select
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value)}
              className="input-focus-ring w-full rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-4 py-3 text-tg-text focus:outline-none"
            >
              <option value="">Любая</option>
              <option value="4">4 недели</option>
              <option value="6">6 недель</option>
              <option value="8">8 недель</option>
              <option value="10">10 недель</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-tg-hint">Сортировка</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="input-focus-ring w-full rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-4 py-3 text-tg-text focus:outline-none"
            >
              <option value="default">По умолчанию</option>
              <option value="date">По дате старта</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => applyFilters(filterDirection, filterLevel, filterDuration, sort)}
            className="btn-cta w-full rounded-[var(--radius-button)] py-4 text-[var(--text-body)] font-semibold"
          >
            Показать
          </button>
        </div>
      </FilterSheet>

      <main className="px-4 py-4">
        {filteredAndSorted.length === 0 ? (
          <EmptyState
            title={hasFilters ? "Ничего не найдено" : "Нет программ"}
            description={hasFilters ? "Попробуйте изменить фильтры или поиск." : undefined}
            onReset={hasFilters ? () => { setFilterDirection(""); setFilterLevel(""); setFilterDuration(""); setSearch(""); setSearchDebounced(""); setSort("default"); } : undefined}
            resetLabel="Сбросить фильтры"
          />
        ) : (
          <ul className="space-y-4">
            {filteredAndSorted.map((prog, index) => {
              const fromPrice = fromPricePlaceholder(prog);
              return (
                <li
                  key={prog.id}
                  className="animate-slide-up opacity-0"
                  style={{ animationDelay: `${Math.min(index * 50, 300)}ms`, animationFillMode: "forwards" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      haptic("light");
                      trackEvent("program_open", { programId: prog.id, programTitle: prog.title });
                      navigate(`/program/${prog.id}`);
                    }}
                    className="card-hover-scale group w-full overflow-hidden rounded-[var(--radius-card)] border border-tg-secondary/80 bg-tg-bg text-left shadow-card transition-all duration-300 hover:border-tg-link/40 hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-tg-link/50 focus:outline-none"
                  >
                    <div className="relative h-20 w-full shrink-0 overflow-hidden">
                      <CourseCoverBlob directionSlug={prog.directionSlug} className="absolute inset-0 h-full w-full" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                        <span>⭐ 4.8</span>
                        <span>·</span>
                        <span>1 200 отзывов</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-tg-hint">{prog.directionName}</span>
                        {prog.orderNum === 0 && (
                          <span className="rounded-full bg-brand-accent/20 px-2.5 py-0.5 text-xs font-semibold text-brand-accent">Популярное</span>
                        )}
                      </div>
                      <h3 className="font-heading mt-1.5 line-clamp-2 text-[var(--text-h3)] font-bold text-tg-text">{prog.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {prog.level && <span className="rounded-full bg-tg-secondary px-2.5 py-0.5 text-xs text-tg-hint">{prog.level}</span>}
                        {prog.duration && <span className="rounded-full bg-tg-secondary px-2.5 py-0.5 text-xs text-tg-hint">{prog.duration}</span>}
                        {prog.format && <span className="rounded-full bg-tg-secondary px-2.5 py-0.5 text-xs text-tg-hint">{prog.format}</span>}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-base font-bold text-tg-text">от {fromPrice.toLocaleString("ru-RU")} ₽</span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
