#!/usr/bin/env node

import { PinataClient } from '../lib/pinata'

async function checkStorage() {
  const apiKey = process.env.PINATA_JWT
  if (!apiKey) {
    console.error('\n❌ Missing PINATA_JWT environment variable')
    console.error('\nPINATA_JWT must be set in your environment or .env.local file')
    console.error('Get your JWT token from: https://app.pinata.cloud/developers/api-keys\n')
    process.exit(1)
  }

  const pinata = new PinataClient(apiKey)

  try {
    console.log('Fetching storage usage from Pinata...\n')
    const usage = await pinata.getStorageUsage()

    const usedMB = (usage.used / 1024 / 1024).toFixed(2)
    const limitMB = (usage.limit / 1024 / 1024).toFixed(0)
    const percentage = usage.percentage.toFixed(2)

    console.log('=== Storage Usage ===')
    console.log(`Used:       ${usedMB} MB`)
    console.log(`Limit:      ${limitMB} MB`)
    console.log(`Percentage: ${percentage}%`)
    console.log(`Available:  ${((usage.limit - usage.used) / 1024 / 1024).toFixed(2)} MB`)

    if (usage.percentage >= 95) {
      console.log('\n🚨 CRITICAL: Storage at 95% capacity!')
      console.log('   New uploads are blocked.')
    } else if (usage.percentage >= 80) {
      console.log('\n⚠️  WARNING: Storage above 80%')
      console.log('   Consider cleaning up old files.')
    } else if (usage.percentage >= 50) {
      console.log('\n✓ Storage usage is moderate')
    } else {
      console.log('\n✓ Storage usage is healthy')
    }

  } catch (error) {
    console.error('Error fetching storage:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

checkStorage()
