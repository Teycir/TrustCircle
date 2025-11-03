import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should load home page and display content', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    
    // Wait for React hydration
    await page.waitForTimeout(2000)
    
    // Check page title or any text content
    const content = await page.content()
    expect(content).toContain('TrustCircle')
  })

  test('should render without errors', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    
    // Check that page has basic HTML structure
    const html = await page.content()
    expect(html).toContain('<html')
    expect(html).toContain('</html>')
  })
})
