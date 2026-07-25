import { test, expect } from '@playwright/test'

test.describe('Button visual', () => {
  test('variants row', async ({ page }) => {
    await page.goto('/#/button')
    const target = page.getByTestId('button-variants')
    await expect(target).toBeVisible()
    await expect(target).toHaveScreenshot('button-variants.png')
  })
})
