import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { expectNoA11yViolations } from '../test/a11y'
import Accordion from './Accordion.vue'
import AccordionContent from './AccordionContent.vue'
import AccordionItem from './AccordionItem.vue'
import AccordionTrigger from './AccordionTrigger.vue'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

function item(value: string, label: string, content: string, disabled = false) {
  return h(AccordionItem, { value, disabled }, () => [
    h(AccordionTrigger, null, () => label),
    h(AccordionContent, null, () => content),
  ])
}

function mountAccordion(options: {
  type?: 'single' | 'multiple'
  collapsible?: boolean
  model?: string | string[]
  items?: Array<{ value: string; label: string; content: string; disabled?: boolean }>
} = {}) {
  const model = ref<string | string[] | undefined>(
    options.model ?? (options.type === 'multiple' ? [] : undefined),
  )
  const items = options.items ?? [
    { value: 'a', label: 'Item A', content: 'Content A' },
    { value: 'b', label: 'Item B', content: 'Content B' },
    { value: 'c', label: 'Item C', content: 'Content C' },
  ]

  const Host = defineComponent({
    setup() {
      return () =>
        h(
          Accordion,
          {
            type: options.type ?? 'single',
            ...(options.collapsible !== undefined
              ? { collapsible: options.collapsible }
              : {}),
            modelValue: model.value,
            'onUpdate:modelValue': (value: string | string[] | undefined) => {
              model.value = value
            },
          },
          () =>
            items.map((entry) =>
              item(entry.value, entry.label, entry.content, entry.disabled),
            ),
        )
    },
  })

  wrapper = mount(Host, { attachTo: document.body })
  return { model }
}

describe('Accordion', () => {
  it('exposes default and value-based data-testid attributes', () => {
    mountAccordion()

    expect(wrapper!.find('[data-testid="accordion"]').exists()).toBe(true)
    expect(wrapper!.find('[data-testid="accordion-item-a"]').exists()).toBe(true)
    expect(wrapper!.find('[data-testid="accordion-item-b"]').exists()).toBe(true)
    expect(wrapper!.find('[data-testid="accordion-item-c"]').exists()).toBe(true)
    expect(wrapper!.findAll('[data-testid="accordion-trigger"]')).toHaveLength(3)
    expect(wrapper!.findAll('[data-testid="accordion-content"]')).toHaveLength(3)
  })

  it('derives child data-testid values from a consumer override on Accordion', async () => {
    const model = ref<string | undefined>()
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Accordion,
            {
              type: 'single',
              modelValue: model.value,
              'onUpdate:modelValue': (value: string | string[] | undefined) => {
                model.value = value as string | undefined
              },
              'data-testid': 'faq',
            },
            () => [item('intro', 'Intro', 'Intro body')],
          )
      },
    })
    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    expect(wrapper.find('[data-testid="faq"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="faq-item-intro"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="faq-trigger"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="faq-content"]').exists()).toBe(true)
  })

  it('expands and collapses via trigger click (single)', async () => {
    const { model } = mountAccordion()
    const triggers = wrapper!.findAll('[data-slot="accordion-trigger"]')

    expect(triggers[0]!.attributes('aria-expanded')).toBe('false')
    expect(wrapper!.findAll('[data-slot="accordion-content"]')[0]!.isVisible()).toBe(
      false,
    )

    await triggers[0]!.trigger('click')
    await nextTick()

    expect(model.value).toBe('a')
    expect(triggers[0]!.attributes('aria-expanded')).toBe('true')
    expect(wrapper!.findAll('[data-slot="accordion-content"]')[0]!.isVisible()).toBe(
      true,
    )

    await triggers[0]!.trigger('click')
    await nextTick()

    expect(model.value).toBeUndefined()
    expect(triggers[0]!.attributes('aria-expanded')).toBe('false')
  })

  it('keeps only one item open in single mode', async () => {
    const { model } = mountAccordion({ model: 'a' })
    const triggers = wrapper!.findAll('[data-slot="accordion-trigger"]')

    await triggers[1]!.trigger('click')
    await nextTick()

    expect(model.value).toBe('b')
    expect(triggers[0]!.attributes('aria-expanded')).toBe('false')
    expect(triggers[1]!.attributes('aria-expanded')).toBe('true')
  })

  it('allows multiple open items when type is multiple', async () => {
    const { model } = mountAccordion({ type: 'multiple', model: [] })
    const triggers = wrapper!.findAll('[data-slot="accordion-trigger"]')

    await triggers[0]!.trigger('click')
    await triggers[1]!.trigger('click')
    await nextTick()

    expect(model.value).toEqual(['a', 'b'])
    expect(triggers[0]!.attributes('aria-expanded')).toBe('true')
    expect(triggers[1]!.attributes('aria-expanded')).toBe('true')
  })

  it('respects collapsible=false in single mode', async () => {
    const { model } = mountAccordion({ collapsible: false, model: 'a' })
    const triggers = wrapper!.findAll('[data-slot="accordion-trigger"]')

    await triggers[0]!.trigger('click')
    await nextTick()

    expect(model.value).toBe('a')
    expect(triggers[0]!.attributes('aria-expanded')).toBe('true')
  })

  it('wires aria-expanded, aria-controls, region, and aria-labelledby', async () => {
    mountAccordion({ model: 'a' })
    await nextTick()

    const trigger = wrapper!.findAll('[data-slot="accordion-trigger"]')[0]!
    const content = wrapper!.findAll('[data-slot="accordion-content"]')[0]!
    const controls = trigger.attributes('aria-controls')
    const labelledBy = content.attributes('aria-labelledby')

    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(controls).toBeTruthy()
    expect(content.attributes('id')).toBe(controls)
    expect(content.attributes('role')).toBe('region')
    expect(labelledBy).toBeTruthy()
    expect(trigger.attributes('id')).toBe(labelledBy)
  })

  it('toggles with Enter and Space', async () => {
    const { model } = mountAccordion()
    const trigger = wrapper!.findAll('[data-slot="accordion-trigger"]')[0]!

    await trigger.trigger('keydown', { key: 'Enter' })
    await nextTick()
    expect(model.value).toBe('a')

    await trigger.trigger('keydown', { key: ' ' })
    await nextTick()
    expect(model.value).toBeUndefined()
  })

  it('moves focus between triggers with Arrow Up/Down and skips disabled', async () => {
    mountAccordion({
      items: [
        { value: 'a', label: 'A', content: 'A body' },
        { value: 'b', label: 'B', content: 'B body', disabled: true },
        { value: 'c', label: 'C', content: 'C body' },
      ],
    })
    await nextTick()

    const triggers = wrapper!.findAll('[data-slot="accordion-trigger"]')
    const first = triggers[0]!.element as HTMLButtonElement
    const third = triggers[2]!.element as HTMLButtonElement
    first.focus()

    await triggers[0]!.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(third)

    await triggers[2]!.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(first)
  })

  it('does not toggle disabled items', async () => {
    const { model } = mountAccordion({
      items: [{ value: 'a', label: 'A', content: 'A body', disabled: true }],
    })
    const trigger = wrapper!.find('[data-slot="accordion-trigger"]')

    expect(trigger.attributes('disabled')).toBeDefined()
    await trigger.trigger('click')
    await nextTick()
    expect(model.value).toBeUndefined()
  })

  it('supports controlled v-model updates', async () => {
    const { model } = mountAccordion()
    await nextTick()

    model.value = 'b'
    await nextTick()

    const triggers = wrapper!.findAll('[data-slot="accordion-trigger"]')
    expect(triggers[1]!.attributes('aria-expanded')).toBe('true')
    expect(wrapper!.findAll('[data-slot="accordion-content"]')[1]!.isVisible()).toBe(
      true,
    )
  })

  it('warns when parts are used outside Accordion', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const orphanItem = mount(AccordionItem, {
      props: { value: 'x' },
      slots: { default: () => 'x' },
    })
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('AccordionItem must be used inside Accordion'),
    )
    orphanItem.unmount()

    const orphanTrigger = mount(AccordionTrigger, { slots: { default: () => 'x' } })
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('AccordionTrigger must be used inside AccordionItem'),
    )
    orphanTrigger.unmount()

    const orphanContent = mount(AccordionContent, { slots: { default: () => 'x' } })
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('AccordionContent must be used inside AccordionItem'),
    )
    orphanContent.unmount()

    warn.mockRestore()
  })

  it('includes focus-visible ring on triggers', () => {
    mountAccordion()
    const className =
      wrapper!.find('[data-slot="accordion-trigger"]').attributes('class') ?? ''
    expect(className).toMatch(/focus-visible:ring-kablui-focus/)
  })

  it('renders a chevron that rotates when open', async () => {
    mountAccordion({ model: 'a' })
    await nextTick()
    const trigger = wrapper!.findAll('[data-slot="accordion-trigger"]')[0]!
    const chevron = trigger.find('svg')
    expect(chevron.exists()).toBe(true)
    expect(chevron.classes()).toContain('rotate-180')
  })

  it('wraps the trigger in the requested heading level', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(Accordion, { type: 'single' }, () =>
            h(AccordionItem, { value: 'a' }, () => [
              h(AccordionTrigger, { heading: 'h2' }, () => 'Heading'),
              h(AccordionContent, null, () => 'Body'),
            ]),
          )
      },
    })
    wrapper = mount(Host)
    await nextTick()
    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.find('h3').exists()).toBe(false)
  })

  it('defaults the trigger heading to h3', () => {
    mountAccordion()
    expect(wrapper!.find('h3').exists()).toBe(true)
  })

  it('uses TabPanel-aligned content padding and foreground color', () => {
    mountAccordion({ model: 'a' })
    const className =
      wrapper!.find('[data-slot="accordion-content"]').attributes('class') ?? ''
    expect(className).toMatch(/px-1/)
    expect(className).toMatch(/py-3/)
    expect(className).toMatch(/text-kablui-fg/)
  })

  it('uses semantic kablui token classes and no hex colors in SFCs', () => {
    for (const file of [
      'Accordion.vue',
      'AccordionItem.vue',
      'AccordionTrigger.vue',
      'AccordionContent.vue',
    ]) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(source).not.toMatch(/kablui-neutral-\d+/)
      expect(source).not.toMatch(/kablui-accent-\d+/)
    }
  })
})

describe('a11y', () => {
  it('has no axe violations with one item open', async () => {
    const model = ref<string | undefined>('a')
    const Host = defineComponent({
      setup() {
        return () =>
          h('main', null, [
            h(
              Accordion,
              {
                type: 'single',
                modelValue: model.value,
                'onUpdate:modelValue': (value: string | string[] | undefined) => {
                  model.value = value as string | undefined
                },
              },
              () => [
                item('a', 'Item A', 'Content A'),
                item('b', 'Item B', 'Content B'),
              ],
            ),
          ])
      },
    })
    wrapper = mount(Host, { attachTo: document.body })
    await nextTick()
    await expectNoA11yViolations(wrapper.element)
  })
})
