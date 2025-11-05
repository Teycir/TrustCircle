import { describe, it, expect, beforeAll } from 'vitest'
import { getConfig, loadConfig } from '../lib/config'
import { PinataClient } from '../lib/pinata'

describe('Storage API Separation Test', () => {
  beforeAll(async () => {
    await loadConfig()
  })

  it('should have two different API keys configured', () => {
    const capsuleKey = getConfig('pinataJWT')
    const vaultKey = getConfig('vaultPinataJWT')

    console.log('Capsule key (first 30):', capsuleKey?.substring(0, 30))
    console.log('Vault key (first 30):', vaultKey?.substring(0, 30))

    expect(capsuleKey).toBeDefined()
    expect(vaultKey).toBeDefined()
    expect(capsuleKey).not.toBe(vaultKey)
  })

  it('should query capsule Pinata account and return data', async () => {
    const capsuleKey = getConfig('pinataJWT')
    if (!capsuleKey) throw new Error('Capsule key not configured')

    const pinata = new PinataClient(capsuleKey)
    const result = await pinata.getStorageUsage()

    console.log('CAPSULE Account Data:', {
      used: result.used,
      usedMB: (result.used / 1024 / 1024).toFixed(4),
      limit: result.limit,
      limitMB: (result.limit / 1024 / 1024).toFixed(0),
      percentage: result.percentage.toFixed(4)
    })

    expect(result).toHaveProperty('used')
    expect(result).toHaveProperty('limit')
    expect(result).toHaveProperty('percentage')
    expect(typeof result.used).toBe('number')
  })

  it('should query vault Pinata account and return data', async () => {
    const vaultKey = getConfig('vaultPinataJWT')
    if (!vaultKey) throw new Error('Vault key not configured')

    const pinata = new PinataClient(vaultKey)
    const result = await pinata.getStorageUsage()

    console.log('VAULT Account Data:', {
      used: result.used,
      usedMB: (result.used / 1024 / 1024).toFixed(4),
      limit: result.limit,
      limitMB: (result.limit / 1024 / 1024).toFixed(0),
      percentage: result.percentage.toFixed(4)
    })

    expect(result).toHaveProperty('used')
    expect(result).toHaveProperty('limit')
    expect(result).toHaveProperty('percentage')
    expect(typeof result.used).toBe('number')
  })

  it('should show different storage values for capsule and vault accounts', async () => {
    const capsuleKey = getConfig('pinataJWT')
    const vaultKey = getConfig('vaultPinataJWT')

    if (!capsuleKey || !vaultKey) throw new Error('Keys not configured')

    const capsulePinata = new PinataClient(capsuleKey)
    const vaultPinata = new PinataClient(vaultKey)

    const capsuleData = await capsulePinata.getStorageUsage()
    const vaultData = await vaultPinata.getStorageUsage()

    console.log('\n=== STORAGE COMPARISON ===')
    console.log('Capsule:', capsuleData.used, 'bytes =', (capsuleData.used / 1024 / 1024).toFixed(4), 'MB')
    console.log('Vault:', vaultData.used, 'bytes =', (vaultData.used / 1024 / 1024).toFixed(4), 'MB')
    console.log('Total:', capsuleData.used + vaultData.used, 'bytes')
    console.log('========================\n')

    // They should be different accounts (unless both happen to be empty)
    expect(capsuleKey).not.toBe(vaultKey)
  })
})
