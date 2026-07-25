import { test, expect } from '@playwright/test'

test.describe('Alert visual', () => {
  test('tones', async ({ page }) => {
    await page.goto('/#/alert')
    const target = page.getByTestId('alert-tones')
    await expect(target).toBeVisible()
    await expect(target).toHaveScreenshot('alert-tones.png')
  })
})
