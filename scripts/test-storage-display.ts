import { getConfig } from '../lib/config'
import { PinataClient } from '../lib/pinata'

async function testStorageDisplay() {
  console.log('Testing Storage Display...\n')

  try {
    const capsuleApiKey = getConfig('pinataJWT')
    const vaultApiKey = getConfig('vaultPinataJWT')

    if (!capsuleApiKey) {
      console.error('❌ NEXT_PUBLIC_PINATA_JWT not configured')
      return
    }

    if (!vaultApiKey) {
      console.error('❌ NEXT_PUBLIC_VAULT_PINATA_JWT not configured')
      return
    }

    console.log('✅ API keys configured\n')

    const capsulePinata = new PinataClient(capsuleApiKey)
    const vaultPinata = new PinataClient(vaultApiKey)

    console.log('Fetching capsule storage...')
    const capsuleStorage = await capsulePinata.getStorageUsage()
    console.log('Capsule Storage:', {
      used: capsuleStorage.used,
      usedMB: (capsuleStorage.used / 1024 / 1024).toFixed(1),
      limit: capsuleStorage.limit,
      limitMB: (capsuleStorage.limit / 1024 / 1024).toFixed(0),
      percentage: capsuleStorage.percentage.toFixed(1)
    })

    console.log('\nFetching vault storage...')
    const vaultStorage = await vaultPinata.getStorageUsage()
    console.log('Vault Storage:', {
      used: vaultStorage.used,
      usedMB: (vaultStorage.used / 1024 / 1024).toFixed(1),
      limit: vaultStorage.limit,
      limitMB: (vaultStorage.limit / 1024 / 1024).toFixed(0),
      percentage: vaultStorage.percentage.toFixed(1)
    })

    console.log('\n✅ Storage display test complete')
    console.log('\nExpected display:')
    console.log(`🔒 ${(capsuleStorage.used / 1024 / 1024).toFixed(1)}/${(capsuleStorage.limit / 1024 / 1024).toFixed(0)}MB | 🔐 ${(vaultStorage.used / 1024 / 1024).toFixed(1)}/${(vaultStorage.limit / 1024 / 1024).toFixed(0)}MB`)

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
  }
}

testStorageDisplay()
