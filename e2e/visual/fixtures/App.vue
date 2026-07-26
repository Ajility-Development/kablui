<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  Alert,
  Button,
  Dialog,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from '../../../src'

const route = ref(window.location.hash.replace(/^#\/?/, '') || 'button')

function syncRoute() {
  route.value = window.location.hash.replace(/^#\/?/, '') || 'button'
}

onMounted(() => {
  window.addEventListener('hashchange', syncRoute)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', syncRoute)
})

const view = computed(() => route.value)
</script>

<template>
  <div class="min-h-screen bg-kablui-bg text-kablui-fg">
    <!-- Button variants row -->
    <div
      v-if="view === 'button'"
      class="fixture-pad"
      data-testid="button-variants"
    >
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="solid">Solid</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button size="sm">sm</Button>
        <Button size="lg">lg</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>

    <!-- Alert tones -->
    <div
      v-else-if="view === 'alert'"
      class="fixture-pad space-y-3"
      data-testid="alert-tones"
    >
      <Alert tone="neutral" title="Neutral">Supporting message for neutral.</Alert>
      <Alert tone="accent" title="Accent">Supporting message for accent.</Alert>
      <Alert tone="success" title="Success">Supporting message for success.</Alert>
      <Alert tone="warning" title="Warning">Supporting message for warning.</Alert>
      <Alert tone="danger" title="Danger">Supporting message for danger.</Alert>
    </div>

    <!-- Open Dialog -->
    <div
      v-else-if="view === 'dialog'"
      class="fixture-pad"
      data-testid="dialog-page"
    >
      <Dialog :open="true" :dismissible="false">
        <template #title>Confirm action</template>
        <template #description>
          This dialog is locked open for a stable visual baseline.
        </template>
        Body content for the open dialog snapshot.
        <template #footer>
          <Button variant="ghost">Cancel</Button>
          <Button variant="solid">Confirm</Button>
        </template>
      </Dialog>

    </div>

    <!-- Field + Input invalid state -->
    <div
      v-else-if="view === 'field'"
      class="fixture-pad"
      data-testid="field-invalid"
    >
      <Field invalid id="email-invalid">
        <FieldLabel required>Email</FieldLabel>
        <Input model-value="not-an-email" type="email" placeholder="you@example.com" />
        <FieldError>Enter a valid email address.</FieldError>
      </Field>
    </div>

    <div v-else class="fixture-pad">
      Unknown fixture: {{ view }}
    </div>
  </div>
</template>
