<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useAttrs,
  useSlots,
  watch,
  type CSSProperties,
} from 'vue'
import { useId } from '../composables/useId'
import { filterRows, isFilterMetaAdvanced, resolveFieldValue } from '../utils/table/filter'
import { measureLeafColumnWidths } from '../utils/table/measure'
import { computeFrozenOffsets } from '../utils/table/frozen'
import {
  computeRowspanMeta,
  groupRows,
  isRowExpanded as isRowExpandedUtil,
  isRowGroupExpanded as isRowGroupExpandedUtil,
  partitionRowGroups,
  toggleRowExpanded,
  toggleRowGroupExpanded,
  type TableRowspanMeta,
} from '../utils/table/group'
import { pageCount as calcPageCount, pageRows } from '../utils/table/page'
import {
  applyColumnOrder,
  columnOrderKey,
  nextColumnOrder,
  reorderItems,
} from '../utils/table/reorder'
import { applyColumnResize, sumColumnWidths } from '../utils/table/resize'
import {
  ariaSortValue,
  getFieldSortOrder,
  getMultiSortBadgeIndex,
  sortRows,
  toggleSort,
} from '../utils/table/sort'
import { exportTableCsv } from '../utils/table/exportCsv'
import {
  keysToSelection,
  loadTableState,
  normalizeTableState,
  saveTableState,
  selectionToKeys,
} from '../utils/table/stateStorage'
import {
  computeVirtualWindow,
  shouldEmitVirtualLazyLoad,
  type TableVirtualWindow,
} from '../utils/table/virtual'
import { omitDataTestId, partTestId, resolveTestId, valueTestId } from '../utils/testId'
import type {
  ExportTableCsvOptions,
  TableCellEditCancelEvent,
  TableCellEditCompleteEvent,
  TableColumnDef,
  TableColumnReorderEvent,
  TableColumnResizeEndEvent,
  TableColumnResizeMode,
  TableEditMode,
  TableExpandedRows,
  TableFilterDisplay,
  TableFilterEvent,
  TableFilterMeta,
  TableFilters,
  TableHeaderRowDef,
  TableLoadEvent,
  TablePageEvent,
  TablePersistedState,
  TableRowCollapseEvent,
  TableRowContextMenuEvent,
  TableRowData,
  TableRowEditCancelEvent,
  TableRowEditInitEvent,
  TableRowEditSaveEvent,
  TableRowExpandEvent,
  TableRowGroupCollapseEvent,
  TableRowGroupExpandEvent,
  TableRowGroupMode,
  TableRowReorderEvent,
  TableRowSelectEvent,
  TableSelectionMode,
  TableSelectionValue,
  TableSize,
  TableSortEvent,
  TableSortMeta,
  TableSortMode,
  TableSortOrder,
  TableStateStorage,
  TableVirtualLazyLoadEvent,
  TableVirtualScrollerOptions,
} from '../utils/table/types'
import Checkbox from './Checkbox.vue'
import Empty from './Empty.vue'
import Icon from './Icon.vue'
import Radio from './Radio.vue'
import { RADIO_GROUP_KEY } from './radioContext'
import Spinner from './Spinner.vue'
import { SlotFn } from './table/SlotFn'
import TableColumnFilter from './table/TableColumnFilter.vue'
import TablePaginator from './table/TablePaginator.vue'
import { TABLE_KEY } from './tableContext'

export interface TableProps {
  /** Row data array. Client pipeline: filter → sort → group → page (Wave 1+: sort + page). */
  value?: unknown[]
  /** Property used as a stable row key (e.g. `"id"`). Falls back to row index. */
  dataKey?: string
  size?: TableSize
  showGridlines?: boolean
  striped?: boolean
  loading?: boolean
  // --- selection (Wave 1) ---
  /** Row click selection: `'single'` or `'multiple'`. */
  selectionMode?: TableSelectionMode
  /**
   * When true (multiple): plain click replaces; Ctrl/Cmd toggles; Shift selects a range.
   * When false: plain click toggles. Touch devices behave as false.
   */
  metaKeySelection?: boolean
  // --- sort (Wave 1) ---
  /** `'single'` (default) or `'multiple'` (Ctrl/Cmd+click to add columns). */
  sortMode?: TableSortMode
  /** When true, a third click clears sort on that column. */
  removableSort?: boolean
  // --- pagination (Wave 1) ---
  /** When true, slice `value` into pages and render Pagination below the grid. */
  paginate?: boolean
  /** Page size (rows per page). */
  rows?: number
  /**
   * Total record count for pageCount. Client mode defaults to pipeline length.
   * Required for accurate paginator counts when `lazy` is true.
   */
  totalRecords?: number
  // --- lazy / virtual (Wave 4) ---
  /**
   * When true, skip client filter → sort → group → page; render `value` as-is
   * (server page/chunk). Emit `page` / `sort` / `filter` / `load` for remote fetch.
   * Select-all operates on the current `value` only.
   */
  lazy?: boolean
  /**
   * Fixed-row-height body virtualization. Prefetch large local arrays, or set
   * `lazy: true` to emit `lazy-load` while scrolling a sparse `value`.
   */
  virtualScrollerOptions?: TableVirtualScrollerOptions
  // --- filter (Wave 2) ---
  /** `'row'` (under headers) or `'menu'` (popover). Omit to hide column filter UI. */
  filterDisplay?: TableFilterDisplay
  /** Fields searched by the `global` key in `filters`. */
  globalFilterFields?: string[]
  // --- scroll / frozen (Wave 2) ---
  /**
   * Vertical scroll viewport height: a CSS length (e.g. `'400px'`) or `'flex'`
   * to fill the parent (parent should be a flex column with a defined height).
   * Enables sticky header.
   */
  scrollHeight?: string
  /** Rows pinned at the top of the body while the rest scroll vertically. */
  frozenValue?: unknown[]
  // --- edit (Wave 2) ---
  /** `'cell'` click-to-edit or `'row'` with rowEditor controls. */
  editMode?: TableEditMode
  /** Accessible label for the row-edit Edit button. */
  editButtonAriaLabel?: string
  /** Accessible label for the row-edit Save button. */
  saveButtonAriaLabel?: string
  /** Accessible label for the row-edit Cancel button. */
  cancelButtonAriaLabel?: string
  // --- expand / group (Wave 3) ---
  /** Field name used to cluster rows into groups. */
  groupRowsBy?: string
  /** `'subheader'` (header/footer rows) or `'rowspan'` (merged group cell). */
  rowGroupMode?: TableRowGroupMode
  /** When true with subheader mode, groups collapse/expand via `expandedRowGroups`. */
  expandableRowGroups?: boolean
  /** Accessible label for expand toggler (collapsed state). */
  expandButtonAriaLabel?: string
  /** Accessible label for expand toggler (expanded state). */
  collapseButtonAriaLabel?: string
  // --- resize / reorder (Wave 3) ---
  /** Enable drag handles on column headers to resize widths. */
  resizableColumns?: boolean
  /**
   * `'fit'` (default) steals width from the adjacent column;
   * `'expand'` grows/shrinks the table.
   */
  columnResizeMode?: TableColumnResizeMode
  /** Enable drag-and-drop reorder of column headers. */
  reorderableColumns?: boolean
  /**
   * Enable drag-and-drop reorder of body rows.
   * Prefer a `TableColumn row-reorder` handle column; requires `dataKey` for stable keys.
   */
  reorderableRows?: boolean
  /** Accessible label for column resize handles. */
  columnResizeHandleAriaLabel?: string
  /** Accessible label for column reorder drag affordance. */
  columnReorderHandleAriaLabel?: string
  /** Accessible label for row reorder drag handles. */
  rowReorderHandleAriaLabel?: string
  // --- state / export (Wave 4) ---
  /**
   * Unique key for persisting view state. When set, page/sort/filters/
   * selection keys/columnOrder/hiddenColumns are saved to Web Storage.
   */
  stateKey?: string
  /** `'session'` (default) or `'local'` storage backend. */
  stateStorage?: TableStateStorage
  /** Default filename when calling the exposed `exportCsv()` helper. */
  exportFilename?: string
  // --- context menu (Wave 4) ---
  /**
   * When true, row right-click prevents the browser menu, updates
   * `contextMenuSelection`, and emits `row-contextmenu`.
   */
  contextMenu?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TableProps>(), {
  value: () => [],
  size: 'md',
  showGridlines: false,
  striped: false,
  loading: false,
  // --- selection (Wave 1) ---
  metaKeySelection: false,
  // --- sort (Wave 1) ---
  sortMode: 'single',
  removableSort: false,
  // --- pagination (Wave 1) ---
  paginate: false,
  rows: 10,
  // --- lazy / virtual (Wave 4) ---
  lazy: false,
  // --- scroll / frozen (Wave 2) ---
  frozenValue: () => [],
  // --- edit (Wave 2) ---
  editButtonAriaLabel: 'Edit',
  saveButtonAriaLabel: 'Save',
  cancelButtonAriaLabel: 'Cancel',
  // --- expand / group (Wave 3) ---
  expandableRowGroups: false,
  expandButtonAriaLabel: 'Expand',
  collapseButtonAriaLabel: 'Collapse',
  // --- resize / reorder (Wave 3) ---
  resizableColumns: false,
  columnResizeMode: 'fit',
  reorderableColumns: false,
  reorderableRows: false,
  columnResizeHandleAriaLabel: 'Resize column',
  columnReorderHandleAriaLabel: 'Reorder column',
  rowReorderHandleAriaLabel: 'Reorder row',
  // --- state / export (Wave 4) ---
  stateStorage: 'session',
  exportFilename: 'download.csv',
  // --- context menu (Wave 4) ---
  contextMenu: false,
})

const emit = defineEmits<{
  // --- selection (Wave 1) ---
  'row-select': [payload: TableRowSelectEvent]
  'row-unselect': [payload: TableRowSelectEvent]
  // --- sort (Wave 1) ---
  sort: [payload: TableSortEvent]
  // --- filter (Wave 2) ---
  filter: [payload: TableFilterEvent]
  // --- lazy / virtual (Wave 4) ---
  page: [payload: TablePageEvent]
  load: [payload: TableLoadEvent]
  'lazy-load': [payload: TableVirtualLazyLoadEvent]
  // --- edit (Wave 2) ---
  'cell-edit-complete': [payload: TableCellEditCompleteEvent]
  'cell-edit-cancel': [payload: TableCellEditCancelEvent]
  'row-edit-init': [payload: TableRowEditInitEvent]
  'row-edit-save': [payload: TableRowEditSaveEvent]
  'row-edit-cancel': [payload: TableRowEditCancelEvent]
  // --- expand / group (Wave 3) ---
  'row-expand': [payload: TableRowExpandEvent]
  'row-collapse': [payload: TableRowCollapseEvent]
  'rowgroup-expand': [payload: TableRowGroupExpandEvent]
  'rowgroup-collapse': [payload: TableRowGroupCollapseEvent]
  // --- resize / reorder (Wave 3) ---
  'column-resize-end': [payload: TableColumnResizeEndEvent]
  'column-reorder': [payload: TableColumnReorderEvent]
  'row-reorder': [payload: TableRowReorderEvent]
  'update:value': [value: unknown[]]
  // --- context menu (Wave 4) ---
  'row-contextmenu': [payload: TableRowContextMenuEvent]
}>()

// --- selection (Wave 1) ---
const selection = defineModel<TableSelectionValue>('selection')

// --- sort (Wave 1) ---
const sortField = defineModel<string | null>('sortField', { default: null })
const sortOrder = defineModel<TableSortOrder | null>('sortOrder', { default: null })
const multiSortMeta = defineModel<TableSortMeta[]>('multiSortMeta', { default: () => [] })

// --- pagination (Wave 1) ---
const page = defineModel<number>('page', { default: 1 })

// --- filter (Wave 2) ---
const filters = defineModel<TableFilters>('filters', { default: () => ({}) })

// --- edit (Wave 2) ---
const editingRows = defineModel<unknown[]>('editingRows', { default: () => [] })

// --- expand / group (Wave 3) ---
const expandedRows = defineModel<TableExpandedRows | undefined>('expandedRows')
const expandedRowGroups = defineModel<unknown[]>('expandedRowGroups', { default: () => [] })

// --- resize / reorder (Wave 3) ---
/** Column order keys (`field` or column id). Empty = registration order. */
const columnOrder = defineModel<string[]>('columnOrder', { default: () => [] })

// --- column groups / visibility model (Wave 3) ---
/** Field names omitted from render (`v-model:hiddenColumns`). */
const hiddenColumns = defineModel<string[]>('hiddenColumns', { default: () => [] })

// --- state / export (Wave 4) ---
/** Suppress persistence while hydrating from storage. */
const stateHydrating = ref(false)
const stateReady = ref(false)

// --- context menu (Wave 4) ---
/** Right-clicked row (`v-model:contextMenuSelection`). */
const contextMenuSelection = defineModel<unknown>('contextMenuSelection')

const attrs = useAttrs()
const slots = useSlots()
const testIdBase = computed(() => resolveTestId(attrs, 'table'))
const bindAttrs = computed(() => omitDataTestId(attrs))
const expansionIdBase = useId('table-expansion')

const registeredColumns = ref<TableColumnDef[]>([])
/** Multi-row header from `TableColumnGroup type="header"`. */
const headerRows = ref<TableHeaderRowDef[]>([])
/** Multi-row footer from `TableColumnGroup type="footer"`. */
const footerRows = ref<TableHeaderRowDef[]>([])

function setHeaderRows(rows: TableHeaderRowDef[]) {
  headerRows.value = rows
}

function setFooterRows(rows: TableHeaderRowDef[]) {
  footerRows.value = rows
}

function registerColumn(column: TableColumnDef) {
  const next = [...registeredColumns.value]
  const index = next.findIndex((c) => c.id === column.id)
  if (index === -1) next.push(column)
  else next[index] = column
  registeredColumns.value = next
}

function unregisterColumn(id: string) {
  registeredColumns.value = registeredColumns.value.filter((c) => c.id !== id)
}

function updateColumn(column: TableColumnDef) {
  const index = registeredColumns.value.findIndex((c) => c.id === column.id)
  if (index === -1) return
  const next = [...registeredColumns.value]
  next[index] = column
  registeredColumns.value = next
}

const rows = computed(() => props.value ?? [])

// --- filter (Wave 2) ---
/** Filtered rows (first client pipeline stage). Feeds sort. Lazy: pass-through. */
const filteredRows = computed(() =>
  props.lazy
    ? rows.value
    : filterRows(rows.value, filters.value, {
        globalFilterFields: props.globalFilterFields,
      }),
)

function isColumnFilterable(column: TableColumnDef): boolean {
  return !!column.filterable && !!column.field && !column.selectionMode
}

function fieldFilterMeta(field: string): TableFilterMeta | undefined {
  return filters.value?.[field]
}

function emitFilterEvent(next: TableFilters) {
  emit('filter', {
    filters: next,
    filteredValue: props.lazy
      ? rows.value
      : filterRows(rows.value, next, {
          globalFilterFields: props.globalFilterFields,
        }),
  })
  // --- lazy / virtual (Wave 4): page watch emits load when page resets ---
  if (props.lazy && !(props.paginate && page.value !== 1)) emitLoadEvent()
}

function applyFieldFilter(field: string, meta: TableFilterMeta) {
  const next = { ...filters.value, [field]: meta }
  filters.value = next
  emitFilterEvent(next)
}

function clearFieldFilter(field: string) {
  const next = { ...filters.value }
  const prev = next[field]
  if (isFilterMetaAdvanced(prev)) {
    next[field] = {
      operator: prev.operator,
      constraints: prev.constraints.map((c) => ({ ...c, value: null })),
    }
  } else if (prev) {
    next[field] = { value: null, matchMode: prev.matchMode }
  } else {
    delete next[field]
  }
  filters.value = next
  emitFilterEvent(next)
}

watch(
  filters,
  () => {
    // --- state / export (Wave 4): skip reset while hydrating persisted state ---
    if (stateHydrating.value) return
    if (props.paginate && page.value !== 1) page.value = 1
  },
  { deep: true },
)

// --- sort (Wave 1) ---
/** Sorted rows from the filtered pipeline. Feeds pagination via `pageSourceRows`. Lazy: pass-through. */
const sortedRows = computed(() =>
  props.lazy
    ? filteredRows.value
    : sortRows(filteredRows.value, {
        sortMode: props.sortMode,
        sortField: sortField.value,
        sortOrder: sortOrder.value,
        multiSortMeta: multiSortMeta.value,
      }),
)

// --- group (Wave 3) ---
/**
 * Group stage: cluster sorted rows by `groupRowsBy` (stable, first-seen order).
 * Pagination pages these flat data rows, then re-derives group chrome for the
 * current page (headers / rowspan). Group header/footer rows are not page units.
 * Lazy: pass-through (render `value` as-is).
 */
const groupedRows = computed(() =>
  props.lazy ? sortedRows.value : groupRows(sortedRows.value, props.groupRowsBy),
)

const isSubheaderGroupMode = computed(
  () => !!props.groupRowsBy && props.rowGroupMode === 'subheader',
)

const isRowspanGroupMode = computed(
  () => !!props.groupRowsBy && props.rowGroupMode === 'rowspan',
)

function fieldSortOrder(field: string): TableSortOrder {
  return getFieldSortOrder(field, {
    sortMode: props.sortMode,
    sortField: sortField.value,
    sortOrder: sortOrder.value,
    multiSortMeta: multiSortMeta.value,
  })
}

function fieldAriaSort(field: string): 'ascending' | 'descending' | 'none' {
  return ariaSortValue(fieldSortOrder(field))
}

function fieldSortBadge(field: string): number {
  return getMultiSortBadgeIndex(field, multiSortMeta.value)
}

function onSortActivate(event: MouseEvent | KeyboardEvent, field: string) {
  const next = toggleSort({
    field,
    sortMode: props.sortMode,
    removableSort: props.removableSort,
    metaKey: event.metaKey || event.ctrlKey,
    sortField: sortField.value,
    sortOrder: sortOrder.value,
    multiSortMeta: multiSortMeta.value,
  })
  sortField.value = next.sortField
  sortOrder.value = next.sortOrder
  multiSortMeta.value = next.multiSortMeta
  // --- lazy / virtual (Wave 4): reset page so remote fetch starts at page 1 ---
  const willResetPage = props.lazy && props.paginate && page.value !== 1
  if (willResetPage) page.value = 1
  emit('sort', {
    originalEvent: event,
    sortField: next.sortField,
    sortOrder: next.sortOrder,
    multiSortMeta: next.multiSortMeta,
  })
  if (props.lazy && !willResetPage) emitLoadEvent()
}

const sortHeaderButtonClasses = [
  'inline-flex items-center gap-1.5',
  'bg-transparent p-0 text-inherit font-inherit',
  'cursor-pointer select-none',
  'rounded-kablui-sm',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
].join(' ')

// --- pagination (Wave 1) ---
/**
 * Rows entering the page stage (after filter → sort → group).
 * When `groupRowsBy` is set, this is the clustered data-row list.
 */
const pageSourceRows = computed(() =>
  props.groupRowsBy ? groupedRows.value : sortedRows.value,
)

const effectiveTotalRecords = computed(
  () => props.totalRecords ?? pageSourceRows.value.length,
)

const tablePageCount = computed(() => {
  if (!props.paginate) return 0
  return calcPageCount(effectiveTotalRecords.value, props.rows)
})

const displayRows = computed(() => {
  // --- lazy / virtual (Wave 4): value is already the current server page/chunk ---
  if (props.lazy) return pageSourceRows.value
  if (!props.paginate) return pageSourceRows.value
  return pageRows(pageSourceRows.value, page.value, props.rows)
})

const showPaginator = computed(() => props.paginate && tablePageCount.value >= 1)

/** Absolute row index in the pre-page pipeline (for keys / body slot `index`). */
function pipelineRowIndex(pageRowIndex: number): number {
  // Lazy: `value` is the current chunk; indices are relative to that chunk unless paginate+totalRecords.
  if (props.lazy) {
    if (!props.paginate) return pageRowIndex
    const size = Math.max(1, Math.floor(props.rows))
    const safePage = Math.max(1, Math.floor(page.value))
    return (safePage - 1) * size + pageRowIndex
  }
  if (!props.paginate) return pageRowIndex
  const size = Math.max(1, Math.floor(props.rows))
  const safePage = Math.max(1, Math.floor(page.value))
  return (safePage - 1) * size + pageRowIndex
}

// --- lazy / virtual (Wave 4) ---
function buildLoadEvent(): TableLoadEvent {
  const size = Math.max(1, Math.floor(props.rows))
  const safePage = Math.max(1, Math.floor(page.value))
  return {
    first: (safePage - 1) * size,
    rows: size,
    page: safePage,
    pageCount: tablePageCount.value,
    totalRecords: effectiveTotalRecords.value,
    sortField: sortField.value ?? null,
    sortOrder: sortOrder.value ?? null,
    multiSortMeta: multiSortMeta.value ?? [],
    filters: filters.value ?? {},
  }
}

function emitLoadEvent() {
  emit('load', buildLoadEvent())
}

function emitPageEvent() {
  const payload = buildLoadEvent()
  emit('page', payload)
  if (props.lazy) emit('load', payload)
}

watch(page, () => {
  // --- state / export (Wave 4): restore must not emit page/load ---
  if (stateHydrating.value) return
  if (!props.paginate) return
  emitPageEvent()
})

// --- column groups / visibility model (Wave 3) ---
function isColumnHiddenByModel(column: TableColumnDef): boolean {
  if (column.visible === false) return true
  if (column.field && hiddenColumns.value.includes(column.field)) return true
  return false
}

/**
 * Body columns only: honors `visible`, `v-model:hiddenColumns`, and
 * excludes group chrome cells (`body: false`).
 */
const visibleColumnsBase = computed(() =>
  registeredColumns.value.filter((c) => c.body !== false && !isColumnHiddenByModel(c)),
)

// --- resize / reorder (Wave 3): apply `columnOrder` to visible columns ---
const visibleColumns = computed(() =>
  applyColumnOrder(visibleColumnsBase.value, columnOrder.value),
)

const hasHeaderGroup = computed(() => headerRows.value.length > 0)
const hasFooterGroup = computed(() => footerRows.value.length > 0)

function columnById(id: string): TableColumnDef | undefined {
  return registeredColumns.value.find((c) => c.id === id)
}

/** Resolve a header/footer row to visible column defs (hides leaf fields in `hiddenColumns`). */
function headerRowColumns(row: TableHeaderRowDef): TableColumnDef[] {
  return row.columnIds
    .map((id) => columnById(id))
    .filter((c): c is TableColumnDef => {
      if (!c) return false
      if (c.body === false) return true
      return !isColumnHiddenByModel(c)
    })
}

/** Label rows for thead (flat single row, or multi-row from `TableColumnGroup`). */
const theadLabelRows = computed(() => {
  if (!hasHeaderGroup.value) {
    return [{ id: '__flat__', columns: visibleColumns.value }]
  }
  return headerRows.value.map((row) => ({
    id: row.id,
    columns: headerRowColumns(row),
  }))
})

/** Label rows for tfoot when a footer column group is registered. */
const tfootLabelRows = computed(() => {
  if (!hasFooterGroup.value) return []
  return footerRows.value.map((row) => ({
    id: row.id,
    columns: headerRowColumns(row),
  }))
})

function headerCellColspan(column: TableColumnDef): number | undefined {
  if (!hasHeaderGroup.value && !hasFooterGroup.value) return undefined
  const span = column.colspan ?? 1
  return span > 1 ? span : undefined
}

function headerCellRowspan(column: TableColumnDef): number | undefined {
  if (!hasHeaderGroup.value && !hasFooterGroup.value) return undefined
  const span = column.rowspan ?? 1
  return span > 1 ? span : undefined
}

const hasColumnFooters = computed(() =>
  visibleColumns.value.some((c) => c.footer != null || !!c.slots.footer),
)

const isEmpty = computed(() => pageSourceRows.value.length === 0 && !props.loading)

function rowKey(row: unknown, index: number): string {
  if (props.dataKey && row && typeof row === 'object') {
    const key = (row as TableRowData)[props.dataKey]
    if (key != null) return String(key)
  }
  return String(index)
}

function cellValue(row: unknown, field?: string): unknown {
  if (!field) return undefined
  return resolveFieldValue(row, field)
}

function alignClass(align?: TableColumnDef['align']): string {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  if (align === 'left') return 'text-left'
  return ''
}

function columnStyle(column: TableColumnDef): CSSProperties | string | undefined {
  const style: CSSProperties = {}
  if (column.width) style.width = column.width
  if (column.minWidth) style.minWidth = column.minWidth
  return Object.keys(style).length > 0 ? style : undefined
}

/** Padding + text density applied on th/td cells (not only `<table>`). */
const sizeCellClasses: Record<TableSize, string> = {
  sm: 'px-2 py-1 text-kablui-sm',
  md: 'px-3 py-2 text-kablui-md',
  lg: 'px-4 py-3 text-kablui-lg',
}

// --- scroll / frozen (Wave 2) ---
// --- lazy / virtual (Wave 4): flags first (scroll sticky + window math) ---
/** Options present with a positive itemSize (may still be gated off without scrollHeight). */
const virtualConfigured = computed(
  () => !!props.virtualScrollerOptions && props.virtualScrollerOptions.itemSize > 0,
)

/** Virtual windowing requires a constrained scrollport (`scrollHeight`). */
const virtualEnabled = computed(() => virtualConfigured.value && !!props.scrollHeight)

const virtualItemSize = computed(() =>
  Math.max(0, Math.floor(props.virtualScrollerOptions?.itemSize ?? 0)),
)

const virtualTolerated = computed(() =>
  Math.max(0, Math.floor(props.virtualScrollerOptions?.numToleratedItems ?? 5)),
)

const virtualLazyEnabled = computed(
  () => virtualEnabled.value && !!props.virtualScrollerOptions?.lazy,
)

/** Debounce handle for virtual `lazy-load` (cleared on unmount). */
let virtualLazyTimer: ReturnType<typeof setTimeout> | null = null

/** One-shot console warnings for virtual incompatibilities. */
let warnedVirtualScrollHeight = false
let warnedVirtualExpansion = false
let warnedVirtualGrouping = false

function warnVirtualOnce(
  flag: 'scrollHeight' | 'expansion' | 'grouping',
  message: string,
) {
  if (flag === 'scrollHeight') {
    if (warnedVirtualScrollHeight) return
    warnedVirtualScrollHeight = true
  } else if (flag === 'expansion') {
    if (warnedVirtualExpansion) return
    warnedVirtualExpansion = true
  } else {
    if (warnedVirtualGrouping) return
    warnedVirtualGrouping = true
  }
  console.warn(message)
}

watch(
  () => [virtualConfigured.value, props.scrollHeight] as const,
  ([configured, scrollHeight]) => {
    if (configured && !scrollHeight) {
      warnVirtualOnce(
        'scrollHeight',
        '[kablui Table] virtualScrollerOptions requires scrollHeight; virtualization is disabled.',
      )
    }
  },
  { immediate: true },
)

watch(
  () =>
    [
      virtualEnabled.value,
      props.groupRowsBy,
      visibleColumns.value.some((c) => c.expander),
      expandedRows.value != null,
    ] as const,
  ([enabled, groupBy, hasExpander, hasExpandedModel]) => {
    if (!enabled) return
    if (groupBy) {
      warnVirtualOnce(
        'grouping',
        '[kablui Table] virtualScrollerOptions is incompatible with groupRowsBy; group chrome is disabled.',
      )
    }
    if (hasExpander || hasExpandedModel) {
      warnVirtualOnce(
        'expansion',
        '[kablui Table] virtualScrollerOptions is incompatible with row expansion; expansion rows are skipped.',
      )
    }
  },
  { immediate: true },
)

const isFlexScroll = computed(() => props.scrollHeight === 'flex')
const hasVerticalScroll = computed(() => !!props.scrollHeight || virtualEnabled.value)
const frozenRows = computed(() => props.frozenValue ?? [])
const hasFrozenRows = computed(() => frozenRows.value.length > 0)
/** Horizontal overflow intent: wide columns via minWidth (e.g. horizontal scroll demos). */
const hasHorizontalOverflowMode = computed(() =>
  visibleColumns.value.some((column) => !!column.minWidth),
)
const hasFrozenColumns = computed(() => visibleColumns.value.some((column) => !!column.frozen))
/**
 * Scrollport (`data-slot="table-scroll"`) only when vertical scroll, virtual,
 * frozen cols/rows, or horizontal overflow mode is active — not for naked tables.
 */
const scrollportEnabled = computed(
  () =>
    !!props.scrollHeight ||
    virtualEnabled.value ||
    hasFrozenRows.value ||
    hasFrozenColumns.value ||
    hasHorizontalOverflowMode.value,
)
const stickyHeaderEnabled = computed(
  () => scrollportEnabled.value && (hasVerticalScroll.value || hasFrozenRows.value),
)

const rootClasses = computed(() =>
  [
    'relative w-full text-kablui-fg',
    isFlexScroll.value ? 'flex h-full min-h-0 flex-col' : '',
  ]
    .filter(Boolean)
    .join(' '),
)

const scrollContainerClasses = computed(() =>
  [
    'relative w-full min-w-0 min-h-0 overflow-auto',
    'rounded-kablui-md border border-kablui-border bg-kablui-bg',
    isFlexScroll.value ? 'flex-1' : '',
  ]
    .filter(Boolean)
    .join(' '),
)

const scrollContainerStyle = computed((): CSSProperties | undefined => {
  if (!scrollportEnabled.value) return undefined
  if (!props.scrollHeight) return undefined
  if (isFlexScroll.value) return { flex: '1 1 0%', minHeight: 0 }
  return { maxHeight: props.scrollHeight }
})

const tableClasses = computed(() =>
  [
    'w-full text-left border-separate border-spacing-0',
    scrollportEnabled.value ? 'min-w-max' : '',
    // --- resize / reorder (Wave 3) ---
    props.resizableColumns ? 'table-fixed' : '',
  ]
    .filter(Boolean)
    .join(' '),
)

const headerCellClasses = ['font-kablui-semibold text-kablui-fg', 'bg-kablui-muted'].join(' ')

const footerCellClasses = ['font-kablui-medium text-kablui-muted-fg', 'bg-kablui-muted'].join(
  ' ',
)

const gridlineCellClasses = 'border border-kablui-border'

function bodyRowClasses(index: number): string {
  return [props.striped && index % 2 === 1 ? 'bg-kablui-muted/40 dark:bg-kablui-muted/55' : '']
    .filter(Boolean)
    .join(' ')
}

// --- scroll / frozen (Wave 2) ---
const tableEl = ref<HTMLTableElement | null>(null)
const theadEl = ref<HTMLTableSectionElement | null>(null)
const measuredColumnWidths = ref<Record<string, number>>({})
const measuredHeaderHeight = ref(0)
/** Cumulative sticky `top` (px) for each thead label row (excludes filter row). */
const headerRowStickyTops = ref<number[]>([])
/** Sticky `top` for the filter row (sum of label row heights). */
const filterRowStickyTop = ref(0)
let columnWidthObserver: ResizeObserver | null = null
let scrollportObserver: ResizeObserver | null = null
/** Shared rAF id for coalescing ResizeObserver measure work (at most one pending frame). */
let measureRafId: number | null = null

const frozenOffsetMap = computed(() =>
  computeFrozenOffsets(visibleColumns.value, measuredColumnWidths.value),
)

function sameNumberArray(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function sameWidthMap(
  a: Record<string, number>,
  b: Record<string, number>,
): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false
  }
  return true
}

function measureHeaderStickyTops() {
  const thead = theadEl.value
  if (!thead) {
    if (headerRowStickyTops.value.length) headerRowStickyTops.value = []
    if (filterRowStickyTop.value !== 0) filterRowStickyTop.value = 0
    if (measuredHeaderHeight.value !== 0) measuredHeaderHeight.value = 0
    return
  }

  const tops: number[] = []
  let cumulative = 0
  let filterTop = 0
  thead.querySelectorAll(':scope > tr').forEach((tr) => {
    const el = tr as HTMLElement
    if (el.dataset.slot === 'table-filter-row') {
      filterTop = cumulative
      return
    }
    tops.push(cumulative)
    cumulative += el.offsetHeight
  })
  const nextFilterTop = filterTop || cumulative
  const nextHeaderHeight = thead.offsetHeight
  if (!sameNumberArray(headerRowStickyTops.value, tops)) {
    headerRowStickyTops.value = tops
  }
  if (filterRowStickyTop.value !== nextFilterTop) {
    filterRowStickyTop.value = nextFilterTop
  }
  if (measuredHeaderHeight.value !== nextHeaderHeight) {
    measuredHeaderHeight.value = nextHeaderHeight
  }
}

function measureScrollLayout() {
  const table = tableEl.value
  if (!table) return

  const nextWidths = measureLeafColumnWidths(table, visibleColumns.value)
  if (!sameWidthMap(measuredColumnWidths.value, nextWidths)) {
    measuredColumnWidths.value = nextWidths
  }
  measureHeaderStickyTops()
}

function flushResizeObserverMeasures() {
  measureRafId = null
  measureScrollLayout()
  measureVirtualViewport()
}

function scheduleResizeObserverFlush() {
  if (measureRafId != null) return
  if (typeof requestAnimationFrame === 'undefined') {
    flushResizeObserverMeasures()
    return
  }
  measureRafId = requestAnimationFrame(flushResizeObserverMeasures)
}

onMounted(() => {
  measureScrollLayout()
  measureVirtualViewport()
  if (typeof ResizeObserver === 'undefined') return
  columnWidthObserver = new ResizeObserver(() => {
    scheduleResizeObserverFlush()
  })
  if (tableEl.value) columnWidthObserver.observe(tableEl.value)
  scrollportObserver = new ResizeObserver(() => {
    scheduleResizeObserverFlush()
  })
  if (scrollEl.value) scrollportObserver.observe(scrollEl.value)
})

onBeforeUnmount(() => {
  if (measureRafId != null && typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(measureRafId)
    measureRafId = null
  }
  columnWidthObserver?.disconnect()
  columnWidthObserver = null
  scrollportObserver?.disconnect()
  scrollportObserver = null
  // --- resize / reorder (Wave 3) ---
  document.removeEventListener('pointermove', onColumnResizeMove)
  document.removeEventListener('pointerup', onColumnResizeEnd)
  document.removeEventListener('pointercancel', onColumnResizeEnd)
  // --- lazy / virtual (Wave 4) ---
  if (virtualLazyTimer != null) {
    clearTimeout(virtualLazyTimer)
    virtualLazyTimer = null
  }
})

watch(
  () =>
    [
      visibleColumns.value.map((c) => c.id).join('\0'),
      props.scrollHeight,
      frozenRows.value.length,
      hasHeaderGroup.value,
      props.filterDisplay,
      theadLabelRows.value.length,
    ] as const,
  async () => {
    await nextTick()
    measureScrollLayout()
  },
)

// --- lazy / virtual (Wave 4): scroll window + lazy-load ---
const scrollEl = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const viewportHeight = ref(0)
const lastVirtualLazyRange = ref<{ first: number; last: number } | null>(null)

const frozenRowsVirtualOffset = computed(() => {
  if (!virtualEnabled.value) return 0
  return frozenRows.value.length * virtualItemSize.value
})

const virtualWindow = computed((): TableVirtualWindow | null => {
  if (!virtualEnabled.value) return null
  // Content origin only — do not also shrink viewport by the same offset (DISC-3).
  const headerOffset = measuredHeaderHeight.value + frozenRowsVirtualOffset.value
  const contentScrollTop = Math.max(0, scrollTop.value - headerOffset)
  return computeVirtualWindow({
    scrollTop: contentScrollTop,
    viewportHeight: viewportHeight.value,
    itemCount: displayRows.value.length,
    itemSize: virtualItemSize.value,
    numToleratedItems: virtualTolerated.value,
  })
})

const virtualSpacerTop = computed(() => virtualWindow.value?.offsetTop ?? 0)
const virtualSpacerBottom = computed(() => virtualWindow.value?.offsetBottom ?? 0)

function measureVirtualViewport() {
  const el = scrollEl.value
  if (!el) return
  viewportHeight.value = el.clientHeight
  scrollTop.value = el.scrollTop
}

function onScrollContainerScroll() {
  const el = scrollEl.value
  if (!el) return
  scrollTop.value = el.scrollTop
  viewportHeight.value = el.clientHeight
}

function emitVirtualLazyLoad(first: number, last: number) {
  const payload: TableVirtualLazyLoadEvent = { first, last }
  emit('lazy-load', payload)
  props.virtualScrollerOptions?.onLazyLoad?.(payload)
}

function scheduleVirtualLazyLoad(first: number, last: number) {
  if (!shouldEmitVirtualLazyLoad(lastVirtualLazyRange.value, { first, last })) return
  lastVirtualLazyRange.value = { first, last }
  const delay = Math.max(0, Math.floor(props.virtualScrollerOptions?.delay ?? 0))
  if (virtualLazyTimer != null) clearTimeout(virtualLazyTimer)
  if (delay === 0) {
    emitVirtualLazyLoad(first, last)
    return
  }
  virtualLazyTimer = setTimeout(() => {
    virtualLazyTimer = null
    emitVirtualLazyLoad(first, last)
  }, delay)
}

watch(
  virtualWindow,
  (win) => {
    if (!virtualLazyEnabled.value || !win) return
    scheduleVirtualLazyLoad(win.startIndex, win.endIndex)
  },
  { immediate: true },
)

watch(
  () => [virtualEnabled.value, props.scrollHeight, displayRows.value.length] as const,
  async () => {
    if (!virtualEnabled.value) return
    await nextTick()
    measureVirtualViewport()
  },
)

function frozenCellStyle(column: TableColumnDef): CSSProperties | undefined {
  const frozen = frozenOffsetMap.value[column.id]
  if (!frozen) return undefined
  const style: CSSProperties = { position: 'sticky' }
  if (frozen.side === 'left') style.left = `${frozen.offset}px`
  else style.right = `${frozen.offset}px`
  return style
}

function headerCellStyle(
  column: TableColumnDef,
  options?: { rowIndex?: number; filterRow?: boolean },
): Array<CSSProperties | string | undefined> {
  const sticky: CSSProperties = {}
  if (stickyHeaderEnabled.value) {
    sticky.position = 'sticky'
    const top = options?.filterRow
      ? filterRowStickyTop.value
      : (headerRowStickyTops.value[options?.rowIndex ?? 0] ?? 0)
    sticky.top = `${top}px`
  }
  const frozen = frozenCellStyle(column)
  // --- resize / reorder (Wave 3): resized width overrides declared width ---
  return [columnStyle(column), resizeColumnStyle(column), column.headerStyle, sticky, frozen]
}

function bodyCellStyle(
  column: TableColumnDef,
  options?: { frozenRow?: boolean },
): Array<CSSProperties | string | undefined> {
  const stickyRow: CSSProperties = {}
  if (options?.frozenRow && stickyHeaderEnabled.value) {
    stickyRow.position = 'sticky'
    stickyRow.top = `${measuredHeaderHeight.value}px`
  }
  // --- resize / reorder (Wave 3) ---
  return [
    columnStyle(column),
    resizeColumnStyle(column),
    column.bodyStyle,
    stickyRow,
    frozenCellStyle(column),
  ]
}

function footerCellStyle(column: TableColumnDef): Array<CSSProperties | string | undefined> {
  // --- resize / reorder (Wave 3) ---
  return [columnStyle(column), resizeColumnStyle(column), column.footerStyle, frozenCellStyle(column)]
}

function frozenColumnClass(column: TableColumnDef, variant: 'header' | 'body' | 'footer'): string {
  const frozen = frozenOffsetMap.value[column.id]
  if (!frozen) return ''
  const z =
    variant === 'header'
      ? 'z-[3]'
      : variant === 'footer'
        ? 'z-[2]'
        : 'z-[1]'
  const edge =
    frozen.side === 'left'
      ? 'shadow-[2px_0_4px_-2px_oklch(0_0_0/0.12)]'
      : 'shadow-[-2px_0_4px_-2px_oklch(0_0_0/0.12)]'
  const bg =
    variant === 'header' || variant === 'footer' ? 'bg-kablui-muted' : ''
  return ['sticky', z, bg, edge].join(' ')
}

function headerCellClass(column: TableColumnDef): string {
  return [
    headerCellClasses,
    sizeCellClasses[props.size],
    props.showGridlines ? gridlineCellClasses : '',
    cellOverflowClasses(column),
    alignClass(column.align),
    column.headerClass,
    // Sticky `top` comes from headerCellStyle (cumulative per thead row).
    stickyHeaderEnabled.value ? 'sticky z-[2] bg-kablui-muted' : '',
    frozenColumnClass(column, 'header'),
  ]
    .filter(Boolean)
    .join(' ')
}

function bodyCellClass(
  column: TableColumnDef,
  options?: { frozenRow?: boolean; striped?: boolean; selected?: boolean },
): string {
  const needsOpaqueBg = !!(options?.frozenRow || frozenOffsetMap.value[column.id])
  let opaqueBg = ''
  if (needsOpaqueBg) {
    if (options?.selected) {
      // Opaque accent tint so sticky frozen cells do not mask selectionRowClasses.
      opaqueBg = options.striped ? 'bg-kablui-accent/20' : 'bg-kablui-accent/10'
    } else {
      opaqueBg = options?.striped ? 'bg-kablui-muted' : 'bg-kablui-bg'
    }
  }
  return [
    sizeCellClasses[props.size],
    props.showGridlines ? gridlineCellClasses : '',
    cellOverflowClasses(column),
    alignClass(column.align),
    column.bodyClass,
    options?.frozenRow ? 'sticky z-[1]' : '',
    frozenColumnClass(column, 'body'),
    opaqueBg,
  ]
    .filter(Boolean)
    .join(' ')
}

function footerCellClass(column: TableColumnDef): string {
  return [
    footerCellClasses,
    sizeCellClasses[props.size],
    props.showGridlines ? gridlineCellClasses : '',
    cellOverflowClasses(column),
    alignClass(column.align),
    column.footerClass,
    frozenColumnClass(column, 'footer'),
  ]
    .filter(Boolean)
    .join(' ')
}

function frozenRowClasses(index: number, row?: unknown): string {
  if (row != null && selectionEnabled.value && isRowSelected(row)) {
    return props.striped && index % 2 === 1
      ? 'bg-kablui-accent/20'
      : 'bg-kablui-accent/10'
  }
  return [
    props.striped && index % 2 === 1
      ? 'bg-kablui-muted/40 dark:bg-kablui-muted/55'
      : 'bg-kablui-bg',
  ]
    .filter(Boolean)
    .join(' ')
}

// --- resize / reorder (Wave 3) ---
const COLUMN_MIN_WIDTH_PX = 50
const columnWidths = ref<Record<string, number>>({})
const expandTableWidth = ref<number | null>(null)

/** Clip cell text when columns are resizable or have a resolved width. */
function cellOverflowClasses(column: TableColumnDef): string {
  const hasResolvedWidth = columnWidths.value[column.id] != null || !!column.width
  if (!props.resizableColumns && !hasResolvedWidth) return ''
  return 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap'
}

type ResizeSession = {
  columnId: string
  field?: string
  startX: number
  startWidths: Record<string, number>
  startWidth: number
}
const resizeSession = ref<ResizeSession | null>(null)

type ColumnDragSession = {
  dragIndex: number
  columnId: string
}
const columnDragSession = ref<ColumnDragSession | null>(null)
const columnDropIndex = ref<number | null>(null)

type RowDragSession = {
  dragIndex: number
  key: string
}
const rowDragSession = ref<RowDragSession | null>(null)
const rowDropIndex = ref<number | null>(null)

function resizeColumnStyle(column: TableColumnDef): CSSProperties | undefined {
  const width = columnWidths.value[column.id]
  if (width == null || !Number.isFinite(width)) return undefined
  return { width: `${width}px`, maxWidth: `${width}px` }
}

const tableResizeStyle = computed((): CSSProperties | undefined => {
  if (!props.resizableColumns) return undefined
  if (props.columnResizeMode === 'expand' && expandTableWidth.value != null) {
    return { width: `${expandTableWidth.value}px` }
  }
  const ids = visibleColumns.value.map((c) => c.id)
  const sum = sumColumnWidths(ids, columnWidths.value)
  if (sum > 0 && Object.keys(columnWidths.value).length > 0) {
    return { width: `${sum}px` }
  }
  return undefined
})

function ensureColumnWidthsFromDom(): Record<string, number> {
  const next = { ...columnWidths.value }
  const table = tableEl.value
  const measured = table
    ? measureLeafColumnWidths(table, visibleColumns.value)
    : measuredColumnWidths.value
  visibleColumns.value.forEach((column) => {
    if (next[column.id] != null) return
    const fromMeasured = measured[column.id] ?? measuredColumnWidths.value[column.id]
    if (fromMeasured != null && fromMeasured > 0) next[column.id] = fromMeasured
  })
  columnWidths.value = next
  return next
}

function isColumnResizable(column: TableColumnDef): boolean {
  if (!props.resizableColumns) return false
  if (column.body === false) return false
  if (column.selectionMode || column.rowEditor || column.rowReorder || column.expander) return false
  return true
}

function isColumnReorderable(column: TableColumnDef): boolean {
  if (!props.reorderableColumns) return false
  if (column.body === false) return false
  if (column.reorderableColumn === false) return false
  if (column.selectionMode || column.rowEditor || column.rowReorder || column.expander) {
    return column.reorderableColumn === true
  }
  return true
}

/** Index into `visibleColumns` by column id (safe under multi-row header groups). */
function visibleColumnIndex(column: TableColumnDef): number {
  return visibleColumns.value.findIndex((c) => c.id === column.id)
}

function onColumnResizeMove(event: PointerEvent) {
  const session = resizeSession.value
  if (!session) return
  const delta = event.clientX - session.startX
  const columnIds = visibleColumns.value.map((c) => c.id)
  const result = applyColumnResize({
    columnIds,
    widths: session.startWidths,
    resizedColumnId: session.columnId,
    delta,
    mode: props.columnResizeMode,
    minWidth: COLUMN_MIN_WIDTH_PX,
  })
  columnWidths.value = result.widths
  if (props.columnResizeMode === 'expand') {
    const base = sumColumnWidths(columnIds, session.startWidths)
    expandTableWidth.value = base + result.tableWidthDelta
  }
}

function onColumnResizeEnd(event: PointerEvent) {
  const session = resizeSession.value
  if (!session) return
  document.removeEventListener('pointermove', onColumnResizeMove)
  document.removeEventListener('pointerup', onColumnResizeEnd)
  document.removeEventListener('pointercancel', onColumnResizeEnd)
  const width = columnWidths.value[session.columnId] ?? session.startWidth
  emit('column-resize-end', {
    originalEvent: event,
    columnId: session.columnId,
    field: session.field,
    width,
    delta: width - session.startWidth,
  })
  resizeSession.value = null
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  void nextTick(() => measureScrollLayout())
}

function onColumnResizeStart(event: PointerEvent, column: TableColumnDef) {
  if (!isColumnResizable(column)) return
  event.preventDefault()
  event.stopPropagation()
  const widths = ensureColumnWidthsFromDom()
  const startWidth = widths[column.id]
  if (startWidth == null) return

  resizeSession.value = {
    columnId: column.id,
    field: column.field,
    startX: event.clientX,
    startWidths: { ...widths },
    startWidth,
  }

  if (props.columnResizeMode === 'expand') {
    const ids = visibleColumns.value.map((c) => c.id)
    expandTableWidth.value = sumColumnWidths(ids, widths)
  }

  document.addEventListener('pointermove', onColumnResizeMove)
  document.addEventListener('pointerup', onColumnResizeEnd)
  document.addEventListener('pointercancel', onColumnResizeEnd)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onColumnDragStart(event: DragEvent, column: TableColumnDef) {
  if (!isColumnReorderable(column)) {
    event.preventDefault()
    return
  }
  const index = visibleColumnIndex(column)
  if (index < 0) {
    event.preventDefault()
    return
  }
  columnDragSession.value = { dragIndex: index, columnId: column.id }
  columnDropIndex.value = index
  event.dataTransfer?.setData('text/plain', columnOrderKey(column))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onColumnDragOver(event: DragEvent, column: TableColumnDef) {
  if (!columnDragSession.value) return
  const index = visibleColumnIndex(column)
  if (index < 0) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  columnDropIndex.value = index
}

function onColumnDrop(event: DragEvent, column: TableColumnDef) {
  event.preventDefault()
  const session = columnDragSession.value
  if (!session) return
  const dropIndex = visibleColumnIndex(column)
  columnDragSession.value = null
  columnDropIndex.value = null
  if (dropIndex < 0) return
  const next = nextColumnOrder(visibleColumns.value, session.dragIndex, dropIndex, true)
  if (!next) return
  columnOrder.value = next
  emit('column-reorder', {
    originalEvent: event,
    dragIndex: session.dragIndex,
    dropIndex,
    columnOrder: next,
  })
}

function onColumnDragEnd() {
  columnDragSession.value = null
  columnDropIndex.value = null
}

function isRowReorderEnabled(): boolean {
  return props.reorderableRows && visibleColumns.value.some((c) => c.rowReorder)
}

function absoluteValueIndex(pageRowIndex: number): number {
  // Map display row → index in props.value (pageSourceRows may be filtered/sorted)
  const row = displayRows.value[pageRowIndex]
  if (row == null) return pageRowIndex
  const key = rowKey(row, pipelineRowIndex(pageRowIndex))
  const source = props.value ?? []
  for (let i = 0; i < source.length; i++) {
    if (rowKey(source[i], i) === key) return i
  }
  return pipelineRowIndex(pageRowIndex)
}

function onRowReorderDragStart(event: DragEvent, pageRowIndex: number) {
  if (!isRowReorderEnabled()) {
    event.preventDefault()
    return
  }
  const row = displayRows.value[pageRowIndex]
  if (row == null) return
  const valueIndex = absoluteValueIndex(pageRowIndex)
  rowDragSession.value = {
    dragIndex: valueIndex,
    key: rowKey(row, pipelineRowIndex(pageRowIndex)),
  }
  rowDropIndex.value = valueIndex
  event.dataTransfer?.setData('text/plain', rowDragSession.value.key)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onRowReorderDragOver(event: DragEvent, pageRowIndex: number) {
  if (!rowDragSession.value) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  rowDropIndex.value = absoluteValueIndex(pageRowIndex)
}

function onRowReorderDrop(event: DragEvent, pageRowIndex: number) {
  event.preventDefault()
  const session = rowDragSession.value
  if (!session) return
  const dropIndex = absoluteValueIndex(pageRowIndex)
  const nextValue = reorderItems(props.value ?? [], session.dragIndex, dropIndex)
  rowDragSession.value = null
  rowDropIndex.value = null
  if (session.dragIndex === dropIndex) return
  emit('update:value', nextValue)
  emit('row-reorder', {
    originalEvent: event,
    dragIndex: session.dragIndex,
    dropIndex,
    value: nextValue,
  })
}

function onRowReorderDragEnd() {
  rowDragSession.value = null
  rowDropIndex.value = null
}

const resizeHandleClasses = [
  'absolute top-0 right-0 z-[4] h-full w-2',
  'cursor-col-resize touch-none',
  'bg-transparent hover:bg-kablui-accent/30',
  'focus-visible:outline-none focus-visible:bg-kablui-accent/40',
].join(' ')

const columnReorderHandleClasses = [
  'inline-flex shrink-0 cursor-grab items-center text-kablui-muted-fg',
  'active:cursor-grabbing',
  'rounded-kablui-sm',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus',
].join(' ')

const rowReorderHandleClasses = [
  'inline-flex size-7 shrink-0 cursor-grab items-center justify-center',
  'rounded-kablui-sm text-kablui-muted-fg hover:bg-kablui-muted',
  'active:cursor-grabbing',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
].join(' ')

function headerCellClassWithResize(column: TableColumnDef): string {
  return [
    headerCellClass(column),
    props.resizableColumns || props.reorderableColumns ? 'relative' : '',
    columnDragSession.value?.columnId === column.id ? 'opacity-60' : '',
    columnDropIndex.value != null &&
    visibleColumns.value[columnDropIndex.value]?.id === column.id &&
    columnDragSession.value
      ? 'outline outline-2 outline-kablui-accent outline-offset-[-2px]'
      : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function bodyRowClassesWithReorder(rowIndex: number): string {
  const valueIndex = absoluteValueIndex(rowIndex)
  return [
    bodyRowClasses(rowIndex),
    rowDragSession.value?.dragIndex === valueIndex ? 'opacity-60' : '',
    rowDropIndex.value === valueIndex && rowDragSession.value
      ? 'outline outline-2 outline-kablui-accent outline-offset-[-2px]'
      : '',
  ]
    .filter(Boolean)
    .join(' ')
}

// --- selection (Wave 1) ---
const hasCheckboxColumn = computed(() =>
  visibleColumns.value.some((c) => c.selectionMode === 'multiple'),
)
const hasRadioColumn = computed(() =>
  visibleColumns.value.some((c) => c.selectionMode === 'single'),
)
const selectionEnabled = computed(
  () => !!props.selectionMode || hasCheckboxColumn.value || hasRadioColumn.value,
)
const isMultipleSelection = computed(
  () => props.selectionMode === 'multiple' || hasCheckboxColumn.value,
)
const rowClickSelection = computed(() => !!props.selectionMode)

const focusedRowIndex = ref(0)
/** Focused frozen-row index, or `null` when focus is in the scrollable body. */
const focusedFrozenIndex = ref<number | null>(null)
const anchorRowIndex = ref<number | null>(null)
const rowRefs = ref<(HTMLTableRowElement | null)[]>([])
const frozenRowRefs = ref<(HTMLTableRowElement | null)[]>([])

function setRowRef(el: unknown, index: number) {
  if (el == null) {
    rowRefs.value[index] = null
    return
  }
  rowRefs.value[index] = el as HTMLTableRowElement
}

function setFrozenRowRef(el: unknown, index: number) {
  if (el == null) {
    frozenRowRefs.value[index] = null
    return
  }
  frozenRowRefs.value[index] = el as HTMLTableRowElement
}

function rowDataKey(row: unknown): string | undefined {
  if (props.dataKey && row && typeof row === 'object') {
    const key = (row as TableRowData)[props.dataKey]
    if (key != null) return String(key)
  }
  return undefined
}

function rowsEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  const ka = rowDataKey(a)
  const kb = rowDataKey(b)
  if (ka != null && kb != null) return ka === kb
  return false
}

function isRowSelected(row: unknown): boolean {
  const sel = selection.value
  if (sel == null) return false
  if (Array.isArray(sel)) return sel.some((item) => rowsEqual(item, row))
  return rowsEqual(sel, row)
}

function selectionRowClasses(row: unknown): string {
  if (!selectionEnabled.value) return ''
  return [
    rowClickSelection.value ? 'cursor-pointer' : '',
    isRowSelected(row) ? 'bg-kablui-accent/10' : '',
    'outline-none',
  ]
    .filter(Boolean)
    .join(' ')
}

/** Persistent focused-row indicator (roving tabindex), not only :focus-visible. */
function focusedRowClasses(rowIndex: number): string {
  if (!selectionEnabled.value || focusedFrozenIndex.value != null) return ''
  if (focusedRowIndex.value !== rowIndex) return ''
  return ''
}

function focusedFrozenRowClasses(frozenIndex: number): string {
  if (!selectionEnabled.value || focusedFrozenIndex.value !== frozenIndex) return ''
  return ''
}

function emitSelect(originalEvent: Event, data: unknown, index: number) {
  emit('row-select', { originalEvent, data, index })
}

function emitUnselect(originalEvent: Event, data: unknown, index: number) {
  emit('row-unselect', { originalEvent, data, index })
}

/**
 * Pipeline index for bulk selection events (same contract as handleRowSelection).
 * Prefer pageSourceRows / frozen positions; never use selection-array index.
 */
function pipelineIndexForSelectionRow(row: unknown): number {
  const srcIdx = pageSourceRows.value.findIndex((r) => rowsEqual(r, row))
  if (srcIdx >= 0) {
    return props.lazy ? pipelineRowIndex(srcIdx) : srcIdx
  }
  const frozenIdx = frozenRows.value.findIndex((r) => rowsEqual(r, row))
  if (frozenIdx >= 0) return frozenRowEventIndex(row, frozenIdx)
  const valueIdx = (props.value ?? []).findIndex((r) => rowsEqual(r, row))
  if (valueIdx >= 0) return valueIdx
  return 0
}

/**
 * Emit row-select / row-unselect only for real transitions (by dataKey / identity).
 */
function emitSelectionTransitions(
  originalEvent: Event,
  previous: unknown[],
  next: unknown[],
) {
  for (const row of previous) {
    if (!next.some((item) => rowsEqual(item, row))) {
      emitUnselect(originalEvent, row, pipelineIndexForSelectionRow(row))
    }
  }
  for (const row of next) {
    if (!previous.some((item) => rowsEqual(item, row))) {
      emitSelect(originalEvent, row, pipelineIndexForSelectionRow(row))
    }
  }
}

function addToSelection(row: unknown, index: number, originalEvent: Event) {
  const current = Array.isArray(selection.value) ? selection.value : []
  if (current.some((item) => rowsEqual(item, row))) return
  selection.value = [...current, row]
  emitSelect(originalEvent, row, index)
}

function removeFromSelection(row: unknown, index: number, originalEvent: Event) {
  const current = Array.isArray(selection.value) ? selection.value : []
  selection.value = current.filter((item) => !rowsEqual(item, row))
  emitUnselect(originalEvent, row, index)
}

function selectRange(from: number, to: number, originalEvent: Event) {
  const start = Math.min(from, to)
  const end = Math.max(from, to)
  const range = displayRows.value.slice(start, end + 1).filter((row) => row != null)
  const prev = Array.isArray(selection.value) ? [...selection.value] : []
  selection.value = [...range]
  emitSelectionTransitions(originalEvent, prev, range)
}

function selectAllRows(originalEvent: Event) {
  // All matching pipeline rows (`pageSourceRows`); lazy = current `value` chunk.
  // Sparse holes are skipped; emits are transition-only with pipeline indices.
  const all: unknown[] = []
  pageSourceRows.value.forEach((row) => {
    if (row == null) return
    all.push(row)
  })
  const prev = Array.isArray(selection.value) ? [...selection.value] : []
  selection.value = all
  emitSelectionTransitions(originalEvent, prev, all)
}

function clearAllSelection(originalEvent: Event) {
  const prev = Array.isArray(selection.value) ? [...selection.value] : []
  selection.value = []
  emitSelectionTransitions(originalEvent, prev, [])
}

const allRowsSelected = computed(() => {
  const all = pageSourceRows.value
  if (all.length === 0) return false
  return all.every((row) => isRowSelected(row))
})

const someRowsSelected = computed(() => {
  const all = pageSourceRows.value
  if (all.length === 0) return false
  const count = all.filter((row) => isRowSelected(row)).length
  return count > 0 && count < all.length
})

function onSelectAllUpdate(checked: boolean, originalEvent: Event = new Event('change')) {
  if (checked) selectAllRows(originalEvent)
  else clearAllSelection(originalEvent)
}

function handleRowSelection(
  event: Event,
  row: unknown,
  displayIndex: number,
  options?: { absoluteIndex?: number; region?: 'body' | 'frozen' },
) {
  const pipelineIndex = options?.absoluteIndex ?? pipelineRowIndex(displayIndex)
  const region = options?.region ?? 'body'
  if (region === 'frozen') {
    focusedFrozenIndex.value = displayIndex
  } else {
    focusedFrozenIndex.value = null
    focusedRowIndex.value = displayIndex
  }
  const selected = isRowSelected(row)
  const mouse = event as MouseEvent
  const metaKey = !!(mouse.metaKey || mouse.ctrlKey)
  const shiftKey = !!mouse.shiftKey
  const useMeta = props.metaKeySelection

  if (isMultipleSelection.value) {
    // Shift-range is page-scoped (body `displayRows` only).
    if (region === 'body' && shiftKey && anchorRowIndex.value != null) {
      selectRange(anchorRowIndex.value, displayIndex, event)
      return
    }

    if (useMeta) {
      if (selected && metaKey) {
        removeFromSelection(row, pipelineIndex, event)
      } else if (!selected) {
        if (metaKey) addToSelection(row, pipelineIndex, event)
        else {
          selection.value = [row]
          emitSelect(event, row, pipelineIndex)
        }
      } else if (selected && !metaKey) {
        selection.value = [row]
      }
      if (region === 'body') anchorRowIndex.value = displayIndex
      return
    }

    if (selected) removeFromSelection(row, pipelineIndex, event)
    else addToSelection(row, pipelineIndex, event)
    if (region === 'body') anchorRowIndex.value = displayIndex
    return
  }

  // single
  if (useMeta) {
    if (selected && metaKey) {
      selection.value = null
      emitUnselect(event, row, pipelineIndex)
    } else if (!selected) {
      selection.value = row
      emitSelect(event, row, pipelineIndex)
    }
  } else if (selected) {
    selection.value = null
    emitUnselect(event, row, pipelineIndex)
  } else {
    selection.value = row
    emitSelect(event, row, pipelineIndex)
  }
  if (region === 'body') anchorRowIndex.value = displayIndex
}

function onRowClick(event: MouseEvent, row: unknown, displayIndex: number) {
  if (!rowClickSelection.value) return
  const target = event.target as HTMLElement | null
  if (
    target?.closest(
      'input, button, a, label, [data-slot="table-selection-cell"], [data-slot="table-row-editor"], [data-slot="table-cell-editor"]',
    )
  ) {
    return
  }
  // Cell edit owns body-cell clicks; keep row selection via checkbox/radio/keyboard.
  if (
    props.editMode === 'cell' &&
    target?.closest('td') &&
    !target.closest('[data-slot="table-selection-cell"]')
  ) {
    return
  }
  handleRowSelection(event, row, displayIndex)
}

function onRowCheckboxUpdate(
  row: unknown,
  displayIndex: number,
  checked: boolean,
  originalEvent: Event = new Event('change'),
) {
  const pipelineIndex = pipelineRowIndex(displayIndex)
  focusedRowIndex.value = displayIndex
  anchorRowIndex.value = displayIndex
  if (checked) addToSelection(row, pipelineIndex, originalEvent)
  else removeFromSelection(row, pipelineIndex, originalEvent)
}

function focusRow(index: number) {
  const max = displayRows.value.length - 1
  if (max < 0) return
  const next = Math.max(0, Math.min(max, index))
  focusedFrozenIndex.value = null
  focusedRowIndex.value = next

  // Virtual scroll: bring target into the window before focusing.
  if (virtualEnabled.value) {
    const win = virtualWindow.value
    const itemSize = virtualItemSize.value
    const el = scrollEl.value
    if (el && win && itemSize > 0 && (next < win.startIndex || next >= win.endIndex)) {
      const headerOffset = measuredHeaderHeight.value + frozenRowsVirtualOffset.value
      el.scrollTop = next * itemSize + headerOffset
      scrollTop.value = el.scrollTop
    }
  }

  nextTick(() => {
    if (rowRefs.value[next]) {
      rowRefs.value[next]!.focus()
      return
    }
    nextTick(() => {
      rowRefs.value[next]?.focus()
    })
  })
}

function focusFrozenRow(index: number) {
  const max = frozenRows.value.length - 1
  if (max < 0) return
  const next = Math.max(0, Math.min(max, index))
  focusedFrozenIndex.value = next
  nextTick(() => {
    frozenRowRefs.value[next]?.focus()
  })
}

function onRowKeydown(event: KeyboardEvent, row: unknown, displayIndex: number) {
  if (!selectionEnabled.value) return
  const key = event.key
  const max = displayRows.value.length - 1

  if (key === 'ArrowDown') {
    event.preventDefault()
    const next = Math.min(max, displayIndex + 1)
    if (event.shiftKey && isMultipleSelection.value) {
      if (anchorRowIndex.value == null) anchorRowIndex.value = displayIndex
      focusRow(next)
      selectRange(anchorRowIndex.value, next, event)
    } else {
      focusRow(next)
    }
    return
  }

  if (key === 'ArrowUp') {
    event.preventDefault()
    if (displayIndex <= 0 && frozenRows.value.length > 0) {
      focusFrozenRow(frozenRows.value.length - 1)
      return
    }
    const next = Math.max(0, displayIndex - 1)
    if (event.shiftKey && isMultipleSelection.value) {
      if (anchorRowIndex.value == null) anchorRowIndex.value = displayIndex
      focusRow(next)
      selectRange(anchorRowIndex.value, next, event)
    } else {
      focusRow(next)
    }
    return
  }

  if (key === 'Home') {
    event.preventDefault()
    if (frozenRows.value.length > 0) focusFrozenRow(0)
    else focusRow(0)
    return
  }

  if (key === 'End') {
    event.preventDefault()
    focusRow(max)
    return
  }

  if (key === ' ' || key === 'Enter') {
    event.preventDefault()
    handleRowSelection(event, row, displayIndex)
    return
  }

  if ((event.ctrlKey || event.metaKey) && (key === 'a' || key === 'A') && isMultipleSelection.value) {
    event.preventDefault()
    selectAllRows(event)
  }
}

const radioGroupName = useId('table-selection')
const radioInputs = new Set<HTMLInputElement>()

const radioModel = computed({
  get(): string | undefined {
    const sel = selection.value
    if (sel == null || Array.isArray(sel)) return undefined
    return rowDataKey(sel) ?? undefined
  },
  set(key: string | undefined) {
    if (key == null || key === '') {
      const prev = selection.value
      selection.value = null
      if (prev != null && !Array.isArray(prev)) {
        const pageIdx = pageSourceRows.value.findIndex(
          (r, i) => rowsEqual(r, prev) || rowKey(r, i) === rowDataKey(prev),
        )
        if (pageIdx >= 0) {
          emitUnselect(new Event('change'), prev, pageIdx)
          return
        }
        const frozenIdx = frozenRows.value.findIndex((r) => rowsEqual(r, prev))
        emitUnselect(
          new Event('change'),
          prev,
          frozenIdx >= 0 ? frozenRowEventIndex(prev, frozenIdx) : 0,
        )
      }
      return
    }
    const pageIndex = pageSourceRows.value.findIndex(
      (r, i) => rowKey(r, i) === key || rowDataKey(r) === key,
    )
    if (pageIndex !== -1) {
      const row = pageSourceRows.value[pageIndex]
      selection.value = row
      emitSelect(new Event('change'), row, pageIndex)
      return
    }
    const frozenIndex = frozenRows.value.findIndex(
      (r, i) => rowKey(r, i) === key || rowDataKey(r) === key,
    )
    if (frozenIndex === -1) return
    const frozenRow = frozenRows.value[frozenIndex]
    selection.value = frozenRow
    emitSelect(new Event('change'), frozenRow, frozenRowEventIndex(frozenRow, frozenIndex))
  },
})

function radioFocusRelative(current: HTMLInputElement, delta: number) {
  const list = [...radioInputs].filter((el) => !el.disabled)
  const index = list.indexOf(current)
  if (index === -1 || list.length === 0) return
  const next = list[(index + delta + list.length) % list.length]!
  next.focus()
  radioModel.value = next.value
}

provide(RADIO_GROUP_KEY, {
  name: computed(() => radioGroupName),
  model: radioModel,
  disabled: computed(() => !!props.loading),
  invalid: computed(() => false),
  register: (el) => radioInputs.add(el),
  unregister: (el) => radioInputs.delete(el),
  focusRelative: radioFocusRelative,
  testIdBase: computed(() => partTestId(testIdBase.value, 'selection')),
})

// --- edit (Wave 2) ---
interface EditingCellState {
  rowKey: string
  field: string
  index: number
  original: unknown
}

const editingCell = ref<EditingCellState | null>(null)
const editingCellData = ref<unknown>(null)
const editingCellEl = ref<HTMLElement | null>(null)
/** Working copies keyed by dataKey for row edit mode. */
const editingMeta = ref<Record<string, unknown>>({})

function cloneRow(row: unknown): unknown {
  if (row == null || typeof row !== 'object') return row
  try {
    if (typeof structuredClone === 'function') return structuredClone(row)
  } catch {
    /* DataCloneError — fall through */
  }
  try {
    return JSON.parse(JSON.stringify(row)) as unknown
  } catch {
    return { ...(row as TableRowData) }
  }
}

function isEditableColumn(column: TableColumnDef): boolean {
  return (
    !!column.slots.editor &&
    !!column.field &&
    !column.selectionMode &&
    !column.rowEditor &&
    !column.expander &&
    !column.rowReorder
  )
}

function isEditingRow(row: unknown): boolean {
  const list = editingRows.value ?? []
  return list.some((item) => rowsEqual(item, row))
}

function isEditingCell(row: unknown, field: string): boolean {
  if (props.editMode === 'cell') {
    if (!editingCell.value || editingCell.value.field !== field) return false
    const key = rowDataKey(row)
    if (key != null) return editingCell.value.rowKey === key
    return editingCell.value.original === row
  }
  if (props.editMode === 'row') {
    return isEditingRow(row)
  }
  return false
}

function getEditingData(row: unknown): unknown {
  if (props.editMode === 'cell' && editingCell.value) {
    if (isEditingCell(row, editingCell.value.field)) return editingCellData.value ?? row
  }
  if (props.editMode === 'row') {
    const key = rowDataKey(row)
    if (key != null && key in editingMeta.value) return editingMeta.value[key]
  }
  return row
}

function showCellEditor(row: unknown, column: TableColumnDef): boolean {
  if (!column.slots.editor || !column.field) return false
  if (props.editMode === 'cell') return isEditingCell(row, column.field)
  if (props.editMode === 'row') return isEditingRow(row)
  return false
}

function setEditingCellRef(el: unknown, row: unknown, column: TableColumnDef) {
  if (props.editMode === 'cell' && column.field && isEditingCell(row, column.field)) {
    editingCellEl.value = el ? (el as HTMLElement) : null
  }
}

function focusCellEditor() {
  nextTick(() => {
    editingCellEl.value
      ?.querySelector<HTMLElement>('input, textarea, select, [contenteditable="true"]')
      ?.focus()
  })
}

function completeCellEdit(event: Event, type: string) {
  const state = editingCell.value
  if (!state) return
  const field = state.field
  const data = state.original
  const newData = editingCellData.value
  emit('cell-edit-complete', {
    originalEvent: event,
    data,
    newData,
    value: cellValue(data, field),
    newValue: cellValue(newData, field),
    field,
    index: state.index,
    type,
  })
  editingCell.value = null
  editingCellData.value = null
  editingCellEl.value = null
}

function cancelCellEdit(event: Event) {
  const state = editingCell.value
  if (!state) return
  emit('cell-edit-cancel', {
    originalEvent: event,
    data: state.original,
    field: state.field,
    index: state.index,
  })
  editingCell.value = null
  editingCellData.value = null
  editingCellEl.value = null
}

/**
 * Event index for a frozen row: prefer its position in `value` (by dataKey),
 * otherwise the frozen-list index. Used by edit/selection payloads.
 */
function frozenRowEventIndex(row: unknown, frozenIndex: number): number {
  const list = props.value ?? []
  const found = list.findIndex((r) => rowsEqual(r, row))
  return found >= 0 ? found : frozenIndex
}

function onCellClick(
  event: MouseEvent,
  row: unknown,
  column: TableColumnDef,
  displayIndex: number,
  absoluteIndex?: number,
) {
  if (props.editMode !== 'cell' || props.loading) return
  if (!isEditableColumn(column)) return
  const field = column.field!
  const index = absoluteIndex ?? pipelineRowIndex(displayIndex)
  const key = rowKey(row, index)
  if (editingCell.value?.rowKey === key && editingCell.value.field === field) return
  if (editingCell.value) completeCellEdit(event, 'outside')
  event.stopPropagation()
  editingCellData.value = cloneRow(row)
  editingCell.value = { rowKey: key, field, index, original: row }
  focusCellEditor()
}

function onFrozenRowCheckboxUpdate(
  row: unknown,
  frozenIndex: number,
  checked: boolean,
  originalEvent: Event = new Event('change'),
) {
  const index = frozenRowEventIndex(row, frozenIndex)
  if (checked) addToSelection(row, index, originalEvent)
  else removeFromSelection(row, index, originalEvent)
}

function onFrozenRowClick(event: MouseEvent, row: unknown, frozenIndex: number) {
  if (!rowClickSelection.value) return
  const target = event.target as HTMLElement | null
  if (
    target?.closest(
      'input, button, a, label, [data-slot="table-selection-cell"], [data-slot="table-row-editor"], [data-slot="table-cell-editor"]',
    )
  ) {
    return
  }
  if (
    props.editMode === 'cell' &&
    target?.closest('td') &&
    !target.closest('[data-slot="table-selection-cell"]')
  ) {
    return
  }
  handleRowSelection(event, row, frozenIndex, {
    absoluteIndex: frozenRowEventIndex(row, frozenIndex),
    region: 'frozen',
  })
}

function onFrozenRowKeydown(event: KeyboardEvent, row: unknown, frozenIndex: number) {
  if (!selectionEnabled.value) return
  const key = event.key
  const max = frozenRows.value.length - 1

  if (key === 'ArrowDown') {
    event.preventDefault()
    if (frozenIndex < max) {
      focusFrozenRow(frozenIndex + 1)
    } else if (displayRows.value.length > 0) {
      focusRow(0)
    }
    return
  }

  if (key === 'ArrowUp') {
    event.preventDefault()
    focusFrozenRow(frozenIndex - 1)
    return
  }

  if (key === 'Home') {
    event.preventDefault()
    focusFrozenRow(0)
    return
  }

  if (key === 'End') {
    event.preventDefault()
    if (displayRows.value.length > 0) focusRow(displayRows.value.length - 1)
    else focusFrozenRow(max)
    return
  }

  if (key === ' ' || key === 'Enter') {
    event.preventDefault()
    handleRowSelection(event, row, frozenIndex, {
      absoluteIndex: frozenRowEventIndex(row, frozenIndex),
      region: 'frozen',
    })
    return
  }

  if ((event.ctrlKey || event.metaKey) && (key === 'a' || key === 'A') && isMultipleSelection.value) {
    event.preventDefault()
    selectAllRows(event)
  }
}

function onEditorKeydown(
  event: KeyboardEvent,
  row: unknown,
  column: TableColumnDef,
  _displayIndex: number,
) {
  if (props.editMode === 'cell' && column.field && isEditingCell(row, column.field)) {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      completeCellEdit(event, 'enter')
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      cancelCellEdit(event)
    }
    return
  }
  if (props.editMode === 'row' && isEditingRow(row) && event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    onRowEditCancel(event, row, _displayIndex)
  }
}

function onRowEditInit(
  event: Event,
  row: unknown,
  displayIndex: number,
  absoluteIndex?: number,
) {
  if (props.editMode !== 'row') return
  if (!props.dataKey) {
    console.warn('[kablui] Table row edit requires dataKey')
    return
  }
  const key = rowDataKey(row)
  if (key == null || isEditingRow(row)) return
  const newData = cloneRow(row)
  editingMeta.value = { ...editingMeta.value, [key]: newData }
  editingRows.value = [...(editingRows.value ?? []), row]
  emit('row-edit-init', {
    originalEvent: event,
    data: row,
    newData,
    index: absoluteIndex ?? pipelineRowIndex(displayIndex),
  })
}

function onRowEditSave(
  event: Event,
  row: unknown,
  displayIndex: number,
  absoluteIndex?: number,
) {
  if (props.editMode !== 'row') return
  const key = rowDataKey(row)
  if (key == null) return
  const newData = editingMeta.value[key] ?? cloneRow(row)
  emit('row-edit-save', {
    originalEvent: event,
    data: row,
    newData,
    index: absoluteIndex ?? pipelineRowIndex(displayIndex),
  })
  const nextMeta = { ...editingMeta.value }
  delete nextMeta[key]
  editingMeta.value = nextMeta
  editingRows.value = (editingRows.value ?? []).filter((item) => !rowsEqual(item, row))
}

function onRowEditCancel(
  event: Event,
  row: unknown,
  displayIndex: number,
  absoluteIndex?: number,
) {
  if (props.editMode !== 'row') return
  const key = rowDataKey(row)
  if (key == null) return
  const newData = editingMeta.value[key] ?? cloneRow(row)
  emit('row-edit-cancel', {
    originalEvent: event,
    data: row,
    newData,
    index: absoluteIndex ?? pipelineRowIndex(displayIndex),
  })
  const nextMeta = { ...editingMeta.value }
  delete nextMeta[key]
  editingMeta.value = nextMeta
  editingRows.value = (editingRows.value ?? []).filter((item) => !rowsEqual(item, row))
}

function onDocumentPointerDown(event: Event) {
  if (props.editMode !== 'cell' || !editingCell.value) return
  const target = event.target as Node | null
  if (editingCellEl.value && target && editingCellEl.value.contains(target)) return
  completeCellEdit(event, 'outside')
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentPointerDown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentPointerDown, true)
})

const rowEditorButtonClasses = [
  'inline-flex size-7 shrink-0 items-center justify-center',
  'rounded-kablui-sm text-kablui-fg hover:bg-kablui-muted',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')

// --- expand / group (Wave 3) ---
const hasExpanderColumn = computed(() => visibleColumns.value.some((c) => c.expander))

const expandTogglerButtonClasses = [
  'inline-flex size-7 shrink-0 items-center justify-center',
  'rounded-kablui-sm text-kablui-fg hover:bg-kablui-muted',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kablui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-kablui-bg',
  'disabled:opacity-50 disabled:pointer-events-none',
].join(' ')

function isRowExpanded(row: unknown): boolean {
  return isRowExpandedUtil(expandedRows.value, row, props.dataKey, rowsEqual)
}

function isGroupExpanded(groupValue: unknown): boolean {
  if (!props.expandableRowGroups) return true
  return isRowGroupExpandedUtil(expandedRowGroups.value, groupValue)
}

function expansionDomId(row: unknown, pipelineIndex: number): string {
  return `${expansionIdBase}-row-${rowKey(row, pipelineIndex)}`
}

function groupExpansionDomId(groupKey: string): string {
  return `${expansionIdBase}-group-${groupKey}`
}

function onToggleRowExpand(event: Event, row: unknown) {
  event.stopPropagation()
  if (virtualEnabled.value) {
    warnVirtualOnce(
      'expansion',
      '[kablui Table] virtualScrollerOptions is incompatible with row expansion; expansion rows are skipped.',
    )
    return
  }
  const { next, expanded } = toggleRowExpanded(
    expandedRows.value,
    row,
    props.dataKey,
    rowsEqual,
  )
  expandedRows.value = next
  if (expanded) emit('row-expand', { originalEvent: event, data: row })
  else emit('row-collapse', { originalEvent: event, data: row })
}

function onToggleRowGroupExpand(event: Event, groupValue: unknown) {
  event.stopPropagation()
  const { next, expanded } = toggleRowGroupExpanded(expandedRowGroups.value, groupValue)
  expandedRowGroups.value = next
  if (expanded) emit('rowgroup-expand', { originalEvent: event, data: groupValue })
  else emit('rowgroup-collapse', { originalEvent: event, data: groupValue })
}

function isGroupFieldColumn(column: TableColumnDef): boolean {
  return !!props.groupRowsBy && column.field === props.groupRowsBy
}

function shouldOmitRowspanCell(column: TableColumnDef, meta?: TableRowspanMeta): boolean {
  return isRowspanGroupMode.value && isGroupFieldColumn(column) && !!meta && meta.rowspan === 0
}

function rowspanForCell(column: TableColumnDef, meta?: TableRowspanMeta): number | undefined {
  if (!isRowspanGroupMode.value || !isGroupFieldColumn(column) || !meta) return undefined
  return meta.rowspan > 1 ? meta.rowspan : undefined
}

type BodyDisplayItem =
  | {
      kind: 'groupheader'
      key: string
      groupKey: string
      groupValue: unknown
      data: unknown
      rows: unknown[]
      expanded: boolean
      controlsId: string
    }
  | {
      kind: 'groupfooter'
      key: string
      groupKey: string
      groupValue: unknown
      data: unknown
      rows: unknown[]
    }
  | {
      kind: 'row'
      key: string
      row: unknown
      rowIndex: number
      pipelineIndex: number
      rowspanMeta?: TableRowspanMeta
      /** Optional id for group aria-controls target (first row of expandable group). */
      groupBodyId?: string
    }
  | {
      kind: 'expansion'
      key: string
      row: unknown
      rowIndex: number
      pipelineIndex: number
      expansionId: string
    }

function pushRowAndExpansion(
  items: BodyDisplayItem[],
  row: unknown,
  rowIndex: number,
  rowspanMeta?: TableRowspanMeta,
  groupBodyId?: string,
  options?: { allowExpansion?: boolean },
) {
  const pipelineIndex = pipelineRowIndex(rowIndex)
  const key = rowKey(row, pipelineIndex)
  items.push({
    kind: 'row',
    key: `row-${key}`,
    row,
    rowIndex,
    pipelineIndex,
    rowspanMeta,
    groupBodyId,
  })
  const allowExpansion = options?.allowExpansion !== false
  if (allowExpansion && hasExpanderColumn.value && isRowExpanded(row)) {
    items.push({
      kind: 'expansion',
      key: `expansion-${key}`,
      row,
      rowIndex,
      pipelineIndex,
      expansionId: expansionDomId(row, pipelineIndex),
    })
  }
}

/**
 * Flattened body render list: optional group chrome, data rows, and expansion detail rows.
 * Built from `displayRows` so pagination stays on clustered data rows.
 * Virtual scroll (Wave 4): windows flat rows with fixed `itemSize`
 * (skips group chrome + expansion rows so scroll math stays fixed).
 */
const bodyDisplayItems = computed((): BodyDisplayItem[] => {
  const items: BodyDisplayItem[] = []
  const pageRowsList = displayRows.value
  const field = props.groupRowsBy

  // --- lazy / virtual (Wave 4): flat window only (no group chrome / expansion) ---
  const win = virtualEnabled.value ? virtualWindow.value : null
  if (win) {
    const sliced = pageRowsList.slice(win.startIndex, win.endIndex)
    sliced.forEach((row, i) => {
      pushRowAndExpansion(items, row, win.startIndex + i, undefined, undefined, {
        allowExpansion: false,
      })
    })
    return items
  }

  if (isSubheaderGroupMode.value && field) {
    const groups = partitionRowGroups(pageRowsList, field)
    let rowIndex = 0
    for (const group of groups) {
      const expanded = isGroupExpanded(group.value)
      items.push({
        kind: 'groupheader',
        key: `gh-${group.key}-${rowIndex}`,
        groupKey: group.key,
        groupValue: group.value,
        data: group.rows[0],
        rows: group.rows,
        expanded,
        controlsId: groupExpansionDomId(group.key),
      })
      if (expanded) {
        let first = true
        for (const row of group.rows) {
          pushRowAndExpansion(
            items,
            row,
            rowIndex,
            undefined,
            first ? groupExpansionDomId(group.key) : undefined,
          )
          first = false
          rowIndex++
        }
        items.push({
          kind: 'groupfooter',
          key: `gf-${group.key}-${rowIndex}`,
          groupKey: group.key,
          groupValue: group.value,
          data: group.rows[0],
          rows: group.rows,
        })
      } else {
        rowIndex += group.rows.length
      }
    }
    return items
  }

  const rowspanMeta = isRowspanGroupMode.value && field
    ? computeRowspanMeta(pageRowsList, field)
    : undefined

  pageRowsList.forEach((row, rowIndex) => {
    pushRowAndExpansion(items, row, rowIndex, rowspanMeta?.[rowIndex])
  })
  return items
})

// --- state / export (Wave 4) ---
/** Selection keys awaiting async `value` after restore. */
const pendingSelectionKeys = ref<string[] | null>(null)

function collectPersistedState(): TablePersistedState {
  const state: TablePersistedState = {
    page: page.value,
    sortField: sortField.value,
    sortOrder: sortOrder.value,
    multiSortMeta: multiSortMeta.value?.length
      ? multiSortMeta.value.map((m) => ({ ...m }))
      : [],
    filters: filters.value ? { ...filters.value } : {},
    columnOrder: [...(columnOrder.value ?? [])],
    hiddenColumns: [...(hiddenColumns.value ?? [])],
  }
  const keys = selectionToKeys(selection.value, props.dataKey)
  if (keys) state.selectionKeys = keys
  return state
}

function persistTableState() {
  if (!props.stateKey || stateHydrating.value || !stateReady.value) return
  saveTableState(props.stateKey, collectPersistedState(), props.stateStorage)
}

function applyPendingSelectionKeys() {
  if (!pendingSelectionKeys.value?.length || !props.dataKey) return
  const restored = keysToSelection(
    pendingSelectionKeys.value,
    props.value ?? [],
    props.dataKey,
    props.selectionMode,
  )
  if (restored === undefined) return
  selection.value = restored
  pendingSelectionKeys.value = null
}

function clampPageToCount() {
  if (!props.paginate) return
  const maxPage = Math.max(1, tablePageCount.value)
  if (page.value > maxPage) page.value = maxPage
  else if (page.value < 1) page.value = 1
}

function restoreTableState() {
  if (!props.stateKey) return
  const loaded = loadTableState(props.stateKey, props.stateStorage)
  if (!loaded) return
  const normalized = normalizeTableState(loaded)
  if (!normalized) return

  // Stay hydrating until after mount watchers flush (filter watch resets page).
  stateHydrating.value = true
  if (normalized.sortField !== undefined) {
    sortField.value = normalized.sortField
  }
  if (normalized.sortOrder !== undefined) {
    sortOrder.value = normalized.sortOrder
  }
  if (Array.isArray(normalized.multiSortMeta)) {
    multiSortMeta.value = normalized.multiSortMeta.map((m) => ({ ...m }))
  }
  if (normalized.filters && typeof normalized.filters === 'object') {
    filters.value = { ...normalized.filters }
  }
  if (Array.isArray(normalized.columnOrder)) {
    columnOrder.value = [...normalized.columnOrder]
  }
  if (Array.isArray(normalized.hiddenColumns)) {
    hiddenColumns.value = [...normalized.hiddenColumns]
  }
  if (Array.isArray(normalized.selectionKeys) && props.dataKey) {
    pendingSelectionKeys.value = [...normalized.selectionKeys]
    applyPendingSelectionKeys()
  }
  // Restore page last so filter/sort watches cannot clear it during hydration.
  if (typeof normalized.page === 'number' && Number.isFinite(normalized.page)) {
    page.value = Math.max(1, Math.floor(normalized.page))
  }
  clampPageToCount()
}

restoreTableState()

onMounted(() => {
  nextTick(() => {
    stateHydrating.value = false
    stateReady.value = true
    // --- lazy / virtual (Wave 4): initial remote fetch after hydrate ---
    if (props.lazy) emitLoadEvent()
  })
})

watch(
  () => props.value,
  () => {
    if (pendingSelectionKeys.value) applyPendingSelectionKeys()
  },
)

watch(tablePageCount, () => {
  clampPageToCount()
})

watch(
  [
    page,
    sortField,
    sortOrder,
    multiSortMeta,
    filters,
    selection,
    columnOrder,
    hiddenColumns,
    () => props.stateKey,
    () => props.stateStorage,
  ],
  () => {
    persistTableState()
  },
  { deep: true },
)

/**
 * Export filtered (pre-page) rows as CSV. Uses body columns by default.
 * Optional overrides merge into `exportTableCsv` options.
 */
function exportCsv(options: Partial<ExportTableCsvOptions> = {}): string {
  const bodyCols = visibleColumns.value
    .filter((c) => c.field && !c.selectionMode && !c.expander && !c.rowEditor && !c.rowReorder)
    .map((c) => ({
      field: c.field as string,
      header: c.header ?? c.field,
    }))
  return exportTableCsv({
    data: options.data ?? filteredRows.value,
    columns: options.columns ?? bodyCols,
    fields: options.fields,
    headers: options.headers,
    separator: options.separator,
    includeHeader: options.includeHeader,
    filename: options.filename ?? props.exportFilename,
  })
}

defineExpose({
  exportCsv,
})

// --- context menu (Wave 4) ---
function isContextMenuRow(row: unknown): boolean {
  if (!props.contextMenu) return false
  const sel = contextMenuSelection.value
  if (sel == null) return false
  return rowsEqual(sel, row)
}

function contextMenuRowClasses(row: unknown): string {
  return isContextMenuRow(row) ? 'bg-kablui-accent/15' : ''
}

function onRowContextMenu(event: MouseEvent, row: unknown, index: number) {
  if (!props.contextMenu) return
  event.preventDefault()
  contextMenuSelection.value = row
  emit('row-contextmenu', {
    originalEvent: event,
    data: row,
    index,
  })
}

provide(TABLE_KEY, {
  value: rows,
  columns: registeredColumns,
  size: computed(() => props.size),
  registerColumn,
  unregisterColumn,
  updateColumn,
  testIdBase,

  // --- selection (Wave 1) ---
  selection,
  selectionMode: computed(() => props.selectionMode),
  metaKeySelection: computed(() => props.metaKeySelection),
  dataKey: computed(() => props.dataKey),
  isRowSelected,
  // --- sort (Wave 1) ---
  sortMode: computed(() => props.sortMode),
  sortField,
  sortOrder,
  multiSortMeta,
  removableSort: computed(() => props.removableSort),
  // --- pagination (Wave 1) ---
  page,
  paginate: computed(() => props.paginate),
  rows: computed(() => props.rows),
  pageCount: tablePageCount,
  displayRows,
  // --- filter (Wave 2) ---
  filters,
  filterDisplay: computed(() => props.filterDisplay),
  globalFilterFields: computed(() => props.globalFilterFields),
  filteredRows,
  // --- scroll / frozen (Wave 2) ---
  scrollHeight: computed(() => props.scrollHeight),
  frozenValue: frozenRows,
  // --- edit (Wave 2) ---
  editMode: computed(() => props.editMode),
  editingRows,
  isEditingRow,
  isEditingCell,
  getEditingData,
  // --- expand / group (Wave 3) ---
  expandedRows,
  expandedRowGroups,
  groupRowsBy: computed(() => props.groupRowsBy),
  rowGroupMode: computed(() => props.rowGroupMode),
  expandableRowGroups: computed(() => props.expandableRowGroups),
  isRowExpanded,
  isRowGroupExpanded: isGroupExpanded,
  // --- resize / reorder (Wave 3) ---
  resizableColumns: computed(() => props.resizableColumns),
  columnResizeMode: computed(() => props.columnResizeMode),
  reorderableColumns: computed(() => props.reorderableColumns),
  reorderableRows: computed(() => props.reorderableRows),
  columnOrder,
  columnWidths,
  // --- column groups / visibility model (Wave 3) ---
  hiddenColumns,
  headerRows,
  footerRows,
  setHeaderRows,
  setFooterRows,
  // --- lazy / virtual (Wave 4) ---
  lazy: computed(() => props.lazy),
  totalRecords: effectiveTotalRecords,
  virtualScrollerOptions: computed(() => props.virtualScrollerOptions),
})
</script>

<template>
  <div
    data-slot="table"
    :data-testid="testIdBase"
    :data-size="size"
    :data-gridlines="showGridlines || undefined"
    :data-striped="striped || undefined"
    :data-loading="loading || undefined"
    :data-paginate="paginate || undefined"
    :data-lazy="lazy || undefined"
    :data-virtual="virtualEnabled || undefined"
    :data-filter-display="filterDisplay || undefined"
    :data-scroll="scrollHeight || undefined"
    :data-scroll-flex="isFlexScroll || undefined"
    :data-edit-mode="editMode || undefined"
    :data-resizable-columns="resizableColumns || undefined"
    :data-column-resize-mode="resizableColumns ? columnResizeMode : undefined"
    :data-reorderable-columns="reorderableColumns || undefined"
    :data-reorderable-rows="reorderableRows || undefined"
    :class="rootClasses"
    v-bind="bindAttrs"
  >
    <!-- Table-level toolbar region (above the grid, outside scrollport) -->
    <div
      v-if="slots.header"
      data-slot="table-caption-header"
      :data-testid="partTestId(testIdBase, 'header')"
      class="px-0 py-2"
    >
      <slot name="header" />
    </div>

    <!-- --- scroll / frozen (Wave 2): scrollport only when needed --- -->
    <!-- --- lazy / virtual (Wave 4): scroll listener for windowing --- -->
    <div
      ref="scrollEl"
      :data-slot="scrollportEnabled ? 'table-scroll' : undefined"
      :data-testid="scrollportEnabled ? partTestId(testIdBase, 'scroll') : undefined"
      :class="scrollportEnabled ? scrollContainerClasses : undefined"
      :style="scrollContainerStyle"
      @scroll="onScrollContainerScroll"
    >
      <table
        ref="tableEl"
        :class="tableClasses"
        :style="tableResizeStyle"
        :aria-busy="loading ? 'true' : undefined"
      >
        <!-- --- header cells (Wave 1 injects sort / selection chrome here) --- -->
        <!-- --- column groups / visibility (Wave 3): multi-row via theadLabelRows --- -->
        <thead
          v-if="visibleColumns.length || hasHeaderGroup"
          ref="theadEl"
          data-slot="table-thead"
          :data-sticky="stickyHeaderEnabled || undefined"
          :data-column-group="hasHeaderGroup || undefined"
        >
          <tr
            v-for="(headerRow, headerRowIndex) in theadLabelRows"
            :key="headerRow.id"
            :data-testid="
              headerRow.id === '__flat__'
                ? partTestId(testIdBase, 'header-row')
                : valueTestId(testIdBase, 'header-row', headerRow.id)
            "
          >
            <th
              v-for="column in headerRow.columns"
              :key="column.id"
              scope="col"
              :colspan="headerCellColspan(column)"
              :rowspan="headerCellRowspan(column)"
              :class="headerCellClassWithResize(column)"
              :style="headerCellStyle(column, { rowIndex: headerRowIndex })"
              :data-column-id="column.body === false ? undefined : column.id"
              :data-frozen="column.frozen || undefined"
              :data-frozen-align="column.frozen ? (column.alignFrozen ?? 'left') : undefined"
              :draggable="isColumnReorderable(column) || undefined"
              :aria-sort="
                column.sortable && column.field ? fieldAriaSort(column.field) : undefined
              "
              :data-testid="
                column.selectionMode
                  ? partTestId(testIdBase, 'column-header-selection')
                  : column.rowReorder
                    ? partTestId(testIdBase, 'column-header-row-reorder')
                    : column.field
                      ? valueTestId(testIdBase, 'column-header', column.field)
                      : column.header
                        ? valueTestId(testIdBase, 'column-header-group', column.header)
                        : partTestId(testIdBase, 'column-header')
              "
              @dragstart="onColumnDragStart($event, column)"
              @dragover="onColumnDragOver($event, column)"
              @drop="onColumnDrop($event, column)"
              @dragend="onColumnDragEnd"
            >
              <div
                :class="
                  isColumnReorderable(column) ? 'flex items-center gap-1' : undefined
                "
              >
                <!-- --- resize / reorder (Wave 3): column drag affordance --- -->
                <button
                  v-if="isColumnReorderable(column)"
                  type="button"
                  :class="columnReorderHandleClasses"
                  :aria-label="columnReorderHandleAriaLabel"
                  :data-testid="
                    column.field
                      ? valueTestId(testIdBase, 'column-reorder', column.field)
                      : partTestId(testIdBase, 'column-reorder')
                  "
                  draggable="true"
                  @dragstart.stop="onColumnDragStart($event, column)"
                  @click.prevent
                >
                  <Icon size="sm" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="9" cy="7" r="1.5" />
                      <circle cx="15" cy="7" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="17" r="1.5" />
                      <circle cx="15" cy="17" r="1.5" />
                    </svg>
                  </Icon>
                </button>
                <!-- Content cluster: label/sort + filter hug text (no flex-1 push). -->
                <div
                  :class="
                    filterDisplay === 'menu' && isColumnFilterable(column)
                      ? 'inline-flex min-w-0 items-center gap-1'
                      : undefined
                  "
                >
                  <!-- --- selection (Wave 1) --- -->
                  <template v-if="column.selectionMode === 'multiple'">
                    <SlotFn
                      v-if="column.slots.header"
                      :fn="column.slots.header"
                      :props="{ column }"
                    />
                    <Checkbox
                      v-else
                      :model-value="allRowsSelected"
                      :indeterminate="someRowsSelected"
                      :disabled="loading || pageSourceRows.length === 0"
                      :data-testid="partTestId(testIdBase, 'select-all')"
                      aria-label="Select all rows"
                      @update:model-value="onSelectAllUpdate($event)"
                    />
                  </template>
                  <template v-else-if="column.selectionMode === 'single'">
                    <SlotFn
                      v-if="column.slots.header"
                      :fn="column.slots.header"
                      :props="{ column }"
                    />
                    <span v-else class="sr-only">Row selection</span>
                  </template>
                  <!-- --- sort (Wave 1) --- -->
                  <button
                    v-else-if="column.sortable && column.field"
                    type="button"
                    :class="sortHeaderButtonClasses"
                    :data-testid="valueTestId(testIdBase, 'sort', column.field)"
                    :data-sort-order="fieldSortOrder(column.field) || undefined"
                    @click="onSortActivate($event, column.field!)"
                  >
                    <span class="text-left">
                      <SlotFn
                        v-if="column.slots.header"
                        :fn="column.slots.header"
                        :props="{ column }"
                      />
                      <template v-else>
                        {{ column.header ?? column.field ?? '' }}
                      </template>
                    </span>
                    <span
                      v-if="fieldSortBadge(column.field)"
                      class="inline-flex size-4 shrink-0 items-center justify-center rounded-kablui-full bg-kablui-muted text-kablui-sm font-kablui-medium leading-none text-kablui-muted-fg"
                      :data-testid="valueTestId(testIdBase, 'sort-badge', column.field)"
                    >
                      {{ fieldSortBadge(column.field) }}
                    </span>
                    <Icon size="sm" class="shrink-0 text-kablui-muted-fg">
                      <!-- ascending -->
                      <svg
                        v-if="fieldSortOrder(column.field) === 1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                      <!-- descending -->
                      <svg
                        v-else-if="fieldSortOrder(column.field) === -1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                      <!-- unsorted -->
                      <svg
                        v-else
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                        class="opacity-50"
                      >
                        <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
                      </svg>
                    </Icon>
                  </button>
                  <template v-else>
                    <SlotFn
                      v-if="column.slots.header"
                      :fn="column.slots.header"
                      :props="{ column }"
                    />
                    <!-- --- edit (Wave 2) --- -->
                    <span v-else-if="column.rowEditor" class="sr-only">Row actions</span>
                    <!-- --- resize / reorder (Wave 3) --- -->
                    <span v-else-if="column.rowReorder" class="sr-only">Reorder</span>
                    <!-- --- expand / group (Wave 3) --- -->
                    <span v-else-if="column.expander" class="sr-only">Expand</span>
                    <template v-else>
                      {{ column.header ?? column.field ?? '' }}
                    </template>
                  </template>
                  <!-- --- filter (Wave 2): menu trigger hugs header text --- -->
                  <TableColumnFilter
                    v-if="filterDisplay === 'menu' && isColumnFilterable(column)"
                    :field="column.field!"
                    display="menu"
                    :filter-meta="fieldFilterMeta(column.field!)"
                    :column="column"
                    :size="size"
                    :test-id-base="testIdBase"
                    :show-operator="isFilterMetaAdvanced(fieldFilterMeta(column.field!))"
                    @apply="applyFieldFilter(column.field!, $event)"
                    @clear="clearFieldFilter(column.field!)"
                  />
                </div>
              </div>
              <!-- --- resize / reorder (Wave 3): column resize handle --- -->
              <button
                v-if="isColumnResizable(column)"
                type="button"
                :aria-label="columnResizeHandleAriaLabel"
                :class="resizeHandleClasses"
                :data-testid="
                  column.field
                    ? valueTestId(testIdBase, 'column-resize', column.field)
                    : partTestId(testIdBase, 'column-resize')
                "
                @pointerdown="onColumnResizeStart($event, column)"
              />
            </th>
          </tr>
          <!-- --- filter (Wave 2): row display --- -->
          <tr
            v-if="filterDisplay === 'row'"
            data-slot="table-filter-row"
            :data-testid="partTestId(testIdBase, 'filter-row')"
          >
            <th
              v-for="column in visibleColumns"
              :key="`filter-${column.id}`"
              scope="col"
              :class="headerCellClass(column)"
              :style="headerCellStyle(column, { filterRow: true })"
              :data-frozen="column.frozen || undefined"
              :data-frozen-align="column.frozen ? (column.alignFrozen ?? 'left') : undefined"
            >
              <TableColumnFilter
                v-if="isColumnFilterable(column)"
                :field="column.field!"
                display="row"
                :filter-meta="fieldFilterMeta(column.field!)"
                :column="column"
                :size="size"
                :test-id-base="testIdBase"
                @apply="applyFieldFilter(column.field!, $event)"
                @clear="clearFieldFilter(column.field!)"
              />
              <span v-else class="sr-only">
                {{ column.header ?? column.field ?? 'Column' }} (no filter)
              </span>
            </th>
          </tr>
        </thead>

        <!-- --- body (Wave 2+ edit wrappers; Wave 3 expand/group rows) --- -->
        <tbody data-slot="table-tbody">
          <!-- Loading replaces body content (no translucent mask over live rows). -->
          <tr v-if="loading">
            <td
              :colspan="Math.max(visibleColumns.length, 1)"
              data-slot="table-loading"
              :data-testid="partTestId(testIdBase, 'loading')"
              :class="[sizeCellClasses[size], 'bg-kablui-bg']"
            >
              <div class="flex min-h-24 items-center justify-center py-6">
                <slot name="loading">
                  <Spinner size="lg" label="Loading" />
                </slot>
              </div>
            </td>
          </tr>

          <template v-else>
          <!-- --- scroll / frozen (Wave 2): pinned rows (edit / selection wired) --- -->
          <tr
            v-for="(row, frozenIndex) in frozenRows"
            :key="`frozen-${rowKey(row, frozenIndex)}`"
            :ref="(el) => setFrozenRowRef(el, frozenIndex)"
            :class="[
              frozenRowClasses(frozenIndex, row),
              selectionRowClasses(row),
              focusedFrozenRowClasses(frozenIndex),
              contextMenuRowClasses(row),
            ]"
            data-frozen-row="true"
            :data-testid="valueTestId(testIdBase, 'frozen-row', rowKey(row, frozenIndex))"
            :data-selected="selectionEnabled && isRowSelected(row) ? 'true' : undefined"
            :data-focused="
              selectionEnabled && focusedFrozenIndex === frozenIndex ? 'true' : undefined
            "
            :data-context-menu-selection="isContextMenuRow(row) ? 'true' : undefined"
            :aria-selected="selectionEnabled ? (isRowSelected(row) ? 'true' : 'false') : undefined"
            :tabindex="
              selectionEnabled
                ? focusedFrozenIndex === frozenIndex
                  ? 0
                  : -1
                : undefined
            "
            :style="virtualEnabled ? { height: `${virtualItemSize}px` } : undefined"
            @click="onFrozenRowClick($event, row, frozenIndex)"
            @keydown="onFrozenRowKeydown($event, row, frozenIndex)"
            @contextmenu="
              onRowContextMenu($event, row, frozenRowEventIndex(row, frozenIndex))
            "
          >
            <td
              v-for="column in visibleColumns"
              :key="column.id"
              :ref="(el) => setEditingCellRef(el, row, column)"
              :class="
                bodyCellClass(column, {
                  frozenRow: true,
                  striped: striped && frozenIndex % 2 === 1,
                  selected: selectionEnabled && isRowSelected(row),
                })
              "
              :style="bodyCellStyle(column, { frozenRow: true })"
              :data-column-id="column.id"
              :data-frozen="column.frozen || undefined"
              :data-frozen-align="column.frozen ? (column.alignFrozen ?? 'left') : undefined"
              :data-editing="showCellEditor(row, column) || undefined"
              :data-testid="
                column.selectionMode
                  ? valueTestId(
                      testIdBase,
                      'frozen-cell-selection',
                      rowKey(row, frozenIndex),
                    )
                  : column.rowEditor
                    ? valueTestId(
                        testIdBase,
                        'frozen-cell-row-editor',
                        rowKey(row, frozenIndex),
                      )
                    : column.field
                      ? valueTestId(
                          testIdBase,
                          'frozen-cell',
                          `${rowKey(row, frozenIndex)}-${column.field}`,
                        )
                      : partTestId(testIdBase, 'frozen-cell')
              "
              @click="
                onCellClick(
                  $event,
                  row,
                  column,
                  frozenIndex,
                  frozenRowEventIndex(row, frozenIndex),
                )
              "
            >
              <span
                v-if="column.selectionMode === 'multiple'"
                data-slot="table-selection-cell"
                class="inline-flex"
                @click.stop
                @keydown.stop
              >
                <Checkbox
                  :model-value="isRowSelected(row)"
                  :disabled="loading"
                  :data-testid="
                    valueTestId(testIdBase, 'frozen-row-select', rowKey(row, frozenIndex))
                  "
                  :aria-label="`Select row ${rowKey(row, frozenIndex)}`"
                  @update:model-value="onFrozenRowCheckboxUpdate(row, frozenIndex, $event)"
                />
              </span>
              <span
                v-else-if="column.selectionMode === 'single'"
                data-slot="table-selection-cell"
                class="inline-flex"
                @click.stop
                @keydown.stop
              >
                <Radio
                  :value="rowKey(row, frozenIndex)"
                  :disabled="loading"
                  :aria-label="`Select row ${rowKey(row, frozenIndex)}`"
                />
              </span>
              <span
                v-else-if="column.rowEditor"
                data-slot="table-row-editor"
                class="inline-flex items-center gap-1"
                @click.stop
                @keydown.stop
              >
                <template v-if="editMode === 'row' && isEditingRow(row)">
                  <button
                    type="button"
                    :class="rowEditorButtonClasses"
                    :disabled="loading"
                    :aria-label="saveButtonAriaLabel"
                    :data-testid="
                      valueTestId(testIdBase, 'frozen-row-save', rowKey(row, frozenIndex))
                    "
                    @click="
                      onRowEditSave(
                        $event,
                        row,
                        frozenIndex,
                        frozenRowEventIndex(row, frozenIndex),
                      )
                    "
                  >
                    <Icon size="sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </Icon>
                  </button>
                  <button
                    type="button"
                    :class="rowEditorButtonClasses"
                    :disabled="loading"
                    :aria-label="cancelButtonAriaLabel"
                    :data-testid="
                      valueTestId(testIdBase, 'frozen-row-cancel', rowKey(row, frozenIndex))
                    "
                    @click="
                      onRowEditCancel(
                        $event,
                        row,
                        frozenIndex,
                        frozenRowEventIndex(row, frozenIndex),
                      )
                    "
                  >
                    <Icon size="sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </Icon>
                  </button>
                </template>
                <button
                  v-else-if="editMode === 'row'"
                  type="button"
                  :class="rowEditorButtonClasses"
                  :disabled="loading"
                  :aria-label="editButtonAriaLabel"
                  :data-testid="
                    valueTestId(testIdBase, 'frozen-row-edit', rowKey(row, frozenIndex))
                  "
                  @click="
                    onRowEditInit(
                      $event,
                      row,
                      frozenIndex,
                      frozenRowEventIndex(row, frozenIndex),
                    )
                  "
                >
                  <Icon size="sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </Icon>
                </button>
              </span>
              <span
                v-else-if="showCellEditor(row, column)"
                data-slot="table-cell-editor"
                class="block w-full"
                :data-testid="
                  column.field
                    ? valueTestId(
                        testIdBase,
                        'frozen-cell-editor',
                        `${rowKey(row, frozenIndex)}-${column.field}`,
                      )
                    : partTestId(testIdBase, 'frozen-cell-editor')
                "
                @click.stop
                @keydown="
                  onEditorKeydown(
                    $event,
                    row,
                    column,
                    frozenRowEventIndex(row, frozenIndex),
                  )
                "
              >
                <SlotFn
                  v-if="column.slots.editor"
                  :fn="column.slots.editor"
                  :props="{
                    data: getEditingData(row),
                    field: column.field,
                    index: frozenRowEventIndex(row, frozenIndex),
                    column,
                  }"
                />
              </span>
              <SlotFn
                v-else-if="column.slots.body"
                :fn="column.slots.body"
                :props="{
                  data: row,
                  field: column.field,
                  index: frozenRowEventIndex(row, frozenIndex),
                  column,
                }"
              />
              <template v-else>
                {{ cellValue(row, column.field) }}
              </template>
            </td>
          </tr>

          <template v-if="!isEmpty">
            <!-- --- lazy / virtual (Wave 4): top spacer --- -->
            <tr
              v-if="virtualEnabled && virtualSpacerTop > 0"
              data-slot="table-virtual-spacer-top"
              :data-testid="partTestId(testIdBase, 'virtual-spacer-top')"
              aria-hidden="true"
            >
              <td
                :colspan="Math.max(visibleColumns.length, 1)"
                :style="{ height: `${virtualSpacerTop}px`, padding: 0, border: 0 }"
              />
            </tr>

            <!-- --- expand / group (Wave 3): bodyDisplayItems (group chrome + rows + expansion) --- -->
            <template v-for="item in bodyDisplayItems" :key="item.key">
              <!-- group header -->
              <tr
                v-if="item.kind === 'groupheader'"
                data-slot="table-group-header"
                :data-testid="valueTestId(testIdBase, 'group-header', item.groupKey)"
                class="bg-kablui-muted/40 font-kablui-medium"
              >
                <td
                  :colspan="Math.max(visibleColumns.length, 1)"
                  :class="[
                    sizeCellClasses[size],
                    showGridlines ? gridlineCellClasses : '',
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <button
                      v-if="expandableRowGroups"
                      type="button"
                      :class="expandTogglerButtonClasses"
                      :aria-expanded="item.expanded ? 'true' : 'false'"
                      :aria-controls="item.controlsId"
                      :aria-label="item.expanded ? collapseButtonAriaLabel : expandButtonAriaLabel"
                      :data-testid="valueTestId(testIdBase, 'group-toggler', item.groupKey)"
                      :disabled="loading"
                      @click="onToggleRowGroupExpand($event, item.groupValue)"
                    >
                      <Icon size="sm" class="text-kablui-muted-fg">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          aria-hidden="true"
                          :class="item.expanded ? 'rotate-90' : ''"
                          class="transition-transform"
                        >
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </Icon>
                    </button>
                    <div class="min-w-0 flex-1">
                      <slot
                        name="groupheader"
                        :data="item.data"
                        :index="0"
                        :group-value="item.groupValue"
                        :rows="item.rows"
                      >
                        {{ item.groupValue }}
                      </slot>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- data row -->
              <tr
                v-else-if="item.kind === 'row'"
                :id="item.groupBodyId"
                :ref="(el) => setRowRef(el, item.rowIndex)"
                :class="[
                  bodyRowClassesWithReorder(item.rowIndex),
                  selectionRowClasses(item.row),
                  focusedRowClasses(item.rowIndex),
                  contextMenuRowClasses(item.row),
                ]"
                :style="virtualEnabled ? { height: `${virtualItemSize}px` } : undefined"
                :data-testid="valueTestId(testIdBase, 'row', rowKey(item.row, item.pipelineIndex))"
                :data-selected="selectionEnabled && isRowSelected(item.row) ? 'true' : undefined"
                :data-focused="
                  selectionEnabled &&
                  focusedFrozenIndex == null &&
                  focusedRowIndex === item.rowIndex
                    ? 'true'
                    : undefined
                "
                :data-context-menu-selection="isContextMenuRow(item.row) ? 'true' : undefined"
                :data-virtual-placeholder="item.row == null ? 'true' : undefined"
                :aria-selected="
                  selectionEnabled && item.row != null
                    ? isRowSelected(item.row)
                      ? 'true'
                      : 'false'
                    : undefined
                "
                :tabindex="
                  selectionEnabled && item.row != null
                    ? focusedFrozenIndex == null && focusedRowIndex === item.rowIndex
                      ? 0
                      : -1
                    : undefined
                "
                @click="item.row != null && onRowClick($event, item.row, item.rowIndex)"
                @keydown="item.row != null && onRowKeydown($event, item.row, item.rowIndex)"
                @contextmenu="
                  item.row != null && onRowContextMenu($event, item.row, item.pipelineIndex)
                "
                @dragover="onRowReorderDragOver($event, item.rowIndex)"
                @drop="onRowReorderDrop($event, item.rowIndex)"
                @dragend="onRowReorderDragEnd"
              >
                <template v-for="column in visibleColumns" :key="column.id">
                <td
                  v-if="!shouldOmitRowspanCell(column, item.rowspanMeta)"
                  :ref="(el) => setEditingCellRef(el, item.row, column)"
                  :rowspan="rowspanForCell(column, item.rowspanMeta)"
                  :class="
                    bodyCellClass(column, {
                      striped: striped && item.rowIndex % 2 === 1,
                      selected:
                        selectionEnabled && item.row != null && isRowSelected(item.row),
                    })
                  "
                  :style="bodyCellStyle(column)"
                  :data-column-id="column.id"
                  :data-frozen="column.frozen || undefined"
                  :data-frozen-align="column.frozen ? (column.alignFrozen ?? 'left') : undefined"
                  :data-editing="showCellEditor(item.row, column) || undefined"
                  :data-testid="
                    column.selectionMode
                      ? valueTestId(
                          testIdBase,
                          'cell-selection',
                          rowKey(item.row, item.pipelineIndex),
                        )
                      : column.rowReorder
                        ? valueTestId(
                            testIdBase,
                            'cell-row-reorder',
                            rowKey(item.row, item.pipelineIndex),
                          )
                        : column.expander
                          ? valueTestId(
                              testIdBase,
                              'cell-expander',
                              rowKey(item.row, item.pipelineIndex),
                            )
                          : column.rowEditor
                          ? valueTestId(
                              testIdBase,
                              'cell-row-editor',
                              rowKey(item.row, item.pipelineIndex),
                            )
                          : column.field
                            ? valueTestId(
                                testIdBase,
                                'cell',
                                `${rowKey(item.row, item.pipelineIndex)}-${column.field}`,
                              )
                            : partTestId(testIdBase, 'cell')
                  "
                  @click="onCellClick($event, item.row, column, item.rowIndex)"
                >
                  <!-- --- selection (Wave 1) --- -->
                  <span
                    v-if="column.selectionMode === 'multiple'"
                    data-slot="table-selection-cell"
                    class="inline-flex"
                    @click.stop
                    @keydown.stop
                  >
                    <Checkbox
                      :model-value="isRowSelected(item.row)"
                      :disabled="loading"
                      :data-testid="
                        valueTestId(
                          testIdBase,
                          'row-select',
                          rowKey(item.row, item.pipelineIndex),
                        )
                      "
                      :aria-label="`Select row ${rowKey(item.row, item.pipelineIndex)}`"
                      @update:model-value="onRowCheckboxUpdate(item.row, item.rowIndex, $event)"
                    />
                  </span>
                  <span
                    v-else-if="column.selectionMode === 'single'"
                    data-slot="table-selection-cell"
                    class="inline-flex"
                    @click.stop
                    @keydown.stop
                  >
                    <Radio
                      :value="rowKey(item.row, item.pipelineIndex)"
                      :disabled="loading"
                      :aria-label="`Select row ${rowKey(item.row, item.pipelineIndex)}`"
                    />
                  </span>
                  <!-- --- resize / reorder (Wave 3) --- -->
                  <span
                    v-else-if="column.rowReorder"
                    data-slot="table-row-reorder"
                    class="inline-flex"
                    @click.stop
                    @keydown.stop
                  >
                    <button
                      type="button"
                      :class="rowReorderHandleClasses"
                      :aria-label="rowReorderHandleAriaLabel"
                      :disabled="loading || !reorderableRows"
                      :data-testid="
                        valueTestId(
                          testIdBase,
                          'row-reorder',
                          rowKey(item.row, item.pipelineIndex),
                        )
                      "
                      draggable="true"
                      @dragstart="onRowReorderDragStart($event, item.rowIndex)"
                    >
                      <Icon size="sm" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <circle cx="9" cy="7" r="1.5" />
                          <circle cx="15" cy="7" r="1.5" />
                          <circle cx="9" cy="12" r="1.5" />
                          <circle cx="15" cy="12" r="1.5" />
                          <circle cx="9" cy="17" r="1.5" />
                          <circle cx="15" cy="17" r="1.5" />
                        </svg>
                      </Icon>
                    </button>
                  </span>
                  <!-- --- expand / group (Wave 3) --- -->
                  <span
                    v-else-if="column.expander"
                    data-slot="table-expander"
                    class="inline-flex"
                    @click.stop
                    @keydown.stop
                  >
                    <button
                      type="button"
                      :class="expandTogglerButtonClasses"
                      :aria-expanded="isRowExpanded(item.row) ? 'true' : 'false'"
                      :aria-controls="expansionDomId(item.row, item.pipelineIndex)"
                      :aria-label="
                        isRowExpanded(item.row) ? collapseButtonAriaLabel : expandButtonAriaLabel
                      "
                      :data-testid="
                        valueTestId(
                          testIdBase,
                          'row-toggler',
                          rowKey(item.row, item.pipelineIndex),
                        )
                      "
                      :disabled="loading"
                      @click="onToggleRowExpand($event, item.row)"
                    >
                      <Icon size="sm" class="text-kablui-muted-fg">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          aria-hidden="true"
                          class="transition-transform"
                          :class="isRowExpanded(item.row) ? 'rotate-90' : ''"
                        >
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </Icon>
                    </button>
                  </span>
                  <!-- --- edit (Wave 2) --- -->
                  <span
                    v-else-if="column.rowEditor"
                    data-slot="table-row-editor"
                    class="inline-flex items-center gap-1"
                    @click.stop
                    @keydown.stop
                  >
                    <template v-if="editMode === 'row' && isEditingRow(item.row)">
                      <button
                        type="button"
                        :class="rowEditorButtonClasses"
                        :disabled="loading"
                        :aria-label="saveButtonAriaLabel"
                        :data-testid="
                          valueTestId(
                            testIdBase,
                            'row-save',
                            rowKey(item.row, item.pipelineIndex),
                          )
                        "
                        @click="onRowEditSave($event, item.row, item.rowIndex)"
                      >
                        <Icon size="sm">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </Icon>
                      </button>
                      <button
                        type="button"
                        :class="rowEditorButtonClasses"
                        :disabled="loading"
                        :aria-label="cancelButtonAriaLabel"
                        :data-testid="
                          valueTestId(
                            testIdBase,
                            'row-cancel',
                            rowKey(item.row, item.pipelineIndex),
                          )
                        "
                        @click="onRowEditCancel($event, item.row, item.rowIndex)"
                      >
                        <Icon size="sm">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </Icon>
                      </button>
                    </template>
                    <button
                      v-else-if="editMode === 'row'"
                      type="button"
                      :class="rowEditorButtonClasses"
                      :disabled="loading"
                      :aria-label="editButtonAriaLabel"
                      :data-testid="
                        valueTestId(
                          testIdBase,
                          'row-edit',
                          rowKey(item.row, item.pipelineIndex),
                        )
                      "
                      @click="onRowEditInit($event, item.row, item.rowIndex)"
                    >
                      <Icon size="sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </Icon>
                    </button>
                  </span>
                  <span
                    v-else-if="showCellEditor(item.row, column)"
                    data-slot="table-cell-editor"
                    class="block w-full"
                    :data-testid="
                      column.field
                        ? valueTestId(
                            testIdBase,
                            'cell-editor',
                            `${rowKey(item.row, item.pipelineIndex)}-${column.field}`,
                          )
                        : partTestId(testIdBase, 'cell-editor')
                    "
                    @click.stop
                    @keydown="onEditorKeydown($event, item.row, column, item.rowIndex)"
                  >
                    <SlotFn
                      v-if="column.slots.editor"
                      :fn="column.slots.editor"
                      :props="{
                        data: getEditingData(item.row),
                        field: column.field,
                        index: item.pipelineIndex,
                        column,
                      }"
                    />
                  </span>
                  <SlotFn
                    v-else-if="column.slots.body"
                    :fn="column.slots.body"
                    :props="{
                      data: item.row,
                      field: column.field,
                      index: item.pipelineIndex,
                      column,
                    }"
                  />
                  <template v-else>
                    {{ cellValue(item.row, column.field) }}
                  </template>
                </td>
                </template>
              </tr>

              <!-- expansion detail -->
              <tr
                v-else-if="item.kind === 'expansion'"
                :id="item.expansionId"
                data-slot="table-expansion"
                :data-testid="
                  valueTestId(testIdBase, 'expansion', rowKey(item.row, item.pipelineIndex))
                "
              >
                <td
                  :colspan="Math.max(visibleColumns.length, 1)"
                  :class="[
                    sizeCellClasses[size],
                    'bg-kablui-muted/20',
                    showGridlines ? gridlineCellClasses : '',
                  ]"
                >
                  <slot
                    name="expansion"
                    :data="item.row"
                    :index="item.pipelineIndex"
                  />
                </td>
              </tr>

              <!-- group footer -->
              <tr
                v-else-if="item.kind === 'groupfooter'"
                data-slot="table-group-footer"
                :data-testid="valueTestId(testIdBase, 'group-footer', item.groupKey)"
                class="bg-kablui-muted/20"
              >
                <td
                  :colspan="Math.max(visibleColumns.length, 1)"
                  :class="[
                    sizeCellClasses[size],
                    showGridlines ? gridlineCellClasses : '',
                  ]"
                >
                  <slot
                    name="groupfooter"
                    :data="item.data"
                    :index="0"
                    :group-value="item.groupValue"
                    :rows="item.rows"
                  >
                    {{ item.rows.length }} items
                  </slot>
                </td>
              </tr>
            </template>

            <!-- --- lazy / virtual (Wave 4): bottom spacer --- -->
            <tr
              v-if="virtualEnabled && virtualSpacerBottom > 0"
              data-slot="table-virtual-spacer-bottom"
              :data-testid="partTestId(testIdBase, 'virtual-spacer-bottom')"
              aria-hidden="true"
            >
              <td
                :colspan="Math.max(visibleColumns.length, 1)"
                :style="{ height: `${virtualSpacerBottom}px`, padding: 0, border: 0 }"
              />
            </tr>
          </template>

          <tr v-else-if="!hasFrozenRows">
            <td
              :colspan="Math.max(visibleColumns.length, 1)"
              class="p-0"
              :data-testid="partTestId(testIdBase, 'empty')"
            >
              <slot name="empty">
                <Empty title="No data" />
              </slot>
            </td>
          </tr>
          </template>
        </tbody>

        <!-- --- footer cells --- -->
        <!-- --- column groups / visibility (Wave 3): footer group or flat footers --- -->
        <tfoot
          v-if="hasFooterGroup || hasColumnFooters"
          data-slot="table-tfoot"
          :data-column-group="hasFooterGroup || undefined"
        >
          <template v-if="hasFooterGroup">
            <tr
              v-for="footerRow in tfootLabelRows"
              :key="footerRow.id"
              :data-testid="valueTestId(testIdBase, 'footer-row', footerRow.id)"
            >
              <td
                v-for="column in footerRow.columns"
                :key="column.id"
                :colspan="headerCellColspan(column)"
                :rowspan="headerCellRowspan(column)"
                :class="footerCellClass(column)"
                :style="footerCellStyle(column)"
                :data-frozen="column.frozen || undefined"
                :data-frozen-align="column.frozen ? (column.alignFrozen ?? 'left') : undefined"
                :data-testid="
                  column.field
                    ? valueTestId(testIdBase, 'column-footer', column.field)
                    : column.footer
                      ? valueTestId(testIdBase, 'column-footer-group', column.footer)
                      : partTestId(testIdBase, 'column-footer')
                "
              >
                <SlotFn
                  v-if="column.slots.footer"
                  :fn="column.slots.footer"
                  :props="{ column }"
                />
                <template v-else>
                  {{ column.footer ?? column.header ?? '' }}
                </template>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td
              v-for="column in visibleColumns"
              :key="column.id"
              :class="footerCellClass(column)"
              :style="footerCellStyle(column)"
              :data-frozen="column.frozen || undefined"
              :data-frozen-align="column.frozen ? (column.alignFrozen ?? 'left') : undefined"
              :data-testid="
                column.field
                  ? valueTestId(testIdBase, 'column-footer', column.field)
                  : partTestId(testIdBase, 'column-footer')
              "
            >
              <SlotFn
                v-if="column.slots.footer"
                :fn="column.slots.footer"
                :props="{ column }"
              />
              <template v-else>
                {{ column.footer ?? '' }}
              </template>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Table-level summary region (below the grid, outside scrollport) -->
    <div
      v-if="slots.footer"
      data-slot="table-caption-footer"
      :data-testid="partTestId(testIdBase, 'footer')"
      class="px-0 py-2"
    >
      <slot name="footer" />
    </div>

    <!-- --- pagination (Wave 1) --- -->
    <TablePaginator
      v-if="showPaginator"
      v-model:page="page"
      :page-count="tablePageCount"
      :test-id="partTestId(testIdBase, 'paginator')"
      :pagination-test-id="partTestId(testIdBase, 'pagination')"
      :disabled="loading"
    />

    <!--
      Column registration host. TableColumn children mount here (hidden) and
      register defs via provide/inject. Supports dynamic v-for columns.
    -->
    <div hidden aria-hidden="true" data-slot="table-columns">
      <slot />
    </div>
  </div>
</template>
