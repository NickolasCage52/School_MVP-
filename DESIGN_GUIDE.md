# Design Guide — Online School Mini App

Design system for the Telegram Mini App: premium edtech look, conversion-focused, Telegram-native.

---

## 1. Tokens

### Colors (CSS variables in `client/src/index.css`)

| Token | Light | Usage |
|-------|--------|--------|
| `--brand-primary` | `#6366f1` | Primary actions, links, selected states |
| `--brand-primary-light` | `#818cf8` | Hover/light accents |
| `--brand-secondary` | `#06b6d4` | Secondary accents, aqua |
| `--brand-secondary-light` | `#22d3ee` | Light aqua |
| `--brand-accent` | `#f97316` | CTAs, highlights, “Рекомендуем” badge |
| `--brand-accent-light` | `#fb923c` | Light accent |
| `--surf-1` | `#ffffff` | Main background (overridden by Telegram) |
| `--surf-2` | `#f4f4f5` | Secondary surface |
| `--text-primary` | `#18181b` | Body text |
| `--text-muted` | `#71717a` | Hints, captions |

Telegram theme overrides surface and text via `--tg-theme-*`. Brand gradients stay; dark mode adjusts opacity in `[data-theme="dark"]`.

### Gradients

- **Hero wash**: `--gradient-hero` — vivid violet → aqua → pink tint for hero/sections.
- **CTA button**: `--gradient-cta` — vivid violet → purple for primary buttons.
- **Card highlight**: `--gradient-card` — light top wash on cards.
- **Section**: `--gradient-section` — soft wash for “Results” / credibility blocks.
- **Page background**: `--gradient-mesh` — radial mesh (violet, aqua, pink) for depth; use class `.page-bg`.

Tailwind: `bg-gradient-hero`, `bg-gradient-cta`, `bg-gradient-card`, `bg-gradient-section`; or use `.btn-cta` for CTA buttons.

### Typography

- **Primary font**: **Montserrat** (заголовки, кнопки, подписи, интерфейс). Подключён в `index.html`, переменная `--font-sans`, Tailwind `font-sans`.
- **Pair font**: **Open Sans** (длинные тексты, описания, отзывы, параграфы). Переменная `--font-body`, Tailwind класс `font-body` — применяйте к абзацам и блокам с текстом.
- **Scale**: H1 2xl bold, H2 lg semibold, H3 base semibold, body base/sm, small xs.
- **Line-height**: relaxed для body; tight для заголовков.

На инпутах указывайте `fontSize: "16px"`, чтобы избежать зума на iOS.

### Radii

- **Cards**: `--radius-card` (20px) — program cards, modals, sections.
- **Buttons**: `--radius-button` (14px) or 2xl (16px) for primary.
- **Inputs**: `--radius-input` (12px).

Tailwind: `rounded-[var(--radius-card)]` or theme `rounded-card`, `rounded-button`, `rounded-input`.

### Shadows

- **Card**: `--shadow-card`, `--shadow-card-hover` for hover.
- **Glow**: `--shadow-glow` (primary), `--shadow-glow-accent` (accent).

### Spacing

- Base grid: **8px**. Use 2, 3, 4, 5, 6 (0.5rem–1.5rem) and 18, 22 for larger gaps.
- **Safe areas**: `.safe-area-top`, `.safe-area-bottom` for notch/home indicator.

---

## 2. Component patterns

### Cards

- Border: `border border-tg-secondary/80`.
- Background: `bg-tg-bg` or `bg-gradient-card` for highlight.
- Radius: `rounded-[var(--radius-card)]` or `rounded-2xl`/`rounded-3xl`.
- Shadow: `shadow-card`, hover `shadow-card-hover`.
- Interactivity: use class `card-hover-scale` for slight scale on hover (desktop) and tap scale on mobile; tap uses `scale(0.98)`.

### Buttons

- **Primary CTA**: `btn-cta` (gradient, white text, glow) or `bg-gradient-cta` + `text-white` + `shadow-glow`.
- **Secondary**: `border-2 border-tg-secondary` + `bg-tg-bg` + `text-tg-text`.
- **Min height**: 44–48px for touch. Use `rounded-2xl` for main actions.

### Badges / Pills

- **Tags**: `rounded-full bg-tg-secondary px-2.5 py-0.5 text-xs text-tg-hint`.
- **Status (admin)**: colored pills — New (primary), In work (amber), Done (emerald), Invalid (red).
- **“Рекомендуем”**: `bg-brand-accent text-white` with small shadow.

### Inputs

- `rounded-xl` or `rounded-[var(--radius-input)]`, `border-2 border-tg-secondary`, `focus:border-tg-link`.
- Always 16px font on mobile to prevent zoom.

### Icons

- Use **lucide-react** consistently (CheckCircle2, Star, Users, ChevronDown, etc.).
- Size: 4–5 (16–20px) for inline, 12 for hero/empty states.

---

## 3. Do / Don’t

**Do**

- Use design tokens (CSS vars / Tailwind theme); keep brand gradients in dark mode.
- Respect safe-area padding for sticky CTAs and headers.
- Use `prefers-reduced-motion` to shorten or disable animations.
- Keep touch targets ≥ 44px and avoid horizontal scroll at 320px.
- Use CourseCoverBlob or gradient+icon for program/direction visuals instead of heavy images.

**Don’t**

- Don’t use raw gray/black without theme; use `tg-text` / `tg-hint` / `tg-bg`.
- Don’t add heavy Lottie or scroll-linked animations by default.
- Don’t use default browser form styles; always use our radii and borders.
- Don’t leave “demo” spacing or raw lists; use consistent 8px grid and card layout.

---

## 4. Adding a new direction / program theme

### Direction slug → card/hero style

1. **CourseCoverBlob** (`client/src/components/CourseCoverBlob.tsx`):  
   Add a mapping for the new direction `slug` in the `gradients` object:
   - `marketing`: violet → aqua  
   - `design`: purple → pink  
   - `analytics`: aqua → violet  
   Add e.g. `product: ["#22c55e", "#06b6d4"]` for a new “product” direction.

2. **Catalog**: Cards already use `directionSlug` from the API; no change if the API returns the new slug.

3. **Program page**: Hero uses `program.direction?.slug` for the same blob; no change if direction has the new slug.

### New program in API

- Ensure the program’s `direction` has a `slug` that exists in `CourseCoverBlob` (or leave default).
- Optional: add a “from price” in catalog by extending the API or keeping the placeholder helper `fromPricePlaceholder(program)`.

---

## 5. Animation

- **Page**: `animate-fade-in` on container; `.page-bg` for gradient mesh background.
- **Cards / sections**: `animate-slide-up` with staggered `animationDelay`; catalog cards use `card-hover-scale` (hover scale 1.02, active 0.98).
- **Buttons**: `active:scale-[0.98]`; `.btn-cta` includes hover brightness and active scale.
- **Bottom sheet**: `animate-sheet-up` (slide from bottom).
- **Accordion**: add class `accordion-smooth` to `<details>` and `accordion-body` to content div for fade+slide open animation; `ChevronDown` rotation on summary.
- **Testimonials**: horizontal scroll carousel with `scroll-snap-type`, `scrollbar-none`; avatar placeholder (first letter) per testimonial.
- **Confetti**: `Confetti` component; respects `prefers-reduced-motion` (disable or reduce particles).

All animations are in `tailwind.config.js` and `index.css`; reduce duration in `index.css` when `prefers-reduced-motion: reduce`.

---

## 7. Results / credibility (template)

- **ResultsSection** (`client/src/components/ResultsSection.tsx`): reusable block with:
  - **Stats row**: e.g. 1 200+ выпускников, 95% завершают курс, 4.8 рейтинг (icons: Users, BookOpen, Award).
  - **Case studies**: “Было → Стало” cards with metric badge (e.g. “Рост заявок”, “Новая профессия”).
  - **Badges**: e.g. Аккредитация, Эксперты, Поддержка (pill style).
- Shown on the **Program** page after “Что получишь”. Edit `SCHOOL_STATS`, `CASE_STUDIES`, `BADGES` in the component to customize for your client.

---

## 6. Telegram

- **BackButton**: Shown on program/lead/admin; hidden on catalog and success.
- **MainButton**: Shown on program (“Оставить заявку” + price) and lead step 2 (“Отправить заявку”); on success (“Вернуться в каталог”).
- **Theme**: `data-theme` and `--tg-theme-*` are set by `useTelegram`; use `tg-bg`, `tg-text`, `tg-hint`, `tg-link`, `tg-button` in Tailwind so UI adapts to light/dark Telegram.
