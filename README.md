# kablui

A UI component library for Vue 3.

## Requirements

- Vue `^3.5.0`
- Node.js 20+

## Install

```bash
npm install kablui
```

## Usage

```ts
import { createApp } from 'vue'
import App from './App.vue'
import 'kablui/style.css'

createApp(App).mount('#app')
```

Import components from the package root once they are published:

```ts
import { /* ComponentName */ } from 'kablui'
```

## Development

```bash
npm install
npm run dev      # playground at http://localhost:5173
npm run build    # emit dist/ for publishing
npm run typecheck
```

### Project layout

```
src/
  components/   # Vue SFCs + barrel export
  styles/       # shared CSS entry
  index.ts      # package public API
playground/     # local app for developing components
```

Add a component under `src/components/`, export it from `src/components/index.ts`, and try it in `playground/App.vue`.

## Publish

```bash
npm run build
npm publish
```
