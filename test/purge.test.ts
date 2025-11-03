import { describe, it, expect } from 'vitest'
import { PinataClient } from '../lib/pinata'

describe('Pinata Storage Management', () => {
  it('should check storage usage', async () => {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_JWT
    if (!apiKey) {
      console.log('Skipping: NEXT_PUBLIC_PINATA_JWT not set')
      return
    }

    const pinata = new PinataClient(apiKey)
    const usage = await pinata.getStorageUsage()

    console.log(`Used: ${(usage.used / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Limit: ${(usage.limit / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Percentage: ${usage.percentage.toFixed(2)}%`)

    expect(usage.used).toBeGreaterThanOrEqual(0)
    expect(usage.limit).toBeGreaterThan(0)
    expect(usage.percentage).toBeGreaterThanOrEqual(0)
    expect(usage.percentage).toBeLessThanOrEqual(100)
  })

  it('should purge old files when above threshold', async () => {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_JWT
    if (!apiKey) {
      console.log('Skipping: NEXT_PUBLIC_PINATA_JWT not set')
      return
    }

    const pinata = new PinataClient(apiKey)
    const usage = await pinata.getStorageUsage()

    if (usage.percentage >= 90) {
      console.log('Storage above 90%, testing purge...')
      await pinata.purgeOldFiles(0.9)

      const newUsage = await pinata.getStorageUsage()
      console.log(`After purge: ${newUsage.percentage.toFixed(2)}%`)

      expect(newUsage.percentage).toBeLessThan(usage.percentage)
    } else {
      console.log('Storage below 90%, skipping purge test')
    }
  })
})
