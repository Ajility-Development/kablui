# Tree-shaking & imports

## Named exports

Import only what you use from the package root. The public API is named exports (components, composables, and types)—there is no default plugin install that registers everything globally.

```ts
import { Button, Dialog, useToast } from 'kablui'
```

Unused named imports are tree-shaken by modern bundlers when your app uses ESM.

## CSS and `sideEffects`

`package.json` marks CSS as side-effectful:

```json
"sideEffects": ["**/*.css"]
```

That tells bundlers not to drop stylesheet imports. Always import styles explicitly (or rely on the root entry’s style import—see below):

```ts
import 'kablui/style.css'
```

The style entry is published as `kablui/style.css` → `dist/kablui.css`.

## Root entry side-imports styles (current behavior)

The library’s root module (`src/index.ts`) currently side-imports the styles entry:

```ts
import './styles/index.css'
```

So importing anything from `kablui` may pull styles through that entry depending on how your bundler resolves the package build. **Documented recommendation for consumers:** still import `kablui/style.css` once in your app entry so styling does not depend on which JS modules you import or how the bundler splits chunks.

This phase does not change CSS bundling strategy. Prefer the explicit stylesheet import for predictable results.

## Types

Props and related types are re-exported from the package root for editor DX. Import types alongside components:

```ts
import { Button, type ButtonProps } from 'kablui'
```

## Related

- [Getting started](/guides/getting-started)
- [Tailwind composition](/guides/tailwind)
