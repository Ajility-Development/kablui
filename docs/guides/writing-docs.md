# Writing docs

Conventions for component pages. Fill content in the existing `.md` files under `docs/components/` and `docs/guides/`.

## Page template

Every component page uses this section order:

1. **Overview** — one short paragraph; what it is and when to use it
2. **Usage / Examples** — live `<Demo>` blocks for interactive components (see below)
3. **Props / Models / Emits / Slots** — markdown tables from SFC `*Props`, `defineModel`, emits, slots
4. **Accessibility** — real ARIA/keyboard behavior from the SFC (do not invent requirements)
5. **Related** — links to sibling components or guides

## Live demos (`<Demo>`)

Interactive components (Forms, Overlays, and later Primitives / Layout / Feedback / Patterns) use a live preview with collapsible source. Preview and code come from the **same** demo SFC so they cannot drift.

### Markdown usage

From a component page under `docs/components/`:

```md
## Examples

### Basic

Short prose describing the scenario.

<Demo src="./demos/input-basic.vue" />

### Sizes

<Demo src="./demos/input-sizes.vue" title="Sizes" />
```

`Demo` is registered globally. Optional `title` renders above the preview chrome.

### Demo file convention

| Rule | Detail |
| --- | --- |
| Path | `docs/components/demos/<component>-<example>.vue` |
| Naming | e.g. `input-basic.vue`, `dialog-dismiss.vue`, `radio-group-invalid.vue` |
| Imports | Always `from 'kablui'` — never relative `../../src` or playground paths |
| Scope | One focused scenario per file; adapt from `playground/demos/`, do not mount whole playground sections |

### Static fences

Use fenced `vue` / `ts` blocks only for **non-rendered** snippets:

- App-root setup (e.g. documenting `ToastProvider` placement for consumers — docs already wrap the app)
- Composable-only or type-only examples
- Partial snippets that are not meant to mount as a full SFC

Do **not** keep a large static Usage fence for interactive UI when a live `<Demo>` covers the same ground.

### Infra notes (Agents B / C / later)

- Vite alias: `kablui` → repo `src` (configured in `docs/.vitepress/config.ts`).
- Theme wraps the docs app with `ToastProvider`, so Toast / `useToast` demos need no per-page provider.
- Library styles + Tailwind `@source` for `docs/components/demos/**` are wired in `docs/.vitepress/theme/custom.css`.
- Exclusive ownership: each agent edits only its component `.md` pages and matching `demos/<component>-*.vue` files. Do not edit `.vitepress/**` or this guide from content agents.

### Smoke check

Infra smoke demo (not a component page):

<Demo src="../components/demos/_smoke.vue" />

## Prop tables

Use markdown tables. Source columns from exported `*Props` types and the SFC—do not invent undocumented props. If a type is missing from the package barrel, note it for the TypeScript DX workstream rather than documenting a private API.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | Visual style |

## Compounds

One page per root pattern. Nested parts (e.g. `AccordionItem` / `Trigger` / `Content`) live on the root page (`accordion.md`), not separate files—unless a part has a distinct public API that warrants its own page.

## File naming

Kebab-case under `docs/components/`, matching the primary component (`button.md`, `radio-group.md`, `toast.md`).
