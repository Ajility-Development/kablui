import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Icon from './Icon.vue'

const slotSvg = '<svg data-testid="glyph"><path d="M0 0h24v24H0z" /></svg>'

describe('Icon', () => {
  it('renders default slot', () => {
    const wrapper = mount(Icon, { slots: { default: slotSvg } })

    expect(wrapper.attributes('data-testid')).toBe('icon')
    expect(wrapper.find('[data-testid="glyph"]').exists()).toBe(true)
  })

  it('applies currentColor / text-color inheritance class contract', () => {
    const wrapper = mount(Icon, { slots: { default: slotSvg } })
    const classes = wrapper.classes()

    expect(classes).toContain('text-current')
  })

  it('maps each size exclusively', () => {
    const sm = mount(Icon, { props: { size: 'sm' }, slots: { default: slotSvg } })
    const md = mount(Icon, { props: { size: 'md' }, slots: { default: slotSvg } })
    const lg = mount(Icon, { props: { size: 'lg' }, slots: { default: slotSvg } })

    expect(sm.classes()).toContain('size-3')
    expect(sm.classes()).not.toContain('size-4')
    expect(sm.classes()).not.toContain('size-5')

    expect(md.classes()).toContain('size-4')
    expect(md.classes()).not.toContain('size-3')
    expect(md.classes()).not.toContain('size-5')

    expect(lg.classes()).toContain('size-5')
    expect(lg.classes()).not.toContain('size-3')
    expect(lg.classes()).not.toContain('size-4')
  })

  it('defaults size to md', () => {
    const wrapper = mount(Icon, { slots: { default: slotSvg } })
    expect(wrapper.classes()).toContain('size-4')
  })

  it('is decorative by default (aria-hidden)', () => {
    const wrapper = mount(Icon, { slots: { default: slotSvg } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })

  it('stays decorative when only title is set', () => {
    const wrapper = mount(Icon, {
      props: { title: 'Settings' },
      slots: { default: slotSvg },
    })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.attributes('title')).toBe('Settings')
  })

  it('with label sets role=img, aria-label, and is not aria-hidden', () => {
    const wrapper = mount(Icon, {
      props: { label: 'Close' },
      slots: { default: slotSvg },
    })

    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Close')
  })

  it('reactively clears aria-hidden when label is set via setProps', async () => {
    const wrapper = mount(Icon, { slots: { default: slotSvg } })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()

    await wrapper.setProps({ label: 'Close' })

    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Close')
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Icon).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Icon).toBeDefined()
    expect(pkg.Icon).toBe(components.Icon)
  })

  it('does not add an icon package dependency in package.json', () => {
    const pkg = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>
      peerDependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.peerDependencies,
      ...pkg.devDependencies,
    }
    const names = Object.keys(allDeps)

    expect(names).not.toEqual(expect.arrayContaining([
      expect.stringMatching(/lucide|heroicons|iconify|fontawesome|@mdi\b|feather-icons/i),
    ]))
    expect(names.some((n) => /lucide|heroicons|iconify|fontawesome|@mdi\b|feather-icons/i.test(n))).toBe(
      false,
    )
  })
})
