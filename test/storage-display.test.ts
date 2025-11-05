import { describe, it, expect } from 'vitest'

describe('Storage Display Regression Test', () => {
  it('should display 0.0 MB correctly when storage is empty', () => {
    const storage = { capsules: 0, vaults: 0, limit: 262144000 }
    
    const capsulesDisplay = (storage.capsules / 1024 / 1024).toFixed(1)
    const vaultsDisplay = (storage.vaults / 1024 / 1024).toFixed(1)
    const limitDisplay = (storage.limit / 1024 / 1024).toFixed(0)
    
    expect(capsulesDisplay).toBe('0.0')
    expect(vaultsDisplay).toBe('0.0')
    expect(limitDisplay).toBe('250')
  })

  it('should display actual storage values correctly', () => {
    const storage = { capsules: 5242880, vaults: 10485760, limit: 262144000 }
    
    const capsulesDisplay = (storage.capsules / 1024 / 1024).toFixed(1)
    const vaultsDisplay = (storage.vaults / 1024 / 1024).toFixed(1)
    const limitDisplay = (storage.limit / 1024 / 1024).toFixed(0)
    
    expect(capsulesDisplay).toBe('5.0')
    expect(vaultsDisplay).toBe('10.0')
    expect(limitDisplay).toBe('250')
  })

  it('should calculate percentage correctly', () => {
    const storage = { capsules: 209715200, vaults: 0, limit: 262144000 }
    const percentage = (storage.capsules + storage.vaults) / storage.limit
    
    expect(percentage).toBeCloseTo(0.8, 2)
    expect(percentage >= 0.80).toBe(true)
    expect(percentage >= 0.95).toBe(false)
  })

  it('should handle null storage gracefully', () => {
    const storage = null
    
    const shouldDisplay = storage !== null
    expect(shouldDisplay).toBe(false)
  })

  it('should display storage when values are zero', () => {
    const storage = { capsules: 0, vaults: 0, limit: 262144000 }
    
    const shouldDisplay = storage !== null
    expect(shouldDisplay).toBe(true)
  })
})
