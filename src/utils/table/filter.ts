import type {
  TableFilterConstraint,
  TableFilterMatchMode,
  TableFilterMeta,
  TableFilterMetaAdvanced,
  TableFilterOperator,
  TableFilters,
} from './types'

/** Match-mode constants (PrimeVue `FilterMatchMode` parity). */
export const FilterMatchMode = {
  STARTS_WITH: 'startsWith',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'notContains',
  ENDS_WITH: 'endsWith',
  EQUALS: 'equals',
  NOT_EQUALS: 'notEquals',
  IN: 'in',
  LESS_THAN: 'lt',
  LESS_THAN_OR_EQUAL_TO: 'lte',
  GREATER_THAN: 'gt',
  GREATER_THAN_OR_EQUAL_TO: 'gte',
  BETWEEN: 'between',
  DATE_IS: 'dateIs',
  DATE_IS_NOT: 'dateIsNot',
  DATE_BEFORE: 'dateBefore',
  DATE_AFTER: 'dateAfter',
} as const

/** Operator constants for advanced multi-rule filters. */
export const FilterOperator = {
  AND: 'and',
  OR: 'or',
} as const

export type { TableFilterMatchMode, TableFilterOperator }

export interface FilterRowsOptions {
  /** Fields searched by the `global` filter key (OR). */
  globalFilterFields?: string[] | null
  /** Locale for string compare (`toLocaleLowerCase`). */
  locale?: string
}

const GLOBAL_KEY = 'global'

function removeAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

/** Resolve a (possibly nested) field path like `country.name`. */
export function resolveFieldValue(row: unknown, field: string): unknown {
  if (row == null || typeof row !== 'object' || !field) return undefined
  if (!field.includes('.')) return (row as Record<string, unknown>)[field]

  let current: unknown = row
  for (const part of field.split('.')) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export function isFilterMetaAdvanced(
  meta: TableFilterMeta | null | undefined,
): meta is TableFilterMetaAdvanced {
  return !!meta && Array.isArray((meta as TableFilterMetaAdvanced).constraints)
}

/** Whether a constraint has a value that should participate in filtering. */
export function isConstraintActive(constraint: TableFilterConstraint | null | undefined): boolean {
  if (!constraint) return false
  const v = constraint.value
  if (v === undefined || v === null || v === '') return false
  if (Array.isArray(v)) {
    if (v.length === 0) return false
    if (constraint.matchMode === FilterMatchMode.BETWEEN && (v[0] == null || v[1] == null)) {
      return false
    }
  }
  return true
}

export function getConstraints(meta: TableFilterMeta | null | undefined): TableFilterConstraint[] {
  if (!meta) return []
  if (isFilterMetaAdvanced(meta)) return meta.constraints ?? []
  return [{ value: meta.value, matchMode: meta.matchMode }]
}

export function isFilterMetaActive(meta: TableFilterMeta | null | undefined): boolean {
  return getConstraints(meta).some(isConstraintActive)
}

type MatchFn = (value: unknown, filter: unknown, locale?: string) => boolean

function normalizeString(value: unknown, locale?: string): string {
  return removeAccents(String(value)).toLocaleLowerCase(locale)
}

const matchers: Record<string, MatchFn> = {
  [FilterMatchMode.STARTS_WITH](value, filter, locale) {
    if (value == null) return false
    const f = normalizeString(filter, locale)
    const v = normalizeString(value, locale)
    return v.slice(0, f.length) === f
  },
  [FilterMatchMode.CONTAINS](value, filter, locale) {
    if (value == null) return false
    return normalizeString(value, locale).includes(normalizeString(filter, locale))
  },
  [FilterMatchMode.NOT_CONTAINS](value, filter, locale) {
    if (value == null) return false
    return !normalizeString(value, locale).includes(normalizeString(filter, locale))
  },
  [FilterMatchMode.ENDS_WITH](value, filter, locale) {
    if (value == null) return false
    const f = normalizeString(filter, locale)
    const v = normalizeString(value, locale)
    return f.length === 0 || v.slice(-f.length) === f
  },
  [FilterMatchMode.EQUALS](value, filter, locale) {
    if (value == null) return false
    const vd = toDate(value)
    const fd = toDate(filter)
    if (vd && fd) return vd.getTime() === fd.getTime()
    return normalizeString(value, locale) === normalizeString(filter, locale)
  },
  [FilterMatchMode.NOT_EQUALS](value, filter, locale) {
    if (value == null) return true
    const vd = toDate(value)
    const fd = toDate(filter)
    if (vd && fd) return vd.getTime() !== fd.getTime()
    return normalizeString(value, locale) !== normalizeString(filter, locale)
  },
  [FilterMatchMode.IN](value, filter) {
    if (!Array.isArray(filter)) return true
    return filter.some((item) => Object.is(item, value) || item === value)
  },
  [FilterMatchMode.BETWEEN](value, filter) {
    if (!Array.isArray(filter) || filter[0] == null || filter[1] == null) return true
    if (value == null) return false
    const vd = toDate(value)
    const a = toDate(filter[0])
    const b = toDate(filter[1])
    if (vd && a && b) return a.getTime() <= vd.getTime() && vd.getTime() <= b.getTime()
    return (filter[0] as number | string) <= (value as number | string)
      && (value as number | string) <= (filter[1] as number | string)
  },
  [FilterMatchMode.LESS_THAN](value, filter) {
    if (value == null) return false
    const vd = toDate(value)
    const fd = toDate(filter)
    if (vd && fd) return vd.getTime() < fd.getTime()
    return (value as number | string) < (filter as number | string)
  },
  [FilterMatchMode.LESS_THAN_OR_EQUAL_TO](value, filter) {
    if (value == null) return false
    const vd = toDate(value)
    const fd = toDate(filter)
    if (vd && fd) return vd.getTime() <= fd.getTime()
    return (value as number | string) <= (filter as number | string)
  },
  [FilterMatchMode.GREATER_THAN](value, filter) {
    if (value == null) return false
    const vd = toDate(value)
    const fd = toDate(filter)
    if (vd && fd) return vd.getTime() > fd.getTime()
    return (value as number | string) > (filter as number | string)
  },
  [FilterMatchMode.GREATER_THAN_OR_EQUAL_TO](value, filter) {
    if (value == null) return false
    const vd = toDate(value)
    const fd = toDate(filter)
    if (vd && fd) return vd.getTime() >= fd.getTime()
    return (value as number | string) >= (filter as number | string)
  },
  [FilterMatchMode.DATE_IS](value, filter) {
    const vd = toDate(value)
    const fd = toDate(filter)
    if (!vd || !fd) return false
    return vd.toDateString() === fd.toDateString()
  },
  [FilterMatchMode.DATE_IS_NOT](value, filter) {
    const vd = toDate(value)
    const fd = toDate(filter)
    if (!vd || !fd) return false
    return vd.toDateString() !== fd.toDateString()
  },
  [FilterMatchMode.DATE_BEFORE](value, filter) {
    const vd = toDate(value)
    const fd = toDate(filter)
    if (!vd || !fd) return false
    return vd.getTime() < fd.getTime()
  },
  [FilterMatchMode.DATE_AFTER](value, filter) {
    const vd = toDate(value)
    const fd = toDate(filter)
    if (!vd || !fd) return false
    return vd.getTime() > fd.getTime()
  },
}

/** Evaluate one constraint against a cell value. */
export function matchConstraint(
  value: unknown,
  constraint: TableFilterConstraint,
  locale?: string,
): boolean {
  if (!isConstraintActive(constraint)) return true
  const fn = matchers[constraint.matchMode]
  if (!fn) return true
  return fn(value, constraint.value, locale)
}

function matchFieldMeta(
  row: unknown,
  field: string,
  meta: TableFilterMeta,
  locale?: string,
): boolean {
  const constraints = getConstraints(meta).filter(isConstraintActive)
  if (constraints.length === 0) return true

  const cell = resolveFieldValue(row, field)
  const operator = isFilterMetaAdvanced(meta)
    ? (meta.operator ?? FilterOperator.AND)
    : FilterOperator.AND

  if (operator === FilterOperator.OR) {
    return constraints.some((c) => matchConstraint(cell, c, locale))
  }
  return constraints.every((c) => matchConstraint(cell, c, locale))
}

function matchGlobal(
  row: unknown,
  meta: TableFilterMeta,
  fields: string[],
  locale?: string,
): boolean {
  const constraints = getConstraints(meta).filter(isConstraintActive)
  if (constraints.length === 0) return true
  if (fields.length === 0) return true

  // Global: any field may satisfy the (usually single) constraint.
  return fields.some((field) => {
    const cell = resolveFieldValue(row, field)
    return constraints.every((c) => matchConstraint(cell, c, locale))
  })
}

/**
 * Return a filtered copy of `rows`. Object identity of each row is preserved.
 * Inactive constraints (empty values) are skipped. Field filters AND together;
 * advanced meta may AND/OR its constraints; global ORs across `globalFilterFields`.
 */
export function filterRows<T>(
  rows: readonly T[],
  filters?: TableFilters | null,
  options: FilterRowsOptions = {},
): T[] {
  if (!filters) return [...rows]

  const entries = Object.entries(filters).filter(([, meta]) => isFilterMetaActive(meta))
  if (entries.length === 0) return [...rows]

  const locale = options.locale
  const globalFields = options.globalFilterFields ?? []

  return rows.filter((row) => {
    for (const [key, meta] of entries) {
      if (key === GLOBAL_KEY) {
        if (!matchGlobal(row, meta, globalFields, locale)) return false
        continue
      }
      if (!matchFieldMeta(row, key, meta, locale)) return false
    }
    return true
  })
}

/** Default simple meta for a text column. */
export function createEmptyFilterMeta(
  matchMode: TableFilterMatchMode = FilterMatchMode.CONTAINS,
): TableFilterMeta {
  return { value: null, matchMode }
}

/** Default advanced meta (single constraint) for menu mode. */
export function createEmptyAdvancedFilterMeta(
  matchMode: TableFilterMatchMode = FilterMatchMode.CONTAINS,
  operator: TableFilterOperator = FilterOperator.AND,
): TableFilterMetaAdvanced {
  return {
    operator,
    constraints: [{ value: null, matchMode }],
  }
}

/** Human labels for common text match modes (menu UI). */
export const DEFAULT_TEXT_MATCH_MODE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Starts with', value: FilterMatchMode.STARTS_WITH },
  { label: 'Contains', value: FilterMatchMode.CONTAINS },
  { label: 'Not contains', value: FilterMatchMode.NOT_CONTAINS },
  { label: 'Ends with', value: FilterMatchMode.ENDS_WITH },
  { label: 'Equals', value: FilterMatchMode.EQUALS },
  { label: 'Not equals', value: FilterMatchMode.NOT_EQUALS },
]

/** Human labels for numeric match modes (menu UI; PrimeVue `dataType="numeric"` parity). */
export const DEFAULT_NUMERIC_MATCH_MODE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Equals', value: FilterMatchMode.EQUALS },
  { label: 'Not equals', value: FilterMatchMode.NOT_EQUALS },
  { label: 'Less than', value: FilterMatchMode.LESS_THAN },
  { label: 'Less than or equal to', value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
  { label: 'Greater than', value: FilterMatchMode.GREATER_THAN },
  { label: 'Greater than or equal to', value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
  { label: 'Between', value: FilterMatchMode.BETWEEN },
]
