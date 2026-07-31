import type { CSSProperties, Slot } from 'vue'

/**
 * Client-side data pipeline order (non-lazy):
 *   filter → sort → group → page → render
 *
 * Lazy mode: render `value` as-is and emit intent events (page/sort/filter)
 * instead of running the client pipeline.
 *
 * Wave 0 renders `value` directly. Later waves hook into this order additively.
 */

export type TableSize = 'sm' | 'md' | 'lg'

export type TableAlign = 'left' | 'center' | 'right'

export type TableFrozenAlign = 'left' | 'right'

export type TableSelectionMode = 'single' | 'multiple'

/** Sort direction: 1 ascending, -1 descending, 0 unsorted. */
export type TableSortOrder = 1 | -1 | 0

/** Single-column vs Ctrl/Cmd multi-column sort. */
export type TableSortMode = 'single' | 'multiple'

export interface TableSortMeta {
  field: string
  order: TableSortOrder
}

/** Payload for the `sort` emit (Wave 1). */
export interface TableSortEvent {
  originalEvent: Event
  sortField: string | null
  sortOrder: TableSortOrder | null
  multiSortMeta: TableSortMeta[]
}

/** Captured slot renderers from a `TableColumn` instance. */
export interface TableColumnSlots {
  body?: Slot
  header?: Slot
  footer?: Slot
  /** Wave 2+: filter UI */
  filter?: Slot
  /** Wave 2+: cell/row editor */
  editor?: Slot
}

/**
 * Registered column definition.
 * Additive-friendly: later waves may read optional fields without renaming.
 */
export interface TableColumnDef {
  /** Stable instance id for register / unregister. */
  id: string
  field?: string
  header?: string
  footer?: string
  sortable?: boolean
  filterable?: boolean
  /**
   * Filter value / match-mode UI (`'text'` default, `'numeric'` for number filters).
   * PrimeVue Column `dataType` parity.
   */
  dataType?: 'text' | 'numeric'
  /** Pin during horizontal scroll (Wave 2). */
  frozen?: boolean
  /** `'left'` (default) or `'right'` when `frozen`. */
  alignFrozen?: TableFrozenAlign
  width?: string
  minWidth?: string
  selectionMode?: TableSelectionMode
  rowEditor?: boolean
  expander?: boolean
  /** Row drag-handle column (Wave 3). */
  rowReorder?: boolean
  /**
   * When `false`, excluded from column header reorder (Wave 3).
   * Default `true` for data columns; special columns often set `false`.
   */
  reorderableColumn?: boolean
  /** When `false`, column is omitted from render. Default `true`. */
  visible?: boolean
  /**
   * When `false`, column is header/footer chrome only (column groups).
   * Default `true` for body-capable columns and flat tables.
   */
  body?: boolean
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
  slots: TableColumnSlots
}

/** `'header'` | `'footer'` for `TableColumnGroup`. */
export type TableColumnGroupType = 'header' | 'footer'

/** One header/footer row registered by `TableHeaderRow`. */
export interface TableHeaderRowDef {
  /** Stable instance id for register / unregister. */
  id: string
  /** Ordered `TableColumn` instance ids in this row. */
  columnIds: string[]
}

/** Payload shape helpers for later waves (emits). */
export interface TablePropsRowEvent {
  originalEvent: Event
  data: unknown
  index: number
}

export type TableRowData = Record<string, unknown>

// --- selection (Wave 1) ---
/** `v-model:selection` value: one row, many rows, or empty. */
export type TableSelectionValue = unknown | unknown[] | null | undefined

/** Fired when a row becomes selected. */
export type TableRowSelectEvent = TablePropsRowEvent

/** Fired when a row becomes unselected. */
export type TableRowUnselectEvent = TablePropsRowEvent

// --- pagination (Wave 1) ---

/** Snapshot of client/lazy page state (lazy Wave 4 may extend). */
export interface TablePageState {
  /** Current page (1-based). */
  page: number
  /** Page size. */
  rows: number
  /** Total pages from `totalRecords` / `rows`. */
  pageCount: number
  /** Total records (client length, or `totalRecords` when provided). */
  totalRecords: number
}

// --- edit (Wave 2) ---

/** Cell click-to-edit vs row editor controls. */
export type TableEditMode = 'cell' | 'row'

/** Fired when a cell edit is cancelled (Escape). */
export interface TableCellEditCancelEvent {
  originalEvent: Event
  data: unknown
  field: string
  index: number
}

/**
 * Fired when a cell edit completes (Enter / outside click).
 * Consumer applies `newValue` / `newData` to their `value` array.
 */
export interface TableCellEditCompleteEvent {
  originalEvent: Event
  data: unknown
  newData: unknown
  value: unknown
  newValue: unknown
  field: string
  index: number
  /** Completion reason: `'enter'` | `'outside'`. */
  type: string
}

/** Fired when row edit starts (Edit button). */
export interface TableRowEditInitEvent {
  originalEvent: Event
  data: unknown
  newData: unknown
  index: number
}

/** Fired when row edit is saved. */
export type TableRowEditSaveEvent = TableRowEditInitEvent

/** Fired when row edit is cancelled. */
export type TableRowEditCancelEvent = TableRowEditInitEvent

// --- resize / reorder (Wave 3) ---

/** Column resize mode: fit steals from adjacent; expand grows the table. */
export type TableColumnResizeMode = 'fit' | 'expand'

/** Fired when a column resize drag ends. */
export interface TableColumnResizeEndEvent {
  originalEvent: Event
  /** Column instance id. */
  columnId: string
  /** Column field when set. */
  field?: string
  /** Final width in px. */
  width: number
  /** Change in width (px). */
  delta: number
}

/** Fired when columns are reordered via drag-and-drop. */
export interface TableColumnReorderEvent {
  originalEvent: Event
  dragIndex: number
  dropIndex: number
  /** New order keys (`field` or column `id`). */
  columnOrder: string[]
}

/** Fired when rows are reordered via drag-and-drop. */
export interface TableRowReorderEvent {
  originalEvent: Event
  dragIndex: number
  dropIndex: number
  /** Reordered row array (full `value` order). */
  value: unknown[]
}

// --- filter (Wave 2) ---

/** Where column filter UI is rendered. */
export type TableFilterDisplay = 'row' | 'menu'

/** Match-mode string tokens (see `FilterMatchMode` in `filter.ts`). */
export type TableFilterMatchMode =
  | 'startsWith'
  | 'contains'
  | 'notContains'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'in'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'dateIs'
  | 'dateIsNot'
  | 'dateBefore'
  | 'dateAfter'
  | (string & {})

/** AND/OR across advanced menu constraints. */
export type TableFilterOperator = 'and' | 'or' | (string & {})

/** Single constraint: value + match mode. */
export interface TableFilterConstraint {
  value: unknown
  matchMode: TableFilterMatchMode
}

/** Simple (row) filter meta: one value + match mode. */
export interface TableFilterMetaSimple {
  value: unknown
  matchMode: TableFilterMatchMode
}

/** Advanced (menu) filter meta: operator + constraint list. */
export interface TableFilterMetaAdvanced {
  operator: TableFilterOperator
  constraints: TableFilterConstraint[]
}

export type TableFilterMeta = TableFilterMetaSimple | TableFilterMetaAdvanced

/**
 * Filter state keyed by field name, plus optional `global` key.
 * Bind with `v-model:filters`.
 */
export type TableFilters = Record<string, TableFilterMeta>

/** Payload for the `filter` emit (Wave 2). */
export interface TableFilterEvent {
  filters: TableFilters
  filteredValue: unknown[]
}

// --- expand / group (Wave 3) ---

/** Subheader chrome vs rowspan merge on the group column. */
export type TableRowGroupMode = 'subheader' | 'rowspan'

/**
 * Expanded row state: object map keyed by `dataKey`, or an array of row refs.
 * Bind with `v-model:expandedRows`.
 */
export type TableExpandedRows = Record<string, boolean> | unknown[]

/** Fired when a detail row is expanded or a row group is expanded. */
export interface TableRowExpandEvent {
  originalEvent: Event
  data: unknown
}

/** Fired when a detail row is collapsed or a row group is collapsed. */
export type TableRowCollapseEvent = TableRowExpandEvent

/** Fired when a row group is expanded. `data` is the group field value. */
export type TableRowGroupExpandEvent = TableRowExpandEvent

/** Fired when a row group is collapsed. `data` is the group field value. */
export type TableRowGroupCollapseEvent = TableRowExpandEvent

// --- lazy / virtual (Wave 4) ---

/**
 * Shared meta for remote fetch when `lazy` is true (page / sort / filter / load).
 * `first` is 0-based; `page` is 1-based to match `v-model:page`.
 */
export interface TableLoadEvent {
  first: number
  rows: number
  page: number
  pageCount: number
  totalRecords: number
  sortField: string | null
  sortOrder: TableSortOrder | null
  multiSortMeta: TableSortMeta[]
  filters: TableFilters
}

/** Fired when the paginator page changes (`page` emit). */
export type TablePageEvent = TableLoadEvent

/**
 * Options for fixed-row-height body virtualization.
 * Requires a vertical `scrollHeight` (CSS length or `'flex'`).
 * Incompatible with row expansion and `groupRowsBy` chrome (skipped at runtime).
 */
export interface TableVirtualScrollerOptions {
  /** Fixed row height in pixels (required for window math). */
  itemSize: number
  /**
   * When true, emit `lazy-load` (and call `onLazyLoad`) as the window moves
   * so consumers can populate sparse `value` slots.
   */
  lazy?: boolean
  /** Extra rows rendered above/below the viewport. Default `5`. */
  numToleratedItems?: number
  /** Debounce (ms) before emitting lazy-load. Default `0`. */
  delay?: number
  /** Optional callback; `lazy-load` is still emitted when set. */
  onLazyLoad?: (event: TableVirtualLazyLoadEvent) => void
}

/** Payload for virtual scroll lazy loading (`lazy-load` emit). */
export interface TableVirtualLazyLoadEvent {
  /** Inclusive start index into `value`. */
  first: number
  /** Exclusive end index into `value`. */
  last: number
}

// --- context menu (Wave 4) ---

/** Fired on row right-click when `contextMenu` is enabled. */
export type TableRowContextMenuEvent = TablePropsRowEvent

// --- state / export (Wave 4) ---

/** Where a stateful table persists view state. */
export type TableStateStorage = 'session' | 'local'

/**
 * Serializable snapshot persisted under `stateKey`.
 * Selection is stored as stable `dataKey` values when available (not full row objects).
 */
export interface TablePersistedState {
  page?: number
  sortField?: string | null
  sortOrder?: TableSortOrder | null
  multiSortMeta?: TableSortMeta[]
  filters?: TableFilters
  /** Stable `dataKey` values for selected rows (safe restore against current `value`). */
  selectionKeys?: string[]
  columnOrder?: string[]
  hiddenColumns?: string[]
}

/** Column descriptor for CSV export. */
export interface ExportTableCsvColumn {
  field: string
  header?: string
}

/** Options for the pure `exportTableCsv` helper. */
export interface ExportTableCsvOptions {
  data: unknown[]
  /** Column defs — field order and default headers. */
  columns?: ExportTableCsvColumn[]
  /** Override which fields to export (order). Defaults to `columns` fields. */
  fields?: string[]
  /** Override headers: array aligned with fields, or map of field → header. */
  headers?: string[] | Record<string, string>
  /** Cell delimiter. Default `','`. */
  separator?: string
  /** When set, trigger a browser file download (no-op without `window`/`document`). */
  filename?: string
  /** Include a header row. Default `true`. */
  includeHeader?: boolean
}
