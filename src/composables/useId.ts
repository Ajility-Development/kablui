import { getCurrentInstance, useId as vueUseId } from 'vue'

let idCounter = 0

/**
 * Generate a unique, stable `kablui-*` id for a11y wiring.
 * During Vue setup, uses Vue's `useId()` (SSR-safe). Outside setup
 * (e.g. `toast()`), falls back to a module counter.
 */
export function useId(prefix: string): string {
  if (getCurrentInstance()) {
    return `kablui-${prefix}-${vueUseId()}`
  }
  idCounter += 1
  return `kablui-${prefix}-${idCounter}`
}

/** @internal — reset between tests */
export function __resetIdCounter(): void {
  idCounter = 0
}
