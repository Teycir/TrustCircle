import { test, expect } from '@playwright/test'

test.describe('Identity Management', () => {
  test('should generate new identity', async ({ page }) => {
    await page.goto('/identity')

    await expect(page.getByText('No Identity Found')).toBeVisible()
    await page.getByRole('button', { name: 'Generate Identity' }).click()

    await expect(page.getByText('Your Public Key')).toBeVisible()
    await expect(page.locator('code')).toContainText('ed25519:')
  })

  test('should copy public key', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/identity')

    await page.getByRole('button', { name: 'Generate Identity' }).click()
    await page.getByRole('button', { name: 'Copy Key' }).click()

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toContain('ed25519:')
  })
})
