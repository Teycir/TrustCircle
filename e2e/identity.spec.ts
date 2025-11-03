import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Clear IndexedDB before each test
  await page.goto('/')
  await page.evaluate(() => {
    indexedDB.databases().then(dbs => {
      dbs.forEach(db => db.name && indexedDB.deleteDatabase(db.name))
    })
  })
})

test.describe('Identity Management', () => {
  test('should load identity page', async ({ page }) => {
    const response = await page.goto('/identity')
    expect(response?.status()).toBe(200)
    
    const content = await page.content()
    expect(content).toContain('TrustCircle')
  })

  test('should have identity page structure', async ({ page }) => {
    await page.goto('/identity')
    await page.waitForTimeout(2000)
    
    const html = await page.content()
    expect(html).toContain('TrustCircle')
  })
})
