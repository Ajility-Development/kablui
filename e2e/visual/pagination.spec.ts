import { test, expect } from '@playwright/test'

test.describe('Pagination visual', () => {
  test('mid-range with ellipsis', async ({ page }) => {
    await page.goto('/#/pagination')
    const target = page.getByTestId('pagination-range')
    await expect(target).toBeVisible()
    await expect(target).toHaveScreenshot('pagination-range.png')
  })
})
