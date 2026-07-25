import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(__dirname, 'index.css'), 'utf8')

describe('theme tokens (index.css)', () => {
  it('defines border-strong in @theme static', () => {
    expect(css).toMatch(/@theme\s+static/)
    expect(css).toMatch(/--color-kablui-border-strong/)
  })

  it('reassigns border-strong in dark mode blocks', () => {
    expect(css).toMatch(
      /prefers-color-scheme:\s*dark[\s\S]*--color-kablui-border-strong/,
    )
    expect(css).toMatch(
      /data-theme=['"]dark['"][\s\S]*--color-kablui-border-strong/,
    )
  })

  it('defines focus and bg semantic tokens', () => {
    expect(css).toMatch(/--color-kablui-focus/)
    expect(css).toMatch(/--color-kablui-bg/)
  })

  it('documents consumer override guidance for dark reassignment', () => {
    expect(css).toMatch(/re-declare semantics/i)
    expect(css).toMatch(/primitive steps/i)
  })

  it('defines elevation shadows md and lg', () => {
    expect(css).toMatch(/--shadow-kablui-md/)
    expect(css).toMatch(/--shadow-kablui-lg/)
  })

  it('reassigns elevation shadows in dark mode blocks', () => {
    expect(css).toMatch(
      /prefers-color-scheme:\s*dark[\s\S]*--shadow-kablui-md/,
    )
    expect(css).toMatch(/data-theme=['"]dark['"][\s\S]*--shadow-kablui-lg/)
  })

  it('defines overlay backdrop token', () => {
    expect(css).toMatch(/--color-kablui-overlay/)
  })

  it('reassigns overlay in dark mode blocks', () => {
    expect(css).toMatch(
      /prefers-color-scheme:\s*dark[\s\S]*--color-kablui-overlay/,
    )
    expect(css).toMatch(
      /data-theme=['"]dark['"][\s\S]*--color-kablui-overlay/,
    )
  })

  it('defines z-index scale tokens', () => {
    expect(css).toMatch(/--z-kablui-dropdown:\s*1000/)
    expect(css).toMatch(/--z-kablui-sticky:\s*1100/)
    expect(css).toMatch(/--z-kablui-overlay:\s*1200/)
    expect(css).toMatch(/--z-kablui-modal:\s*1300/)
    expect(css).toMatch(/--z-kablui-toast:\s*1400/)
    expect(css).toMatch(/--z-kablui-tooltip:\s*1500/)
  })

  it('defines success and warning primitives and semantics', () => {
    expect(css).toMatch(/--color-kablui-success-400/)
    expect(css).toMatch(/--color-kablui-success-500/)
    expect(css).toMatch(/--color-kablui-success-600/)
    expect(css).toMatch(/--color-kablui-warning-400/)
    expect(css).toMatch(/--color-kablui-warning-500/)
    expect(css).toMatch(/--color-kablui-warning-600/)
    expect(css).toMatch(/--color-kablui-success:/)
    expect(css).toMatch(/--color-kablui-success-fg/)
    expect(css).toMatch(/--color-kablui-warning:/)
    expect(css).toMatch(/--color-kablui-warning-fg/)
  })

  it('reassigns success and warning in dark mode blocks', () => {
    expect(css).toMatch(
      /prefers-color-scheme:\s*dark[\s\S]*--color-kablui-success:/,
    )
    expect(css).toMatch(
      /data-theme=['"]dark['"][\s\S]*--color-kablui-warning-fg/,
    )
  })
})
