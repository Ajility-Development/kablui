# Theming

kablui styles are driven by design tokens in `@theme` / CSS variables (see `src/styles/index.css`, published as `kablui/style.css`). You can re-skin the library by overriding those variables in your app—no forking of components required.

## Token layers

| Layer | Role | When to touch |
| --- | --- | --- |
| **Primitives** | Mode-stable palette steps (`--color-kablui-neutral-*`, `--color-kablui-accent-400`, etc.) | Brand color that should work in both light and dark |
| **Semantics** | Mode-aware roles (`--color-kablui-bg`, `--color-kablui-fg`, `--color-kablui-accent`, …) | Role-level tweaks; components use semantic utilities only (e.g. `bg-kablui-bg`, `text-kablui-fg`) |

Components should consume **semantic** utilities. Prefer overriding **primitive** steps when you want a brand accent that remains coherent across themes.

## Light and dark

- **Default:** `prefers-color-scheme` reassigns semantic variables under dark OS settings.
- **Forced theme:** set `data-theme="dark"` or `data-theme="light"` on `html`, `:root`, or `:host`.
- Forced **light** wins over OS dark.

```html
<html data-theme="dark">
  <!-- …
</html>
```

## Consumer overrides

Load your app CSS **after** `kablui/style.css` so overrides win.

### Brand via primitives (recommended for both modes)

```css
:root {
  --color-kablui-accent-400: oklch(0.65 0.2 30);
  --color-kablui-accent-500: oklch(0.52 0.22 30);
}
```

### Role-level semantics

Re-declare semantics inside each theme selector (`:root`, dark media, `[data-theme=…]`). Dark rules reassign semantic vars and will overwrite a lone `:root { --color-kablui-accent: … }` in dark mode if you only set light values.

```css
:root {
  --color-kablui-accent: var(--color-kablui-accent-500);
}

:root[data-theme='dark'] {
  --color-kablui-accent: var(--color-kablui-accent-400);
}
```

### Contrast

Keep accent / danger / success / warning foreground pairs at least **4.5:1** against their fills.

## Other tokens

Beyond color, `@theme` also defines type (`--font-kablui-sans`, `--text-kablui-*`), radius, elevation (`--shadow-kablui-*`), and z-index (`--z-kablui-*`). Override the same way when needed.

## Related

- [Tailwind composition](/guides/tailwind)
- [Getting started](/guides/getting-started)
