<script setup lang="ts">
import { version, Text, Separator } from '../src'
import ThemeControl from './demos/ThemeControl.vue'
import TokenSamples from './demos/TokenSamples.vue'
import PrimitiveDemos from './demos/PrimitiveDemos.vue'
import FormDemos from './demos/FormDemos.vue'
</script>

<template>
  <main class="mx-auto max-w-3xl space-y-10 px-6 py-12">
    <header class="space-y-2">
      <Text as="h1" size="lg" weight="semibold">kablui playground</Text>
      <Text tone="muted" size="sm">
        Local proof for tokens, theming, primitives, and forms. Version {{ version }}.
      </Text>
    </header>

    <ThemeControl />
    <Separator />
    <TokenSamples />
    <Separator />
    <PrimitiveDemos id="primitives" />
    <Separator />
    <FormDemos id="forms" />
  </main>
</template>
