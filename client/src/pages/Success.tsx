import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { useTelegramBackButton, useTelegramMainButton } from "../hooks/useTelegram";
import { Confetti } from "../components/Confetti";
import type { ProgramDetail, Package } from "../types/api";

const TELEGRAM_SUPPORT_LINK = "https://t.me/skillup_support";

export function Success() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as { program?: ProgramDetail; selectedPackage?: Package } | undefined;
  const program = state?.program ?? null;
  const selectedPackage = state?.selectedPackage ?? null;

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  useTelegramBackButton(false, () => {});
  useTelegramMainButton(true, "Вернуться в каталог", () => navigate("/"));

  return (
    <div className="page-bg flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center animate-fade-in safe-area-top safe-area-bottom">
      {showConfetti && <Confetti particleCount={35} />}

      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary animate-success-pop">
        <CheckCircle2 className="h-12 w-12" aria-hidden />
      </div>
      <h1 className="font-heading text-[var(--text-h1)] font-bold text-tg-text animate-slide-up opacity-0" style={{ animationDelay: "150ms", animationFillMode: "forwards" }}>
        Заявка отправлена
      </h1>
      <p className="mt-3 max-w-sm text-[var(--text-body)] text-tg-hint animate-slide-up opacity-0" style={{ animationDelay: "250ms", animationFillMode: "forwards" }}>
        Мы свяжемся с вами в течение 24 часов по телефону или в Telegram.
      </p>

      {(program || selectedPackage) && (
        <div className="mt-6 w-full max-w-sm rounded-[var(--radius-card)] border border-tg-secondary/80 bg-gradient-card bg-tg-bg p-4 text-left shadow-card animate-slide-up opacity-0" style={{ animationDelay: "350ms", animationFillMode: "forwards" }}>
          <h2 className="font-heading text-sm font-semibold text-tg-text">Ваша заявка</h2>
          {program && <p className="mt-1 font-medium text-tg-text">{program.title}</p>}
          {selectedPackage && (
            <p className="mt-0.5 text-sm text-tg-hint">
              Тариф: {selectedPackage.name} · {selectedPackage.price.toLocaleString("ru-RU")} ₽
            </p>
          )}
        </div>
      )}

      <div className="mt-6 w-full max-w-sm rounded-[var(--radius-card)] border border-tg-secondary/80 bg-tg-bg p-4 text-left shadow-card animate-slide-up opacity-0" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
        <h2 className="font-heading text-sm font-semibold text-tg-text">Что дальше?</h2>
        <ul className="mt-2 space-y-2 text-[var(--text-sm)] text-tg-hint">
          <li>• В течение 24 часов с вами свяжется менеджер</li>
          <li>• Подготовьте вопросы по программе и формату обучения</li>
          <li>• Проверьте почту — пришлём доп. материалы при необходимости</li>
        </ul>
      </div>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 animate-slide-up opacity-0" style={{ animationDelay: "500ms", animationFillMode: "forwards" }}>
        <a
          href={TELEGRAM_SUPPORT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] px-6 py-3"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Написать в Telegram
        </a>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="btn-cta inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] py-4 font-semibold text-white shadow-glow transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          В каталог
          <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
        {id && (
          <button
            type="button"
            onClick={() => navigate(`/program/${id}`)}
            className="btn-secondary min-h-[44px] rounded-[var(--radius-button)] py-2.5 text-sm"
          >
            К программе
          </button>
        )}
      </div>
    </div>
  );
}
