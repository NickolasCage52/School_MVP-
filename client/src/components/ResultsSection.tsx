/**
 * Results / School achievements section for credibility.
 * Template-ready: case studies, stats, badges. Adjust copy for your client.
 */
import { TrendingUp, Award, Users, BookOpen } from "lucide-react";

const SCHOOL_STATS = [
  { value: "1 200+", label: "выпускников", icon: Users },
  { value: "95%", label: "завершают курс", icon: BookOpen },
  { value: "4.8", label: "средний рейтинг", icon: Award },
];

const CASE_STUDIES = [
  {
    before: "Новичок в маркетинге",
    after: "Запустил рекламу и получил первые 30 заявок за 2 месяца",
    metric: "Рост заявок",
  },
  {
    before: "Без опыта в таргете",
    after: "Ведёт рекламу для двух клиентов, окупаемость 140%",
    metric: "Новая профессия",
  },
  {
    before: "Хотел систематизировать знания",
    after: "Контент-план на 3 месяца, серия постов по своей нише",
    metric: "Портфолио",
  },
];

const BADGES = [
  { label: "Аккредитованные программы", short: "Аккредитация" },
  { label: "Практикующие эксперты", short: "Эксперты" },
  { label: "Поддержка после выпуска", short: "Поддержка" },
];

export function ResultsSection() {
  return (
    <section className="rounded-[var(--radius-card)] bg-gradient-section py-6 px-4">
      <h2 className="font-heading flex items-center gap-2 text-[var(--text-h2)] font-semibold text-tg-text">
        <TrendingUp className="h-5 w-5 text-brand-primary" aria-hidden />
        Результаты школы
      </h2>
      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {SCHOOL_STATS.map(({ value, label, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl border border-tg-secondary/60 bg-tg-bg/80 py-3 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <Icon className="mb-1 h-5 w-5 text-brand-primary" aria-hidden />
            <span className="text-lg font-bold text-tg-text">{value}</span>
            <span className="text-xs text-tg-hint">{label}</span>
          </div>
        ))}
      </div>
      {/* Case studies: Before → After */}
      <div className="mt-6">
        <h3 className="font-heading text-sm font-semibold text-tg-text">Истории выпускников</h3>
        <div className="mt-3 space-y-3">
          {CASE_STUDIES.map((study, i) => (
            <div
              key={i}
              className="rounded-xl border border-tg-secondary/80 bg-tg-bg p-4 shadow-card animate-slide-up opacity-0"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}
            >
              <p className="font-body text-xs font-medium text-tg-hint">Было: {study.before}</p>
              <p className="font-body mt-1 text-sm font-medium text-tg-text">Стало: {study.after}</p>
              <span className="mt-2 inline-block rounded-full bg-brand-primary/15 px-2.5 py-0.5 text-xs font-medium text-brand-primary">
                {study.metric}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Badges */}
      <div className="mt-6 flex flex-wrap gap-2">
        {BADGES.map((b) => (
          <span
            key={b.short}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1.5 text-xs font-medium text-brand-primary"
            title={b.label}
          >
            <Award className="h-3.5 w-3.5" aria-hidden />
            {b.short}
          </span>
        ))}
      </div>
    </section>
  );
}
