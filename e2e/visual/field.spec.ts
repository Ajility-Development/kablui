import { test, expect } from '@playwright/test'

test.describe('Field visual', () => {
  test('invalid Field + Input', async ({ page }) => {
    await page.goto('/#/field')
    const target = page.getByTestId('field-invalid')
    await expect(target).toBeVisible()
    await expect(target).toHaveScreenshot('field-invalid.png')
  })
})
