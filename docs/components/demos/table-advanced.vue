<script setup lang="ts">
import { ref } from 'vue'
import {
  FilterMatchMode,
  Input,
  Table,
  TableColumn,
  Text,
  type TableCellEditCompleteEvent,
  type TableFilters,
} from 'kablui'

type Person = {
  id: number
  name: string
  role: string
  country: string
  score: number
}

const rows = ref<Person[]>(
  Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    name: [
      'Ada Lovelace',
      'Grace Hopper',
      'Alan Turing',
      'Katherine Johnson',
      'Margaret Hamilton',
      'Dorothy Vaughan',
    ][i % 6] + ` (${i + 1})`,
    role: i % 3 === 0 ? 'Engineer' : i % 3 === 1 ? 'Scientist' : 'Designer',
    country: i % 2 === 0 ? 'UK' : 'US',
    score: 70 + ((i * 7) % 30),
  })),
)

const filters = ref<TableFilters>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  role: { value: null, matchMode: FilterMatchMode.CONTAINS },
})
const page = ref(1)
const sortField = ref<string | null>('name')
const sortOrder = ref<1 | -1 | 0 | null>(1)
const selection = ref<Person[]>([])

function onGlobalInput(value: string) {
  filters.value = {
    ...filters.value,
    global: {
      value: value === '' ? null : value,
      matchMode: FilterMatchMode.CONTAINS,
    },
  }
}

function onCellEditComplete(event: TableCellEditCompleteEvent) {
  const data = event.data as Person
  const index = rows.value.findIndex((r) => r.id === data.id)
  if (index === -1 || !event.field) return
  const next = [...rows.value]
  next[index] = { ...next[index]!, [event.field]: event.newValue }
  rows.value = next
}
</script>

<template>
  <Table
    v-model:filters="filters"
    v-model:page="page"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:selection="selection"
    :value="rows"
    data-key="id"
    selection-mode="multiple"
    paginate
    :rows="5"
    filter-display="row"
    edit-mode="cell"
    striped
    show-gridlines
    :global-filter-fields="['name', 'role', 'country']"
    @cell-edit-complete="onCellEditComplete"
  >
    <template #header>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Text size="sm" tone="muted">
          Filter, sort, page, select, and click a name to edit.
        </Text>
        <Input
          :model-value="String(filters.global?.value ?? '')"
          placeholder="Search…"
          size="sm"
          data-testid="table-advanced-global-filter"
          @update:model-value="onGlobalInput"
        />
      </div>
    </template>
    <TableColumn selection-mode="multiple" header-style="width: 3rem" />
    <TableColumn field="name" header="Name" sortable>
      <template #editor="{ data, field }">
        <Input v-model="data[field]" size="sm" />
      </template>
    </TableColumn>
    <TableColumn field="role" header="Role" sortable filterable />
    <TableColumn field="country" header="Country" sortable />
    <TableColumn field="score" header="Score" sortable align="right" />
  </Table>
</template>
