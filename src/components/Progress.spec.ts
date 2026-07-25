import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Progress from './Progress.vue'

describe('Progress', () => {
  it('exposes progressbar role with aria value attributes when determinate', () => {
    const wrapper = mount(Progress, { props: { value: 40, max: 100 } })
    const bar = wrapper.find('[role="progressbar"]')

    expect(bar.exists()).toBe(true)
    expect(bar.attributes('aria-valuemin')).toBe('0')
    expect(bar.attributes('aria-valuemax')).toBe('100')
    expect(bar.attributes('aria-valuenow')).toBe('40')
  })

  it('omits aria-valuenow when indeterminate', () => {
    const wrapper = mount(Progress, {
      props: { value: 40, indeterminate: true },
    })
    const bar = wrapper.find('[role="progressbar"]')

    expect(bar.attributes('aria-valuenow')).toBeUndefined()
    expect(bar.attributes('aria-busy')).toBe('true')
  })

  it('renders an indeterminate fill with pulse animation and no width style', () => {
    const wrapper = mount(Progress, { props: { indeterminate: true } })
    const fill = wrapper.find('[role="progressbar"] > div')

    expect(fill.classes()).toContain('animate-pulse')
    expect(fill.classes()).toContain('absolute')
    expect(fill.attributes('style') ?? '').not.toMatch(/width/)
  })

  it('omits aria-busy when determinate and respects a custom max', () => {
    const wrapper = mount(Progress, { props: { value: 1, max: 4 } })
    const bar = wrapper.find('[role="progressbar"]')

    expect(bar.attributes('aria-busy')).toBeUndefined()
    expect(bar.attributes('aria-valuemin')).toBe('0')
    expect(bar.attributes('aria-valuemax')).toBe('4')
    expect(bar.attributes('aria-valuenow')).toBe('1')
    expect(bar.find('div').attributes('style')).toMatch(/width:\s*25%/)
  })

  it('treats missing value as indeterminate', () => {
    const wrapper = mount(Progress)
    const bar = wrapper.find('[role="progressbar"]')

    expect(bar.attributes('aria-valuenow')).toBeUndefined()
    expect(bar.attributes('aria-busy')).toBe('true')
  })

  it('clamps value between 0 and max for aria-valuenow and width', () => {
    const high = mount(Progress, { props: { value: 150, max: 100 } })
    const low = mount(Progress, { props: { value: -10, max: 100 } })

    expect(high.find('[role="progressbar"]').attributes('aria-valuenow')).toBe(
      '100',
    )
    expect(low.find('[role="progressbar"]').attributes('aria-valuenow')).toBe(
      '0',
    )

    const fill = high.find('[role="progressbar"] > div')
    expect(fill.attributes('style')).toMatch(/width:\s*100%/)
  })

  it('renders optional label and wires aria-label', () => {
    const wrapper = mount(Progress, {
      props: { value: 25, label: 'Upload' },
    })

    expect(wrapper.text()).toContain('Upload')
    expect(wrapper.find('[role="progressbar"]').attributes('aria-label')).toBe(
      'Upload',
    )
  })

  it('applies track and accent fill token classes', () => {
    const wrapper = mount(Progress, { props: { value: 50 } })
    const track = wrapper.find('[role="progressbar"]')
    const fill = track.find('div')

    expect(track.classes()).toContain('bg-kablui-muted')
    expect(fill.classes()).toContain('bg-kablui-accent')
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Progress.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
    expect(source).not.toMatch(/kablui-accent-\d+/)
  })
})
