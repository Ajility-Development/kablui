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
  Table,
  TableColumn,
  TableColumnGroup,
  TableHeaderRow,
  exportTableCsv,
  FilterMatchMode,
  FilterOperator,
} from 'kablui'
```

Table also exports helpers and types such as `downloadCsv`, `TableFilters`, `TableSortMeta`, `TableSelectionValue`, `TableRowSelectEvent`, and `TablePersistedState`.

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
npm run docs:dev     # http://localhost:5174
npm run docs:build
npm run docs:preview
```

Start with [Getting started](docs/guides/getting-started.md). Deeper guides cover [theming](docs/guides/theming.md), [Tailwind composition](docs/guides/tailwind.md), and [tree-shaking](docs/guides/tree-shaking.md). Component API pages are under [`docs/components/`](docs/components/).

This README keeps install/usage short; use the docs site for full guidance.

## Development

```bash
npm install
npm run dev      # playground at http://localhost:5173
npm run docs:dev # VitePress docs at http://localhost:5174
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

## Status

**0.2.0** has shipped. Ongoing work is iterative (fixes, polish, new components). See [`CHANGELOG.md`](CHANGELOG.md) for release history.

## Publish

Normal releases use GitHub Actions with an npm Trusted Publisher under **Ajility Technologies** (OIDC; no `NPM_TOKEN`). The workflow binds to GitHub repo `ajility/kablui` and `.github/workflows/release.yml`—see [Releasing](docs/guides/releasing.md). Manual `npm publish` is emergency-only (login + OTP).

```bash
npm run build   # also runs via prepublishOnly
npm publish     # emergency fallback only
```

