import { describe, it, expect, beforeEach } from 'vitest'
import { offlineManager } from '../lib/offline'

describe('Offline Manager', () => {
  beforeEach(async () => {
    await offlineManager.init()
  })

  it('should save and retrieve capsule', async () => {
    const testData = { title: 'Test', content: 'data' }
    await offlineManager.saveCapsule('test-1', testData)
    
    const result = await offlineManager.getCapsule('test-1')
    expect(result?.data).toEqual(testData)
  })

  it('should queue operations', async () => {
    await offlineManager.queueOperation('create', 'capsule', { id: 'test-2' })
    
    const ops = await offlineManager.getPendingOperations()
    expect(ops.length).toBeGreaterThan(0)
    expect(ops[0].type).toBe('create')
  })

  it('should sync operations', async () => {
    await offlineManager.queueOperation('create', 'capsule', { id: 'test-3' })
    
    let synced = false
    await offlineManager.sync(async () => {
      synced = true
    })
    
    expect(synced).toBe(true)
  })
})
