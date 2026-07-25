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
</script>

<template>
  <ToastProvider>
    <main class="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <header class="space-y-2">
        <Text as="h1" size="lg" weight="semibold">kablui playground</Text>
        <Text tone="muted" size="sm">
          Local proof for tokens, theming, primitives, forms, layout, feedback, overlays, and
          composition. Version {{ version }}.
        </Text>
      </header>

      <ThemeControl />
      <Separator />
      <TokenSamples />
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
