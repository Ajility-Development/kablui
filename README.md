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
  FieldLabel,
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
  Stack,
  Cluster,
  Container,
  Alert,
  Spinner,
  Progress,
  Skeleton,
  Empty,
  Dialog,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
  Toast,
  ToastProvider,
  useToast,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  Pagination,
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

## Documentation

Consumer docs live in [`docs/`](docs/) (VitePress), alongside the playground:

```bash
npm run docs:dev
npm run docs:build
npm run docs:preview
```

Start with [Getting started](docs/guides/getting-started.md). Deeper guides cover [theming](docs/guides/theming.md), [Tailwind composition](docs/guides/tailwind.md), and [tree-shaking](docs/guides/tree-shaking.md). Component API pages are under [`docs/components/`](docs/components/).

This README keeps install/usage short; use the docs site for full guidance.

## Development

```bash
npm install
npm run dev      # playground at http://localhost:5173
npm run docs:dev # VitePress docs
npm run build    # emit dist/ for publishing
npm run typecheck
npm test
```

Stack for local work: Vue 3, Vite (library mode), TypeScript, **Tailwind CSS v4** via `@tailwindcss/vite`. Docs: VitePress under `docs/`.

### Project layout

```
src/
  components/   # Vue SFCs + barrel export (use Tailwind utilities)
  styles/       # Tailwind entry (`index.css` → dist/kablui.css)
  index.ts      # package public API
playground/     # local app for developing components
docs/           # VitePress consumer documentation
```

Add a component under `src/components/`, export it from `src/components/index.ts`, style it with Tailwind classes, and try it in `playground/App.vue`. Library sources under `src/` are scanned for class names; the playground has its own CSS entry that also scans `playground/`.

## Development roadmap

Shipped phases that established the current library surface. Details live in component docs and the playground.

### 1. Foundations — done

- Design tokens (color, type, space, radius, elevation) in Tailwind `@theme` / CSS variables, with light/dark and consumer overrides.
- Component conventions: Composition API + `<script setup>`, Tailwind utilities, prop/event naming, slots, and public TypeScript types.
- Accessibility baselines (focus visibility, keyboard expectations, ARIA patterns) and CSS tree-shake via Tailwind content scanning + the Vite library build (`kablui/style.css`).
- Package API shape: named exports, style entry (`kablui/style.css`), and playground as the local source of truth.

### 2. Core primitives — done

- Visual building blocks (Button, Text, Icon, Link, Badge, Separator) with consistent variants and sizes expressed as Tailwind class maps.
- Token/theming proven end-to-end in the playground.

### 3. Forms & interactive controls — done

- Form controls (Input, Textarea, Checkbox, RadioGroup/Radio, Switch, Select) with `v-model`, disabled/invalid states, and Field labeling helpers (`FieldLabel`, `FieldHint`, `FieldError`).
- Keyboard behavior, focus management, and labeling aligned across controls.

### 4. Layout, overlays & feedback — done

- Layout helpers (Stack, Cluster, Container) and feedback surfaces (Alert, Spinner, Progress, Empty, Skeleton).
- Overlay patterns (Dialog, Popover, Tooltip, Toast, Menu) with focus traps, dismiss behavior, and stacking/portal rules.

### 5. Patterns — done

- Higher-level patterns (Card regions, Tabs, Accordion, Pagination) composed from primitives.
- Playground demos document recommended composition when a full component is not warranted.

### 6. Documentation & developer experience — done

- [x] VitePress site under [`docs/`](docs/) with consumer guides (install, theming, Tailwind composition, tree-shaking).
- [x] Component API pages (examples, props tables, accessibility) from SFCs + playground demos.
- [x] Public Props types exported for compound parts; TypeScript surfaces support editor autocomplete.

Run `npm run docs:dev` for the docs site; playground remains the live sandbox (`npm run dev`).

### 7. Hardening & release — done

- [x] Add unit/component tests for critical behavior and visual/regression coverage where it pays off; run automated a11y checks on key components.
- [x] Define versioning, changelog, and release process (semver, breaking-change policy)—see [`CHANGELOG.md`](CHANGELOG.md) and [Releasing](docs/guides/releasing.md).
- [x] Cut a first public release (`0.1.0`) once foundations, a useful primitive + form set, docs, and quality gates are in place—then iterate.

## Publish

Requires `npm login` (verify with `npm whoami`). Publish may still need 2FA (`--otp`) or a granular token with bypass 2FA—see [Releasing](docs/guides/releasing.md).

```bash
npm run build   # also runs via prepublishOnly
npm publish
```
