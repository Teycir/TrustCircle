import { describe, it, expect } from 'vitest'
import { buildLocationHash, evaluate } from '../lib/policy'

describe('Policy Engine', () => {
  it('builds location hash with precision', async () => {
    const hash1 = await buildLocationHash(37.7749, -122.4194, new Date('2025-01-01'), 2, 'salt123')
    const hash2 = await buildLocationHash(37.7749, -122.4194, new Date('2025-01-01'), 2, 'salt123')

    expect(hash1).toBe(hash2)
  })

  it('produces different hashes for different locations', async () => {
    const hash1 = await buildLocationHash(37.77, -122.42, new Date('2025-01-01'), 2, 'salt')
    const hash2 = await buildLocationHash(37.78, -122.42, new Date('2025-01-01'), 2, 'salt')

    expect(hash1).not.toBe(hash2)
  })

  it('produces different hashes for different dates', async () => {
    const hash1 = await buildLocationHash(37.77, -122.42, new Date('2025-01-01'), 2, 'salt')
    const hash2 = await buildLocationHash(37.77, -122.42, new Date('2025-01-02'), 2, 'salt')

    expect(hash1).not.toBe(hash2)
  })

  it('evaluates DATE_AFTER condition', async () => {
    const policy = {
      conditions: [{ type: 'DATE_AFTER' as const, value: '2025-01-01T00:00:00Z' }],
      logic: 'ALL' as const
    }

    const pass = await evaluate(policy, { now: new Date('2025-01-02') })
    expect(pass).toBe(true)

    await expect(evaluate(policy, { now: new Date('2024-12-31') }))
      .rejects.toThrow('This capsule is not available yet.')
  })

  it('evaluates LOCATION_HASH_EQ condition', async () => {
    const lat = 37.7749
    const lon = -122.4194
    const date = new Date('2025-01-01')
    const salt = 'test-salt'

    const hash = await buildLocationHash(lat, lon, date, 2, salt)

    const policy = {
      conditions: [{
        type: 'LOCATION_HASH_EQ' as const,
        value: hash,
        precision: 2,
        salt
      }],
      logic: 'ALL' as const
    }

    const pass = await evaluate(policy, { now: date, lat, lon })
    expect(pass).toBe(true)

    await expect(evaluate(policy, { now: date, lat: 40.0, lon }))
      .rejects.toThrow('You are not in the required unlock area.')
  })

  it('evaluates ALL logic with multiple conditions', async () => {
    const policy = {
      conditions: [
        { type: 'DATE_AFTER' as const, value: '2025-01-01T00:00:00Z' },
        { type: 'DATE_AFTER' as const, value: '2025-01-02T00:00:00Z' }
      ],
      logic: 'ALL' as const
    }

    const pass = await evaluate(policy, { now: new Date('2025-01-03') })
    expect(pass).toBe(true)

    await expect(evaluate(policy, { now: new Date('2025-01-01T12:00:00Z') }))
      .rejects.toThrow('This capsule is not available yet.')
  })

  it('evaluates ANY logic with multiple conditions', async () => {
    const policy = {
      conditions: [
        { type: 'DATE_AFTER' as const, value: '2025-01-01T00:00:00Z' },
        { type: 'DATE_AFTER' as const, value: '2025-12-31T00:00:00Z' }
      ],
      logic: 'ANY' as const
    }

    const pass = await evaluate(policy, { now: new Date('2025-01-02') })
    expect(pass).toBe(true)

    await expect(evaluate(policy, { now: new Date('2024-12-31') }))
      .rejects.toThrow('This capsule is not available yet.')
  })

  it('fails location check when context missing coordinates', async () => {
    const policy = {
      conditions: [{
        type: 'LOCATION_HASH_EQ' as const,
        value: 'somehash',
        precision: 2,
        salt: 'salt'
      }],
      logic: 'ALL' as const
    }

    await expect(evaluate(policy, { now: new Date() }))
      .rejects.toThrow('You are not in the required unlock area.')
  })
})
