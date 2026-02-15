import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  Users,
  Award,
  Clock,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { api } from "../lib/api";
import { getMockProgram } from "../data/mockCatalog";
import { trackEvent } from "../lib/analytics";
import { useTelegram, useTelegramBackButton, useTelegramMainButton } from "../hooks/useTelegram";
import { ProgramSkeleton } from "../components/Skeletons";
import { ErrorState } from "../components/ErrorState";
import { CourseCoverBlob } from "../components/CourseCoverBlob";
import { ResultsSection } from "../components/ResultsSection";
import { PageHeader, NavMenuSheet } from "../components/PageHeader";
import type { ProgramDetail, Package } from "../types/api";

export function Program() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { twa, haptic } = useTelegram();

  useTelegramBackButton(!!id, () => {
    haptic("light");
    navigate(-1);
  });

  const ctaLabel = selectedPackage
    ? `Оставить заявку · от ${selectedPackage.price.toLocaleString("ru-RU")} ₽`
    : "Оставить заявку";
  useTelegramMainButton(!!program, ctaLabel, () => {
    haptic("medium");
    trackEvent("lead_start", { programId: program?.id, programTitle: program?.title });
    navigate(`/lead/${program?.id}`, { state: { program, selectedPackage } });
  });

  const loadProgram = (programId: string) => {
    setError(null);
    api
      .program(programId)
      .then((p) => {
        setProgram(p);
        const rec = p.packages?.find((x) => x.recommended);
        setSelectedPackage(rec ?? p.packages?.[0] ?? null);
      })
      .catch(() => {
        // Режим презентации — моковые данные
        const mock = getMockProgram(programId);
        if (mock) {
          setProgram(mock);
          const rec = mock.packages?.find((x) => x.recommended);
          setSelectedPackage(rec ?? mock.packages?.[0] ?? null);
        } else {
          setError("Программа не найдена");
        }
      });
  };

  useEffect(() => {
    if (!id) return;
    loadProgram(id);
  }, [id]);

  const isNotFound = error?.toLowerCase().includes("не найден") ?? false;

  if (error && isNotFound) {
    return (
      <div className="page-bg flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-lg font-medium text-tg-text">Программа не найдена</p>
        <p className="mt-2 text-sm text-tg-hint">Возможно, она была удалена или ссылка устарела.</p>
        <button
          type="button"
          onClick={() => { haptic("light"); navigate("/"); }}
          className="btn-cta mt-6 min-h-[48px] rounded-[var(--radius-button)] px-6 py-4 font-semibold text-white"
        >
          В каталог
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-bg min-h-screen">
        <ErrorState
          message={error}
          onRetry={() => { haptic("light"); loadProgram(id!); }}
          retryLabel="Попробовать снова"
        />
      </div>
    );
  }
  if (!program) return <ProgramSkeleton />;

  const structure = program.structure ?? [];
  const faq = program.faq ?? [];
  const packages = program.packages ?? [];

  const handleBack = () => {
    haptic("light");
    navigate("/");
  };

  return (
    <div className="page-bg min-h-screen pb-32 animate-fade-in">
      <PageHeader
        onBack={handleBack}
        backLabel="Назад"
        title={program.title.length > 28 ? program.title.slice(0, 28) + "…" : program.title}
        showMenu
        onMenuClick={() => {
          haptic("light");
          setMenuOpen(true);
        }}
      />
      <NavMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onGoToCatalog={() => {
          haptic("light");
          navigate("/");
        }}
      />
      <div className="px-4 py-4">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-tg-secondary/80 bg-tg-bg shadow-card">
          <div className="absolute inset-0 bg-gradient-hero pointer-events-none" aria-hidden />
          <div className="relative h-28 w-full">
            <CourseCoverBlob directionSlug={program.direction?.slug} className="absolute inset-0 h-full w-full" />
          </div>
          <div className="relative -mt-2 rounded-t-3xl bg-tg-bg px-4 pb-4 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-tg-hint">{program.direction?.name}</p>
            <h1 className="font-heading mt-1 text-[var(--text-h1)] font-bold leading-tight text-tg-text">{program.title}</h1>
            {program.subtitle && <p className="mt-1 text-sm text-tg-hint">{program.subtitle}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-tg-hint">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden /> {(program.rating ?? 4.8).toFixed(1).replace(".", ",")}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" aria-hidden /> {(program.graduatesCount ?? program.reviewCount ?? 1200).toLocaleString("ru-RU")}+ выпускников
              </span>
              <span className="inline-flex items-center gap-1">
                <Award className="h-4 w-4 text-brand-primary" aria-hidden /> Сертификат
              </span>
              {program.duration && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden /> {program.duration}
                </span>
              )}
            </div>
          </div>
        </div>

        {program.shortDesc && (
          <p className="font-body mt-4 text-tg-text leading-relaxed animate-slide-up opacity-0" style={{ animationDelay: "60ms", animationFillMode: "forwards" }}>
            {program.shortDesc}
          </p>
        )}

        {/* Что получишь */}
        {(program.outcomes?.length ?? 0) > 0 && (
          <section className="mt-8 animate-slide-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
            <h2 className="font-heading flex items-center gap-2 text-[var(--text-h2)] font-semibold text-tg-text">
              <CheckCircle2 className="h-5 w-5 text-brand-primary" aria-hidden />
              Что получишь
            </h2>
            <ul className="mt-3 space-y-2">
              {program.outcomes.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-tg-text">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Кому подходит */}
        {(program.targetAudience?.length ?? 0) > 0 && (
          <section className="mt-8 animate-slide-up opacity-0" style={{ animationDelay: "140ms", animationFillMode: "forwards" }}>
            <h2 className="font-heading text-[var(--text-h2)] font-semibold text-tg-text">Подходит вам, если…</h2>
            <ul className="mt-3 space-y-1.5">
              {program.targetAudience.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-tg-text">
                  <span className="text-brand-primary">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Результаты школы (case studies, stats, badges) */}
        <section className="mt-8 animate-slide-up opacity-0" style={{ animationDelay: "120ms", animationFillMode: "forwards" }}>
          <ResultsSection />
        </section>

        {/* Формат, длительность */}
        <div className="mt-8 flex flex-wrap gap-4 text-sm animate-slide-up opacity-0" style={{ animationDelay: "160ms", animationFillMode: "forwards" }}>
          {program.duration && (
            <span className="text-tg-hint">
              <strong className="text-tg-text">Длительность:</strong> {program.duration}
            </span>
          )}
          {program.format && (
            <span className="text-tg-hint">
              <strong className="text-tg-text">Формат:</strong> {program.format}
            </span>
          )}
          {program.level && (
            <span className="text-tg-hint">
              <strong className="text-tg-text">Уровень:</strong> {program.level}
            </span>
          )}
          {program.startDate && (
            <span className="text-tg-hint">
              <strong className="text-tg-text">Старт:</strong> {program.startDate}
            </span>
          )}
        </div>

        {/* Пакеты */}
        {packages.length > 0 && (
          <section className="mt-8 animate-slide-up opacity-0" style={{ animationDelay: "180ms", animationFillMode: "forwards" }}>
            <h2 className="font-heading text-[var(--text-h2)] font-semibold text-tg-text">Тарифы</h2>
            <div className="mt-3 space-y-3">
              {packages.map((pkg) => {
                const selected = selectedPackage?.id === pkg.id;
                const monthly = pkg.price >= 10000 ? Math.round(pkg.price / 3) : null;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => {
                      haptic("light");
                      setSelectedPackage(pkg);
                      trackEvent("package_select", { programId: program.id, packageId: pkg.id, packageName: pkg.name });
                    }}
                    className={`relative w-full rounded-[var(--radius-card)] border-2 p-4 text-left shadow-card transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-tg-link/50 active:scale-[0.99] ${
                      selected
                        ? "border-brand-primary bg-brand-primary/5 shadow-glow"
                        : "border-tg-secondary/80 bg-tg-bg hover:border-tg-link/40 hover:shadow-card-hover"
                    }`}
                  >
                    {pkg.recommended && (
                      <span className="absolute -top-2 left-4 rounded-full bg-brand-accent px-2.5 py-0.5 text-xs font-semibold text-white shadow-glow-accent">
                        Рекомендуем
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-tg-text">{pkg.name}</span>
                      <span className="text-lg font-bold text-brand-primary">
                        {pkg.price.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                    {monthly != null && (
                      <p className="mt-1 text-xs text-tg-hint">Рассрочка от {monthly.toLocaleString("ru-RU")} ₽/мес</p>
                    )}
                    <ul className="mt-3 space-y-1.5">
                      {(pkg.features ?? []).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-tg-text">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Модули / структура */}
        {structure.length > 0 && (
          <section className="mt-8 animate-slide-up opacity-0" style={{ animationDelay: "220ms", animationFillMode: "forwards" }}>
            <h2 className="font-heading text-[var(--text-h2)] font-semibold text-tg-text">Программа курса</h2>
            <div className="mt-3 space-y-2">
              {structure.map((item, i) => (
                <details
                  key={i}
                  className="accordion-smooth group rounded-xl border border-tg-secondary/80 bg-tg-bg overflow-hidden transition-all duration-200 open:border-brand-primary/30 open:shadow-card"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-medium text-tg-text [&::-webkit-details-marker]:hidden">
                    <span className="text-left">
                      <span className="text-tg-hint">Модуль {i + 1}. </span>
                      {item.title}
                    </span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-tg-hint transition-transform duration-200 group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="accordion-body font-body border-t border-tg-secondary/50 px-4 py-3 text-sm text-tg-hint">
                    {item.content}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Как проходит обучение */}
        {program.howItWorks && (
          <section className="mt-8 animate-slide-up opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <h2 className="font-heading text-[var(--text-h2)] font-semibold text-tg-text">Как проходит обучение</h2>
            <p className="font-body mt-2 text-sm text-tg-text leading-relaxed">{program.howItWorks}</p>
          </section>
        )}

        {/* Преподаватели */}
        {(program.instructors?.length ?? 0) > 0 && (
          <section className="mt-8 animate-slide-up opacity-0" style={{ animationDelay: "260ms", animationFillMode: "forwards" }}>
            <h2 className="font-heading flex items-center gap-2 text-[var(--text-h2)] font-semibold text-tg-text">
              <GraduationCap className="h-5 w-5 text-brand-primary" aria-hidden />
              Преподаватели
            </h2>
            <div className="mt-3 space-y-3">
              {program.instructors.map((inst, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl border border-tg-secondary/80 bg-tg-bg p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-cta text-lg font-bold text-white shadow-glow">
                    {inst.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-tg-text">{inst.name}</p>
                    <p className="text-sm text-brand-primary">{inst.role}</p>
                    <p className="font-body mt-1 text-sm text-tg-hint leading-relaxed">{inst.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Отзывы — carousel */}
        {(program.testimonials?.length ?? 0) > 0 && (
          <section className="mt-8 animate-slide-up opacity-0" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
            <h2 className="font-heading flex items-center gap-2 text-[var(--text-h2)] font-semibold text-tg-text">
              <MessageCircle className="h-5 w-5 text-brand-primary" aria-hidden />
              Отзывы выпускников
            </h2>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-none [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch]">
              {program.testimonials.map((t, i) => (
                <div
                  key={i}
                  className="min-w-[85%] shrink-0 snap-center rounded-xl border border-tg-secondary/80 bg-gradient-card bg-tg-bg p-4 shadow-card"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-cta text-sm font-bold text-white">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-tg-text">{t.author}</p>
                      {t.role && <p className="text-xs text-tg-hint">{t.role}</p>}
                    </div>
                  </div>
                  <p className="font-body text-sm text-tg-text leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="mt-8 animate-slide-up opacity-0" style={{ animationDelay: "340ms", animationFillMode: "forwards" }}>
            <h2 className="font-heading text-[var(--text-h2)] font-semibold text-tg-text">Частые вопросы</h2>
            <div className="mt-3 space-y-2">
              {faq.map((item, i) => (
                <details
                  key={i}
                  className="accordion-smooth group rounded-xl border border-tg-secondary/80 bg-tg-bg overflow-hidden transition-colors duration-200 open:border-tg-link/30"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-tg-text [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-tg-hint transition-transform duration-200 group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="accordion-body font-body border-t border-tg-secondary/50 px-4 py-3 text-sm text-tg-hint">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky CTA bar (always visible; in Telegram MainButton is primary) */}
      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 z-20 border-t border-tg-secondary/80 bg-tg-bg/95 p-4 backdrop-blur">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            {selectedPackage ? (
              <>
                <p className="text-xs text-tg-hint">от</p>
                <p className="text-lg font-bold text-tg-text">
                  {selectedPackage.price.toLocaleString("ru-RU")} ₽
                </p>
              </>
            ) : (
              <p className="text-sm text-tg-hint">Выберите тариф выше</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              haptic("medium");
              trackEvent("lead_start", { programId: program.id });
              navigate(`/lead/${program.id}`, { state: { program, selectedPackage } });
            }}
            className="btn-cta min-h-[48px] flex-1 max-w-[240px] rounded-[var(--radius-button)] py-4 font-semibold text-white shadow-glow transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Оставить заявку
          </button>
        </div>
        {twa && (
          <p className="mt-2 text-center text-xs text-tg-hint">
            Или нажмите кнопку внизу экрана
          </p>
        )}
      </div>
    </div>
  );
}
