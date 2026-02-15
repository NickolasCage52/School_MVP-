/**
 * Демо-данные для режима презентации (GitHub Pages без бэкенда).
 * Используются при ошибке/отсутствии API.
 */
import type { CatalogResponse, ProgramDetail } from "../types/api";

const PROG_1: ProgramDetail = {
  id: "demo-marketing",
  title: "Маркетинг и продвижение",
  subtitle: "От нуля до первых заказов",
  slug: "marketing",
  tags: ["маркетинг", "SMM", "таргет"],
  shortDesc:
    "Научитесь запускать рекламу, продвигать проекты в соцсетях и привлекать клиентов. Практика на реальных кейсах.",
  duration: "8 недель",
  format: "Онлайн",
  level: "Начальный",
  startDate: "15 марта",
  orderNum: 0,
  direction: { name: "Маркетинг", slug: "marketing" },
  targetAudience: [
    "Хотите научиться продвигать свой бизнес",
    "Планируете стать SMM-специалистом",
    "Нужны базовые навыки таргетолога",
  ],
  outcomes: [
    "Настройка рекламы ВКонтакте и Telegram",
    "Создание контент-планов",
    "Работа с аналитикой и метриками",
    "Сертификат о прохождении",
  ],
  structure: [
    { title: "Основы маркетинга", content: "Введение в digital-маркетинг, каналы продвижения." },
    { title: "SMM и контент", content: "Ведение соцсетей, создание контента, вовлечение." },
    { title: "Таргетированная реклама", content: "Настройка кампаний, аудитории, креативы." },
  ],
  howItWorks:
    "Онлайн-занятия 2 раза в неделю, домашние задания, разбор кейсов. Доступ к записям на 3 месяца.",
  testimonials: [
    { text: "Отличный курс для старта в маркетинге. Всё по делу, без воды.", author: "Анна К.", role: "Собственный бизнес" },
  ],
  instructors: [
    { name: "Иван Петров", role: "Head of Marketing", bio: "10+ лет в digital, ex-яндекс." },
  ],
  faq: [
    { q: "Нужен ли опыт?", a: "Нет, курс для начинающих." },
    { q: "Есть ли рассрочка?", a: "Да, можно оплатить в 2–3 платежа." },
  ],
  packages: [
    {
      id: "pkg-basic",
      name: "Базовый",
      price: 12_000,
      features: ["8 занятий", "Записи на 3 месяца", "Сертификат"],
      recommended: false,
      orderNum: 0,
    },
    {
      id: "pkg-pro",
      name: "Профессионал",
      price: 18_000,
      features: ["Всё из Базового", "Практика на своих проектах", "Чат с экспертами"],
      recommended: true,
      orderNum: 1,
    },
  ],
};

const PROG_2: ProgramDetail = {
  ...PROG_1,
  id: "demo-design",
  title: "Дизайн интерфейсов",
  subtitle: "UI/UX с нуля",
  slug: "design",
  tags: ["дизайн", "UI", "UX", "Figma"],
  shortDesc: "Освойте Figma, создавайте интерфейсы и прототипы. Подходит тем, кто хочет сменить профессию.",
  direction: { name: "Дизайн", slug: "design" },
  packages: [
    { id: "pkg-d1", name: "Стандарт", price: 15_000, features: ["12 занятий", "Портфолио"], recommended: true, orderNum: 0 },
    { id: "pkg-d2", name: "Премиум", price: 22_000, features: ["Всё из Стандарта", "Менторство"], recommended: false, orderNum: 1 },
  ],
};

const PROG_3: ProgramDetail = {
  ...PROG_1,
  id: "demo-programming",
  title: "Веб-разработка",
  subtitle: "Frontend и основы Backend",
  slug: "programming",
  tags: ["программирование", "JS", "React"],
  shortDesc: "HTML, CSS, JavaScript и React. Создайте свой первый сайт и приложение за 10 недель.",
  direction: { name: "Программирование", slug: "programming" },
  packages: [
    { id: "pkg-pr1", name: "Старт", price: 20_000, features: ["10 занятий", "Git, React"], recommended: true, orderNum: 0 },
  ],
};

const MOCK_PROGRAMS: ProgramDetail[] = [PROG_1, PROG_2, PROG_3];

function toSummary(p: ProgramDetail) {
  return {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    slug: p.slug,
    tags: p.tags,
    shortDesc: p.shortDesc,
    duration: p.duration,
    format: p.format,
    level: p.level,
    startDate: p.startDate,
    orderNum: p.orderNum,
  };
}

export const mockCatalog: CatalogResponse = {
  directions: [
    {
      id: "dir-marketing",
      name: "Маркетинг",
      slug: "marketing",
      orderNum: 0,
      programs: [toSummary(PROG_1)],
    },
    {
      id: "dir-design",
      name: "Дизайн",
      slug: "design",
      orderNum: 1,
      programs: [toSummary(PROG_2)],
    },
    {
      id: "dir-programming",
      name: "Программирование",
      slug: "programming",
      orderNum: 2,
      programs: [toSummary(PROG_3)],
    },
  ],
};

export function getMockProgram(id: string): ProgramDetail | null {
  return MOCK_PROGRAMS.find((p) => p.id === id) ?? null;
}
