import { resolveFieldValue } from './filter'
import type { ExportTableCsvColumn, ExportTableCsvOptions } from './types'

export type { ExportTableCsvColumn, ExportTableCsvOptions }

/** Escape a CSV cell (RFC 4180-style quoting). */
export function escapeCsvCell(value: unknown, separator = ','): string {
  if (value == null) return ''
  let text: string
  if (value instanceof Date) {
    text = value.toISOString()
  } else if (typeof value === 'object') {
    text = JSON.stringify(value)
  } else {
    text = String(value)
  }
  // OWASP CSV formula neutralization: neutralize formula/injection prefixes.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`
  }
  const needsQuotes =
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r') ||
    text.includes(separator)
  const escaped = text.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function resolveFields(options: ExportTableCsvOptions): string[] {
  if (options.fields?.length) return options.fields
  if (options.columns?.length) {
    return options.columns.map((c) => c.field).filter(Boolean)
  }
  return []
}

function resolveHeaders(fields: string[], options: ExportTableCsvOptions): string[] {
  const { headers, columns } = options
  if (Array.isArray(headers)) {
    return fields.map((field, i) => headers[i] ?? field)
  }
  if (headers && typeof headers === 'object') {
    return fields.map((field) => headers[field] ?? field)
  }
  if (columns?.length) {
    const byField = new Map(columns.map((c) => [c.field, c.header ?? c.field]))
    return fields.map((field) => byField.get(field) ?? field)
  }
  return fields
}

/**
 * Build a CSV string from row data and column/field config.
 * When `filename` is set and the DOM is available, also triggers a download.
 */
export function exportTableCsv(options: ExportTableCsvOptions): string {
  const separator = options.separator ?? ','
  const includeHeader = options.includeHeader !== false
  const fields = resolveFields(options)

  if (!fields.length) {
    if (options.filename) downloadCsv('', options.filename)
    return ''
  }

  const lines: string[] = []
  if (includeHeader) {
    const headers = resolveHeaders(fields, options)
    lines.push(headers.map((h) => escapeCsvCell(h, separator)).join(separator))
  }

  for (const row of options.data) {
    const cells = fields.map((field) =>
      escapeCsvCell(resolveFieldValue(row, field), separator),
    )
    lines.push(cells.join(separator))
  }

  const csv = lines.join('\n')
  if (options.filename) {
    downloadCsv(csv, options.filename)
  }
  return csv
}

/** Trigger a browser download of CSV content. No-op without `window`/`document`. */
export function downloadCsv(content: string, filename: string): void {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !filename
  ) {
    return
  }
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
