import { getConfig } from '../lib/config'

async function verifyAccounts() {
  console.log('Verifying Pinata account separation...\n')

  const capsuleKey = getConfig('pinataJWT')
  const vaultKey = getConfig('vaultPinataJWT')

  console.log('Capsule API Key:', capsuleKey ? `${capsuleKey.substring(0, 20)}...` : 'NOT SET')
  console.log('Vault API Key:', vaultKey ? `${vaultKey.substring(0, 20)}...` : 'NOT SET')
  console.log('Are they different?', capsuleKey !== vaultKey ? 'YES ✅' : 'NO ❌ SAME KEY!')

  if (capsuleKey === vaultKey) {
    console.log('\n⚠️  WARNING: Both accounts use the SAME API key!')
    console.log('This means all files go to one Pinata account.')
    console.log('Storage display will be inaccurate.')
  }

  console.log('\nFetching capsule account data...')
  const capsuleResponse = await fetch('https://api.pinata.cloud/data/userPinnedDataTotal', {
    headers: { Authorization: `Bearer ${capsuleKey}` }
  })
  const capsuleData = await capsuleResponse.json()
  console.log('Capsule account:', {
    files: capsuleData.pin_count,
    size: capsuleData.pin_size_total,
    sizeMB: (capsuleData.pin_size_total / 1024 / 1024).toFixed(2)
  })

  console.log('\nFetching vault account data...')
  const vaultResponse = await fetch('https://api.pinata.cloud/data/userPinnedDataTotal', {
    headers: { Authorization: `Bearer ${vaultKey}` }
  })
  const vaultData = await vaultResponse.json()
  console.log('Vault account:', {
    files: vaultData.pin_count,
    size: vaultData.pin_size_total,
    sizeMB: (vaultData.pin_size_total / 1024 / 1024).toFixed(2)
  })

  console.log('\n' + '='.repeat(50))
  console.log('SUMMARY:')
  console.log('Capsule files:', capsuleData.pin_count)
  console.log('Vault files:', vaultData.pin_count)
  console.log('Total files:', capsuleData.pin_count + vaultData.pin_count)
  console.log('Using same account?', capsuleKey === vaultKey ? 'YES ❌' : 'NO ✅')
}

verifyAccounts().catch(console.error)
