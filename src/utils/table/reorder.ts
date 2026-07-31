import type { TableColumnDef } from './types'

/** Stable key for column order models: `field` when set, else column `id`. */
export function columnOrderKey(column: Pick<TableColumnDef, 'id' | 'field'>): string {
  return column.field ?? column.id
}

/**
 * Move an item from `fromIndex` to `toIndex` (insert-before semantics).
 * Returns a new array; no-ops when indices are equal or out of range.
 */
export function reorderItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return [...items]
  }
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  if (moved === undefined) return [...items]
  next.splice(toIndex, 0, moved)
  return next
}

/**
 * Apply a `columnOrder` key list to columns. Unknown keys are ignored;
 * columns missing from `order` keep relative registration order at the end.
 */
export function applyColumnOrder<T extends Pick<TableColumnDef, 'id' | 'field'>>(
  columns: T[],
  order: string[] | null | undefined,
): T[] {
  if (!order?.length) return [...columns]

  const byKey = new Map<string, T>()
  for (const column of columns) {
    byKey.set(columnOrderKey(column), column)
  }

  const used = new Set<string>()
  const ordered: T[] = []
  for (const key of order) {
    const column = byKey.get(key)
    if (!column || used.has(key)) continue
    ordered.push(column)
    used.add(key)
  }
  for (const column of columns) {
    const key = columnOrderKey(column)
    if (!used.has(key)) ordered.push(column)
  }
  return ordered
}

/** Keys for the current column list (for initializing / syncing `columnOrder`). */
export function columnOrderKeys(
  columns: Array<Pick<TableColumnDef, 'id' | 'field'>>,
): string[] {
  return columns.map(columnOrderKey)
}

/**
 * Whether a column reorder crosses a frozen / unfrozen boundary.
 * Frozen columns may reorder among themselves; unfrozen among themselves.
 * Cross-boundary moves return `false`.
 */
export function canReorderAcrossFreeze(
  columns: Array<Pick<TableColumnDef, 'frozen'>>,
  dragIndex: number,
  dropIndex: number,
): boolean {
  const drag = columns[dragIndex]
  const drop = columns[dropIndex]
  if (!drag || !drop) return false
  return !!drag.frozen === !!drop.frozen
}

/**
 * Compute next column-order keys after a drag/drop between visible columns.
 * Returns `null` when the move is disallowed (e.g. freeze boundary).
 */
export function nextColumnOrder(
  columns: Array<Pick<TableColumnDef, 'id' | 'field' | 'frozen'>>,
  dragIndex: number,
  dropIndex: number,
  respectFreezeBoundary = true,
): string[] | null {
  if (respectFreezeBoundary && !canReorderAcrossFreeze(columns, dragIndex, dropIndex)) {
    return null
  }
  const keys = columnOrderKeys(columns)
  return reorderItems(keys, dragIndex, dropIndex)
}
