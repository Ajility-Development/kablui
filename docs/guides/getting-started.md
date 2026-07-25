# Getting started

kablui is a Tailwind CSS–based UI component library for Vue 3. Components ship with a precompiled stylesheet published as `kablui/style.css`.

## Requirements

- Vue `^3.5.0`
- Node.js 20+

## Install

```bash
npm install kablui
```

## Import styles

Import the built stylesheet once in your app entry (or root layout):

```ts
import { createApp } from 'vue'
import App from './App.vue'
import 'kablui/style.css'

createApp(App).mount('#app')
```

## Import components

Import components from the package root (named exports):

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
  CardBody,
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

### Minimal example

```vue
<script setup lang="ts">
import { Button } from 'kablui'
</script>

<template>
  <Button>Save</Button>
</template>
```

## TypeScript / Volar

Use Vue 3 with [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (Take Over Mode recommended). Public components expose Props types through the package barrel for autocomplete and hover docs.

## Next steps

- [Theming](/guides/theming) — tokens, `data-theme`, CSS variable overrides
- [Tailwind composition](/guides/tailwind) — Preflight, `@source`, app Tailwind
- [Tree-shaking & imports](/guides/tree-shaking) — named exports and CSS side effects
- [Components](/components/) — API docs and examples
