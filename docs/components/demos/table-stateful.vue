<script setup lang="ts">
import { ref } from 'vue'
import {
  FilterMatchMode,
  Input,
  Table,
  TableColumn,
  Text,
  type TableFilters,
} from 'kablui'

const rows = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  role: i % 2 === 0 ? 'Engineer' : 'Designer',
  country: i % 3 === 0 ? 'UK' : 'US',
}))

const filters = ref<TableFilters>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const page = ref(1)
const sortField = ref<string | null>(null)
const sortOrder = ref<1 | -1 | 0 | null>(null)
const selection = ref<(typeof rows)[number] | null>(null)
const hiddenColumns = ref<string[]>([])

function onGlobalInput(value: string) {
  filters.value = {
    ...filters.value,
    global: {
      value: value === '' ? null : value,
      matchMode: FilterMatchMode.CONTAINS,
    },
  }
}
</script>

<template>
  <Table
    v-model:filters="filters"
    v-model:page="page"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:selection="selection"
    v-model:hidden-columns="hiddenColumns"
    :value="rows"
    data-key="id"
    selection-mode="single"
    paginate
    :rows="5"
    state-key="kablui-demo-table-state"
    state-storage="session"
    :global-filter-fields="['name', 'role', 'country']"
  >
    <template #header>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Text size="sm" tone="muted">
          Change page, sort, filter, or selection — reload the page and state is restored
          (session storage).
        </Text>
        <Input
          :model-value="String(filters.global?.value ?? '')"
          placeholder="Search…"
          size="sm"
          data-testid="table-stateful-global-filter"
          @update:model-value="onGlobalInput"
        />
      </div>
    </template>
    <TableColumn field="name" header="Name" sortable />
    <TableColumn field="role" header="Role" sortable />
    <TableColumn field="country" header="Country" sortable />
  </Table>
</template>
