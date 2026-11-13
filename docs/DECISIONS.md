# Decyzje projektowe — Pasovelo

Rejestr zatwierdzonych decyzji. Każdy wpis zawiera datę, status, uzasadnienie i konsekwencje. Decyzje otwarte znajdują się na końcu. Plan wdrożenia: [`PLAN.md`](PLAN.md).

## Zatwierdzone

### 2026-11-13 — shadcn/ui na Base UI

**Status:** zatwierdzona

**Decyzja:** UI bazujemy na shadcn/ui z Base UI jako warstwą primitives oraz Tailwind CSS 4. Komponenty shadcn kopiujemy do `src/components/ui`, a motyw definiujemy przez CSS variables. Własne komponenty domenowe (quiz, odmiana, postęp) trzymamy w `src/components`.

**Dlaczego:**

- Base UI jest lekką warstwą headless i nie narzuca wyglądu.
- shadcn daje gotowe, dostępne komponenty i szybki start.
- Kod trafia do repo, więc nadpisywanie nie wymaga walki ze specificity.
- Całość dobrze współgra z Tailwind CSS 4, Next.js App Router i React 19.
- Pozwala zbudować ciepły, czytelny interfejs dopasowany do nauki języków.

**Konsekwencje:**

- `components.json` z `rsc: true`, `tsx: true`, `tailwind.cssVariables: true` i aliasami `@/*` → `src/*`.
- `style` i `baseColor` wybieramy podczas `pnpm dlx shadcn@latest init`; po inicjalizacji są niezmienialne.
- Komponenty interaktywne dostają `'use client'`; komponenty prezentacyjne mogą działać w RSC.
- Inicjalizacja nastąpi przy pierwszym ekranie UI (Faza 2), nie wcześniej.
- Base UI jest nadal w RC — przed inicjalizacją sprawdzić aktualny stan. Fallback: Radix UI w ramach tego samego shadcn.

### 2026-11-13 — pozostałe ustalenia

| Obszar | Decyzja |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Package manager | pnpm 10.13.1; Node 22 (`engines`, `.nvmrc`, CI) |
| CI | GitHub Actions: `Code Quality`, `Tests`, `PR Title Check` |
| Dependabot | tylko security updates (PR-y przy wykrytych podatnościach); version updates wyłączone |
| Commity | Conventional Commits + commitlint; header ≤72; `subject-case` blokuje sentence/start/pascal/upper-case |
| Testy | Vitest + Testing Library + jsdom; testy obok komponentów |
| Branch workflow | GitHub Project „Pasovelo Board” #4 + `pnpm task` |
| Deployment | odroczony; GitHub Pages możliwy jako static export |
| Release/changelog | odroczony do pierwszego release |

## Otwarte decyzje

- Stan aplikacji: React Context + reducer vs Zustand.
- Hosting: Netlify vs Cloudflare Pages vs Railway.
- Domyślny wariant hiszpańskiego: `es-ES` vs `es-419`.
- Zakres MVP: 4 czasy i 300 czasowników.
- Motyw shadcn przy inicjalizacji: base color, typografia i promienie.
