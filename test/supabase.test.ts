import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TrustCircleDB } from '../lib/supabase'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => mockQuery)
  }))
}))

let mockQuery: any

describe('Supabase Client', () => {
  let db: TrustCircleDB

  beforeEach(() => {
    mockQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis()
    }
    mockQuery.select.mockReturnValue(mockQuery)
    mockQuery.eq.mockReturnValue(mockQuery)
    mockQuery.update.mockReturnValue(mockQuery)
    db = new TrustCircleDB('https://test.supabase.co', 'test-key')
  })

  it('saves capsule and returns id', async () => {
    mockQuery.single.mockResolvedValueOnce({
      data: { id: 'test-uuid' },
      error: null
    })

    const record = {
      creator_pubkey: 'creator123',
      approver_pubkey: 'approver456',
      payload_cid: 'QmTest',
      metadata: { test: 'data' }
    }

    const id = await db.saveCapsule(record)

    expect(id).toBe('test-uuid')
    expect(mockQuery.insert).toHaveBeenCalledWith(record)
  })

  it('throws error on save failure', async () => {
    mockQuery.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' }
    })

    await expect(db.saveCapsule({} as any)).rejects.toThrow('Failed to save capsule: Database error')
  })

  it('gets capsule by id', async () => {
    const mockCapsule = {
      id: 'test-uuid',
      creator_pubkey: 'creator123',
      payload_cid: 'QmTest'
    }

    mockQuery.single.mockResolvedValueOnce({
      data: mockCapsule,
      error: null
    })

    const result = await db.getCapsule('test-uuid')

    expect(result).toEqual(mockCapsule)
    expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-uuid')
  })

  it('throws error on get failure', async () => {
    mockQuery.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' }
    })

    await expect(db.getCapsule('invalid')).rejects.toThrow('Failed to get capsule: Not found')
  })

  it('lists all capsules without filters', async () => {
    const mockCapsules = [{ id: '1' }, { id: '2' }]
    mockQuery.select.mockResolvedValueOnce({
      data: mockCapsules,
      error: null
    })

    const result = await db.listCapsules()

    expect(result).toEqual(mockCapsules)
  })

  it('lists capsules filtered by creator', async () => {
    const chainedQuery = {
      eq: vi.fn().mockResolvedValueOnce({ data: [{ id: '1' }], error: null })
    }
    mockQuery.select.mockReturnValueOnce(chainedQuery)

    await db.listCapsules({ creator: 'creator123' })

    expect(chainedQuery.eq).toHaveBeenCalledWith('creator_pubkey', 'creator123')
  })

  it('lists capsules filtered by approver', async () => {
    const chainedQuery = {
      eq: vi.fn().mockResolvedValueOnce({ data: [{ id: '1' }], error: null })
    }
    mockQuery.select.mockReturnValueOnce(chainedQuery)

    await db.listCapsules({ approver: 'approver456' })

    expect(chainedQuery.eq).toHaveBeenCalledWith('approver_pubkey', 'approver456')
  })

  it('updates capsule status', async () => {
    const chainedQuery = {
      eq: vi.fn().mockResolvedValueOnce({ data: null, error: null })
    }
    mockQuery.update.mockReturnValueOnce(chainedQuery)

    await db.updateStatus('test-uuid', 'unlocked')

    expect(mockQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'unlocked', unlocked_at: expect.any(String) })
    )
    expect(chainedQuery.eq).toHaveBeenCalledWith('id', 'test-uuid')
  })

  it('throws error on update failure', async () => {
    const chainedQuery = {
      eq: vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'Update failed' } })
    }
    mockQuery.update.mockReturnValueOnce(chainedQuery)

    await expect(db.updateStatus('test-uuid', 'unlocked')).rejects.toThrow('Failed to update status: Update failed')
  })
})
