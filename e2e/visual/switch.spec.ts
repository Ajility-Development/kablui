import { test, expect } from '@playwright/test'

test.describe('Switch visual', () => {
  test('on / off / disabled', async ({ page }) => {
    await page.goto('/#/switch')
    const target = page.getByTestId('switch-states')
    await expect(target).toBeVisible()
    await expect(target).toHaveScreenshot('switch-states.png')
  })
})
