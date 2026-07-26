<script setup lang="ts">
import { version, Text, Separator, ToastProvider } from '../src'
import ThemeControl from './demos/ThemeControl.vue'
import TokenSamples from './demos/TokenSamples.vue'
import PrimitiveDemos from './demos/PrimitiveDemos.vue'
import FormDemos from './demos/FormDemos.vue'
import LayoutDemos from './demos/LayoutDemos.vue'
import FeedbackDemos from './demos/FeedbackDemos.vue'
import OverlayDemos from './demos/OverlayDemos.vue'
import CompositionDemos from './demos/CompositionDemos.vue'

const nav = [
  { href: '#theme', label: 'Theme' },
  { href: '#tokens', label: 'Tokens' },
  { href: '#primitives', label: 'Primitives' },
  { href: '#forms', label: 'Forms' },
  { href: '#layout', label: 'Layout' },
  { href: '#feedback', label: 'Feedback' },
  { href: '#overlays', label: 'Overlays' },
  { href: '#composition', label: 'Patterns' },
] as const
</script>

<template>
  <ToastProvider>
    <main class="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <header class="space-y-3">
        <Text as="h1" size="lg" weight="semibold">kablui playground</Text>
        <Text tone="muted" size="sm">
          Local proof for tokens, theming, primitives, forms, layout, feedback, overlays, and
          patterns. Version {{ version }}.
        </Text>
        <nav aria-label="Playground sections" class="flex flex-wrap gap-x-3 gap-y-1">
          <a
            v-for="item in nav"
            :key="item.href"
            :href="item.href"
            class="text-kablui-sm text-kablui-accent underline-offset-2 hover:underline"
          >
            {{ item.label }}
          </a>
        </nav>
      </header>

      <ThemeControl id="theme" />
      <Separator />
      <TokenSamples id="tokens" />
      <Separator />
      <PrimitiveDemos id="primitives" />
      <Separator />
      <FormDemos id="forms" />
      <Separator />
      <LayoutDemos id="layout" />
      <Separator />
      <FeedbackDemos id="feedback" />
      <Separator />
      <OverlayDemos id="overlays" />
      <Separator />
      <CompositionDemos id="composition" />
    </main>
  </ToastProvider>
</template>
