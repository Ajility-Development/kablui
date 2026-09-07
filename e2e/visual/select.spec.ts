import { test, expect } from '@playwright/test'

test.describe('Select visual', () => {
  test('open listbox', async ({ page }) => {
    await page.goto('/#/select')
    await page.getByTestId('select-open').click()
    await expect(page.getByTestId('select-open-listbox')).toBeVisible()
    // Focus lands in the listbox; blur so the ring is not in the baseline.
    await page.evaluate(() => {
      const el = document.activeElement
      if (el instanceof HTMLElement) el.blur()
    })
    await expect(page).toHaveScreenshot('select-open.png')
  })
})
