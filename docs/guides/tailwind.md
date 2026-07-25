# Tailwind composition

kablui is authored with Tailwind utility classes. The library build emits a precompiled stylesheet with the utilities those components need. You can use that sheet alone or compose with an app that already runs Tailwind v4.

## Recommended default

Import `kablui/style.css` once. You get component styles (and Tailwind base styles included in that build) without configuring Tailwind yourself.

```ts
import 'kablui/style.css'
```

## When your app also uses Tailwind

| Concern | Guidance |
| --- | --- |
| **Preflight / base** | Prefer a **single** Preflight. kablui’s stylesheet includes Tailwind base styles. If you also `@import "tailwindcss"`, you may see duplicate resets. Either rely on kablui’s CSS for base, or compile Tailwind yourself and treat kablui as a class source (advanced). |
| **Component classes** | Keep importing `kablui/style.css` for the utilities used by kablui components, **or** scan the package when you compile Tailwind in the consumer app. |
| **Load order** | App CSS after `kablui/style.css` when you override tokens (see [Theming](/guides/theming)). |

### `@source` scanning (consumer Tailwind)

To detect classes from kablui when you compile Tailwind in the app, register the package as a source (paths relative to your CSS file):

```css
@import 'tailwindcss';
@source '../node_modules/kablui/dist';
```

## `kablui/style.css` vs app Tailwind

| Approach | Use when |
| --- | --- |
| **Import `kablui/style.css`** | You want kablui styles without owning a Tailwind pipeline for the library. |
| **Compose with app Tailwind** | Your app already uses Tailwind v4 and you want one toolchain; still import `kablui/style.css` **or** scan `kablui/dist` with `@source`. |

Theme tokens live in `@theme static` / CSS variables inside the published CSS. Override those variables rather than rewriting component class maps.

## Local development note

In this repo, library sources under `src/` are scanned for class names; the playground has its own CSS entry that also scans `playground/`. Consumers only need the published `kablui/style.css` (and optional `@source` of `dist`)—they do not need the playground setup.

## Related

- [Theming](/guides/theming)
- [Tree-shaking & imports](/guides/tree-shaking)
