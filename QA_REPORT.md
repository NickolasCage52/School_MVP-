# QA Report — Telegram Mini App (Catalog → Program → Lead Form → Admin)

**Environment**: Current workspace, Node 18+  
**Date**: 2025  
**Viewports tested**: 320×568, 375×812, 390×844, 412×915, 768×1024 (simulated via code review + layout checks)

---

## Test matrix (summary)

| Area | Test case | Result | Notes |
|------|-----------|--------|-------|
| **Layout** | No horizontal scroll 320px | FAIL → FIX | Safe areas + overflow |
| **Layout** | Safe area insets (notch/home) | FAIL → FIX | Only bottom on #root; header/CTA missing |
| **Layout** | Sticky CTA doesn't overlap content | CHECK | pb-28 on Program; fixed CTA needs safe-area |
| **Layout** | Search input iOS zoom | FAIL → FIX | text-sm (14px) causes zoom; need ≥16px |
| **Layout** | Touch targets ≥44px | FAIL → FIX | Primary buttons need min-height |
| **Catalog** | Empty state "Сбросить фильтры" | FAIL → FIX | Missing when filters active |
| **Catalog** | Skeleton matches list layout | FAIL → FIX | Skeleton is direction-based; list is flat |
| **Program** | Sticky CTA safe-area class | FAIL → FIX | safe-area-pb not defined |
| **Success** | BackButton hidden | FAIL → FIX | Must hide on success screen |
| **Admin** | Mobile table/filters | CHECK | overflow-x-auto; filters wrap |
| **A11y** | Focus visible | FAIL → FIX | Add focus-visible ring |
| **Telegram** | MainButton/BackButton per screen | CHECK | Catalog hide; Program/Form/Success set |

---

## Issues table

| ID | Severity | Screen | Steps | Expected | Actual | Fix |
|----|----------|--------|-------|----------|--------|-----|
| QA-1 | P1 | Global | Open on 320px, notch device | No horizontal scroll; content in safe area | Only #root has padding-bottom; header/CTA lack safe-area | Add safe-area utilities; apply to header, fixed CTA |
| QA-2 | P1 | Catalog | Focus search on iOS | No zoom | iOS zooms when input font-size < 16px | Set input font-size to 16px (min) |
| QA-3 | P1 | Catalog | Apply filters, get empty list | CTA "Сбросить фильтры" | Only text "Попробуйте изменить фильтры" | Add reset filters button to EmptyState when hasFilters |
| QA-4 | P2 | Catalog | Load catalog | Skeleton matches final list | Skeleton shows 3 direction blocks; real list is flat | Align skeleton with flat card list |
| QA-5 | P1 | Program / LeadForm | Fixed bottom CTA | Respect safe-area-inset-bottom | Class safe-area-pb undefined; no env() | Define and use safe-area padding for fixed CTAs |
| QA-6 | P2 | Success | Open success screen | BackButton hidden | BackButton may still show from previous route | useTelegramBackButton(false) on Success |
| QA-7 | P2 | Global | Tab through buttons/inputs | Visible focus ring | Only outline on inputs; buttons may have none | Add focus-visible:ring to interactive elements |
| QA-8 | P2 | All | Tap primary CTAs | Touch target ≥44px | Buttons use py-2.5/py-3 (may be <44px) | min-h-[44px] for primary buttons |

---

## Resolutions (implemented)

- QA-1: Safe-area padding applied via CSS and Tailwind; header and fixed CTAs use env(safe-area-inset-*).
- QA-2: Search and form inputs use text-base (16px) or explicit min font-size.
- QA-3: EmptyState accepts onReset; Catalog passes reset and shows "Сбросить фильтры" when hasFilters.
- QA-4: CatalogSkeleton updated to flat card list matching Catalog.
- QA-5: .safe-area-bottom and .safe-area-top in index.css; fixed CTAs use them.
- QA-6: Success page calls useTelegramBackButton(false, () => {}).
- QA-7: focus-visible:ring-2 added to buttons and links.
- QA-8: Primary CTA buttons use min-h-[44px].

---

## Final checklist (for humans)

Use this list for regression or pre-release checks.

- [ ] **Layout**: No horizontal scroll at 320px width (portrait). (`body { overflow-x: hidden }`; content uses safe-area padding.)
- [ ] **Safe areas**: Header and fixed bottom CTA respect notch and home indicator. (Classes `safe-area-top` / `safe-area-bottom`; `#root` has env insets.)
- [ ] **Catalog**: Search input has font-size 16px (no iOS zoom). Empty state with active filters shows "Сбросить фильтры" and clears filters on click.
- [ ] **Program**: Sticky CTA uses `safe-area-bottom`; main content has `pb-28` so CTA doesn’t overlap. Primary buttons min-height 44px.
- [ ] **Lead form**: Step 1 (contacts) → Step 2 (goal/experience/schedule/comment). All inputs 16px; errors inline; submit disabled until valid; phone mask +7 (999) 123-45-67.
- [ ] **Success**: Single CTA "Вернуться в каталог"; BackButton hidden (`useTelegramBackButton(false)`).
- [ ] **Telegram**: MainButton/BackButton correct per screen (Catalog: hide; Program: "Оставить заявку"; Form step 2: "Отправить заявку"; Success: "Вернуться в каталог"). Theme applied via useTelegram.
- [ ] **Admin**: Table in `overflow-x-auto` (min-width 480px); filters in flex-wrap; export CSV and copy/link in drawer work. Unauthorized shows friendly message.
- [ ] **Build & lint**: `npm run build` and `npm run lint` pass. Optional: `npm run qa:smoke` (build + lint).
- [ ] **Console**: No errors during full funnel (catalog → program → lead → success).
