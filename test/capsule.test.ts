import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CapsuleManager } from '../lib/capsule'
import { generateIdentity } from '../lib/crypto'
import { PinataClient } from '../lib/pinata'
import { TrustCircleDB } from '../lib/supabase'

vi.mock('../lib/pinata')
vi.mock('../lib/supabase')

describe('Capsule Integration', () => {
  let manager: CapsuleManager
  let mockPinata: any
  let mockDb: any
  let creatorKeys: Awaited<ReturnType<typeof generateIdentity>>
  let approverKeys: Awaited<ReturnType<typeof generateIdentity>>

  beforeEach(async () => {
    creatorKeys = await generateIdentity()
    approverKeys = await generateIdentity()

    mockPinata = {
      uploadBytes: vi.fn().mockResolvedValue('QmTestCID123'),
      getBytes: vi.fn(),
      getStorageUsage: vi.fn().mockResolvedValue({ used: 0, limit: 1073741824, percentage: 0 }),
      purgeOldFiles: vi.fn().mockResolvedValue(undefined)
    }

    mockDb = {
      saveCapsule: vi.fn().mockResolvedValue('capsule-uuid'),
      getCapsule: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue(undefined)
    }

    vi.mocked(PinataClient).mockImplementation(() => mockPinata)
    vi.mocked(TrustCircleDB).mockImplementation(() => mockDb)

    manager = new CapsuleManager(mockPinata, mockDb)
  })

  it('creates capsule with date policy', async () => {
    const files = new TextEncoder().encode('secret data')
    const policy = {
      conditions: [{ type: 'DATE_AFTER' as const, value: '2025-01-01T00:00:00Z' }],
      logic: 'ALL' as const
    }

    const capsuleId = await manager.createCapsule({
      files,
      approverPubkey: { ed25519: approverKeys.ed25519.publicKey, x25519: approverKeys.x25519.publicKey },
      creatorKeys,
      policy,
      title: 'Test Capsule',
      notes: 'Test notes'
    })

    expect(capsuleId).toBe('capsule-uuid')
    expect(mockPinata.uploadBytes).toHaveBeenCalled()
    expect(mockDb.saveCapsule).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Capsule',
        notes: 'Test notes',
        payload_cid: 'QmTestCID123'
      })
    )
  })

  it('unlocks capsule when policy met', async () => {
    const originalData = new TextEncoder().encode('secret data')

    const policy = {
      conditions: [{ type: 'DATE_AFTER' as const, value: '2025-01-01T00:00:00Z' }],
      logic: 'ALL' as const
    }

    const capsuleId = await manager.createCapsule({
      files: originalData,
      approverPubkey: { ed25519: approverKeys.ed25519.publicKey, x25519: approverKeys.x25519.publicKey },
      creatorKeys,
      policy
    })

    const savedMetadata = mockDb.saveCapsule.mock.calls[0][0].metadata
    mockDb.getCapsule.mockResolvedValueOnce({
      id: capsuleId,
      metadata: { ...savedMetadata, capsule_id: capsuleId }
    })

    const encryptedPayload = mockPinata.uploadBytes.mock.calls[0][0] as Uint8Array
    mockPinata.getBytes.mockResolvedValueOnce(encryptedPayload)

    const decrypted = await manager.unlockCapsule({
      capsuleId,
      approverKeys,
      context: { now: new Date('2025-06-01') }
    })

    expect(new TextDecoder().decode(decrypted)).toBe('secret data')
    expect(mockDb.updateStatus).toHaveBeenCalledWith(capsuleId, 'unlocked')
  })

  it('rejects unlock when policy not met', async () => {
    const policy = {
      conditions: [{ type: 'DATE_AFTER' as const, value: '2025-12-31T00:00:00Z' }],
      logic: 'ALL' as const
    }

    const capsuleId = await manager.createCapsule({
      files: new TextEncoder().encode('data'),
      approverPubkey: { ed25519: approverKeys.ed25519.publicKey, x25519: approverKeys.x25519.publicKey },
      creatorKeys,
      policy
    })

    const savedMetadata = mockDb.saveCapsule.mock.calls[0][0].metadata
    mockDb.getCapsule.mockResolvedValueOnce({
      id: capsuleId,
      metadata: { ...savedMetadata, capsule_id: capsuleId }
    })

    await expect(manager.unlockCapsule({
      capsuleId,
      approverKeys,
      context: { now: new Date('2025-01-01') }
    })).rejects.toThrow('This capsule is not available yet.')
  })

  it('rejects tampered metadata', async () => {
    const policy = {
      conditions: [{ type: 'DATE_AFTER' as const, value: '2025-01-01T00:00:00Z' }],
      logic: 'ALL' as const
    }

    const capsuleId = await manager.createCapsule({
      files: new TextEncoder().encode('data'),
      approverPubkey: { ed25519: approverKeys.ed25519.publicKey, x25519: approverKeys.x25519.publicKey },
      creatorKeys,
      policy
    })

    const savedMetadata = mockDb.saveCapsule.mock.calls[0][0].metadata
    const tamperedMetadata = { ...savedMetadata, payload_cid: 'QmTampered' }

    mockDb.getCapsule.mockResolvedValueOnce({
      id: capsuleId,
      metadata: { ...tamperedMetadata, capsule_id: capsuleId }
    })

    await expect(manager.unlockCapsule({
      capsuleId,
      approverKeys,
      context: { now: new Date('2025-06-01') }
    })).rejects.toThrow('This capsule details are invalid. It may have been altered.')
  })

  it('creates capsule with location policy', async () => {
    const policy = {
      conditions: [{
        type: 'LOCATION_HASH_EQ' as const,
        value: 'hash123',
        precision: 2,
        salt: 'salt'
      }],
      logic: 'ALL' as const
    }

    await manager.createCapsule({
      files: new TextEncoder().encode('data'),
      approverPubkey: { ed25519: approverKeys.ed25519.publicKey, x25519: approverKeys.x25519.publicKey },
      creatorKeys,
      policy
    })

    const savedRecord = mockDb.saveCapsule.mock.calls[0][0]
    expect(savedRecord.metadata.unlock_policy.conditions[0].type).toBe('LOCATION_HASH_EQ')
  })
})
