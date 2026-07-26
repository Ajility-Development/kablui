<script setup lang="ts">
import { ref } from 'vue'
import {
  Alert,
  Badge,
  Button,
  Empty,
  Icon,
  Progress,
  Skeleton,
  Spinner,
  Stack,
  Text,
  useToast,
} from '../../src'

const alertVisible = ref(true)
const progress = ref(42)
const itemCreated = ref(false)
const { toast } = useToast()

function createItem() {
  itemCreated.value = true
  toast({
    tone: 'success',
    title: 'Item created',
    description: 'Empty state is hidden while content exists.',
  })
}
</script>

<template>
  <section id="feedback" class="space-y-8">
    <div class="space-y-2">
      <Text as="h2" size="lg" weight="semibold">Feedback</Text>
      <Text tone="muted" size="sm">
        Alert tones, Spinner, Progress, Skeleton placeholders, and Empty state.
      </Text>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Alert</Text>
      <Stack gap="sm">
        <Alert tone="neutral" title="Neutral">Supporting copy for a status message.</Alert>
        <Alert tone="accent" title="Accent">Highlight something noteworthy.</Alert>
        <Alert tone="success" title="Success">Changes saved.</Alert>
        <Alert tone="warning" title="Warning">Review before continuing.</Alert>
        <Alert tone="danger" title="Danger">Something went wrong.</Alert>
        <Alert
          v-if="alertVisible"
          tone="neutral"
          title="Dismissible"
          dismissible
          @dismiss="alertVisible = false"
        >
          Click × to hide this alert.
        </Alert>
        <Button v-else size="sm" variant="outline" @click="alertVisible = true">
          Show dismissible alert
        </Button>
      </Stack>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Badge tones</Text>
      <div class="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">Neutral</Badge>
        <Badge tone="accent">Accent</Badge>
        <Badge tone="success">Success</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="danger">Danger</Badge>
      </div>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Spinner</Text>
      <div class="flex flex-wrap items-center gap-4 text-kablui-fg">
        <Spinner size="sm" label="Loading small" />
        <Spinner size="md" label="Loading" />
        <Spinner size="lg" label="Loading large" />
      </div>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Progress</Text>
      <Stack gap="sm" class="max-w-md">
        <Progress :value="progress" :caption="`${progress}% complete`" />
        <div class="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" @click="progress = Math.max(0, progress - 10)">
            −10
          </Button>
          <Button size="sm" variant="outline" @click="progress = Math.min(100, progress + 10)">
            +10
          </Button>
        </div>
        <Progress indeterminate caption="Working…" />
      </Stack>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Skeleton</Text>
      <div class="flex items-center gap-3">
        <Skeleton circle width="2.5rem" height="2.5rem" />
        <Stack gap="sm" class="flex-1">
          <Skeleton width="60%" height="0.875rem" />
          <Skeleton width="90%" height="0.875rem" />
        </Stack>
      </div>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Empty</Text>
      <div class="rounded-kablui-md border border-kablui-border">
        <Empty v-if="!itemCreated" title="No results">
          <template #icon>
            <Icon size="lg" label="Empty inbox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </Icon>
          </template>
          Try a different filter or create something new.
          <template #action>
            <Button size="sm" variant="outline" @click="createItem">Create item</Button>
          </template>
        </Empty>
        <div v-else class="space-y-3 p-4">
          <Text weight="semibold">Created item</Text>
          <Text size="sm" tone="muted">Your first item is ready. Reset to see Empty again.</Text>
          <Button size="sm" variant="outline" @click="itemCreated = false">Reset empty</Button>
        </div>
      </div>
    </div>
  </section>
</template>
