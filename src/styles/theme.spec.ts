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
})
