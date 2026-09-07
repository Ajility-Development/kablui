import { test, expect } from '@playwright/test'

test.describe('Menu visual', () => {
  test('open menu', async ({ page }) => {
    await page.goto('/#/menu')
    await expect(page.getByTestId('menu-content')).toBeVisible()
    // Opening focuses the first item; blur so the ring is not in the baseline.
    await page.evaluate(() => {
      const el = document.activeElement
      if (el instanceof HTMLElement) el.blur()
    })
    await expect(page).toHaveScreenshot('menu-open.png')
  })
})
