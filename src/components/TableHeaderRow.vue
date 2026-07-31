<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { useId } from '../composables/useId'
import {
  TABLE_COLUMN_GROUP_KEY,
  TABLE_HEADER_ROW_KEY,
} from './tableColumnGroupContext'

export interface TableHeaderRowProps {}

defineProps<TableHeaderRowProps>()

const group = inject(TABLE_COLUMN_GROUP_KEY, null)

if (!group) {
  console.warn('[kablui] TableHeaderRow must be used inside TableColumnGroup')
}

const rowId = useId('table-header-row')
const columnIds = ref<string[]>([])
let registered = false

function toDef() {
  return { id: rowId, columnIds: [...columnIds.value] }
}

function pushToGroup() {
  if (!group) return
  if (!registered) {
    group.registerHeaderRow(toDef())
    registered = true
  } else {
    group.updateHeaderRow(toDef())
  }
}

function registerCell(columnId: string) {
  if (columnIds.value.includes(columnId)) return
  columnIds.value = [...columnIds.value, columnId]
  pushToGroup()
}

function unregisterCell(columnId: string) {
  columnIds.value = columnIds.value.filter((id) => id !== columnId)
  pushToGroup()
}

onMounted(() => {
  pushToGroup()
})

watch(
  columnIds,
  () => {
    pushToGroup()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  group?.unregisterHeaderRow(rowId)
  registered = false
})

provide(TABLE_HEADER_ROW_KEY, {
  registerCell,
  unregisterCell,
})
</script>

<template>
  <!-- Declarative config only; Table owns tr DOM. -->
  <span hidden aria-hidden="true" data-slot="table-header-row" :data-row-id="rowId">
    <slot />
  </span>
</template>
