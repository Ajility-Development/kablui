/**
 * Normalize a free-form value for use in a `data-testid` segment.
 * Lowercases and replaces characters outside `[a-z0-9_-]` with `-`.
 */
export function sanitizeTestIdValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
}

/**
 * Resolve a root `data-testid` from attrs, falling back when missing/empty.
 */
export function resolveTestId(attrs: Record<string, unknown>, fallback: string): string {
  const override = attrs['data-testid']
  if (typeof override === 'string' && override.length > 0) {
    return override
  }
  return fallback
}

/** Build a part test id: `${base}-${part}`. */
export function partTestId(base: string, part: string): string {
  return `${base}-${part}`
}

/**
 * Build a value-scoped part test id.
 * e.g. `valueTestId('select', 'option', 'US')` → `'select-option-us'`
 */
export function valueTestId(base: string, part: string, value: string): string {
  return `${base}-${part}-${sanitizeTestIdValue(value)}`
}

/** Strip `data-testid` from attrs before spreading onto a child element. */
export function omitDataTestId(attrs: Record<string, unknown>): Record<string, unknown> {
  const { ['data-testid']: _, ...rest } = attrs
  return rest
}
