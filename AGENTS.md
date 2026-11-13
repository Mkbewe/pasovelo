# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Pasovelo — Next.js 16 App Router + TypeScript + Tailwind CSS 4. Package manager: pnpm.
See `README.md` and `docs/PLAN.md` for architecture and roadmap.

## Commands

- `pnpm check:all` — typecheck, ESLint and Prettier; run once before finishing work
- `pnpm test` — not configured yet; add Vitest when tests start
- Commits follow Conventional Commits; subject at most 72 characters
- Scope is optional; use a short area such as `ui`, `ci` or `docs` until issue numbers exist
- When the user asks for a commit message, answer with one message only: the Conventional Commits header and, when the change set is large, a body with bullet points
- Do not run `check:all` after every small edit; run Prettier/ESLint on touched files during work and the full check at the end

## Working agreement

Every change in the project requires the user's explicit confirmation before it is made. Do not edit files, commit, push, or modify GitHub issues/PRs without approval.

Commits, pushes and pull requests are always the user's job. Never run `git push` or `gh pr create` without an explicit instruction for that specific branch.

Tests are only updated or fixed once work on a task is finished — not after every small change while the task is still in progress.

## Next.js

- App Router lives in `src/app`; route files follow Next.js conventions (`page.tsx`, `layout.tsx`, `route.ts`).
- Use `'use client'` only for components that need browser state, effects or localStorage. Keep server components as the default.
- Import alias `@/*` maps to `src/*`.
- Prefer server components for static content; use client components for the interactive quiz and progress.
- Content is static JSON in the MVP; no runtime database.
- Styling uses Tailwind CSS 4. Avoid ad-hoc CSS unless there is a clear need.

## Components

- One public component per file; colocate tests next to the component when tests exist.
- Hooks live in `src/hooks`; non-component logic and types live in `src/lib`.
- Soft limit ~150 lines per component file; split by responsibility when it grows.
- Shared wrappers take `children`; do not add text props just to pass copy through a wrapper.

## Code style

- Nested ternary expressions are forbidden; use `if`/`else` or a small helper.
- Avoid non-null assertions (`!`); narrow values with explicit guards.
- Do not silence a wrong type with `as`. A cast is allowed only at a real boundary (parsed JSON, external data) and must sit next to a type guard.
- Do not add a second algorithm that repairs the first. Fix the contract or replace the algorithm.
- Do not branch on a variant name when the variant should carry the behavior. Extend the variant instead.
- User-facing copy is Polish for now; centralize strings when i18n is introduced.

## GitHub

- Repository: `Mkbewe/pasovelo`
- `gh` is installed and authenticated as `Mkbewe`.
- Issue titles, descriptions and repository documentation default to English; use another language only when the user specifies it.
- Commits, pushes and pull requests are the user's job.
