#!/usr/bin/env tsx

import { config } from 'dotenv'
config({ path: '.env.local' })

import { PinataClient } from '../lib/pinata'

async function quickTest() {
  console.log('Quick Storage Test\n')
  
  const apiKey = process.env.PINATA_JWT
  if (!apiKey) {
    console.error('PINATA_JWT not set')
    process.exit(1)
  }

  const pinata = new PinataClient(apiKey)

  console.log('Checking current storage usage...')
  const usage = await pinata.getStorageUsage()
  
  const usedMB = (usage.used / 1024 / 1024).toFixed(2)
  const limitMB = (usage.limit / 1024 / 1024).toFixed(0)
  
  console.log(`\nCurrent Storage:`)
  console.log(`  Used: ${usedMB} MB`)
  console.log(`  Limit: ${limitMB} MB`)
  console.log(`  Percentage: ${usage.percentage.toFixed(2)}%`)
  console.log(`  Available: ${((usage.limit - usage.used) / 1024 / 1024).toFixed(2)} MB`)
  
  if (usage.percentage >= 95) {
    console.log('\n🚨 CRITICAL: At 95% capacity - uploads blocked')
  } else if (usage.percentage >= 80) {
    console.log('\n⚠️  WARNING: Above 80% capacity')
  } else {
    console.log('\n✓ Storage healthy')
  }
  
  console.log('\nStorage limits:')
  console.log(`  Per-user quota: 250 MB`)
  console.log(`  Global limit: 1024 MB (blocks at 95%)`)
}

quickTest().catch(console.error)
