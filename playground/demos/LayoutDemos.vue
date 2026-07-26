<script setup lang="ts">
import { Badge, Cluster, Container, Stack, Text } from '../../src'
</script>

<template>
  <section id="layout" class="space-y-8">
    <div class="space-y-2">
      <Text as="h2" size="lg" weight="semibold">Layout</Text>
      <Text tone="muted" size="sm">
        Stack (vertical), Cluster (wrap), and Container (max-width) helpers.
      </Text>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Stack</Text>
      <Stack
        gap="sm"
        class="rounded-kablui-md border border-kablui-border bg-kablui-muted/40 p-3"
      >
        <Text size="sm">Item one</Text>
        <Text size="sm">Item two</Text>
        <Text size="sm">Item three</Text>
      </Stack>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Cluster</Text>
      <Cluster
        gap="sm"
        class="rounded-kablui-md border border-kablui-border bg-kablui-muted/40 p-3"
      >
        <Badge
          v-for="n in 8"
          :key="n"
          :tone="n % 3 === 0 ? 'accent' : 'neutral'"
          size="sm"
        >
          Item {{ n }}
        </Badge>
      </Cluster>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Container</Text>
      <div class="rounded-kablui-md border border-dashed border-kablui-border py-2">
        <Container size="sm" class="bg-kablui-muted/40 py-2">
          <Text size="sm">size="sm" — centered, padded max-width</Text>
        </Container>
      </div>
    </div>
  </section>
</template>
