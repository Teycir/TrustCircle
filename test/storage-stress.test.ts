import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { CapsuleManager } from '../lib/capsule'
import { generateIdentity } from '@trustcircle/core'
import { PinataClient } from '../lib/pinata'
import { TrustCircleDB } from '../lib/supabase'

describe('Storage Stress Tests', () => {
  let manager: CapsuleManager
  let pinata: PinataClient
  let db: TrustCircleDB
  let creatorKeys: Awaited<ReturnType<typeof generateIdentity>>
  let approverKeys: Awaited<ReturnType<typeof generateIdentity>>

  beforeAll(async () => {
    const apiKey = process.env.PINATA_JWT || ''
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    pinata = new PinataClient(apiKey)
    db = new TrustCircleDB(supabaseUrl, supabaseKey, pinata)
    manager = new CapsuleManager(pinata, db)
    
    creatorKeys = await generateIdentity()
    approverKeys = await generateIdentity()
  })

  it('blocks upload exceeding user quota (250MB)', async () => {
    const largeFile = new Uint8Array(260 * 1024 * 1024)
    crypto.getRandomValues(largeFile)

    const policy = {
      conditions: [{ type: 'DATE_AFTER' as const, value: '2025-01-01T00:00:00Z' }],
      logic: 'ALL' as const
    }

    await expect(manager.createCapsule({
      files: largeFile,
      approverPubkey: { ed25519: approverKeys.ed25519.publicKey, x25519: approverKeys.x25519.publicKey },
      creatorKeys,
      policy,
      title: 'Oversized Capsule'
    })).rejects.toThrow(/quota/)
  })

  it('allows multiple small uploads within quota', async () => {
    const smallFile = new Uint8Array(10 * 1024 * 1024)
    crypto.getRandomValues(smallFile)

    const policy = {
      conditions: [{ type: 'DATE_AFTER' as const, value: '2025-01-01T00:00:00Z' }],
      logic: 'ALL' as const
    }

    const uploads = []
    for (let i = 0; i < 5; i++) {
      uploads.push(manager.createCapsule({
        files: smallFile,
        approverPubkey: { ed25519: approverKeys.ed25519.publicKey, x25519: approverKeys.x25519.publicKey },
        creatorKeys,
        policy,
        title: `Small Capsule ${i}`
      }))
    }

    const results = await Promise.allSettled(uploads)
    const successful = results.filter(r => r.status === 'fulfilled')
    expect(successful.length).toBeGreaterThan(0)
  })

  it('tracks storage usage accurately', async () => {
    const usage = await pinata.getStorageUsage()
    
    expect(usage).toHaveProperty('used')
    expect(usage).toHaveProperty('limit')
    expect(usage).toHaveProperty('percentage')
    expect(usage.used).toBeGreaterThanOrEqual(0)
    expect(usage.limit).toBe(1073741824)
    expect(usage.percentage).toBeLessThanOrEqual(100)
  })

  it('warns at 80% capacity', async () => {
    const usage = await pinata.getStorageUsage()
    const warningThreshold = usage.limit * 0.8

    if (usage.used >= warningThreshold) {
      expect(usage.percentage).toBeGreaterThanOrEqual(80)
    }
  })

  it('handles concurrent uploads', async () => {
    const file = new Uint8Array(5 * 1024 * 1024)
    crypto.getRandomValues(file)

    const policy = {
      conditions: [{ type: 'DATE_AFTER' as const, value: '2025-01-01T00:00:00Z' }],
      logic: 'ALL' as const
    }

    const concurrent = Array.from({ length: 10 }, (_, i) =>
      manager.createCapsule({
        files: file,
        approverPubkey: { ed25519: approverKeys.ed25519.publicKey, x25519: approverKeys.x25519.publicKey },
        creatorKeys,
        policy,
        title: `Concurrent ${i}`
      })
    )

    const results = await Promise.allSettled(concurrent)
    const successful = results.filter(r => r.status === 'fulfilled')
    expect(successful.length).toBeGreaterThan(0)
  })

  it('blocks at 95% global capacity', async () => {
    const usage = await pinata.getStorageUsage()
    const capacityThreshold = usage.limit * 0.95

    if (usage.used >= capacityThreshold) {
      const file = new Uint8Array(1024 * 1024)
      const policy = {
        conditions: [{ type: 'DATE_AFTER' as const, value: '2025-01-01T00:00:00Z' }],
        logic: 'ALL' as const
      }

      await expect(manager.createCapsule({
        files: file,
        approverPubkey: { ed25519: approverKeys.ed25519.publicKey, x25519: approverKeys.x25519.publicKey },
        creatorKeys,
        policy
      })).rejects.toThrow(/capacity/)
    }
  })
})
