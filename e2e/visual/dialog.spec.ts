import { test, expect } from '@playwright/test'

test.describe('Dialog visual', () => {
  test('open dialog', async ({ page }) => {
    await page.goto('/#/dialog')
    await expect(page.locator('[data-kablui-dialog-panel]')).toBeVisible()
    // Focus trap lands on the first tabbable (close); blur so the ring is not in the baseline.
    await page.evaluate(() => {
      const el = document.activeElement
      if (el instanceof HTMLElement) el.blur()
    })
    // Full viewport — overlay + centered panel.
    await expect(page).toHaveScreenshot('dialog-open.png')
  })
})
