import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Text from './Text.vue'

describe('Text', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Text, { slots: { default: 'Hello' } })

    expect(wrapper.text()).toBe('Hello')
  })

  it('defaults to a paragraph element', () => {
    const wrapper = mount(Text, { slots: { default: 'Body' } })

    expect(wrapper.element.tagName).toBe('P')
  })

  it('renders the element from as', () => {
    const wrapper = mount(Text, {
      props: { as: 'span' },
      slots: { default: 'Inline' },
    })

    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('applies default size, weight, and tone classes', () => {
    const wrapper = mount(Text, { slots: { default: 'Default' } })
    const classes = wrapper.classes()

    expect(classes).toContain('text-kablui-md')
    expect(classes).toContain('font-kablui-normal')
    expect(classes).toContain('text-kablui-fg')
  })

  it('maps each size exclusively', () => {
    const sm = mount(Text, { props: { size: 'sm' }, slots: { default: 'S' } })
    const md = mount(Text, { props: { size: 'md' }, slots: { default: 'M' } })
    const lg = mount(Text, { props: { size: 'lg' }, slots: { default: 'L' } })

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

  it('maps each weight exclusively', () => {
    const normal = mount(Text, {
      props: { weight: 'normal' },
      slots: { default: 'N' },
    })
    const medium = mount(Text, {
      props: { weight: 'medium' },
      slots: { default: 'M' },
    })
    const semibold = mount(Text, {
      props: { weight: 'semibold' },
      slots: { default: 'S' },
    })

    expect(normal.classes()).toContain('font-kablui-normal')
    expect(normal.classes()).not.toContain('font-kablui-medium')
    expect(normal.classes()).not.toContain('font-kablui-semibold')

    expect(medium.classes()).toContain('font-kablui-medium')
    expect(medium.classes()).not.toContain('font-kablui-normal')
    expect(medium.classes()).not.toContain('font-kablui-semibold')

    expect(semibold.classes()).toContain('font-kablui-semibold')
    expect(semibold.classes()).not.toContain('font-kablui-normal')
    expect(semibold.classes()).not.toContain('font-kablui-medium')
  })

  it('maps each tone exclusively', () => {
    const def = mount(Text, { props: { tone: 'default' }, slots: { default: 'D' } })
    const muted = mount(Text, { props: { tone: 'muted' }, slots: { default: 'M' } })
    const accent = mount(Text, {
      props: { tone: 'accent' },
      slots: { default: 'A' },
    })
    const danger = mount(Text, {
      props: { tone: 'danger' },
      slots: { default: 'X' },
    })

    expect(def.classes()).toContain('text-kablui-fg')
    expect(def.classes()).not.toContain('text-kablui-muted-fg')
    expect(def.classes()).not.toContain('text-kablui-accent')
    expect(def.classes()).not.toContain('text-kablui-danger')

    expect(muted.classes()).toContain('text-kablui-muted-fg')
    expect(muted.classes()).not.toContain('text-kablui-fg')
    expect(muted.classes()).not.toContain('text-kablui-accent')
    expect(muted.classes()).not.toContain('text-kablui-danger')

    expect(accent.classes()).toContain('text-kablui-accent')
    expect(accent.classes()).not.toContain('text-kablui-fg')
    expect(accent.classes()).not.toContain('text-kablui-muted-fg')
    expect(accent.classes()).not.toContain('text-kablui-danger')

    expect(danger.classes()).toContain('text-kablui-danger')
    expect(danger.classes()).not.toContain('text-kablui-fg')
    expect(danger.classes()).not.toContain('text-kablui-muted-fg')
    expect(danger.classes()).not.toContain('text-kablui-accent')
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Text).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Text).toBeDefined()
    expect(pkg.Text).toBe(components.Text)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Text.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
    expect(source).not.toMatch(/kablui-accent-\d+/)
    expect(source).not.toMatch(/kablui-danger-\d+/)
  })
})
