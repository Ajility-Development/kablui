<script setup lang="ts">
import { ref } from 'vue'
import { Badge, Button, Icon, Link, Separator, Text } from '../../src'

const clickCount = ref(0)
const loading = ref(false)

function runLoadingDemo() {
  if (loading.value) return
  loading.value = true
  clickCount.value++
  window.setTimeout(() => {
    loading.value = false
  }, 1500)
}
</script>

<template>
  <section id="primitives" class="space-y-8">
    <div class="space-y-2">
      <Text as="h2" size="lg" weight="semibold">Primitives</Text>
      <Text tone="muted" size="sm">
        Interactive demos for shipped components. Variants/sizes are library props only.
      </Text>
    </div>

    <!-- A11y smoke -->
    <div class="space-y-2 rounded-kablui-md border border-kablui-border bg-kablui-muted/40 px-3 py-2">
      <Text as="h3" weight="semibold" size="sm">A11y smoke</Text>
      <Text size="sm" tone="muted">
        Tab through controls and confirm focus-visible rings (offset on bg). Disabled Button
        and Link are non-interactive; focus a solid Button to verify the ring sample.
      </Text>
      <div class="flex flex-wrap items-center gap-2 pt-1">
        <Button variant="solid" aria-label="Focus sample solid button">Focus me</Button>
        <Button disabled>Disabled Button</Button>
        <Link href="#forms" disabled>Disabled Link</Link>
        <Button variant="ghost" aria-label="Icon-only action">
          <Icon size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Icon>
        </Button>
      </div>
    </div>

    <!-- Button -->
    <div class="space-y-3">
      <Text as="h3" weight="semibold">Button</Text>
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="solid" @click="clickCount++">Solid</Button>
        <Button variant="outline" @click="clickCount++">Outline</Button>
        <Button variant="ghost" @click="clickCount++">Ghost</Button>
        <Button size="sm" @click="clickCount++">sm</Button>
        <Button size="lg" @click="clickCount++">lg</Button>
        <Button disabled>Disabled</Button>
        <Button variant="outline" :loading="loading" @click="runLoadingDemo">
          {{ loading ? 'Saving…' : 'Loading' }}
        </Button>
        <Button variant="outline" @click="clickCount++">
          <Icon size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Icon>
          With icon
        </Button>
        <Button variant="ghost" aria-label="Icon-only action" @click="clickCount++">
          <Icon size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </Icon>
        </Button>
      </div>
      <Text size="sm" tone="muted">Clicks: {{ clickCount }}</Text>
    </div>

    <Separator />

    <!-- Text -->
    <div class="space-y-3">
      <Text as="h3" weight="semibold">Text</Text>
      <Text as="h4" size="lg" weight="semibold">Heading via as="h4"</Text>
      <Text size="sm" tone="muted">Small muted supporting copy.</Text>
      <Text size="md" weight="medium" tone="accent">Medium accent label</Text>
      <Text as="span" size="sm" tone="danger">Inline danger span</Text>
    </div>

    <Separator />

    <!-- Link -->
    <div class="space-y-3">
      <Text as="h3" weight="semibold">Link</Text>
      <div class="flex flex-wrap items-center gap-4">
        <Link href="#primitives">Primitives</Link>
        <Link href="#forms">Forms</Link>
        <Link href="#overlays">Overlays</Link>
        <Link href="https://example.com" external>External</Link>
        <Link href="#layout" disabled>Disabled</Link>
      </div>
    </div>

    <Separator />

    <!-- Badge -->
    <div class="space-y-3">
      <Text as="h3" weight="semibold">Badge</Text>
      <div class="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">Neutral</Badge>
        <Badge tone="accent">Accent</Badge>
        <Badge tone="success">Success</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="danger">Danger</Badge>
        <Badge size="sm" tone="accent">sm accent</Badge>
      </div>
    </div>

    <Separator />

    <!-- Separator -->
    <div class="space-y-3">
      <Text as="h3" weight="semibold">Separator</Text>
      <Text size="sm" tone="muted">Horizontal (default decorative)</Text>
      <Separator />
      <Text size="sm" tone="muted">Vertical + semantic (decorative=false)</Text>
      <div class="flex h-8 items-center gap-3">
        <Text size="sm">Left</Text>
        <Separator orientation="vertical" :decorative="false" class="self-stretch" />
        <Text size="sm">Right</Text>
      </div>
    </div>

    <Separator />

    <!-- Icon -->
    <div class="space-y-3">
      <Text as="h3" weight="semibold">Icon</Text>
      <Text size="sm" tone="muted">Slotted SVG only — no icon package.</Text>
      <div class="flex flex-wrap items-center gap-4 text-kablui-fg">
        <Icon size="sm" label="Check small">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </Icon>
        <Icon size="md" label="Check medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </Icon>
        <Icon size="lg" label="Check large">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </Icon>
        <span class="flex flex-col items-center gap-1 text-kablui-accent">
          <Icon size="md" title="Accent currentColor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l2.5 2.5" />
            </svg>
          </Icon>
          <Text size="sm" tone="muted">title = tooltip only (decorative)</Text>
        </span>
        <span class="flex flex-col items-center gap-1">
          <Icon size="md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Icon>
          <Text size="sm" tone="muted">decorative (no label/title)</Text>
        </span>
      </div>
    </div>
  </section>
</template>
