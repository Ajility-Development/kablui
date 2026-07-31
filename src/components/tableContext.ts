import type { ComputedRef, InjectionKey, ModelRef, Ref } from 'vue'
import type {
  TableColumnDef,
  TableColumnResizeMode,
  TableEditMode,
  TableExpandedRows,
  TableFilterDisplay,
  TableFilters,
  TableHeaderRowDef,
  TableRowGroupMode,
  TableSelectionMode,
  TableSelectionValue,
  TableSize,
  TableSortMeta,
  TableSortMode,
  TableSortOrder,
  TableVirtualScrollerOptions,
} from '../utils/table/types'

/**
 * Shared table context (provide/inject).
 *
 * Wave 0 exposes value, registered columns, and testIdBase.
 * Later waves extend this interface additively — do not rename Wave 0 fields.
 *
 * Client pipeline order (documented in utils/table/types.ts):
 *   filter → sort → group → page → render
 */
export interface TableContext {
  value: ComputedRef<unknown[]>
  /** Registered column defs in mount order (includes `visible: false`). */
  columns: Ref<TableColumnDef[]>
  size: ComputedRef<TableSize>
  registerColumn: (column: TableColumnDef) => void
  unregisterColumn: (id: string) => void
  updateColumn: (column: TableColumnDef) => void
  testIdBase: ComputedRef<string>

  // --- selection (Wave 1) ---
  selection: ModelRef<TableSelectionValue>
  selectionMode: ComputedRef<TableSelectionMode | undefined>
  metaKeySelection: ComputedRef<boolean>
  dataKey: ComputedRef<string | undefined>
  isRowSelected: (row: unknown) => boolean
  // --- sort (Wave 1) ---
  sortMode: ComputedRef<TableSortMode>
  sortField: Ref<string | null | undefined>
  sortOrder: Ref<TableSortOrder | null | undefined>
  multiSortMeta: Ref<TableSortMeta[] | undefined>
  removableSort: ComputedRef<boolean>
  // --- pagination (Wave 1) ---
  /** Current page (1-based), bound via `v-model:page`. */
  page: ModelRef<number>
  paginate: ComputedRef<boolean>
  /** Page size (`rows` prop). */
  rows: ComputedRef<number>
  pageCount: ComputedRef<number>
  /** Rows after page slice (or full pipeline output when `paginate` is false). */
  displayRows: ComputedRef<unknown[]>
  // --- filter (Wave 2) ---
  filters: ModelRef<TableFilters>
  filterDisplay: ComputedRef<TableFilterDisplay | undefined>
  globalFilterFields: ComputedRef<string[] | undefined>
  filteredRows: ComputedRef<unknown[]>
  // --- scroll / frozen (Wave 2) ---
  /** CSS length or `'flex'` for vertical scroll viewport. */
  scrollHeight: ComputedRef<string | undefined>
  /** Rows pinned above the scrollable body. */
  frozenValue: ComputedRef<unknown[]>
  // --- edit (Wave 2) ---
  /** Optional until Edit agent provides models. */
  editMode?: ComputedRef<TableEditMode | undefined>
  /** Rows currently in row-edit mode (`v-model:editingRows`). */
  editingRows?: ModelRef<unknown[]>
  isEditingRow?: (row: unknown) => boolean
  isEditingCell?: (row: unknown, field: string) => boolean
  /** Working copy for the active editor (`v-model` target in `#editor`). */
  getEditingData?: (row: unknown) => unknown
  // --- expand / group (Wave 3) ---
  expandedRows: ModelRef<TableExpandedRows | undefined>
  expandedRowGroups: ModelRef<unknown[]>
  groupRowsBy: ComputedRef<string | undefined>
  rowGroupMode: ComputedRef<TableRowGroupMode | undefined>
  expandableRowGroups: ComputedRef<boolean>
  isRowExpanded: (row: unknown) => boolean
  isRowGroupExpanded: (groupValue: unknown) => boolean
  // --- resize / reorder (Wave 3) ---
  resizableColumns?: ComputedRef<boolean>
  columnResizeMode?: ComputedRef<TableColumnResizeMode>
  reorderableColumns?: ComputedRef<boolean>
  reorderableRows?: ComputedRef<boolean>
  columnOrder?: ModelRef<string[]>
  columnWidths?: Ref<Record<string, number>>
  // --- column groups / visibility model (Wave 3) ---
  /** Field names currently hidden (`v-model:hiddenColumns`). */
  hiddenColumns: ModelRef<string[]>
  /** Multi-row header structure from `TableColumnGroup type="header"`. */
  headerRows: Ref<TableHeaderRowDef[]>
  /** Multi-row footer structure from `TableColumnGroup type="footer"`. */
  footerRows: Ref<TableHeaderRowDef[]>
  setHeaderRows: (rows: TableHeaderRowDef[]) => void
  setFooterRows: (rows: TableHeaderRowDef[]) => void
  // --- lazy / virtual (Wave 4) ---
  lazy: ComputedRef<boolean>
  totalRecords: ComputedRef<number>
  virtualScrollerOptions: ComputedRef<TableVirtualScrollerOptions | undefined>
}

export const TABLE_KEY: InjectionKey<TableContext> = Symbol('kablui-table')
