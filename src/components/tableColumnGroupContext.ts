import type { InjectionKey } from 'vue'
import type { TableColumnGroupType, TableHeaderRowDef } from '../utils/table/types'

/**
 * Context for `TableColumnGroup` → `TableHeaderRow` → `TableColumn`.
 * Header rows register here; the parent Table reads them via TABLE_KEY.
 */
export interface TableColumnGroupContext {
  type: TableColumnGroupType
  registerHeaderRow: (row: TableHeaderRowDef) => void
  unregisterHeaderRow: (id: string) => void
  updateHeaderRow: (row: TableHeaderRowDef) => void
}

export const TABLE_COLUMN_GROUP_KEY: InjectionKey<TableColumnGroupContext> =
  Symbol('kablui-table-column-group')

/** Context for a single `TableHeaderRow` so child columns register cell order. */
export interface TableHeaderRowContext {
  registerCell: (columnId: string) => void
  unregisterCell: (columnId: string) => void
}

export const TABLE_HEADER_ROW_KEY: InjectionKey<TableHeaderRowContext> = Symbol(
  'kablui-table-header-row',
)
