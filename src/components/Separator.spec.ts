import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Separator from './Separator.vue'

describe('Separator', () => {
  it('defaults to horizontal orientation classes', () => {
    const wrapper = mount(Separator)
    const classes = wrapper.classes()

    expect(classes).toContain('border-kablui-border')
    expect(classes).toContain('w-full')
    expect(classes).toContain('border-t')
    expect(classes).not.toContain('border-l')
    expect(classes).not.toContain('h-full')
  })

  it('applies vertical orientation classes', () => {
    const wrapper = mount(Separator, { props: { orientation: 'vertical' } })
    const classes = wrapper.classes()

    expect(classes).toContain('border-kablui-border')
    expect(classes).toContain('h-full')
    expect(classes).toContain('border-l')
    expect(classes).not.toContain('border-t')
    expect(classes).not.toContain('w-full')
  })

  it('is decorative by default (aria-hidden, no separator role)', () => {
    const wrapper = mount(Separator)
    const el = wrapper.element

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(el.getAttribute('aria-orientation')).toBeNull()
  })

  it('opt-in semantic mode sets role=separator and stronger border', () => {
    const wrapper = mount(Separator, { props: { semantic: true } })

    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.attributes('aria-orientation')).toBeUndefined()
    expect(wrapper.classes()).toContain('border-kablui-border-strong')
    expect(wrapper.classes()).not.toContain('border-kablui-border')
  })

  it('sets aria-orientation=vertical when semantic and vertical', () => {
    const wrapper = mount(Separator, {
      props: { semantic: true, orientation: 'vertical' },
    })

    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Separator).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Separator).toBeDefined()
    expect(pkg.Separator).toBe(components.Separator)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Separator.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
    expect(source).not.toMatch(/kablui-accent-\d+/)
    expect(source).not.toMatch(/kablui-danger-\d+/)
  })
})
