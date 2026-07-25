# kablui

A Tailwind CSS–based UI component library for Vue 3.

Components are authored with Tailwind utility classes. The library builds a
precompiled stylesheet for those classes and publishes it as `kablui/style.css`.

## Requirements

- Vue `^3.5.0`
- Node.js 20+

## Install

```bash
npm install kablui
```

## Usage

Import the built stylesheet once in your app entry (or root layout):

```ts
import { createApp } from 'vue'
import App from './App.vue'
import 'kablui/style.css'

createApp(App).mount('#app')
```

Import components from the package root:

```ts
import {
  Button,
  Text,
  Icon,
  Link,
  Badge,
  Separator,
  Field,
  Label,
  FieldHint,
  FieldError,
  Input,
  Textarea,
  Checkbox,
  RadioGroup,
  Radio,
  Switch,
  Select,
  SelectItem,
} from 'kablui'
```

### Styling model

| Approach | When to use |
| --- | --- |
| **Import `kablui/style.css`** (recommended default) | You want kablui styles without configuring Tailwind yourself. The published CSS includes the utilities used by kablui components. |
| **Compose with your own Tailwind** | Your app already uses Tailwind v4. Keep importing `kablui/style.css` for component styles, **or** scan kablui for classes in your own CSS (see below). |

**If your app also uses Tailwind**

- Prefer a single Preflight/base reset. kablui’s stylesheet includes Tailwind’s base styles; if you also `@import "tailwindcss"`, you may see duplicate resets. Either rely on kablui’s CSS for base styles, or compile Tailwind yourself and treat kablui as a class source (advanced).
- To detect classes from kablui when you compile Tailwind in the consumer app, register the package as a source (paths relative to your CSS file):

```css
@import 'tailwindcss';
@source '../node_modules/kablui/dist';
```

Theme tokens live in `@theme static` / CSS variables in `src/styles/index.css` (and the published `kablui/style.css`). Override those variables in your app when you need to re-skin kablui without forking components.

## Development

```bash
npm install
npm run dev      # playground at http://localhost:5173
npm run build    # emit dist/ for publishing
npm run typecheck
npm test
```

Stack for local work: Vue 3, Vite (library mode), TypeScript, **Tailwind CSS v4** via `@tailwindcss/vite`.

### Project layout

```
src/
  components/   # Vue SFCs + barrel export (use Tailwind utilities)
  styles/       # Tailwind entry (`index.css` → dist/kablui.css)
  index.ts      # package public API
playground/     # local app for developing components
```

Add a component under `src/components/`, export it from `src/components/index.ts`, style it with Tailwind classes, and try it in `playground/App.vue`. Library sources under `src/` are scanned for class names; the playground has its own CSS entry that also scans `playground/`.

## Development roadmap

High-level phases for building kablui. Each phase should produce something usable before the next begins; details will be broken down later.

### 1. Foundations

- Establish design tokens (color, type, space, radius, elevation) in Tailwind `@theme` / CSS variables, with a theming model that supports light/dark and consumer overrides.
- Define component conventions: Composition API + `<script setup>`, Tailwind utilities for styling, prop/event naming, slots, `defineExpose`, and public TypeScript types.
- Set accessibility baselines (focus visibility, keyboard expectations, ARIA patterns) and keep CSS tree-shake friendly via Tailwind’s content scanning + the existing Vite library build (`kablui/style.css`).
- Lock package API shape: named exports, style entry (`kablui/style.css`), and playground usage as the local source of truth.

### 2. Core primitives

- Ship the smallest visual building blocks (e.g. Button, Text/Typography, Icon, Link, Badge, Separator) with consistent variants and sizes expressed as Tailwind class maps.
- Prove the token/theming system end-to-end in the playground; refine APIs before wider surface area grows.
- Prefer composable, single-responsibility components over early “kitchen sink” APIs.

### 3. Forms & interactive controls

- Add form-oriented controls (Input, Textarea, Checkbox, Radio, Switch, Select, and related labels/helpers) with clear `v-model` and disabled/invalid states.
- Align keyboard behavior, focus management, and labeling so controls are usable without mouse.
- Keep styling and behavior consistent with primitives so forms feel like one system, not a second library.

### 4. Layout, overlays & feedback

- Introduce layout helpers (stack/cluster/container-style primitives as needed) and feedback surfaces (Alert, Spinner/Progress, empty/skeleton states).
- Build overlay patterns (Dialog/Modal, Popover/Dropdown, Tooltip, Toast) with focus traps, dismiss behavior, and stacking/portal rules.
- Ensure overlays and feedback work with the token system and do not fight consumer app layout.

### 5. Composition & higher-level patterns

- Compose primitives into common product patterns (e.g. Card regions, Menu, Tabs, Accordion, Pagination) where reuse justifies a dedicated component.
- Document recommended composition recipes in the playground when a full component is not warranted.
- Resist scope creep: only promote patterns that show repeated need and stable APIs.

### 6. Documentation & developer experience

- Stand up component documentation (API tables, examples, accessibility notes) alongside the playground; keep examples copy-paste ready.
- Clarify install/usage, theming (CSS variables / `@theme`), Tailwind composition, and tree-shaking guidance for consumers.
- Tighten TypeScript surfaces and export ergonomics so autocompletion and editor DX feel first-class.

### 7. Hardening & release

- Add unit/component tests for critical behavior and visual/regression coverage where it pays off; run automated a11y checks on key components.
- Define versioning, changelog, and release process (semver, breaking-change policy) on top of the existing build/publish scripts.
- Cut a first public release once foundations, a useful primitive + form set, docs, and quality gates are in place—then iterate.

## Publish

```bash
npm run build
npm publish
```
