import { test, expect } from '@playwright/test'

test.describe('Toast visual', () => {
  test('tones', async ({ page }) => {
    await page.goto('/#/toast')
    const target = page.getByTestId('toast-tones')
    await expect(target).toBeVisible()
    await expect(target).toHaveScreenshot('toast-tones.png')
  })
})
