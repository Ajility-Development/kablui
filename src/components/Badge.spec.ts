import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from './Badge.vue'

describe('Badge', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Badge, { slots: { default: 'New' } })

    expect(wrapper.text()).toBe('New')
  })

  it('applies default tone and size classes', () => {
    const wrapper = mount(Badge, { slots: { default: 'Default' } })
    const classes = wrapper.classes()

    expect(classes).toContain('bg-kablui-muted')
    expect(classes).toContain('text-kablui-fg')
    expect(classes).toContain('text-kablui-md')
  })

  it('maps each tone exclusively', () => {
    const tones = ['neutral', 'accent', 'danger', 'success', 'warning'] as const
    const tokenByTone = {
      neutral: 'bg-kablui-muted',
      accent: 'bg-kablui-accent',
      danger: 'bg-kablui-danger',
      success: 'bg-kablui-success',
      warning: 'bg-kablui-warning',
    } as const

    for (const tone of tones) {
      const wrapper = mount(Badge, {
        props: { tone },
        slots: { default: tone },
      })
      const classes = wrapper.classes()

      expect(classes).toContain(tokenByTone[tone])
      for (const other of tones) {
        if (other === tone) continue
        expect(classes).not.toContain(tokenByTone[other])
      }
    }
  })

  it('maps each size exclusively', () => {
    const sm = mount(Badge, { props: { size: 'sm' }, slots: { default: 'S' } })
    const md = mount(Badge, { props: { size: 'md' }, slots: { default: 'M' } })
    const lg = mount(Badge, { props: { size: 'lg' }, slots: { default: 'L' } })

    expect(sm.classes()).toContain('text-kablui-sm')
    expect(sm.classes()).not.toContain('text-kablui-md')
    expect(sm.classes()).not.toContain('text-kablui-lg')

    expect(md.classes()).toContain('text-kablui-md')
    expect(md.classes()).not.toContain('text-kablui-sm')
    expect(md.classes()).not.toContain('text-kablui-lg')

    expect(lg.classes()).toContain('text-kablui-lg')
    expect(lg.classes()).not.toContain('text-kablui-sm')
    expect(lg.classes()).not.toContain('text-kablui-md')
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Badge).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Badge).toBeDefined()
    expect(pkg.Badge).toBe(components.Badge)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Badge.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
    expect(source).not.toMatch(/kablui-accent-\d+/)
    expect(source).not.toMatch(/kablui-danger-\d+/)
  })
})
