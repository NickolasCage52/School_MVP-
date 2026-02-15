# Telegram Mini App MVP — Каталог для онлайн-школы

Реалистичный MVP: каталог направлений и программ, карточка программы, заявка (лид) в 2 шага, сохранение в БД, админ-список с пагинацией и экспортом.

## Что улучшено (upgrade)

- **Telegram**: применение themeParams к CSS, MainButton/BackButton по маршрутам (каталог — скрыт; программа — «Оставить заявку»; форма — «Отправить» до валидных данных; успех — «Вернуться в каталог»), haptic на ключевых действиях.
- **Каталог**: поиск с debounce, фильтры (направление, уровень, длительность), сортировка (по умолчанию / по дате старта).
- **Карточка программы**: hero-блок, «Подходит вам, если…», социальное доказательство (рейтинг/выпускники), блок «Как проходит обучение», отзывы выпускников, преподаватели, тарифы, FAQ.
- **Форма заявки**: 2 шага — (1) контакты: имя, телефон с маской, email; (2) цель, опыт, расписание, комментарий. Prefill из Telegram, сохранение черновика в localStorage, восстановление при возврате.
- **Лиды**: расширенная модель (updatedAt, status Invalid, direction, priceShown, answers JSON, device JSON, utm_content/term). Валидация и санитизация на сервере, нормализация телефона, honeypot, идемпотентность (повторная отправка в 15 мин → тот же id), лимит по IP и по telegramUserId.
- **Админка**: пагинация (50 на страницу), фильтры (программа, статус, даты), статус Invalid, экран «Нет доступа» при 401, в drawer — копирование телефона и ссылки на Telegram.
- **Аналитика**: `trackEvent(name, payload)` — логи в консоль и в prod POST `/api/events`. События: catalog_view, search_use, filter_change, program_open, package_select, lead_start, lead_step_complete, lead_submit_success, lead_submit_error.
- **Надёжность**: баннер «Проблемы с сетью» при offline, code-splitting по маршрутам.

## Шаблон для продакшена и демо клиентам

Этот MVP можно использовать как **готовый шаблон** для презентации заказчикам (онлайн-школы, образовательные проекты):

- **Яркий дизайн**: градиенты (violet → aqua → pink), фоновая mesh-подложка (`.page-bg`), карточки с hover-эффектом и тенями.
- **Блок «Результаты школы»**: статистика (выпускники, % завершения, рейтинг), кейсы «Было → Стало», бейджи (аккредитация, эксперты). Компонент `ResultsSection` — правьте константы под клиента.
- **Отзывы**: карусель с аватаром-заглушкой и цитатой; данные из API программы.
- **Типографика**: Manrope, чёткая иерархия заголовков и подписей.
- Подробнее: **DESIGN_GUIDE.md** (токены, компоненты, анимации, как добавить направление).

## Дизайн и анимации

- **Шрифты**: Manrope (Google Fonts) для современной типографики; поддержка `prefers-reduced-motion` для доступности.
- **Каталог**: карточки программ с тенями (shadow-card, hover), лёгкий scale при наведении (`card-hover-scale`), поочерёдное появление списка (staggered slide-up), скругление 2xl, бейдж «Популярное».
- **Страница программы**: hero с градиентным оверлеем и CourseCoverBlob; секция «Результаты школы» (статистика, кейсы, бейджи); секции с анимацией появления; аккордеоны (модули, FAQ) с плавным раскрытием (`accordion-smooth`); тарифы с бейджем «Рекомендуем» и выделением выбранного; отзывы в горизонтальной карусели с аватарами; sticky CTA и MainButton.
- **Форма заявки**: прогресс-бар, поля с border-2 и фокусом, валидация, шаг 2 slide-left-in, кнопка со спиннером при отправке.
- **Экран успеха**: галочка (success-pop), конфести (с учётом reduced-motion), блок «Что дальше?», кнопки «Написать в Telegram» и «В каталог».
- **Загрузка**: скелетоны каталога и программы, совпадающие с итоговым layout.
- **Общее**: единая сетка отступов, скругления (xl/2xl), переходы 200–400 ms; все анимации отключаются при `prefers-reduced-motion: reduce`.

## Архитектура

- **Frontend**: React 18 + TypeScript + Vite + Tailwind. Telegram WebApp SDK (тема, MainButton, BackButton, HapticFeedback).
- **Backend**: Node.js + Express + Prisma + SQLite.
- **API**: `GET /api/catalog`, `GET /api/programs/:id` (в т.ч. `howItWorks`, `testimonials`, `instructors`), `POST /api/leads`, `POST /api/events`, `GET /api/admin/leads` (пагинация), `PATCH /api/admin/leads/:id`, `GET /api/admin/leads/export`, защита админки по `ADMIN_TOKEN`.

## Быстрый старт

1. **Установка**
   ```bash
   npm install
   cd server && npm install && cd ..
   cd client && npm install && cd ..
   ```

2. **Backend**
   - В `server/` скопировать `.env.example` в `.env` (или уже есть `.env` с `DATABASE_URL="file:./dev.db"`, `PORT=3001`, `ADMIN_TOKEN=...`).
   - Создать БД и сиды:
     ```bash
     cd server && npx prisma generate && npx prisma db push && npm run db:seed && cd ..
     ```
   - Если при `prisma generate` возникает EPERM (например, в OneDrive), выполните команды из корня: `cd server`, затем `cd ..`, затем снова `cd server` и `npx prisma generate`.
   - Запуск сервера: `npm run dev:server` (порт 3001).

3. **Frontend**
   - В `client/` при необходимости создать `.env` с `VITE_ADMIN_TOKEN` (тот же, что в server) для страницы `/admin`.
   - Запуск: `npm run dev:client` (порт 5173, проксирует `/api` на 3001).

4. **Всё вместе**
   ```bash
   npm run dev
   ```
   Открыть в браузере: **http://localhost:5173** (каталог), http://localhost:5173/admin (админка). Не открывайте `file:///.../dist/index.html` — стили и анимации подгружаются только через dev-сервер или собранный сервер с правильными путями.

## Устранение неполадок

- **«Failed to load program» / «Ошибка загрузки» при открытии программы**
  - Убедитесь, что backend запущен (`npm run dev` или отдельно `npm run dev:server` в `server/`).
  - Проверьте, что БД создана и заполнена: в `server/` выполните `npx prisma db push` и `npm run db:seed`.
  - В production: если фронт и API на разных доменах, задайте в `client/.env` переменную `VITE_API_URL` (полный URL API, например `https://api.example.com`). Тогда все запросы пойдут на этот адрес вместо относительного `/api`.

- **Ошибка `EADDRINUSE: port 3001`** — порт занят (например, сервер уже запущен в другом терминале). Освободить порт в Windows:
  - **PowerShell**: `Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
  - **cmd**: `for /f "tokens=5" %a in ('netstat -ano ^| findstr :3001') do taskkill /F /PID %a`
  Затем снова запустите `npm run dev`. Либо закройте другое окно/терминал, где был запущен сервер.

- **Нет шрифта Manrope, «плоский» дизайн или нет анимаций** — откройте приложение **только по адресу http://localhost:5173** (не через открытие файла `index.html` и не через `file://`). Сделайте жёсткое обновление страницы: **Ctrl+Shift+R** (или Cmd+Shift+R на Mac), чтобы сбросить кэш. Шрифт подгружается с Google Fonts; при отсутствии доступа к нему используется системный (system-ui). Стили и анимации задаются Tailwind и подхватываются при запуске через `npm run dev`.

## Переменные окружения

- **server/.env**
  - `DATABASE_URL` — SQLite: `file:./dev.db`.
  - `PORT` — порт API (по умолчанию 3001).
  - `ADMIN_TOKEN` — секретный токен для доступа к `/api/admin/*` (заголовок `Authorization: Bearer <ADMIN_TOKEN>`).

- **client/.env** (опционально)
  - `VITE_ADMIN_TOKEN` — тот же токен для входа на страницу `/admin` без ввода вручную.

## Как тестировать в Telegram

1. Развернуть фронтенд на HTTPS (обязательно для Telegram WebApp).
2. Пробросить локальный сервер в интернет:
   - **ngrok**: `ngrok http 5173` (или 3001, если фронт и бэк на одном домене).
   - **cloudflared**: `cloudflared tunnel --url http://localhost:5173`.
3. В BotFather создать бота, в настройках бота указать URL Mini App (HTTPS URL из ngrok/cloudflared).
4. Открыть бота в Telegram → меню/кнопка Mini App — откроется каталог. Заявки уходят на ваш API (нужно, чтобы API был доступен по тому же домену или CORS/прокси настроены).

Как проверить Telegram-фичи: открыть Mini App внутри Telegram — тема подхватится, BackButton и MainButton появятся на нужных экранах, haptic сработает при тапах (на поддерживаемых устройствах).

Если API на другом порту, во фронте в production задать `VITE_API_URL` и использовать его в `api.ts` вместо относительного `/api`.

## Хранение заявок и админка

- Заявки сохраняются в SQLite (модель `Lead`: clientName, phone нормализованный, answers JSON, device JSON, direction, priceShown, статусы New/In work/Done/Invalid).
- Админка: страница `/admin`. Таблица с пагинацией (50 на страницу), фильтры (программа, статус, даты), смена статуса, экспорт CSV по текущим фильтрам, drawer с деталями и кнопками «Копировать» (телефон) и «Ссылка» (t.me/username).
- Доступ: заголовок `Authorization: Bearer <ADMIN_TOKEN>`. В браузере можно задать `VITE_ADMIN_TOKEN` в `client/.env` — тогда токен подставится автоматически при открытии `/admin`.
- Как управлять лидами: откройте `/admin`, примените фильтры при необходимости, меняйте статус (New → In work → Done) в выпадающем списке, при необходимости экспортируйте CSV для работы в CRM или рассылке.

## E2E smoke (ручная проверка)

1. Запустить `npm run dev`, открыть http://localhost:5173.
2. Каталог: поиск, фильтры, переход в программу.
3. Программа: выбор тарифа, кнопка «Оставить заявку».
4. Форма: шаг 1 — имя, телефон, email; «Далее»; шаг 2 — цель, опыт, расписание, комментарий; «Отправить заявку»; экран успеха.
5. Админка: открыть /admin, ввести токен (или задать VITE_ADMIN_TOKEN), проверить таблицу, фильтры, смену статуса, экспорт CSV, открытие drawer и копирование.

## Внутренние метрики (только для кейса/README)

- Цели по кейсу: 212 лидов, 6.2% конверсия, CPL −28%. Эти цифры не выводятся в UI.

## Скрипты

- `npm run dev` — запуск backend + frontend.
- `npm run build` — сборка server и client.
- `npm run seed` — повторный запуск сидов (server).
- `npm run lint` — проверка TypeScript и ESLint (server + client).

## Структура

- `server/` — Express, Prisma, SQLite, роуты catalog/programs/leads/admin/events, нормализация телефона, idempotency и rate limit для leads.
- `client/` — Vite SPA с code-splitting: каталог (поиск, фильтры, сортировка), карточка программы, форма заявки (2 шага, черновик, маска телефона), успех, админка (пагинация, 401, copy link).
