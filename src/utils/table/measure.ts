/**
 * Leaf-aligned column width measurement for Table scroll/freeze/resize.
 * Prefer body first-row cells (visible leaf order); fall back to leaf header cells by id.
 */

export interface MeasureLeafColumn {
  id: string
}

/**
 * Measure widths for leaf columns.
 * - Body path: first non-frozen data row `td[data-column-id]` in DOM order.
 * - Header fallback: `thead th[data-column-id]` (ignores group chrome without the attr).
 */
export function measureLeafColumnWidths(
  table: HTMLElement,
  columns: readonly MeasureLeafColumn[],
): Record<string, number> {
  const next: Record<string, number> = {}
  if (!columns.length) return next

  const bodyRow = table.querySelector(
    'tbody tr[data-testid*="-row-"]:not([data-frozen-row]):not([aria-hidden="true"])',
  )
  if (bodyRow) {
    const tds = bodyRow.querySelectorAll(':scope > td[data-column-id]')
    if (tds.length > 0) {
      tds.forEach((td) => {
        const id = (td as HTMLElement).dataset.columnId
        const width = (td as HTMLElement).offsetWidth
        if (id && width > 0) next[id] = width
      })
    } else {
      // Visible leaf cells without data-column-id still follow column order.
      const ordered = bodyRow.querySelectorAll(':scope > td')
      columns.forEach((column, index) => {
        const td = ordered[index] as HTMLElement | undefined
        if (td?.offsetWidth) next[column.id] = td.offsetWidth
      })
    }
  }

  for (const column of columns) {
    if (next[column.id] != null && next[column.id]! > 0) continue
    const escape =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape
        : (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    const th = table.querySelector(
      `thead th[data-column-id="${escape(column.id)}"]`,
    ) as HTMLElement | null
    if (th?.offsetWidth) next[column.id] = th.offsetWidth
  }

  return next
}
