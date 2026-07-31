<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Checkbox,
  Cluster,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableColumn,
  Text,
} from 'kablui'

const rows = [
  { id: 1, name: 'Ada', role: 'Engineer', country: 'UK' },
  { id: 2, name: 'Grace', role: 'Admiral', country: 'US' },
  { id: 3, name: 'Alan', role: 'Scientist', country: 'UK' },
]

const columns = [
  { field: 'name', header: 'Name' },
  { field: 'role', header: 'Role' },
  { field: 'country', header: 'Country' },
]

/** Fields currently hidden — Table omits them from header and body. */
const hiddenColumns = ref<string[]>([])

const visibleCount = computed(
  () => columns.length - hiddenColumns.value.length,
)

function isColumnVisible(field: string): boolean {
  return !hiddenColumns.value.includes(field)
}

function setColumnVisible(field: string, visible: boolean) {
  if (visible) {
    hiddenColumns.value = hiddenColumns.value.filter((f) => f !== field)
  } else if (!hiddenColumns.value.includes(field)) {
    hiddenColumns.value = [...hiddenColumns.value, field]
  }
}
</script>

<template>
  <Table v-model:hidden-columns="hiddenColumns" :value="rows" data-key="id">
    <template #header>
      <Cluster gap="sm" class="items-center justify-between">
        <Text size="sm" tone="muted">{{ visibleCount }} of {{ columns.length }} columns</Text>
        <Popover placement="bottom-end">
          <PopoverTrigger>Columns</PopoverTrigger>
          <PopoverContent aria-label="Toggle columns">
            <div class="flex flex-col gap-2 p-1">
              <label
                v-for="col in columns"
                :key="col.field"
                class="flex items-center gap-2"
              >
                <Checkbox
                  :model-value="isColumnVisible(col.field)"
                  :data-testid="`column-toggle-${col.field}`"
                  @update:model-value="setColumnVisible(col.field, $event)"
                />
                <Text size="sm">{{ col.header }}</Text>
              </label>
            </div>
          </PopoverContent>
        </Popover>
      </Cluster>
    </template>
    <TableColumn
      v-for="col in columns"
      :key="col.field"
      :field="col.field"
      :header="col.header"
    />
  </Table>
</template>
