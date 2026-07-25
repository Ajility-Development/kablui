import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Empty from './Empty.vue'

describe('Empty', () => {
  it('renders title and default slot', () => {
    const wrapper = mount(Empty, {
      props: { title: 'No results' },
      slots: { default: 'Try another search.' },
    })

    expect(wrapper.text()).toContain('No results')
    expect(wrapper.text()).toContain('Try another search.')
  })

  it('renders icon and action slots', () => {
    const wrapper = mount(Empty, {
      props: { title: 'Empty' },
      slots: {
        icon: '<span data-testid="icon">◎</span>',
        default: 'Nothing here',
        action: '<button type="button">Retry</button>',
      },
    })

    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Retry')
  })

  it('centers content with muted styling classes', () => {
    const wrapper = mount(Empty, {
      props: { title: 'Empty' },
      slots: { default: 'Muted' },
    })
    const classes = wrapper.classes()

    expect(classes).toContain('items-center')
    expect(classes).toContain('justify-center')
    expect(classes).toContain('text-center')
    expect(classes).toContain('text-kablui-muted-fg')
  })

  it('omits title and slot regions when unused', () => {
    const wrapper = mount(Empty)

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('uses semantic kablui token classes and no hex colors in the SFC', () => {
    const source = readFileSync(resolve(__dirname, 'Empty.vue'), 'utf8')

    expect(source).toMatch(/kablui-/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/kablui-neutral-\d+/)
  })
})
