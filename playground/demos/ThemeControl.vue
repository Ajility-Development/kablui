<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Button, Text } from '../../src'

export type ThemeMode = 'system' | 'light' | 'dark'

const mode = ref<ThemeMode>('system')

function applyTheme(next: ThemeMode) {
  const root = document.documentElement
  if (next === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', next)
  }
}

function setMode(next: ThemeMode) {
  mode.value = next
}

onMounted(() => {
  const existing = document.documentElement.getAttribute('data-theme')
  if (existing === 'light' || existing === 'dark') {
    mode.value = existing
  }
  applyTheme(mode.value)
})

watch(mode, applyTheme)
</script>

<template>
  <section class="space-y-3">
    <Text as="h2" size="lg" weight="semibold">Theme</Text>
    <Text tone="muted" size="sm">
      Sets <code class="text-kablui-fg">data-theme</code> on
      <code class="text-kablui-fg">&lt;html&gt;</code>. System removes the attribute
      so <code class="text-kablui-fg">prefers-color-scheme</code> applies.
    </Text>
    <div class="flex flex-wrap gap-2">
      <Button
        :variant="mode === 'system' ? 'solid' : 'outline'"
        size="sm"
        @click="setMode('system')"
      >
        System
      </Button>
      <Button
        :variant="mode === 'light' ? 'solid' : 'outline'"
        size="sm"
        @click="setMode('light')"
      >
        Light
      </Button>
      <Button
        :variant="mode === 'dark' ? 'solid' : 'outline'"
        size="sm"
        @click="setMode('dark')"
      >
        Dark
      </Button>
    </div>
  </section>
</template>
