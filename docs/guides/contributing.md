# Contributing

Thanks for helping improve kablui. This guide covers local setup, quality checks, and pull request expectations.

## Prerequisites

- Node.js 20+
- npm

## Clone and install

```bash
git clone https://github.com/ajility/kablui.git
cd kablui
npm install
```

## Local commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Playground at `http://localhost:5173` |
| `npm run docs:dev` | VitePress docs site |
| `npm run typecheck` | TypeScript check (`vue-tsc --noEmit`) |
| `npm test` | Unit / component tests (Vitest) |
| `npm run test:visual` | Visual regression checks (Playwright) |
| `npm run build` | Library build → `dist/` |

Prefer `npm test` and `npm run typecheck` before opening a PR. For UI or a11y-sensitive changes, also run `npm run test:visual` so screenshot regressions surface early.

Docs authors: see [Writing docs](./writing-docs.md). Release process: [Releasing](./releasing.md).

## Pull requests

- Keep the change focused; match existing component conventions (Composition API + `<script setup>`, Tailwind utilities, exported `*Props` types).
- Include a short description of **what** changed and **why**.
- Update docs or the changelog under `[Unreleased]` when the change affects consumers (API, behavior, or styles).
- Ensure `npm run typecheck` and `npm test` pass locally.
- Prefer small PRs over large mixed refactors.

## Accessibility and visual coverage

Automated a11y and visual checks live alongside the unit suite. Use:

```bash
npm test           # unit / component / a11y-oriented coverage as configured
npm run test:visual
```

Treat those commands as the local gates for UI work.
