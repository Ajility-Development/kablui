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
    const neutral = mount(Badge, {
      props: { tone: 'neutral' },
      slots: { default: 'N' },
    })
    const accent = mount(Badge, {
      props: { tone: 'accent' },
      slots: { default: 'A' },
    })
    const danger = mount(Badge, {
      props: { tone: 'danger' },
      slots: { default: 'D' },
    })

    expect(neutral.classes()).toContain('bg-kablui-muted')
    expect(neutral.classes()).toContain('text-kablui-fg')
    expect(neutral.classes()).not.toContain('bg-kablui-accent')
    expect(neutral.classes()).not.toContain('bg-kablui-danger')

    expect(accent.classes()).toContain('bg-kablui-accent')
    expect(accent.classes()).not.toContain('bg-kablui-muted')
    expect(accent.classes()).not.toContain('bg-kablui-danger')

    expect(danger.classes()).toContain('bg-kablui-danger')
    expect(danger.classes()).not.toContain('bg-kablui-muted')
    expect(danger.classes()).not.toContain('bg-kablui-accent')
  })

  it('maps each size exclusively', () => {
    const sm = mount(Badge, { props: { size: 'sm' }, slots: { default: 'S' } })
    const md = mount(Badge, { props: { size: 'md' }, slots: { default: 'M' } })

    expect(sm.classes()).toContain('text-kablui-sm')
    expect(sm.classes()).not.toContain('text-kablui-md')

    expect(md.classes()).toContain('text-kablui-md')
    expect(md.classes()).not.toContain('text-kablui-sm')
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
