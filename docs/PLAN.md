# Plan wdrożenia — Pasovelo (trener odmiany hiszpańskiej)

**Wersja:** 0.4  
**Data:** 13 listopada 2026  
**Status:** roboczy  
**Nazwa:** Pasovelo  
**Autor:** Kacper Bobrowski

Zatwierdzone decyzje: [`DECISIONS.md`](DECISIONS.md).

---

## 1. Wizja i cel

Aplikacja do nauki hiszpańskiego skoncentrowana na **poprawnych formach gramatycznych w kontekście**, a nie na przypadkowych zdaniach. Główne filary:

- poprawność odmiany oparta na jednym źródle prawdy i automatycznej walidacji,
- pełne paradygmaty: osoby, czasy, tryby, formy złożone,
- naturalne zdania i typowe konteksty,
- system powtórek (SRS),
- prostota: bez logowania i bez backendu w MVP.

Kolejność rozwoju: **czasowniki → rzeczowniki i przymiotniki → ewentualnie inne języki**. Najpierw hiszpański.

---

## 2. Ustalenia

| Obszar | Ustalenie | Status |
|---|---|---|
| Nazwa | **Pasovelo** — wybrana. Domeny `.com/.pl/.app/.io/.es` wolne wg DNS; potwierdzić WHOIS i sprawdzić znak towarowy. | zatwierdzona |
| Język | Hiszpański. Domyślny wariant proponowany: **es-ES** (z `vosotros`), z opcją `es-419` później. | propozycja |
| Zakres MVP | Czasowniki, 4 czasy, 6 osób, tryb indicativo. | propozycja |
| Zakres docelowy | Wszystkie czasy i tryby, formy złożone, czasowniki zwrotne, bezosobowe i phrasal verbs. | zatwierdzone |
| Silnik odmiany | **Brak ręcznego silnika.** Formy precomputowane z danych źródłowych, walidowane testami. | zatwierdzone |
| Źródła form | Wiktionary / kaikki.org (CC BY-SA). Jehle wyłącznie do wewnętrznego cross-checku. | zatwierdzone |
| Źródła zdań | Tatoeba (CC BY 2.0 FR) + LLM jako generator draftów + walidacja + review. | zatwierdzone |
| Szablony zdań | **Odrzucone jako źródło naturalnych zdań.** Dopuszczalne wyłącznie jako opcjonalny drill 6 osób, oznaczone jako ćwiczenie gramatyczne. | zatwierdzone |
| Częstotliwość | FrequencyWords (OpenSubtitles 2018), dane CC BY-SA 4.0. | zatwierdzone |
| Poziomy CEFR | Przybliżane na podstawie częstotliwości + ręczne tagowanie. Oznaczane jako orientacyjne. | zatwierdzone |
| Logowanie | Brak w MVP. Opcjonalne imię i postęp w localStorage. | zatwierdzone |
| Baza danych | Brak runtime DB. JSON generowany w buildzie; SQLite lokalnie w pipeline. Później rozważamy Netlify Database (Postgres), Neon, Supabase lub Turso. | zatwierdzone |
| Biblioteka UI | **shadcn/ui na Base UI** + Tailwind CSS 4. Komponenty kopiowane do `src/components/ui`, motyw przez CSS variables. | zatwierdzona |
| SRS | FSRS (`ts-fsrs`). | propozycja |
| Hosting | Do decyzji. Rozważamy Netlify (Free, commercial OK), Cloudflare Pages i Railway; Vercel Hobby odpada przy reklamach. **Na razie brak deploymentu.** | propozycja |
| Monetyzacja | Donacje teraz, reklamy opcjonalnie później. Licencje danych muszą pozwalać na komercję. | zatwierdzone |
| Testy | Teraz: CI code quality + testy (Vitest) + PR title check. Później: walidacja danych i E2E. | zatwierdzone |
| Poza MVP | Konta, płatności, aplikacja mobilna, rzeczowniki/przymiotniki, wiele języków. | zatwierdzone |

---

## 3. Architektura

### 3.1. Przepływ danych

```
Wiktionary / kaikki ─┐
FrequencyWords ──────┼─> scripts/ingest + validate ─> data/*.json ─> Next.js (hosting TBD)
Tatoeba ─────────────┤                                      │
LLM (tylko luki) ────┘                                      └─> localStorage / IndexedDB
                                                               (postęp, FSRS, ustawienia)
```

Zasada: **treść jest read-only i wersjonowana w repo**, a aplikacja nie potrzebuje bazy danych w runtime.

### 3.2. Stack

| Warstwa | Technologia |
|---|---|
| Framework | Next.js (App Router, najnowsza stabilna) |
| Język | TypeScript |
| Styl | Tailwind CSS 4 |
| Komponenty UI | shadcn/ui na Base UI; kod w `src/components/ui`, motyw przez CSS variables |
| Stan | React Context + reducer lub Zustand (decyzja implementacyjna) |
| SRS | `ts-fsrs` |
| Walidacja danych | Zod |
| Testy | Vitest + Playwright |
| Pipeline | Node.js + `tsx`, opcjonalnie `better-sqlite3` lokalnie |
| PWA | Serwist |
| Hosting | Do decyzji: Netlify / Cloudflare Pages / Railway (Vercel Pro jako fallback) |
| CI | GitHub Actions: code quality + PR title check |

### 3.3. Struktura repo

```
/
  src/
    app/
      page.tsx
      cwiczenia/
      czasowniki/
      czasowniki/[infinitive]/
      ustawienia/
      zrodla/
    components/
      ui/            # shadcn/ui (Base UI)
    lib/
      utils.ts       # cn() dla shadcn/ui
      srs/
      storage/
      quiz/
      answer-check/
  content/
    source/          # surowe dumps, gitignored
    generated/       # wygenerowane JSON, commitowane
  scripts/
    ingest-wiktionary.ts
    ingest-frequency.ts
    ingest-tatoeba.ts
    generate-sentences.ts
    validate-data.ts
    build-data.ts
  data/
    meta.json
    verbs.index.json
    verbs/
    sentences/
  public/
  PLAN.md
```

### 3.4. Kluczowe decyzje architektoniczne

1. **Statyczne dane zamiast DB w runtime.** Hosting serverless nie ma trwałego dysku; plik SQLite nie przetrwa deployu. JSON jest szybszy, tańszy i prostszy.
2. **Formy są faktami w danych, nie wynikiem działania kodu.** Aplikacja tylko czyta tabelę form.
3. **Walidacja w CI.** Każdy build i przyszły deploy przechodzi testy integralności danych.
4. **Dane dzielone per czasownik.** `verbs/hablar.json` ładowany lazy; indeks zawiera metadane.
5. **PWA/offline.** Po pierwszym wejściu dane i postęp działają bez sieci.
6. **Wersjonowanie schematu.** `meta.json` zawiera wersję danych i listę źródeł.

---

## 4. Model danych

### 4.1. Typy

```ts
type Variant = 'es-ES' | 'es-419'
type Pos = 'verb' | 'noun' | 'adjective' | 'adverb' | 'pronoun' | 'other'
type Mood = 'indicativo' | 'subjuntivo' | 'imperativo'
type Person = 1 | 2 | 3
type Number = 'singular' | 'plural'
type SourceName = 'wiktionary' | 'tatoeba' | 'llm' | 'manual' | 'frequency'

interface Lemma {
  id: string
  lang: 'es'
  pos: Pos
  lemma: string
  translations: { pl: string[]; en?: string[] }
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  freqRank?: number
  variant?: Variant
  flags: {
    reflexive?: boolean
    impersonal?: boolean
    phrasal?: boolean
    gustarType?: boolean
  }
  source: SourceName
  license: string
}

interface Form {
  id: string
  lemmaId: string
  surface: string
  features: {
    mood?: Mood
    tense?: string
    person?: Person
    number?: Number
    gender?: 'masculine' | 'feminine'
    case?: string
  }
  irregular: boolean
  source: SourceName
}

interface Sentence {
  id: string
  lemmaId: string
  formId?: string
  mood: Mood
  tense: string
  person: Person
  number: Number
  sentence: string
  answer: string
  translationPl: string
  translationSource: 'tatoeba' | 'llm' | 'human'
  tenseCue?: string
  cueStrength: 'strong' | 'weak'
  source: 'tatoeba' | 'llm' | 'manual'
  sourceId?: string
  author?: string
  license: string
  verified: boolean
  variant: Variant
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  tags: string[]
}

interface Progress {
  cardId: string
  fsrs: unknown
  reps: number
  lapses: number
  lastSeen: string
  due: string
}

interface SourceRecord {
  id: SourceName
  name: string
  url: string
  license: string
  attribution: string
  retrievedAt: string
  version?: string
}
```

### 4.2. Identyfikatory

- Lemat: `verb:hablar`, `verb:llamarse`, `verb:acabar-con`.
- Forma: `form:hablar:indicativo:presente:1s`.
- Zdanie: `sent:hablar:indefinido:1s:0001`.

Stabilne ID pozwalają zachować postęp SRS przy zmianach danych.

### 4.3. Przechowywanie

- `data/meta.json` — wersja, data generacji, licencje, liczby.
- `data/verbs.index.json` — lista lematów, poziom, częstotliwość, kategoria.
- `data/verbs/{id}.json` — lemat + formy + zdania.
- `data/sentences/{id}.json` — opcjonalnie osobno, jeśli zdania będą liczne.
- Przeglądarka: localStorage dla ustawień i lekkiego postępu; IndexedDB dla cache danych i większego postępu.

### 4.4. Rozszerzalność na rzeczowniki i przymiotniki

`features` jest generyczne (`gender`, `number`, `case`), a `pos` odróżnia typ lematu. Dzięki temu później dodasz:

- rzeczowniki: liczba, rodzaj, nieregularne plurale,
- przymiotniki: rodzaj, liczba, stopniowanie,
- zaimki: przypadek, rodzaj, liczba.

Bez migracji tabel i bez zmiany kontraktu API.

---

## 5. Pipeline treści

### 5.1. Kroki

1. **Ingest Wiktionary / kaikki**
   - Pobierz hiszpański extract (JSONL).
   - Przefiltruj `pos=verb`, język hiszpański.
   - Wyciągnij lemat, formy, tłumaczenia, rodzaj nieregularności.
   - Zapisz surowe dane w `content/source/` (gitignored).

2. **Ingest FrequencyWords**
   - Pobierz `es_50k.txt`.
   - Zlematyzuj formy (spaCy lub FreeLing).
   - Policz częstotliwość lematów i przypisz `freqRank`.

3. **Normalizacja**
   - Unicode NFC, lowercase, trim.
   - Mapowanie tagów źródłowych na `features`.
   - Deduplikacja form i lematów.
   - Obsługa form wielowyrazowych, zwrotnych i phrasal verbs.

4. **Walidacja form**
   - Każdy czasownik ma komplet form dla wybranych czasów.
   - Brak duplikatów i pustych form.
   - Porównanie z UniMorph / Wiktionary; rozbieżności do kolejki review.
   - Testy jednostkowe dla czasowników nieregularnych.

5. **Poziomy CEFR**
   - Pasma częstotliwości + ręczne tagowanie.
   - Oznaczenie „orientacyjny”.
   - Brak kopiowania list PCIC/DELE.

6. **Zdania z Tatoeba**
   - Pobierz `spa_sentences`, `pol_sentences` i plik linków.
   - Dopasuj dokładne formy z tabel odmian.
   - Filtruj długość, wariant, jakość, duplikaty.
   - Sparuj tłumaczenia PL; jeśli brak — angielski pivot lub LLM z oznaczeniem.
   - Zapisz `sourceId`, autora, licencję.

7. **Zdania z LLM (luki)**
   - Prompt zawiera dokładną tabelę form i wymagania.
   - Wynik w JSON zgodnym ze schematem.
   - Walidacja automatyczna + kolejka review.
   - Tylko zatwierdzone zdania trafiają do trybu egzaminacyjnego.

8. **Generowanie danych**
   - Zapisz JSON, policz hash, zaktualizuj `meta.json`.
   - Uruchom pełny zestaw testów.
   - Commit danych razem z kodem.

### 5.2. Reguły walidacji zdań

- `answer` jest dokładnie formą z tabeli dla `(lemma, mood, tense, person, number)`.
- W zdaniu występuje dokładnie jeden blank `___`.
- Forma docelowa nie występuje poza blankiem.
- Osoba i liczba zgadzają się z podmiotem lub kontekstem.
- Tłumaczenie PL jest obecne i zawiera sens czasownika.
- Dla trybu egzaminacyjnego: `cueStrength = 'strong'` i jednoznaczna odpowiedź.
- LanguageTool nie zgłasza błędów gramatycznych.
- Brak duplikatów i zdań zbyt podobnych.
- Wariant (`es-ES` / `es-419`) jest zgodny z formą.
- `source`, `license`, `verified` są wypełnione.

### 5.3. Workflow review

- Statusy: `pending`, `approved`, `rejected`.
- CLI lub prosty panel review (później).
- W produkcji: `approved` wszędzie; `pending` tylko z etykietą „niezweryfikowane” w trybie nauki, nigdy w egzaminie.
- Zgłaszanie błędów przez użytkownika trafia do kolejki.

### 5.4. Planowane komendy

```bash
pnpm data:ingest
pnpm data:validate
pnpm data:build
pnpm data:stats
pnpm test
pnpm lint
pnpm typecheck
```

---

## 6. Zakres gramatyczny

### 6.1. Priorytety

| Priorytet | Zakres |
|---|---|
| P0 (MVP) | Presente, pretérito indefinido, pretérito perfecto, pretérito imperfecto; 6 osób; indicativo; regularne i nieregularne; zwrotne; podstawowe specjalne. |
| P1 | Futuro simple, condicional simple, pluscuamperfecto, presente de subjuntivo, imperativo afirmativo i negatywny. |
| P2 | Pretérito anterior, futuro perfecto, condicional compuesto, imperfecto de subjuntivo, perfecto de subjuntivo, pluscuamperfecto de subjuntivo, futuro de subjuntivo (rzadkie), formy nieosobowe. |
| P3 | Strona bierna, konstrukcje progresywne, warianty dialektalne, voseo. |

### 6.2. Osoby i warianty

- 6 osób: yo, tú, él/ella/usted, nosotros/as, vosotros/as, ellos/ellas/ustedes.
- Domyślnie `es-ES` z `vosotros`; `es-419` z `ustedes` jako opcja.
- Formy `usted/ustedes` współdzielą formę z 3. osobą; UI pokazuje etykietę zbiorczą.

### 6.3. Czasowniki specjalne

- `ser`, `estar`, `ir`, `haber`, `tener`, `hacer`, `poder`, `decir`, `venir`, `poner`, `saber`, `querer`, `dar`, `ver`, `salir`, `traer`, `conducir`, `conocer`, `producir`, `oír`, `caer`, `valer`, `caber`.
- `gustar` i podobne (`encantar`, `doler`, `interesar`) — konstrukcja z zaimkiem dopełnienia, nie klasyczna odmiana „osobowa”.
- `llover`, `nevar` — bezosobowe, tylko 3. os. l. poj.
- `llamarse`, `levantarse`, `acostarse` — zwrotne; zaimki `me/te/se/nos/os/se`.
- `acabar con`, `depender de`, `tratar de` — phrasal verbs; odmienia się tylko czasownik główny.

### 6.4. Sprawdzanie odpowiedzi

- Normalizacja: lowercase, trim, pojedyncze spacje, interpunkcja.
- Tolerancja braku akcentów: opcjonalna, z ostrzeżeniem (nie jako pełna poprawność).
- Formy złożone: dokładny auxiliary + participio.
- Imperativo: ustalić zasady dla enklityk (`dime` vs `me di`), negacji (`no me digas`).
- Wiele poprawnych wariantów: lista akceptowanych odpowiedzi.
- Nie akceptować form z innego wariantu, jeśli użytkownik wybrał konkretny.

---

## 7. Tryby ćwiczeń

| Tryb | Opis | Uwagi |
|---|---|---|
| Forma | Bezokolicznik + czas + osoba → wpisz formę. | Bazowy tryb z prototypu. |
| Paradygmat | 6 osób po kolei lub cała tabela. | „Wpisywanie w każdej osobie”. |
| Cloze | Zdanie z luką → wpisz formę. | „Wpisywanie do przykładowego zdania”. |
| Kontekst | Krótkie naturalne zdanie; w razie potrzeby ukryj czas. | Tatoeba + LLM; bez szablonów. |
| Tłumaczenie | Zdanie PL → ES. | Akceptuj warianty; pokaż diff. |
| 6 osób (drill) | Opcjonalny drill z szablonami. | Jedyne dopuszczalne użycie szablonów; oznaczone jako ćwiczenie. |
| Egzamin | Ukryty czas i osoba; wnioskujesz z kontekstu. | Tylko `cueStrength: strong` i jednoznaczne zdania. |
| Powtórka błędów | Kolejka błędnych kart. | Jak w prototypie. |
| SRS | Karty due według FSRS. | Formy i zdania. |
| Słuchanie | Później: TTS / nagrania. | Poza MVP. |

### 7.1. UX

- Filtry: poziom, kategoria, czas, tylko nieregularne, wariant.
- Klawiatura znaków hiszpańskich (`á é í ó ú ñ`).
- Enter = sprawdź / następne; Pomiń.
- Feedback: poprawna forma, pełna odmiana, wyjaśnienie.
- Statystyki: poprawne, błędne, seria.
- Imię w localStorage (opcjonalne).
- Eksport/import postępu.
- Dark mode.
- Mobile-first.

---

## 8. Aplikacja Next.js

### 8.1. Routing

| Ścieżka | Funkcja |
|---|---|
| `/` | Start, wybór trybu, szybki dostęp do ustawień. |
| `/cwiczenia` | Sesja ćwiczeń. |
| `/czasowniki` | Przeglądarka czasowników, filtry. |
| `/czasowniki/[infinitive]` | Szczegóły, pełne tabele, zdania. |
| `/ustawienia` | Wariant, akcenty, motyw, eksport/import. |
| `/zrodla` | Źródła, licencje, atrybucja. |

### 8.2. Komponenty

Bazowe komponenty UI pochodzą z **shadcn/ui (Base UI)** i są kopiowane do `src/components/ui`. Komponenty domenowe (quiz, odmiana, postęp) trzymamy w `src/components`.

- `ExerciseCard`
- `AnswerInput`
- `SpanishKeyboard`
- `FeedbackBox`
- `FullParadigmTable`
- `FiltersPanel`
- `StatsBar`
- `MistakesBanner`
- `ThemeToggle`
- `ProgressExport`

### 8.3. Generowanie statyczne

- `generateStaticParams` dla `/czasowniki/[infinitive]`.
- JSON per czasownik ładowany lazy.
- Indeks i metadane w małym pliku.
- Cache w IndexedDB po pierwszym pobraniu.

### 8.4. PWA i offline

- Serwist: cache shell + danych.
- Instalacja na telefonie.
- Tryb offline dla pobranych czasowników.
- Brak sync w MVP; eksport/import ręczny.

### 8.5. Dostępność i wydajność

- Obsługa klawiatury, focus, ARIA.
- Kontrast, duże cele dotykowe.
- Code splitting, lazy data.
- Obrazy/fonty zoptymalizowane.

---

## 9. Hosting, domena, koszty

### 9.1. Hosting — opcje rozważane

**Decyzja: brak deploymentu na tym etapie.** Wracamy do tego po ustabilizowaniu MVP.

- **Netlify** — najbliżej Vercel: oficjalny adapter Next.js, preview per PR, production z `main`. Free plan pozwala na komercję (sprawdzić aktualne limity credits). **Główny kandydat.**
- **Cloudflare Pages** — darmowe, komercyjne dozwolone; świetne przy statycznym eksporcie (`output: 'export'`). Next.js SSR przez OpenNext jest bardziej złożony.
- **Railway** — ok. $5/mies., łatwy deploy, pełny Node/Next standalone, wolumeny i SQLite. Dobry, gdy pojawi się backend/sync.
- **Vercel Pro** — ~$20/mies., zero zmian; fallback, jeśli reklamy pokryją koszt.
- **Vercel Hobby** — tylko non-commercial; odpada przy reklamach.

**Baza danych:** na razie brak. Później rozważamy **Netlify Database** (managed Postgres, oparty na Neon), **Neon**, **Supabase** albo **Turso** (SQLite/libSQL). Netlify Database jest wygodny, ale działa na planach credit-based — sprawdzić cennik.

**Domena:** `pasovelo.com` (wolna wg DNS; potwierdzić WHOIS), z przekierowaniem z `pasovelo.pl` / `pasovelo.app`.

### 9.2. Koszty orientacyjne

| Pozycja | Koszt |
|---|---|
| Netlify Free / Cloudflare Pages | $0 (limity/credits) |
| Railway | ~$5/mies. |
| Vercel Pro (fallback) | ~$20/mies. |
| Domena | ~$10–15/rok |
| Analytics (opcjonalnie) | $0–10/mies. |
| LLM API (generacja zdań) | zależnie od modelu; jednorazowo |

### 9.3. CI/CD

**Teraz konfigurujemy tylko:**
- GitHub Actions: **code quality** — `typecheck`, `lint`, `format`, `build`.
- **PR title check** — commitlint na tytule PR.

**Później:**
- Testy (`Vitest`/`Playwright`) i walidacja danych w CI.
- Deploy preview / production — po wyborze hostingu.
- Promote/rollback/release — tylko jeśli będzie potrzebne.

---

## 10. Licencje i atrybucja

| Źródło | Licencja | Komercyjnie | Wymagania | Użycie |
|---|---|---|---|---|
| Wiktionary / kaikki.org | CC BY-SA | tak | atrybucja + share-alike | lematy, formy, tłumaczenia |
| FrequencyWords | CC BY-SA 4.0 (dane), MIT (kod) | tak | atrybucja + share-alike | częstotliwość |
| Tatoeba | CC BY 2.0 FR | tak | atrybucja (Tatoeba + autorzy) | zdania |
| UniMorph | sprawdzić dla hiszpańskiego | zależnie | zależnie | walidacja form |
| Jehle | CC BY-NC-SA 3.0 | **nie** | — | tylko wewnętrzny cross-check |
| OpenSubtitles / OPUS | atrybucja | tak | link do źródła | pośrednio przez FrequencyWords |
| LLM | regulamin dostawcy | zależnie | — | drafty zdań |
| CEFR (PCIC/DELE) | copyrighted | nie | — | tylko inspiracja, nie kopiowanie |

Zasady:

- Strona `/zrodla` z atrybucją i linkami.
- `data/LICENSE` dla wygenerowanego datasetu (CC BY-SA).
- Kod aplikacji może pozostać zamknięty; share-alike dotyczy danych.
- Nie scrapingować SpanishDict, Verbix, RAE.
- Przed włączeniem reklam: audyt licencji.
- Przechowywać `sourceId`, autora i licencję przy każdym zdaniu.

---

## 11. Plan wdrożenia

Czasy orientacyjne dla projektu solo, po godzinach. Mogą się zmienić.

### Faza 0 — Decyzje i setup (3–5 dni)

- Nazwa: **Pasovelo** — potwierdzić domeny (WHOIS) i sprawdzić znak towarowy (EUIPO/USPTO).
- Wybór domyślnego wariantu (`es-ES` / `es-419`).
- Potwierdzenie zakresu MVP (4 czasy, 300 czasowników).
- Scaffold Next.js + TS + Tailwind.
- Repo, CI: code quality + PR title check; lint, typecheck.
- Brak deploymentu na tym etapie.
- Szkic UI na podstawie prototypu.

**Done when:** repo się buduje, CI zielone, decyzje zapisane.

### Faza 1 — Pipeline danych (2–3 tygodnie)

- Ingest Wiktionary/kaikki.
- Ingest FrequencyWords + lematyzacja.
- Model danych + Zod.
- Generowanie form dla 4 czasów.
- Walidacja i testy integralności.
- 50–300 czasowników w JSON.
- Poziomy CEFR (przybliżone).
- Strona `/zrodla` i licencje.

**Done when:** 300 czasowników × 4 czasy × 6 osób przechodzi walidację; testy zielone.

### Faza 2 — MVP aplikacji (2–3 tygodnie)

- Port UI z prototypu.
- Inicjalizacja shadcn/ui (Base UI), motyw i pierwsze komponenty bazowe.
- Tryb Forma + Paradygmat.
- Filtry, statystyki, klawiatura hiszpańska.
- localStorage + eksport/import.
- FSRS.
- Widok pełnej odmiany.
- Testy E2E.

**Done when:** można ćwiczyć 300 czasowników w 4 czasach; postęp przetrwa odświeżenie.

### Faza 3 — Zdania i kontekst (2–4 tygodnie)

- Ekstraktor Tatoeba + parowanie PL.
- Walidator zdań.
- LLM dla luk + review.
- Tryby Cloze, Kontekst, Egzamin.
- Kolejka błędów.
- Oznaczanie `verified`.

**Done when:** top 100 czasowników ma zweryfikowane zdania w 4 czasach; tryb egzaminacyjny działa.

### Faza 4 — Pełna gramatyka (3–4 tygodnie)

- Wszystkie czasy indicativo.
- Subjuntivo.
- Imperativo.
- Formy złożone i nieosobowe.
- Więcej czasowników (600–1000).
- Wariant `es-419`.
- Obsługa specjalnych konstrukcji.

**Done when:** pełne paradygmaty dla wybranej listy czasowników; walidacja kompletna.

### Faza 5 — Dopracowanie i launch (1–2 tygodnie)

- PWA/offline.
- Wydajność i dostępność.
- SEO, metadata, sitemap.
- Analytics (opcjonalnie).
- Formularz zgłaszania błędów.
- Domena, wybór hostingu i deploy produkcyjny (po decyzji).
- Testy na telefonie.

**Done when:** aplikacja publicznie dostępna, stabilna, zgodna z licencjami.

### Faza 6 — Po MVP (ciągłe)

- Rzeczowniki i przymiotniki.
- Konta i sync (Turso/Neon + Auth.js).
- Reklamy lub płatności (jeśli w ogóle).
- Słuchanie i wymowa.
- Więcej języków.

---

## 12. Testy i jakość

### 12.1. Testy danych

- Komplet form dla każdego czasownika i czasu.
- Brak duplikatów.
- Poprawność akcentów.
- Porównanie z źródłem / UniMorph.
- Spójność `features`.
- Zdania: odpowiedź zgodna z tabelą, jeden blank, osoba, tłumaczenie, cue.
- Brak danych NC w produkcyjnym datasecie.

### 12.2. Testy jednostkowe

- Normalizacja odpowiedzi.
- Tolerancja akcentów.
- Sprawdzanie form złożonych i zwrotnych.
- FSRS.
- Eksport/import postępu.

### 12.3. E2E

- Sesja ćwiczeń: poprawna, błędna, pominięta.
- Filtry i pula.
- Trwałość postępu po reload.
- Tryb egzaminacyjny.
- Mobile viewport.

### 12.4. CI

Teraz:
```bash
pnpm typecheck
pnpm lint
pnpm format
pnpm test
pnpm build
```

Później:
```bash
pnpm data:validate
```

---

## 13. Ryzyka i mitygacje

| Ryzyko | Wpływ | Mitygacja |
|---|---|---|
| Błędy w odmianach | wysokie | precomputowane dane, walidacja, testy, review |
| Halucynacje LLM w zdaniach | wysokie | walidator, LanguageTool, review, `verified` |
| Słabe pokrycie Tatoeba | średnie | LLM/manualne luki, priorytet top 100 |
| Niezgodność licencji | wysokie | tylko CC BY/SA, atrybucja, audyt przed reklamami |
| Kolizja nazwy | średnie | zmiana nazwy, sprawdzenie EUIPO/USPTO, domeny |
| Limity hostingu | średnie | Netlify/Cloudflare/Railway; Vercel Pro tylko jako fallback |
| Scope creep | wysokie | sztywne MVP, fazy, lista „poza MVP” |
| Wydajność danych | średnie | podział per czasownik, lazy load, IndexedDB |
| Utrata postępu (localStorage) | średnie | eksport/import, IndexedDB, później konta |
| Warianty hiszpańskiego | średnie | ustawienie wariantu, osobne formy/zadania |
| Wprowadzanie akcentów | niskie | klawiatura, tolerancja z ostrzeżeniem |

---

## 14. Otwarte decyzje

1. **Nazwa:** **Pasovelo** — wybrana; szczegóły i historia w 14.1.
2. **Wariant domyślny:** `es-ES` czy `es-419`?
3. **Zakres MVP:** 4 czasy i 300 czasowników czy więcej?
4. **Drill 6 osób:** czy zostawiamy opcjonalne szablony, czy całkowicie rezygnujemy?
5. **Hosting/monetyzacja:** Netlify vs Cloudflare Pages vs Railway; reklamy/donacje. Decyzja odroczona — brak deploymentu teraz.
6. **Poziomy:** czy zostawiamy przybliżone CEFR, czy dodajemy własne kategorie?
7. **Tłumaczenia:** tylko PL, czy też EN?
8. **Branding:** nazwa, logo, ton komunikacji.

### 14.1. Historia decyzji o nazwie

- **Lemma** — odrzucone: kolizje z lemma.my (AI vocabulary coach), Lemma Ordbogen (słownik w App Store/Google Play), trylemma.io (AI language app), Lemma (YC). „Lemma” samo jest pospolitym terminem i słabą marką.
- **Mnemo** — odrzucone: domeny `mnemo.com`, `mnemo.app`, `mnemo.io`, `mnemo.pl`, `mnemo.es`, `mnemo.study`, `getmnemo.com` są zajęte; istnieją mnemo.one (study app z FSRS), mnemo.matjay.me (Anki + zdania do nauki języków), Mnemo: Voice to Text, trymnemo.net; aktywne zgłoszenia MNEMO w USPTO.
- **Lemma Mneme** — połączenie dwóch zajętych/pospolitych słów; nie rekomendowane.
- **Pasovelo** — **wybrana**. Domeny `pasovelo.com`, `.pl`, `.app`, `.io`, `.es` wolne wg DNS (13.11.2026); brak dokładnej kolizji; jedynie podobne hiszpańskie „pasavoleo” przez „a”. Przed zakupem potwierdzić WHOIS, przed rejestracją marki sprawdzić EUIPO/USPTO.
- **Kierunek:** nazwa nie musi sugerować funkcji aplikacji; ma być unikalna i dobrze brzmieć.

---

## 15. Kryteria sukcesu

- 300 czasowników × 4 czasy × 6 osób z poprawnymi formami.
- Sesja działa płynnie na telefonie i desktopie.
- Postęp przetrwa odświeżenie i eksport/import.
- Zdania są naturalne i zweryfikowane; tryb egzaminacyjny nie ma niejednoznaczności.
- Aplikacja jest dostępna publicznie i szybka.
- Licencje i atrybucja są kompletne.
- Użytkownik (Ty) faktycznie uczy się z aplikacji i widzi postęp.

---

## 16. Następne kroki

1. Podjąć pozostałe decyzje z sekcji 14; nazwa **Pasovelo** jest zatwierdzona.
2. Zeskaflować repo Next.js + CI: code quality + PR title check.
3. Napisać pipeline na 20–50 czasownikach.
4. Port UI z prototypu.
5. Dodać FSRS i localStorage.
6. Uruchomić Tatoeba + walidację zdań.
7. Wybór hostingu i pierwszy deploy — później.

---

## Dodatek A — Słownik pojęć

- **Lemat** — podstawowa forma słowa, np. `hablar`.
- **Forma** — odmieniona postać, np. `hablo`.
- **Paradygmat** — pełny zestaw form dla osoby/czasu/trybu.
- **Cloze** — zdanie z luką do uzupełnienia.
- **FSRS** — algorytm powtórek oparty na pamięci.
- **SRS** — spaced repetition system.
- **Cue** — wskazówka czasu w zdaniu, np. `ayer`.
- **Phrasal verb** — czasownik z przyimkiem/partykułą, np. `acabar con`.

## Dodatek B — Źródła

- Wiktionary: https://www.wiktionary.org/
- kaikki.org (Spanish): https://kaikki.org/dictionary/Spanish/
- FrequencyWords: https://github.com/hermitdave/FrequencyWords
- Tatoeba: https://tatoeba.org/ i https://downloads.tatoeba.org/exports/
- UniMorph: https://unimorph.github.io/
- Jehle (tylko cross-check): https://github.com/ghidinelli/fred-jehle-spanish-verbs
- Vercel Hobby: https://vercel.com/docs/plans/hobby
- Vercel fair use: https://vercel.com/docs/limits/fair-use-guidelines
- Netlify: https://www.netlify.com/
- Netlify Database: https://docs.netlify.com/build/data-and-storage/netlify-database/
- Cloudflare Pages: https://pages.cloudflare.com/
- Railway: https://railway.com/
- Creative Commons: https://creativecommons.org/licenses/

## Dodatek C — Prototyp

Plik: `public/prototype.html` (serwowany pod `/prototype.html`; źródło: Downloads).

Co działa:

- 129 czasowników, 4 czasy, 6 osób.
- Filtry poziomu, kategorii, nieregularnych.
- Tolerancja akcentów.
- Kolejka błędów.
- Pełna tabela odmiany.
- Dark mode, klawiatura hiszpańska.
- Statystyki i seria.

Ograniczenia:

- Ręczny silnik odmiany z lukami (brak imperativo/subjuntivo, czasy złożone, część ortografii).
- Brak SRS.
- Brak naturalnych zdań.
- Brak zapisu postępu.
- Dane w jednym pliku HTML.

## Dodatek D — Przykładowy JSON

```json
{
  "id": "sent:conseguir:indefinido:1s:0001",
  "lemmaId": "verb:conseguir",
  "formId": "form:conseguir:indicativo:indefinido:1s",
  "mood": "indicativo",
  "tense": "indefinido",
  "person": 1,
  "number": "singular",
  "sentence": "Al final ayer ___ las entradas para el concierto.",
  "answer": "conseguí",
  "translationPl": "W końcu wczoraj zdobyłem bilety na koncert.",
  "translationSource": "human",
  "tenseCue": "ayer",
  "cueStrength": "strong",
  "source": "llm",
  "license": "own",
  "verified": true,
  "variant": "es-ES",
  "level": "B1",
  "tags": ["concierto", "entradas"]
}
```
