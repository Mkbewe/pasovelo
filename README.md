# Pasovelo

A Spanish forms trainer — evolving from a prototype into a full app for learning verb conjugation and vocabulary.

## Status

Early stage. A working UI prototype is available at `/prototype.html`. The actual app (data, SRS, exercise modes) is under construction — see [`docs/PLAN.md`](docs/PLAN.md).

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- ESLint + Prettier
- Vitest + Testing Library
- pnpm

## Requirements

- Node.js 22+
- pnpm 10+

## Getting Started

```bash
pnpm install
pnpm dev
```

App: http://localhost:3000  
Prototype: http://localhost:3000/prototype.html

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with autofix |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm format` | Check formatting with Prettier |
| `pnpm format:fix` | Format files with Prettier |
| `pnpm test` | Run the Vitest suite once |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm task` | Create a branch from an issue on the Pasovelo board |
| `pnpm check:all` | typecheck + lint + format + test |

## Commit convention

Commits and PR titles follow Conventional Commits. Subjects start with a
lowercase letter; acronyms and module names keep their case.

## CI

GitHub Actions runs code quality checks and tests on pushes and pull requests to `main`, and validates PR titles against Conventional Commits.

## Project Structure

```
src/app/          # App Router
src/              # Components, hooks and shared logic as the app grows
public/           # Static assets, including prototype.html
scripts/          # Project tooling
docs/             # Project plan
```

## Documentation

- [`docs/PLAN.md`](docs/PLAN.md) — decisions, architecture, roadmap
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — confirmed and open project decisions
- [`public/prototype.html`](public/prototype.html) — UI prototype (served at `/prototype.html`)

## License

Private project. License TBD.
