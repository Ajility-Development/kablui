<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, onUpdated, useSlots, type CSSProperties } from 'vue'
import { useId } from '../composables/useId'
import type {
  TableAlign,
  TableColumnDef,
  TableFrozenAlign,
  TableSelectionMode,
} from '../utils/table/types'
import { TABLE_KEY } from './tableContext'
import { TABLE_HEADER_ROW_KEY } from './tableColumnGroupContext'

export interface TableColumnProps {
  field?: string
  header?: string
  footer?: string
  /** Wave 1+: sortable header. Ignored in Wave 0 render. */
  sortable?: boolean
  /** Wave 2+: filterable column. Ignored in Wave 0 render. */
  filterable?: boolean
  /**
   * Filter value / match-mode UI. Default `'text'`.
   * Use `'numeric'` for number inputs and numeric match modes.
   */
  dataType?: 'text' | 'numeric'
  /** Pin column during horizontal scroll. */
  frozen?: boolean
  /** Side to pin when `frozen` (`'left'` default). */
  alignFrozen?: TableFrozenAlign
  width?: string
  minWidth?: string
  /** Wave 1+: selection column mode. Ignored in Wave 0 render. */
  selectionMode?: TableSelectionMode
  /** Wave 2+: row editor controls column (Edit / Save / Cancel). */
  rowEditor?: boolean
  /** Wave 3+: expander column. Ignored in Wave 0 render. */
  expander?: boolean
  /** Wave 3+: row drag-handle column. */
  rowReorder?: boolean
  /**
   * When `false`, excluded from column header reorder (Wave 3).
   * Default `true` for data columns.
   */
  reorderableColumn?: boolean
  /** When `false`, omitted from table render. Default `true`. */
  visible?: boolean
  /** Columns spanned in a grouped header/footer cell. */
  colspan?: number
  /** Rows spanned in a grouped header/footer cell. */
  rowspan?: number
  align?: TableAlign
  headerStyle?: string | CSSProperties
  bodyStyle?: string | CSSProperties
  footerStyle?: string | CSSProperties
  headerClass?: string
  bodyClass?: string
  footerClass?: string
}

const props = withDefaults(defineProps<TableColumnProps>(), {
  sortable: false,
  filterable: false,
  dataType: 'text',
  frozen: false,
  alignFrozen: 'left',
  rowEditor: false,
  expander: false,
  rowReorder: false,
  reorderableColumn: true,
  visible: true,
  colspan: 1,
  rowspan: 1,
})

const slots = useSlots()
const table = inject(TABLE_KEY, null)
const headerRow = inject(TABLE_HEADER_ROW_KEY, null)
const columnId = useId('table-column')

if (!table) {
  console.warn('[kablui] TableColumn must be used inside Table')
}

function isBodyCapable(): boolean {
  return !!(
    props.field ||
    props.selectionMode ||
    props.rowEditor ||
    props.expander ||
    props.rowReorder
  )
}

/**
 * Columns inside a header/footer group without a body role are chrome-only
 * (colspan/rowspan labels). Flat-table columns always participate in the body.
 */
function isBodyColumn(): boolean {
  if (headerRow && !isBodyCapable()) return false
  return true
}

function toDef(): TableColumnDef {
  return {
    id: columnId,
    field: props.field,
    header: props.header,
    footer: props.footer,
    sortable: props.sortable,
    filterable: props.filterable,
    dataType: props.dataType,
    frozen: props.frozen,
    alignFrozen: props.alignFrozen,
    width: props.width,
    minWidth: props.minWidth,
    selectionMode: props.selectionMode,
    rowEditor: props.rowEditor,
    expander: props.expander,
    rowReorder: props.rowReorder,
    reorderableColumn: props.reorderableColumn,
    visible: props.visible,
    body: isBodyColumn(),
    colspan: props.colspan,
    rowspan: props.rowspan,
    align: props.align,
    headerStyle: props.headerStyle,
    bodyStyle: props.bodyStyle,
    footerStyle: props.footerStyle,
    headerClass: props.headerClass,
    bodyClass: props.bodyClass,
    footerClass: props.footerClass,
    slots: {
      body: slots.body,
      header: slots.header,
      footer: slots.footer,
      filter: slots.filter,
      editor: slots.editor,
    },
  }
}

onMounted(() => {
  table?.registerColumn(toDef())
  headerRow?.registerCell(columnId)
})

onUpdated(() => {
  table?.updateColumn(toDef())
})

onBeforeUnmount(() => {
  headerRow?.unregisterCell(columnId)
  table?.unregisterColumn(columnId)
})
</script>

<template>
  <!-- Declarative config only; Table owns thead/tbody/tfoot DOM. -->
  <span hidden aria-hidden="true" data-slot="table-column" :data-column-id="columnId" />
</template>
