import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByRole('heading', { name: 'Privacy-First Secure Data Sharing' })).toBeVisible()
    
    await page.getByRole('link', { name: /Create Capsule/ }).click()
    await expect(page).toHaveURL('/create')
    await expect(page.getByRole('heading', { name: 'Create Capsule' })).toBeVisible()
    
    await page.goto('/')
    await page.getByRole('link', { name: /Unlock Capsule/ }).click()
    await expect(page).toHaveURL('/unlock')
    
    await page.goto('/')
    await page.getByRole('link', { name: /Dashboard/ }).click()
    await expect(page).toHaveURL('/dashboard')
    
    await page.goto('/')
    await page.getByRole('link', { name: /Identity/ }).click()
    await expect(page).toHaveURL('/identity')
  })
})
