# Pasovelo

A Spanish forms trainer — evolving from a prototype into a full app for learning verb conjugation and vocabulary.

## Status

Early stage. A working UI prototype is available at `/prototype.html`. The actual app (data, SRS, exercise modes) is under construction — see [`docs/PLAN.md`](docs/PLAN.md).

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- ESLint + Prettier
- pnpm

## Requirements

- Node.js 20+
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
| `pnpm check:all` | typecheck + lint + format |

## Project Structure

```
src/app/          # App Router
public/           # Static assets, including prototype.html
docs/             # Project plan
```

## Documentation

- [`docs/PLAN.md`](docs/PLAN.md) — decisions, architecture, roadmap
- [`public/prototype.html`](public/prototype.html) — UI prototype (served at `/prototype.html`)

## License

Private project. License TBD.
