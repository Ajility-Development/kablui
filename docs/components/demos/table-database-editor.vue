<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Badge,
  Button,
  Cluster,
  FilterMatchMode,
  Input,
  Select,
  SelectItem,
  Table,
  TableColumn,
  Text,
  type TableFilters,
  type TableRowEditSaveEvent,
} from 'kablui'

type RecordRow = {
  id: number
  name: string
  status: 'active' | 'paused' | 'archived'
  owner: string
  notes: string
}

const seed: RecordRow[] = [
  {
    id: 1,
    name: 'Northwind sync',
    status: 'active',
    owner: 'Ada',
    notes: 'Nightly ETL',
  },
  {
    id: 2,
    name: 'Billing export',
    status: 'paused',
    owner: 'Grace',
    notes: 'Awaiting schema',
  },
  {
    id: 3,
    name: 'Audit trail',
    status: 'active',
    owner: 'Alan',
    notes: 'Immutable log',
  },
  {
    id: 4,
    name: 'Legacy archive',
    status: 'archived',
    owner: 'Katherine',
    notes: 'Read-only',
  },
  {
    id: 5,
    name: 'Feature flags',
    status: 'active',
    owner: 'Margaret',
    notes: 'Canary cohort',
  },
  {
    id: 6,
    name: 'Metrics rollup',
    status: 'paused',
    owner: 'Dorothy',
    notes: 'Cost cap',
  },
]

const rows = ref<RecordRow[]>(seed.map((r) => ({ ...r })))
const editingRows = ref<RecordRow[]>([])
const selection = ref<RecordRow[]>([])
const page = ref(1)
const sortField = ref<string | null>('name')
const sortOrder = ref<1 | -1 | 0 | null>(1)
const filters = ref<TableFilters>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
})

const statusTone = {
  active: 'success',
  paused: 'warning',
  archived: 'neutral',
} as const

const selectedCount = computed(() => selection.value.length)

function onGlobalInput(value: string) {
  filters.value = {
    ...filters.value,
    global: {
      value: value === '' ? null : value,
      matchMode: FilterMatchMode.CONTAINS,
    },
  }
}

function onStatusFilter(value: string) {
  filters.value = {
    ...filters.value,
    status: {
      value: value === '' || value === 'all' ? null : value,
      matchMode: FilterMatchMode.EQUALS,
    },
  }
}

const statusFilterModel = computed({
  get: () => {
    const v = filters.value.status
    if (!v || !('value' in v) || v.value == null || v.value === '') return 'all'
    return String(v.value)
  },
  set: (value: string) => onStatusFilter(value),
})

function onRowEditSave(event: TableRowEditSaveEvent) {
  const data = event.data as RecordRow
  const index = rows.value.findIndex((r) => r.id === data.id)
  if (index === -1) return
  const next = [...rows.value]
  next[index] = event.newData as RecordRow
  rows.value = next
}

function archiveSelected() {
  const ids = new Set(selection.value.map((r) => r.id))
  rows.value = rows.value.map((r) =>
    ids.has(r.id) ? { ...r, status: 'archived' as const } : r,
  )
  selection.value = []
}
</script>

<template>
  <Table
    v-model:filters="filters"
    v-model:page="page"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:selection="selection"
    v-model:editing-rows="editingRows"
    :value="rows"
    data-key="id"
    selection-mode="multiple"
    paginate
    :rows="4"
    filter-display="menu"
    edit-mode="row"
    striped
    :global-filter-fields="['name', 'owner', 'notes']"
    @row-edit-save="onRowEditSave"
  >
    <template #header>
      <div class="flex flex-col gap-3">
        <Cluster gap="sm" class="items-center justify-between">
          <Text size="sm" tone="muted">
            Database-style editor: search, status filter, row edit, bulk archive.
          </Text>
          <Button
            size="sm"
            variant="outline"
            :disabled="selectedCount === 0"
            data-testid="table-db-archive"
            @click="archiveSelected"
          >
            Archive selected ({{ selectedCount }})
          </Button>
        </Cluster>
        <Cluster gap="sm" class="items-center">
          <Input
            :model-value="String(filters.global?.value ?? '')"
            placeholder="Search name, owner, notes…"
            size="sm"
            class="min-w-[12rem] flex-1"
            data-testid="table-db-global-filter"
            @update:model-value="onGlobalInput"
          />
          <Select
            v-model="statusFilterModel"
            placeholder="Status"
            size="sm"
            data-testid="table-db-status-filter"
          >
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </Select>
        </Cluster>
      </div>
    </template>

    <TableColumn selection-mode="multiple" header-style="width: 3rem" />
    <TableColumn field="name" header="Name" sortable>
      <template #editor="{ data, field }">
        <Input v-model="data[field]" size="sm" />
      </template>
    </TableColumn>
    <TableColumn field="status" header="Status" sortable>
      <template #body="{ data }">
        <Badge :tone="statusTone[data.status]" size="sm">
          {{ data.status }}
        </Badge>
      </template>
      <template #editor="{ data, field }">
        <Select v-model="data[field]" size="sm">
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </Select>
      </template>
    </TableColumn>
    <TableColumn field="owner" header="Owner" sortable>
      <template #editor="{ data, field }">
        <Input v-model="data[field]" size="sm" />
      </template>
    </TableColumn>
    <TableColumn field="notes" header="Notes">
      <template #editor="{ data, field }">
        <Input v-model="data[field]" size="sm" />
      </template>
    </TableColumn>
    <TableColumn row-editor header-style="width: 6rem" body-style="text-align: center" />
  </Table>
</template>
