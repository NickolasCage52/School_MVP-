import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { getFriendlyErrorMessage } from "../lib/errors";
import { PageHeader, NavMenuSheet } from "../components/PageHeader";
import { trackEvent } from "../lib/analytics";
import { getUtmParams } from "../lib/utm";
import { useTelegram, useTelegramBackButton, useTelegramMainButton } from "../hooks/useTelegram";
import { normalizePhoneInput } from "../lib/phone";
import type { ProgramDetail, Package } from "../types/api";

const STEP_CONTACTS = 1;
const STEP_GOAL = 2;
const DRAFT_KEY = "lead_draft";

function getDraftKey(telegramUserId: string | undefined, programId: string) {
  return `${DRAFT_KEY}_${telegramUserId ?? "anon"}_${programId}`;
}

function loadDraft(key: string): Record<string, unknown> | null {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function saveDraft(key: string, data: Record<string, unknown>) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function LeadForm() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stateProgram = location.state as { program?: ProgramDetail; selectedPackage?: Package } | undefined;
  const program = stateProgram?.program ?? null;
  const initialPackage = stateProgram?.selectedPackage ?? null;

  const [step, setStep] = useState(STEP_CONTACTS);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(initialPackage);
  const [programFetched, setProgramFetched] = useState<ProgramDetail | null>(program);
  const [loading, setLoading] = useState(!program && !!id);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [schedule, setSchedule] = useState("");
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [validation, setValidation] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, haptic } = useTelegram();

  const draftKey = programFetched && (user?.id || id) ? getDraftKey(user?.id, programFetched.id) : null;

  useTelegramBackButton(true, () => {
    haptic("light");
    if (step === STEP_GOAL) setStep(STEP_CONTACTS);
    else navigate(-1);
  });

  const emailTrimmed = email.trim();
  const emailValid = !emailTrimmed || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  const isStep1Valid =
    clientName.trim().length > 0 &&
    emailValid &&
    (phone.replace(/\D/g, "").length >= 10 || emailTrimmed.length > 0 || user?.id);
  useTelegramMainButton(
    !!programFetched && step === STEP_GOAL,
    "Отправить заявку",
    () => void handleSubmit(),
    { disabled: !isStep1Valid || submitting }
  );

  useEffect(() => {
    if (program) {
      setProgramFetched(program);
      setSelectedPackage(initialPackage ?? program.packages?.[0] ?? null);
      setLoading(false);
      return;
    }
    if (!id) {
      setError("Программа не выбрана");
      setLoading(false);
      return;
    }
    api
      .program(id)
      .then((p) => {
        setProgramFetched(p);
        setSelectedPackage(p.packages?.find((x) => x.recommended) ?? p.packages?.[0] ?? null);
      })
      .catch((e) => setError(getFriendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, program, initialPackage]);

  useEffect(() => {
    if (user) {
      setClientName((prev) => (prev.trim() ? prev : user.firstName + (user.lastName ? " " + user.lastName : "")));
    }
  }, [user]);

  useEffect(() => {
    if (!draftKey || !programFetched) return;
    const draft = loadDraft(draftKey);
    if (draft) {
      if (typeof draft.clientName === "string") setClientName(draft.clientName);
      if (typeof draft.email === "string") setEmail(draft.email);
      if (typeof draft.phone === "string") setPhone(draft.phone);
      if (typeof draft.goal === "string") setGoal(draft.goal);
      if (typeof draft.experience === "string") setExperience(draft.experience);
      if (typeof draft.schedule === "string") setSchedule(draft.schedule);
      if (typeof draft.comment === "string") setComment(draft.comment);
    }
  }, [draftKey, programFetched]);

  const persistDraft = useCallback(() => {
    if (!draftKey) return;
    saveDraft(draftKey, {
      clientName,
      email,
      phone,
      goal,
      experience,
      schedule,
      comment,
    });
  }, [draftKey, clientName, email, phone, goal, experience, schedule, comment]);

  useEffect(() => {
    const t = setTimeout(persistDraft, 500);
    return () => clearTimeout(t);
  }, [persistDraft]);

  const validateStep1 = (): boolean => {
    const v: Record<string, string> = {};
    if (!clientName.trim()) v.clientName = "Введите имя";
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length > 0 && phoneDigits.length < 10) v.phone = "Введите корректный номер";
    const emailTrimmed = email.trim();
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      v.email = "Введите корректный email";
    }
    if (!clientName.trim() && !emailTrimmed && phoneDigits.length < 10 && !user?.id) {
      v.clientName = v.clientName || "Укажите имя и контакт (телефон или email)";
    }
    setValidation(v);
    return Object.keys(v).length === 0;
  };

  const handleNext = () => {
    if (!validateStep1()) return;
    haptic("light");
    trackEvent("lead_step_complete", { step: 1, programId: programFetched?.id });
    setStep(STEP_GOAL);
  };

  const handleSubmit = async () => {
    if (!programFetched) return;
    if (step === STEP_CONTACTS) {
      handleNext();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const utm = getUtmParams();
    const phoneNormalized = phone.trim() ? normalizePhoneInput(phone) : "";
    try {
      await api.createLead({
        programId: programFetched.id,
        programName: programFetched.title,
        direction: programFetched.direction?.name,
        selectedPackage: selectedPackage?.name,
        priceShown: selectedPackage?.price,
        clientName: clientName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phoneNormalized ? (phoneNormalized.length >= 10 ? phoneNormalized : undefined) : undefined,
        telegramUserId: user?.id,
        telegramUsername: user?.username || undefined,
        telegramFirstName: user?.firstName || undefined,
        telegramLastName: user?.lastName || undefined,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
        utmContent: utm.utmContent,
        utmTerm: utm.utmTerm,
        answers: { goal: goal.trim() || undefined, level: experience.trim() || undefined, schedule: schedule.trim() || undefined, comment: comment.trim() || undefined },
        device: {
          platform: typeof navigator !== "undefined" ? navigator.platform : undefined,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent?.slice(0, 200) : undefined,
          language: typeof navigator !== "undefined" ? navigator.language : undefined,
          theme: document.documentElement.getAttribute("data-theme") ?? (window.Telegram?.WebApp?.colorScheme ?? "light"),
        },
        website: website || undefined,
      });
      trackEvent("lead_submit_success", { programId: programFetched.id });
      if (draftKey) try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      navigate(`/lead/${programFetched.id}/success`, { replace: true, state: { program: programFetched, selectedPackage } });
    } catch (e) {
      const msg = getFriendlyErrorMessage(e);
      setSubmitError(msg);
      trackEvent("lead_submit_error", { programId: programFetched.id, error: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-tg-button border-t-transparent" />
      </div>
    );
  }
  if (error || !programFetched) {
    return (
      <div className="page-bg flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="text-[var(--text-body)] text-tg-text">{error ?? "Программа не найдена"}</p>
        <div className="mt-6 flex flex-col gap-3">
          {id && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoading(true);
                api.program(id).then((p) => {
                  setProgramFetched(p);
                  setSelectedPackage(p.packages?.find((x) => x.recommended) ?? p.packages?.[0] ?? null);
                }).catch((e) => setError(getFriendlyErrorMessage(e))).finally(() => setLoading(false));
              }}
              className="btn-cta min-h-[48px] rounded-[var(--radius-button)] px-6 py-3 font-semibold text-white"
            >
              Повторить
            </button>
          )}
          <button type="button" onClick={() => navigate("/")} className="btn-secondary min-h-[48px] rounded-[var(--radius-button)] px-6 py-3">
            В каталог
          </button>
        </div>
      </div>
    );
  }

  const totalSteps = 2;
  const currentStep = step;

  const handleBack = () => {
    haptic("light");
    if (step === STEP_GOAL) setStep(STEP_CONTACTS);
    else navigate(-1);
  };

  return (
    <div className="page-bg min-h-screen pb-28 animate-fade-in">
      <PageHeader
        onBack={handleBack}
        backLabel="Назад"
        title={`Заявка · Шаг ${currentStep} из ${totalSteps}`}
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
      <div className="safe-area-top border-b border-tg-secondary/50 bg-tg-bg/95 px-4 py-3 backdrop-blur">
        <div className="h-2 w-full overflow-hidden rounded-full bg-tg-secondary">
          <div className="h-full rounded-full bg-gradient-cta transition-[width] duration-400 ease-out" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
        </div>
      </div>

      <main className="mx-auto max-w-xl px-4 py-6 sm:px-6">
        {step === STEP_CONTACTS && (
          <div className="animate-slide-up space-y-5 opacity-0" style={{ animationFillMode: "forwards" }}>
            <h1 className="font-heading text-[var(--text-h1)] font-bold text-tg-text">Контактные данные</h1>
            <p className="mt-1 text-[var(--text-sm)] text-tg-hint">Ответим в течение 24 часов. Данные не передаём третьим лицам.</p>
            <div>
              <label className="block text-sm font-medium text-tg-text">Имя *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Иван Иванов"
                className={`input-focus-ring mt-2 w-full rounded-[var(--radius-input)] border-2 bg-tg-bg px-4 py-3 text-[var(--text-body)] text-tg-text placeholder:text-tg-hint transition-all duration-200 focus:outline-none ${
                  validation.clientName ? "input-error border-red-400" : "border-tg-secondary"
                }`}
                style={{ fontSize: "16px" }}
                aria-invalid={!!validation.clientName}
                aria-describedby={validation.clientName ? "err-name" : undefined}
              />
              {validation.clientName && <p id="err-name" className="mt-1.5 text-sm text-red-500 animate-fade-in" role="alert">{validation.clientName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-tg-text">Телефон *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value;
                  const d = v.replace(/\D/g, "").slice(0, 11);
                  if (d.length <= 1) setPhone(d ? "+7" : "");
                  else setPhone("+7 " + d.slice(1).replace(/(\d{3})(\d{0,3})(\d{0,2})(\d{0,2})/, "($1) $2-$3-$4").replace(/[-\s]$/, "").trim());
                }}
                placeholder="+7 (999) 123-45-67"
                className={`input-focus-ring mt-2 w-full rounded-[var(--radius-input)] border-2 bg-tg-bg px-4 py-3 text-[var(--text-body)] text-tg-text placeholder:text-tg-hint transition-all duration-200 focus:outline-none ${
                  validation.phone ? "input-error border-red-400" : "border-tg-secondary"
                }`}
                style={{ fontSize: "16px" }}
                aria-invalid={!!validation.phone}
                aria-describedby={validation.phone ? "err-phone" : undefined}
              />
              {validation.phone && <p id="err-phone" className="mt-1.5 text-sm text-red-500 animate-fade-in" role="alert">{validation.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-tg-text">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={`input-focus-ring mt-2 w-full rounded-[var(--radius-input)] border-2 bg-tg-bg px-4 py-3 text-[var(--text-body)] text-tg-text placeholder:text-tg-hint transition-all duration-200 focus:outline-none ${
                  validation.email ? "input-error border-red-400" : "border-tg-secondary"
                }`}
                style={{ fontSize: "16px" }}
                aria-invalid={!!validation.email}
                aria-describedby={validation.email ? "err-email" : undefined}
              />
              {validation.email && <p id="err-email" className="mt-1.5 text-sm text-red-500 animate-fade-in" role="alert">{validation.email}</p>}
            </div>
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website">Сайт</label>
              <input id="website" type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
            </div>
          </div>
        )}

        {step === STEP_GOAL && (
          <div className="animate-slide-left-in space-y-5 opacity-0" style={{ animationFillMode: "forwards" }}>
            <h1 className="font-heading text-[var(--text-h1)] font-bold text-tg-text">Расскажите о себе</h1>
            <p className="mt-1 text-[var(--text-sm)] text-tg-hint">Поможет подобрать формат и ответить на вопросы</p>
            <div>
              <label className="block text-sm font-medium text-tg-text">Цель обучения</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Например: сменить профессию, запустить рекламу"
                className="input-focus-ring mt-2 w-full rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-4 py-3 text-[var(--text-body)] text-tg-text placeholder:text-tg-hint transition-all duration-200 focus:outline-none"
                style={{ fontSize: "16px" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tg-text">Опыт в теме</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Новичок / есть опыт"
                className="input-focus-ring mt-2 w-full rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-4 py-3 text-[var(--text-body)] text-tg-text placeholder:text-tg-hint transition-all duration-200 focus:outline-none"
                style={{ fontSize: "16px" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tg-text">Удобное время</label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Утро / вечер / выходные"
                className="input-focus-ring mt-2 w-full rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-4 py-3 text-[var(--text-body)] text-tg-text placeholder:text-tg-hint transition-all duration-200 focus:outline-none"
                style={{ fontSize: "16px" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tg-text">Комментарий</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Вопрос или пожелание"
                rows={3}
                className="input-focus-ring mt-2 w-full resize-none rounded-[var(--radius-input)] border-2 border-tg-secondary bg-tg-bg px-4 py-3 text-[var(--text-body)] text-tg-text placeholder:text-tg-hint transition-all duration-200 focus:outline-none"
                style={{ fontSize: "16px" }}
              />
            </div>
            {submitError && (
              <div className="rounded-[var(--radius-input)] border-2 border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30" role="alert">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{submitError}</p>
                <p className="mt-1 text-xs text-tg-hint">Проверьте подключение и попробуйте снова.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 border-t border-tg-secondary bg-tg-bg p-4">
        <button
          type="button"
          onClick={step === STEP_CONTACTS ? handleNext : () => void handleSubmit()}
          disabled={step === STEP_CONTACTS ? !isStep1Valid : submitting}
          className="btn-cta min-h-[48px] w-full rounded-[var(--radius-button)] py-4 font-semibold text-white shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {submitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-tg-button-text border-t-transparent" />
              Отправка…
            </span>
          ) : step === STEP_CONTACTS ? "Далее" : "Отправить заявку"}
        </button>
      </div>
    </div>
  );
}
