import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import Card from './Card.vue'
import CardContent from './CardContent.vue'
import CardDescription from './CardDescription.vue'
import CardFooter from './CardFooter.vue'
import CardHeader from './CardHeader.vue'
import CardTitle from './CardTitle.vue'

const cardSources = [
  'Card.vue',
  'CardHeader.vue',
  'CardTitle.vue',
  'CardDescription.vue',
  'CardContent.vue',
  'CardFooter.vue',
] as const

describe('Card', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Card, { slots: { default: 'Plain content' } })

    expect(wrapper.text()).toContain('Plain content')
    expect(wrapper.attributes('data-slot')).toBe('card')
    expect(wrapper.attributes('data-testid')).toBe('card')
  })

  it('composes header, title, description, content, and footer slots', () => {
    const Demo = defineComponent({
      components: {
        Card,
        CardHeader,
        CardTitle,
        CardDescription,
        CardContent,
        CardFooter,
      },
      template: `
        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Monthly billing</CardDescription>
          </CardHeader>
          <CardContent>Details go here</CardContent>
          <CardFooter>Actions</CardFooter>
        </Card>
      `,
    })

    const wrapper = mount(Demo)

    expect(wrapper.find('[data-slot="card"]').exists()).toBe(true)
    expect(wrapper.find('[data-slot="card-header"]').exists()).toBe(true)
    expect(wrapper.find('[data-slot="card-title"]').text()).toBe('Plan')
    expect(wrapper.find('[data-slot="card-description"]').text()).toBe(
      'Monthly billing',
    )
    expect(wrapper.find('[data-slot="card-content"]').text()).toBe(
      'Details go here',
    )
    expect(wrapper.find('[data-slot="card-footer"]').text()).toBe('Actions')

    expect(wrapper.find('[data-testid="card"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="card-header"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="card-title"]').text()).toBe('Plan')
    expect(wrapper.find('[data-testid="card-description"]').text()).toBe(
      'Monthly billing',
    )
    expect(wrapper.find('[data-testid="card-content"]').text()).toBe(
      'Details go here',
    )
    expect(wrapper.find('[data-testid="card-footer"]').text()).toBe('Actions')
  })

  it('applies shell token classes by default', () => {
    const wrapper = mount(Card, { slots: { default: 'Shell' } })
    const classes = wrapper.classes()

    expect(classes).toContain('rounded-kablui-md')
    expect(classes).toContain('border-kablui-border')
    expect(classes).toContain('bg-kablui-bg')
    expect(classes).toContain('shadow-kablui-sm')
  })

  it('does not apply root padding classes', () => {
    const wrapper = mount(Card, { slots: { default: 'Default' } })
    const classes = wrapper.classes()

    expect(classes).not.toContain('p-3')
    expect(classes).not.toContain('p-4')
  })

  it('renders as the requested element', () => {
    const div = mount(Card, { slots: { default: 'D' } })
    const article = mount(Card, {
      props: { as: 'article' },
      slots: { default: 'A' },
    })
    const section = mount(Card, {
      props: { as: 'section' },
      slots: { default: 'S' },
    })

    expect(div.element.tagName).toBe('DIV')
    expect(article.element.tagName).toBe('ARTICLE')
    expect(section.element.tagName).toBe('SECTION')
  })

  it('renders CardTitle as the requested heading', () => {
    const defaultTitle = mount(CardTitle, { slots: { default: 'Default' } })
    const h2 = mount(CardTitle, {
      props: { as: 'h2' },
      slots: { default: 'H2' },
    })

    expect(defaultTitle.element.tagName).toBe('H3')
    expect(h2.element.tagName).toBe('H2')
  })

  it('applies region padding and muted description styles', () => {
    const header = mount(CardHeader, { slots: { default: 'H' } })
    const content = mount(CardContent, { slots: { default: 'B' } })
    const footer = mount(CardFooter, { slots: { default: 'F' } })
    const description = mount(CardDescription, { slots: { default: 'Muted' } })
    const title = mount(CardTitle, { slots: { default: 'Title' } })

    expect(header.classes()).toContain('px-4')
    expect(content.classes()).toContain('px-4')
    expect(footer.classes()).toContain('px-4')
    expect(footer.classes()).toContain('border-kablui-border')

    expect(description.classes()).toContain('text-kablui-muted-fg')
    expect(description.classes()).toContain('text-kablui-sm')

    expect(title.classes()).toContain('text-kablui-fg')
    expect(title.classes()).toContain('font-kablui-semibold')
  })

  it('is available from component and package barrels', async () => {
    const components = await import('./index')
    expect(components.Card).toBeDefined()
    expect(components.CardHeader).toBeDefined()
    expect(components.CardTitle).toBeDefined()
    expect(components.CardDescription).toBeDefined()
    expect(components.CardContent).toBeDefined()
    expect(components.CardFooter).toBeDefined()

    const pkg = await import('../index')
    expect(pkg.Card).toBe(components.Card)
    expect(pkg.CardHeader).toBe(components.CardHeader)
    expect(pkg.CardTitle).toBe(components.CardTitle)
    expect(pkg.CardDescription).toBe(components.CardDescription)
    expect(pkg.CardContent).toBe(components.CardContent)
    expect(pkg.CardFooter).toBe(components.CardFooter)
  })

  it('uses semantic kablui token classes and no hex colors in Card SFCs', () => {
    for (const file of cardSources) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')

      expect(source).toMatch(/kablui-/)
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(source).not.toMatch(/kablui-neutral-\d+/)
      expect(source).not.toMatch(/kablui-accent-\d+/)
      expect(source).not.toMatch(/kablui-danger-\d+/)
      expect(source).not.toMatch(/kablui-success-\d+/)
      expect(source).not.toMatch(/kablui-warning-\d+/)
    }
  })

  it('does not use provide/inject for composition', () => {
    for (const file of cardSources) {
      const source = readFileSync(resolve(__dirname, file), 'utf8')

      expect(source).not.toMatch(/\bprovide\b/)
      expect(source).not.toMatch(/\binject\b/)
    }
  })
})
