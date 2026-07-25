import { axe } from 'vitest-axe'
import { expect } from 'vitest'

/**
 * Assert that `container` has no axe accessibility violations.
 *
 * Pass the mounted component root (`wrapper.element`) or a dialog/teleport
 * portal root (e.g. the element that received the teleported content).
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}
