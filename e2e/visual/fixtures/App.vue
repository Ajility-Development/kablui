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
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Pagination,
  Select,
  Switch,
  Table,
  TableColumn,
  Toast,
} from '../../../src'

const selectOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany', disabled: true },
]

const tableRows = [
  { id: 1, name: 'Ada Lovelace', role: 'Mathematician' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral' },
  { id: 3, name: 'Alan Turing', role: 'Scientist' },
]

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

    <!-- Switch on / off / disabled -->
    <div
      v-else-if="view === 'switch'"
      class="fixture-pad space-y-4"
      data-testid="switch-states"
    >
      <div class="flex items-center gap-3">
        <Switch :model-value="false" />
        <span>Off</span>
      </div>
      <div class="flex items-center gap-3">
        <Switch :model-value="true" />
        <span>On</span>
      </div>
      <div class="flex items-center gap-3">
        <Switch disabled :model-value="false" />
        <span>Disabled</span>
      </div>
    </div>

    <!-- Select (opened by the spec) -->
    <div
      v-else-if="view === 'select'"
      class="fixture-pad"
      data-testid="select-page"
    >
      <Select
        model-value="ca"
        placeholder="Select a country"
        :options="selectOptions"
        data-testid="select-open"
      />
    </div>

    <!-- Open Menu -->
    <div
      v-else-if="view === 'menu'"
      class="fixture-pad"
      data-testid="menu-page"
    >
      <Menu :open="true">
        <MenuTrigger>Actions</MenuTrigger>
        <MenuContent>
          <MenuItem>Edit</MenuItem>
          <MenuItem>Duplicate</MenuItem>
          <MenuSeparator />
          <MenuItem disabled>Archive</MenuItem>
          <MenuItem>Delete</MenuItem>
        </MenuContent>
      </Menu>
    </div>

    <!-- Toast tones (presentational) -->
    <div
      v-else-if="view === 'toast'"
      class="fixture-pad space-y-3"
      data-testid="toast-tones"
    >
      <Toast tone="neutral" title="Neutral" description="Supporting message for neutral." />
      <Toast tone="accent" title="Accent" description="Supporting message for accent." />
      <Toast tone="success" title="Success" description="Supporting message for success." />
      <Toast tone="warning" title="Warning" description="Supporting message for warning." />
      <Toast tone="danger" title="Danger" description="Supporting message for danger." />
    </div>

    <!-- Pagination mid-range with ellipsis -->
    <div
      v-else-if="view === 'pagination'"
      class="fixture-pad fixture-pad-wide"
      data-testid="pagination-range"
    >
      <Pagination :page="5" :page-count="12" />
    </div>

    <!-- Table smoke -->
    <div
      v-else-if="view === 'table'"
      class="fixture-pad fixture-pad-wide"
      data-testid="table-smoke"
    >
      <Table :value="tableRows" data-key="id">
        <TableColumn field="name" header="Name" />
        <TableColumn field="role" header="Role" />
      </Table>
    </div>

    <div v-else class="fixture-pad">
      Unknown fixture: {{ view }}
    </div>
  </div>
</template>
