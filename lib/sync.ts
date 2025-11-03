import { offlineManager, isOnline } from './offline'
import { getClient } from './client'

export async function syncPendingOperations() {
  if (!isOnline()) return

  await offlineManager.sync(async (operations) => {
    const client = getClient()
    
    for (const op of operations) {
      try {
        if (op.entity === 'capsule') {
          if (op.type === 'create') {
            await client.createCapsule(op.data)
          } else if (op.type === 'update') {
            await client.updateCapsule(op.data.id, op.data)
          } else if (op.type === 'delete') {
            await client['db'].deleteCapsule(op.data.id)
          }
        }
      } catch (err) {
        console.error('Operation sync failed:', err)
        throw err
      }
    }
  })
}

export function startAutoSync(intervalMs = 30000) {
  const interval = setInterval(() => {
    syncPendingOperations().catch(console.error)
  }, intervalMs)
  
  return () => clearInterval(interval)
}
