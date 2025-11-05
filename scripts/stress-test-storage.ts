#!/usr/bin/env tsx

import { config } from 'dotenv'
config({ path: '.env.local' })

import { CapsuleManager } from '../lib/capsule'
import { VaultManager } from '../lib/vault'
import { generateIdentity } from '../lib/crypto'
import { PinataClient } from '../lib/pinata'
import { TrustCircleDB } from '../lib/supabase'

const USER_QUOTA = 262144000
const GLOBAL_LIMIT = 1073741824
const CAPACITY_THRESHOLD = 0.95

interface TestResult {
  test: string
  passed: boolean
  message: string
  duration: number
}

async function runStressTest() {
  console.log('Starting Storage Stress Test...\n')
  
  const apiKey = process.env.PINATA_JWT
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!apiKey) {
    throw new Error(
      'PINATA_JWT environment variable not set. ' +
      'Set it in .env.local or run: export PINATA_JWT=your_token'
    )
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local'
    )
  }

  const pinata = new PinataClient(apiKey)
  const db = new TrustCircleDB(supabaseUrl, supabaseKey, pinata)
  const capsuleManager = new CapsuleManager(pinata, db)
  const vaultManager = new VaultManager(pinata, db)
  
  const results: TestResult[] = []

  async function test(name: string, fn: () => Promise<void>) {
    const start = Date.now()
    try {
      await fn()
      results.push({ test: name, passed: true, message: 'Success', duration: Date.now() - start })
      console.log(`✓ ${name} (${Date.now() - start}ms)`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      results.push({ test: name, passed: false, message: msg, duration: Date.now() - start })
      console.log(`✗ ${name}: ${msg} (${Date.now() - start}ms)`)
    }
  }

  await test('Check initial storage usage', async () => {
    const usage = await pinata.getStorageUsage()
    console.log(`  Current: ${(usage.used / 1024 / 1024).toFixed(1)}MB / ${(usage.limit / 1024 / 1024).toFixed(0)}MB (${usage.percentage.toFixed(1)}%)`)
    if (usage.percentage >= 95) {
      throw new Error('Storage already at 95% capacity')
    }
  })

  await test('Upload 100MB file', async () => {
    const creator = await generateIdentity()
    const approver = await generateIdentity()
    const file = new Uint8Array(100 * 1024 * 1024)
    crypto.getRandomValues(file)

    await capsuleManager.createCapsule({
      files: file,
      approverPubkey: { ed25519: approver.ed25519.publicKey, x25519: approver.x25519.publicKey },
      creatorKeys: creator,
      policy: { conditions: [{ type: 'DATE_AFTER', value: '2025-01-01T00:00:00Z' }], logic: 'ALL' },
      title: 'Stress Test 100MB'
    })
  })

  await test('Upload 200MB file', async () => {
    const creator = await generateIdentity()
    const approver = await generateIdentity()
    const file = new Uint8Array(200 * 1024 * 1024)
    crypto.getRandomValues(file)

    await capsuleManager.createCapsule({
      files: file,
      approverPubkey: { ed25519: approver.ed25519.publicKey, x25519: approver.x25519.publicKey },
      creatorKeys: creator,
      policy: { conditions: [{ type: 'DATE_AFTER', value: '2025-01-01T00:00:00Z' }], logic: 'ALL' },
      title: 'Stress Test 200MB'
    })
  })

  await test('User at exact quota limit (250MB)', async () => {
    const creator = await generateIdentity()
    const approver = await generateIdentity()
    const file = new Uint8Array(USER_QUOTA)
    crypto.getRandomValues(file)

    await capsuleManager.createCapsule({
      files: file,
      approverPubkey: { ed25519: approver.ed25519.publicKey, x25519: approver.x25519.publicKey },
      creatorKeys: creator,
      policy: { conditions: [{ type: 'DATE_AFTER', value: '2025-01-01T00:00:00Z' }], logic: 'ALL' },
      title: 'Exact Quota 250MB'
    })
    console.log('  User stored exactly 250MB')
  })

  await test('Reject file exceeding user quota (250MB + 1KB)', async () => {
    const creator = await generateIdentity()
    const approver = await generateIdentity()
    const file1 = new Uint8Array(USER_QUOTA)
    crypto.getRandomValues(file1)

    await capsuleManager.createCapsule({
      files: file1,
      approverPubkey: { ed25519: approver.ed25519.publicKey, x25519: approver.x25519.publicKey },
      creatorKeys: creator,
      policy: { conditions: [{ type: 'DATE_AFTER', value: '2025-01-01T00:00:00Z' }], logic: 'ALL' },
      title: 'First 250MB'
    })

    const file2 = new Uint8Array(1024)
    crypto.getRandomValues(file2)

    try {
      await capsuleManager.createCapsule({
        files: file2,
        approverPubkey: { ed25519: approver.ed25519.publicKey, x25519: approver.x25519.publicKey },
        creatorKeys: creator,
        policy: { conditions: [{ type: 'DATE_AFTER', value: '2025-01-01T00:00:00Z' }], logic: 'ALL' },
        title: 'Should Fail 1KB Over'
      })
      throw new Error('Should have rejected upload exceeding user quota')
    } catch (error) {
      if (error instanceof Error && error.message.includes('quota')) {
        console.log('  Correctly blocked 1KB over quota')
        return
      }
      throw error
    }
  })

  await test('Multiple users each at quota (4 x 250MB)', async () => {
    const uploads = Array.from({ length: 4 }, async (_, i) => {
      const creator = await generateIdentity()
      const approver = await generateIdentity()
      const file = new Uint8Array(USER_QUOTA)
      crypto.getRandomValues(file)

      return capsuleManager.createCapsule({
        files: file,
        approverPubkey: { ed25519: approver.ed25519.publicKey, x25519: approver.x25519.publicKey },
        creatorKeys: creator,
        policy: { conditions: [{ type: 'DATE_AFTER', value: '2025-01-01T00:00:00Z' }], logic: 'ALL' },
        title: `User ${i + 1} at 250MB`
      })
    })

    const results = await Promise.allSettled(uploads)
    const successful = results.filter(r => r.status === 'fulfilled').length
    console.log(`  ${successful}/4 users stored 250MB each`)
    if (successful === 0) throw new Error('All user uploads failed')
  })

  await test('10 concurrent 10MB uploads', async () => {
    const uploads = Array.from({ length: 10 }, async (_, i) => {
      const creator = await generateIdentity()
      const approver = await generateIdentity()
      const file = new Uint8Array(10 * 1024 * 1024)
      crypto.getRandomValues(file)

      return capsuleManager.createCapsule({
        files: file,
        approverPubkey: { ed25519: approver.ed25519.publicKey, x25519: approver.x25519.publicKey },
        creatorKeys: creator,
        policy: { conditions: [{ type: 'DATE_AFTER', value: '2025-01-01T00:00:00Z' }], logic: 'ALL' },
        title: `Concurrent ${i}`
      })
    })

    const results = await Promise.allSettled(uploads)
    const successful = results.filter(r => r.status === 'fulfilled').length
    console.log(`  ${successful}/10 uploads succeeded`)
    if (successful === 0) throw new Error('All concurrent uploads failed')
  })

  await test('Vault upload 50MB', async () => {
    const creator = await generateIdentity()
    const file = new Uint8Array(50 * 1024 * 1024)
    crypto.getRandomValues(file)

    await vaultManager.createVault({
      files: file,
      creatorKeys: creator,
      title: 'Stress Test Vault',
      documentType: 'contract',
      issuer: 'Test Issuer',
      documentId: 'TEST-001',
      fileName: 'stress-test.bin',
      fileSize: file.length
    })
  })

  await test('Test global 95% capacity limit', async () => {
    const usage = await pinata.getStorageUsage()
    const capacityLimit = GLOBAL_LIMIT * CAPACITY_THRESHOLD
    const remaining = capacityLimit - usage.used

    console.log(`  Current global usage: ${(usage.used / 1024 / 1024).toFixed(1)}MB`)
    console.log(`  95% capacity limit: ${(capacityLimit / 1024 / 1024).toFixed(1)}MB`)
    console.log(`  Remaining until block: ${(remaining / 1024 / 1024).toFixed(1)}MB`)

    if (remaining > 10 * 1024 * 1024) {
      console.log('  Skipping: Too far from 95% limit to test safely')
      return
    }

    if (remaining > 0) {
      const creator = await generateIdentity()
      const approver = await generateIdentity()
      const file = new Uint8Array(Math.floor(remaining))
      crypto.getRandomValues(file)

      await capsuleManager.createCapsule({
        files: file,
        approverPubkey: { ed25519: approver.ed25519.publicKey, x25519: approver.x25519.publicKey },
        creatorKeys: creator,
        policy: { conditions: [{ type: 'DATE_AFTER', value: '2025-01-01T00:00:00Z' }], logic: 'ALL' },
        title: 'Fill to 95%'
      })
      console.log('  Filled to exactly 95%')
    }

    const creator = await generateIdentity()
    const approver = await generateIdentity()
    const file = new Uint8Array(1024 * 1024)
    crypto.getRandomValues(file)

    try {
      await capsuleManager.createCapsule({
        files: file,
        approverPubkey: { ed25519: approver.ed25519.publicKey, x25519: approver.x25519.publicKey },
        creatorKeys: creator,
        policy: { conditions: [{ type: 'DATE_AFTER', value: '2025-01-01T00:00:00Z' }], logic: 'ALL' },
        title: 'Should Fail at 95%'
      })
      throw new Error('Should have blocked at 95% global capacity')
    } catch (error) {
      if (error instanceof Error && error.message.includes('capacity')) {
        console.log('  Correctly blocked at 95% global capacity')
        return
      }
      throw error
    }
  })

  await test('Check final storage usage', async () => {
    const usage = await pinata.getStorageUsage()
    console.log(`  Final: ${(usage.used / 1024 / 1024).toFixed(1)}MB / ${(usage.limit / 1024 / 1024).toFixed(0)}MB (${usage.percentage.toFixed(1)}%)`)
    
    if (usage.percentage >= 80) {
      console.log('  ⚠️  Warning: Storage above 80%')
    }
    if (usage.percentage >= 95) {
      console.log('  🚨 Critical: Storage at 95% capacity')
    }
  })

  // Database connection cleanup not needed

  console.log('\n=== Test Summary ===')
  const passed = results.filter(r => r.passed).length
  const total = results.length
  console.log(`Passed: ${passed}/${total}`)
  console.log(`Failed: ${total - passed}/${total}`)
  console.log(`Total Duration: ${results.reduce((sum, r) => sum + r.duration, 0)}ms`)

  if (passed < total) {
    console.log('\nFailed Tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.test}: ${r.message}`)
    })
  }

  process.exit(passed === total ? 0 : 1)
}

runStressTest().catch(error => {
  console.error('Stress test failed:', error)
  process.exit(1)
})
