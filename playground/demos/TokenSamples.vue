<script setup lang="ts">
import { Text } from '../../src'

const colors = [
  { name: 'bg', className: 'bg-kablui-bg border border-kablui-border' },
  { name: 'fg', className: 'bg-kablui-fg' },
  { name: 'muted', className: 'bg-kablui-muted' },
  { name: 'muted-fg', className: 'bg-kablui-muted-fg' },
  { name: 'border', className: 'bg-kablui-border' },
  { name: 'border-strong', className: 'bg-kablui-border-strong' },
  { name: 'accent', className: 'bg-kablui-accent' },
  { name: 'accent-fg', className: 'bg-kablui-accent-fg border border-kablui-border' },
  { name: 'danger', className: 'bg-kablui-danger' },
  { name: 'danger-fg', className: 'bg-kablui-danger-fg border border-kablui-border' },
  { name: 'focus', className: 'bg-kablui-focus' },
] as const

const pairs = [
  {
    name: 'muted-fg on muted',
    className: 'bg-kablui-muted text-kablui-muted-fg',
  },
  {
    name: 'fg on muted (Badge)',
    className: 'bg-kablui-muted text-kablui-fg',
  },
  {
    name: 'accent-fg on accent',
    className: 'bg-kablui-accent text-kablui-accent-fg',
  },
  {
    name: 'danger-fg on danger',
    className: 'bg-kablui-danger text-kablui-danger-fg',
  },
] as const

const spaces = [
  { name: '1', className: 'w-1' },
  { name: '2', className: 'w-2' },
  { name: '3', className: 'w-3' },
  { name: '4', className: 'w-4' },
  { name: '6', className: 'w-6' },
  { name: '8', className: 'w-8' },
] as const

const radii = [
  { name: 'sm', className: 'rounded-kablui-sm' },
  { name: 'md', className: 'rounded-kablui-md' },
  { name: 'full', className: 'rounded-kablui-full' },
] as const

const shadows = [
  { name: 'sm', className: 'shadow-kablui-sm' },
] as const
</script>

<template>
  <section id="tokens" class="space-y-6">
    <div class="space-y-2">
      <Text as="h2" size="lg" weight="semibold">Tokens</Text>
      <Text tone="muted" size="sm">
        Semantic color / type / space samples. Toggle theme above to see mode reassignment.
      </Text>
    </div>

    <div class="space-y-2">
      <Text weight="medium">Color</Text>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="token in colors"
          :key="token.name"
          class="flex w-20 flex-col items-center gap-1"
        >
          <div :class="['h-10 w-10 rounded-kablui-md shadow-kablui-sm', token.className]" />
          <Text size="sm" tone="muted">{{ token.name }}</Text>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <Text weight="medium">Text on surface</Text>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="pair in pairs"
          :key="pair.name"
          :class="['rounded-kablui-md px-3 py-2 text-kablui-sm', pair.className]"
        >
          {{ pair.name }}
        </div>
        <div
          class="rounded-kablui-md bg-kablui-bg px-3 py-2 text-kablui-sm text-kablui-fg ring-2 ring-kablui-focus ring-offset-2 ring-offset-kablui-bg"
        >
          focus ring on bg
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <Text weight="medium">Type</Text>
      <div class="space-y-1">
        <Text size="sm">sm / normal — The quick brown fox</Text>
        <Text size="md" weight="medium">md / medium — The quick brown fox</Text>
        <Text size="lg" weight="semibold">lg / semibold — The quick brown fox</Text>
        <Text size="md" tone="muted">muted tone</Text>
        <Text size="md" tone="accent">accent tone</Text>
        <Text size="md" tone="danger">danger tone</Text>
      </div>
    </div>

    <div class="space-y-2">
      <Text weight="medium">Space</Text>
      <div class="flex flex-wrap items-end gap-3">
        <div
          v-for="space in spaces"
          :key="space.name"
          class="flex flex-col items-center gap-1"
        >
          <div :class="['h-4 bg-kablui-accent', space.className]" />
          <Text size="sm" tone="muted">{{ space.name }}</Text>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <Text weight="medium">Radius</Text>
      <div class="flex flex-wrap items-center gap-3">
        <div
          v-for="radius in radii"
          :key="radius.name"
          class="flex flex-col items-center gap-1"
        >
          <div
            :class="['h-10 w-10 bg-kablui-accent', radius.className]"
          />
          <Text size="sm" tone="muted">{{ radius.name }}</Text>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <Text weight="medium">Shadow</Text>
      <div class="flex flex-wrap items-center gap-3">
        <div
          v-for="shadow in shadows"
          :key="shadow.name"
          class="flex flex-col items-center gap-1"
        >
          <div
            :class="['h-10 w-10 rounded-kablui-md bg-kablui-bg border border-kablui-border', shadow.className]"
          />
          <Text size="sm" tone="muted">{{ shadow.name }}</Text>
        </div>
      </div>
    </div>
  </section>
</template>
