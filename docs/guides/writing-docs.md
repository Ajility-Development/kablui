# Writing docs

Conventions for component pages. Fill content in the existing `.md` files under `docs/components/` and `docs/guides/`.

## Page template

Every component page uses this section order:

1. **Overview** — one short paragraph; what it is and when to use it
2. **Usage** — copy-paste Vue example(s)
3. **Props / Models / Emits / Slots** — markdown tables from SFC `*Props`, `defineModel`, emits, slots
4. **Accessibility** — real ARIA/keyboard behavior from the SFC (do not invent requirements)
5. **Related** — links to sibling components or guides

## Examples

- Import from **`kablui`**, never `../../src` or playground paths.
- Prefer static fenced `vue` (or `ts`) blocks. Interactive VitePress demos only when a static fence is not enough.
- Adapt playground demos; do not copy live demo SFCs into the docs app unless needed.

```vue
<script setup lang="ts">
import { Button } from 'kablui'
</script>

<template>
  <Button variant="solid">Save</Button>
</template>
```

`Button` `variant` values are `'solid' | 'outline' | 'ghost'` only (not `primary` / `secondary`).

## Prop tables

Use markdown tables. Source columns from exported `*Props` types and the SFC—do not invent undocumented props. If a type is missing from the package barrel, note it for the TypeScript DX workstream rather than documenting a private API.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | Visual style |

## Compounds

One page per root pattern. Nested parts (e.g. `AccordionItem` / `Trigger` / `Content`) live on the root page (`accordion.md`), not separate files—unless a part has a distinct public API that warrants its own page.

## File naming

Kebab-case under `docs/components/`, matching the primary component (`button.md`, `radio-group.md`, `toast.md`).
