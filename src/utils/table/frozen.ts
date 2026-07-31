import type { TableColumnDef, TableFrozenAlign } from './types'

export interface FrozenColumnOffset {
  side: TableFrozenAlign
  offset: number
}

/** Parse a CSS px length; returns 0 for non-px or missing values. */
export function parseCssPx(value?: string): number {
  if (!value) return 0
  const match = /^(\d+(?:\.\d+)?)px$/i.exec(value.trim())
  return match ? Number(match[1]) : 0
}

/** Declared column width for offset fallback: `width` then `minWidth`. */
export function declaredColumnWidthPx(column: Pick<TableColumnDef, 'width' | 'minWidth'>): number {
  return parseCssPx(column.width) || parseCssPx(column.minWidth)
}

function frozenSide(column: Pick<TableColumnDef, 'frozen' | 'alignFrozen'>): TableFrozenAlign | null {
  if (!column.frozen) return null
  return column.alignFrozen === 'right' ? 'right' : 'left'
}

function resolveWidth(
  column: Pick<TableColumnDef, 'id' | 'width' | 'minWidth'>,
  measuredWidths?: Record<string, number>,
): number {
  const measured = measuredWidths?.[column.id]
  if (measured != null && measured > 0) return measured
  return declaredColumnWidthPx(column)
}

/**
 * Cumulative sticky `left` / `right` offsets for frozen columns.
 * Left frozen columns accumulate in visual order; right in reverse.
 */
export function computeFrozenOffsets(
  columns: Array<Pick<TableColumnDef, 'id' | 'frozen' | 'alignFrozen' | 'width' | 'minWidth'>>,
  measuredWidths?: Record<string, number>,
): Record<string, FrozenColumnOffset> {
  const result: Record<string, FrozenColumnOffset> = {}

  let left = 0
  for (const column of columns) {
    if (frozenSide(column) !== 'left') continue
    result[column.id] = { side: 'left', offset: left }
    left += resolveWidth(column, measuredWidths)
  }

  let right = 0
  for (let i = columns.length - 1; i >= 0; i--) {
    const column = columns[i]!
    if (frozenSide(column) !== 'right') continue
    result[column.id] = { side: 'right', offset: right }
    right += resolveWidth(column, measuredWidths)
  }

  return result
}
