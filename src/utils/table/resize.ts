/** Column resize mode: fit steals from adjacent; expand grows the table. */
export type TableColumnResizeMode = 'fit' | 'expand'

export interface ApplyColumnResizeInput {
  /** Visible column ids in display order. */
  columnIds: string[]
  /** Current widths in px, keyed by column id. */
  widths: Record<string, number>
  /** Column being resized (left edge of the handle). */
  resizedColumnId: string
  /** Pointer delta in px (positive = grow). */
  delta: number
  mode: TableColumnResizeMode
  /** Minimum width per column in px. Default `50`. */
  minWidth?: number
}

export interface ApplyColumnResizeResult {
  widths: Record<string, number>
  /** Net change to overall table width (0 in fit mode). */
  tableWidthDelta: number
}

/**
 * Apply a horizontal resize delta.
 * - `fit`: grow/shrink the resized column and steal the opposite delta from the next column.
 * - `expand`: grow/shrink only the resized column (table width changes).
 */
export function applyColumnResize(input: ApplyColumnResizeInput): ApplyColumnResizeResult {
  const minWidth = input.minWidth ?? 50
  const { columnIds, resizedColumnId, mode } = input
  const widths = { ...input.widths }
  const index = columnIds.indexOf(resizedColumnId)
  if (index === -1) {
    return { widths, tableWidthDelta: 0 }
  }

  const current = widths[resizedColumnId]
  if (current == null || !Number.isFinite(current)) {
    return { widths, tableWidthDelta: 0 }
  }

  if (mode === 'expand') {
    const nextWidth = Math.max(minWidth, current + input.delta)
    const applied = nextWidth - current
    widths[resizedColumnId] = nextWidth
    return { widths, tableWidthDelta: applied }
  }

  // fit — need an adjacent column to steal from (prefer next, else previous)
  const neighborId =
    index < columnIds.length - 1
      ? columnIds[index + 1]!
      : index > 0
        ? columnIds[index - 1]!
        : null

  if (!neighborId || neighborId === resizedColumnId) {
    return { widths, tableWidthDelta: 0 }
  }

  const neighborCurrent = widths[neighborId]
  if (neighborCurrent == null || !Number.isFinite(neighborCurrent)) {
    return { widths, tableWidthDelta: 0 }
  }

  const growSelf = Math.max(minWidth, current + input.delta) - current
  const shrinkNeighbor = neighborCurrent - Math.max(minWidth, neighborCurrent - growSelf)
  const applied = Math.min(growSelf, shrinkNeighbor)

  widths[resizedColumnId] = current + applied
  widths[neighborId] = neighborCurrent - applied
  return { widths, tableWidthDelta: 0 }
}

/** Sum column widths for expand-mode table sizing. */
export function sumColumnWidths(
  columnIds: string[],
  widths: Record<string, number>,
): number {
  return columnIds.reduce((sum, id) => {
    const w = widths[id]
    return sum + (w != null && Number.isFinite(w) ? w : 0)
  }, 0)
}
