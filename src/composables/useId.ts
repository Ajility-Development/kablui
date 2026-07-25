let idCounter = 0

/**
 * Generate a unique, stable `kablui-*` id for a11y wiring.
 * Safe to call outside setup (module counter, not Vue's useId).
 */
export function useId(prefix: string): string {
  idCounter += 1
  return `kablui-${prefix}-${idCounter}`
}

/** @internal — reset between tests */
export function __resetIdCounter(): void {
  idCounter = 0
}
