<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import type { TableColumnGroupType, TableHeaderRowDef } from '../utils/table/types'
import { TABLE_KEY } from './tableContext'
import { TABLE_COLUMN_GROUP_KEY } from './tableColumnGroupContext'

export interface TableColumnGroupProps {
  /** Render as multi-row header or footer. */
  type?: TableColumnGroupType
}

const props = withDefaults(defineProps<TableColumnGroupProps>(), {
  type: 'header',
})

const table = inject(TABLE_KEY, null)

if (!table) {
  console.warn('[kablui] TableColumnGroup must be used inside Table')
}

const headerRows = ref<TableHeaderRowDef[]>([])

function registerHeaderRow(row: TableHeaderRowDef) {
  const next = [...headerRows.value]
  const index = next.findIndex((r) => r.id === row.id)
  if (index === -1) next.push(row)
  else next[index] = row
  headerRows.value = next
  syncToTable()
}

function unregisterHeaderRow(id: string) {
  headerRows.value = headerRows.value.filter((r) => r.id !== id)
  syncToTable()
}

function updateHeaderRow(row: TableHeaderRowDef) {
  const index = headerRows.value.findIndex((r) => r.id === row.id)
  if (index === -1) return
  const next = [...headerRows.value]
  next[index] = row
  headerRows.value = next
  syncToTable()
}

function syncToTable() {
  if (!table) return
  if (props.type === 'footer') {
    table.setFooterRows([...headerRows.value])
  } else {
    table.setHeaderRows([...headerRows.value])
  }
}

onMounted(() => {
  syncToTable()
})

onBeforeUnmount(() => {
  if (!table) return
  if (props.type === 'footer') table.setFooterRows([])
  else table.setHeaderRows([])
})

provide(TABLE_COLUMN_GROUP_KEY, {
  type: props.type,
  registerHeaderRow,
  unregisterHeaderRow,
  updateHeaderRow,
})
</script>

<template>
  <!-- Declarative config only; Table owns thead/tfoot DOM. -->
  <span hidden aria-hidden="true" data-slot="table-column-group" :data-type="type">
    <slot />
  </span>
</template>
