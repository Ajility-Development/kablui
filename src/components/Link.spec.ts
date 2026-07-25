import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Link from './Link.vue'

describe('Link', () => {
  it('renders an anchor with href and default slot', () => {
    const wrapper = mount(Link, {
      props: { href: '/docs' },
      slots: { default: 'Docs' },
    })
    const anchor = wrapper.find('a')

    expect(anchor.exists()).toBe(true)
    expect(anchor.attributes('href')).toBe('/docs')
    expect(anchor.text()).toBe('Docs')
  })

  it('includes focus-visible ring contract with semantic focus token', () => {
    const wrapper = mount(Link, {
      props: { href: '/focus' },
      slots: { default: 'Focus' },
    })
    const className = wrapper.find('a').attributes('class') ?? ''

    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
    expect(className).toMatch(/focus-visible:ring-offset-kablui-bg/)
    expect(className).toMatch(/focus-visible:ring-/)
  })

  it('applies underline and disabled muted styling classes', () => {
    const wrapper = mount(Link, {
      props: { href: '/style' },
      slots: { default: 'Styled' },
    })
    const className = wrapper.find('a').attributes('class') ?? ''

    expect(className).toMatch(/underline/)
    expect(className).toMatch(/aria-disabled:opacity-50/)
    expect(className).toMatch(/aria-disabled:pointer-events-none/)
  })

  it('sets target and rel when external', () => {
    const wrapper = mount(Link, {
      props: { href: 'https://example.com', external: true },
      slots: { default: 'External' },
    })
    const anchor = wrapper.find('a')

    expect(anchor.attributes('target')).toBe('_blank')
    expect(anchor.attributes('rel')).toBe('noopener noreferrer')
  })

  it('does not set target or rel when not external', () => {
    const wrapper = mount(Link, {
      props: { href: '/internal' },
      slots: { default: 'Internal' },
    })
    const anchor = wrapper.find('a')

    expect(anchor.attributes('target')).toBeUndefined()
    expect(anchor.attributes('rel')).toBeUndefined()
  })

  it('uses aria-disabled pattern and blocks activation when disabled', async () => {
    const wrapper = mount(Link, {
      props: { href: '/blocked', disabled: true },
      slots: { default: 'Disabled' },
    })
    const anchor = wrapper.find('a')

    expect(anchor.attributes('aria-disabled')).toBe('true')
    expect(anchor.attributes('tabindex')).toBe('-1')
    expect(anchor.attributes('disabled')).toBeUndefined()

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })
    const preventSpy = vi.spyOn(clickEvent, 'preventDefault')
    await anchor.element.dispatchEvent(clickEvent)

    expect(preventSpy).toHaveBeenCalled()
  })

  it('prevents default on Enter (and Space) keydown when disabled', async () => {
    const wrapper = mount(Link, {
      props: { href: '/blocked', disabled: true },
      slots: { default: 'Disabled' },
    })
    const anchor = wrapper.find('a')

    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    })
    const enterSpy = vi.spyOn(enterEvent, 'preventDefault')
    await anchor.element.dispatchEvent(enterEvent)
    expect(enterSpy).toHaveBeenCalled()

    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    })
    const spaceSpy = vi.spyOn(spaceEvent, 'preventDefault')
    await anchor.element.dispatchEvent(spaceEvent)
    expect(spaceSpy).toHaveBeenCalled()
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Link).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Link).toBeDefined()
    expect(pkg.Link).toBe(components.Link)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Link.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
    expect(source).not.toMatch(/kablui-accent-\d+/)
    expect(source).not.toMatch(/kablui-danger-\d+/)
  })
})
