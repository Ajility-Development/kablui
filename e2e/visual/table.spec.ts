import { test, expect } from '@playwright/test'

test.describe('Table visual', () => {
  test('basic rows', async ({ page }) => {
    await page.goto('/#/table')
    const target = page.getByTestId('table-smoke')
    await expect(target).toBeVisible()
    await expect(target).toHaveScreenshot('table-smoke.png')
  })
})
