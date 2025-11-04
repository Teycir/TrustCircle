import { describe, it, expect, beforeEach, vi } from 'vitest'
import { enableDeadHand, resetDeadHandDate, disableDeadHand, getDeadHandStatus } from '../lib/dead-hand'
import { TrustCircleDB } from '../lib/supabase'

const mockUpdateDeadHand = vi.fn().mockResolvedValue(undefined)
const mockGetCapsule = vi.fn()

vi.mock('../lib/supabase', () => ({
  TrustCircleDB: class {
    updateDeadHand = mockUpdateDeadHand
    getCapsule = mockGetCapsule
  },
}))

describe('Dead Hand', () => {
  let db: TrustCircleDB

  beforeEach(() => {
    vi.clearAllMocks()
    db = new TrustCircleDB('test-url', 'test-key')
    mockGetCapsule.mockResolvedValue({
      id: 'test-capsule-id',
      dead_hand_trigger_date: null,
      dead_hand_recipients: null,
      dead_hand_status: null,
      owner_email: null,
      warning_sent_at: null,
    })
  })

  describe('enableDeadHand', () => {
    it('should enable dead hand with valid config', async () => {
      const config = {
        triggerDate: new Date('2025-12-31'),
        recipients: ['test@example.com'],
        ownerEmail: 'owner@example.com',
      }

      await enableDeadHand(db, 'test-capsule-id', config)

      expect(mockUpdateDeadHand).toHaveBeenCalledWith('test-capsule-id', {
        dead_hand_trigger_date: config.triggerDate.toISOString(),
        dead_hand_recipients: config.recipients,
        dead_hand_status: null,
        owner_email: config.ownerEmail,
        warning_sent_at: null,
      })
    })

    it('should handle multiple recipients', async () => {
      const config = {
        triggerDate: new Date('2025-12-31'),
        recipients: ['test1@example.com', 'test2@example.com', 'test3@example.com'],
        ownerEmail: 'owner@example.com',
      }

      await enableDeadHand(db, 'test-capsule-id', config)

      expect(mockUpdateDeadHand).toHaveBeenCalledWith('test-capsule-id', 
        expect.objectContaining({
          dead_hand_recipients: config.recipients,
        })
      )
    })
  })

  describe('resetDeadHandDate', () => {
    it('should reset trigger date and clear status', async () => {
      const newDate = new Date('2026-06-30')

      await resetDeadHandDate(db, 'test-capsule-id', newDate)

      expect(mockUpdateDeadHand).toHaveBeenCalledWith('test-capsule-id', {
        dead_hand_trigger_date: newDate.toISOString(),
        dead_hand_status: null,
        warning_sent_at: null,
      })
    })
  })

  describe('disableDeadHand', () => {
    it('should clear all dead hand fields', async () => {
      await disableDeadHand(db, 'test-capsule-id')

      expect(mockUpdateDeadHand).toHaveBeenCalledWith('test-capsule-id', {
        dead_hand_trigger_date: null,
        dead_hand_recipients: null,
        dead_hand_status: null,
        owner_email: null,
        warning_sent_at: null,
      })
    })
  })

  describe('getDeadHandStatus', () => {
    it('should return disabled status when not enabled', async () => {
      const status = await getDeadHandStatus(db, 'test-capsule-id')

      expect(status).toEqual({
        enabled: false,
        triggerDate: null,
        status: null,
        recipients: [],
        daysUntilTrigger: null,
        warningDate: null,
      })
    })

    it('should calculate days until trigger correctly', async () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      
      mockGetCapsule.mockResolvedValue({
        dead_hand_trigger_date: futureDate.toISOString(),
        dead_hand_recipients: ['test@example.com'],
        dead_hand_status: null,
        owner_email: 'owner@example.com',
      })

      const status = await getDeadHandStatus(db, 'test-capsule-id')

      expect(status.enabled).toBe(true)
      expect(status.daysUntilTrigger).toBeGreaterThanOrEqual(9)
      expect(status.daysUntilTrigger).toBeLessThanOrEqual(10)
    })

    it('should calculate warning date correctly', async () => {
      const triggerDate = new Date('2025-12-31T00:00:00Z')
      
      mockGetCapsule.mockResolvedValue({
        dead_hand_trigger_date: triggerDate.toISOString(),
        dead_hand_recipients: ['test@example.com'],
        dead_hand_status: null,
        owner_email: 'owner@example.com',
      })

      const status = await getDeadHandStatus(db, 'test-capsule-id')

      const expectedWarningDate = new Date(triggerDate.getTime() - 2 * 24 * 60 * 60 * 1000)
      expect(status.warningDate?.getTime()).toBe(expectedWarningDate.getTime())
    })

    it('should return current status', async () => {
      mockGetCapsule.mockResolvedValue({
        dead_hand_trigger_date: new Date('2025-12-31').toISOString(),
        dead_hand_recipients: ['test@example.com'],
        dead_hand_status: 'warning_sent',
        owner_email: 'owner@example.com',
      })

      const status = await getDeadHandStatus(db, 'test-capsule-id')

      expect(status.status).toBe('warning_sent')
    })
  })
})
