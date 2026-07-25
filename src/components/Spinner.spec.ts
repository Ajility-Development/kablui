import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Spinner from './Spinner.vue'

describe('Spinner', () => {
  it('renders with role="status"', () => {
    const wrapper = mount(Spinner)

    expect(wrapper.attributes('role')).toBe('status')
  })

  it('applies default md size classes on the spinner glyph', () => {
    const wrapper = mount(Spinner)
    const glyph = wrapper.find('[aria-hidden="true"]')

    expect(glyph.classes()).toContain('size-4')
    expect(glyph.classes()).toContain('animate-spin')
    expect(glyph.classes()).toContain('border-t-transparent')
  })

  it('maps each size exclusively', () => {
    const sm = mount(Spinner, { props: { size: 'sm' } })
    const md = mount(Spinner, { props: { size: 'md' } })
    const lg = mount(Spinner, { props: { size: 'lg' } })

    expect(sm.find('[aria-hidden="true"]').classes()).toContain('size-3')
    expect(sm.find('[aria-hidden="true"]').classes()).not.toContain('size-4')
    expect(sm.find('[aria-hidden="true"]').classes()).not.toContain('size-5')

    expect(md.find('[aria-hidden="true"]').classes()).toContain('size-4')
    expect(md.find('[aria-hidden="true"]').classes()).not.toContain('size-3')
    expect(md.find('[aria-hidden="true"]').classes()).not.toContain('size-5')

    expect(lg.find('[aria-hidden="true"]').classes()).toContain('size-5')
    expect(lg.find('[aria-hidden="true"]').classes()).not.toContain('size-3')
    expect(lg.find('[aria-hidden="true"]').classes()).not.toContain('size-4')
  })

  it('exposes sr-only label and aria-busy when labeled', () => {
    const wrapper = mount(Spinner, { props: { label: 'Loading' } })

    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('aria-label')).toBe('Loading')
    expect(wrapper.find('.sr-only').text()).toBe('Loading')
  })

  it('omits aria-busy and sr-only text when unlabeled', () => {
    const wrapper = mount(Spinner)

    expect(wrapper.attributes('aria-busy')).toBeUndefined()
    expect(wrapper.find('.sr-only').exists()).toBe(false)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Spinner.vue'), 'utf8')

    expect(source).toMatch(/rounded-kablui-full/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})
