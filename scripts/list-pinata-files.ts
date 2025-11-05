import { getConfig } from '../lib/config'

async function listFiles() {
  await import('../lib/config').then(m => m.loadConfig())
  
  const capsuleKey = getConfig('pinataJWT')
  const vaultKey = getConfig('vaultPinataJWT')

  console.log('Fetching capsule account files...')
  const capsuleResponse = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=100', {
    headers: { Authorization: `Bearer ${capsuleKey}` }
  })
  const capsuleData = await capsuleResponse.json()
  console.log(`Capsule account: ${capsuleData.count} files`)
  capsuleData.rows?.forEach((f: any) => {
    console.log(`  - ${f.ipfs_pin_hash} (${(f.size / 1024).toFixed(2)} KB)`)
  })

  console.log('\nFetching vault account files...')
  const vaultResponse = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=100', {
    headers: { Authorization: `Bearer ${vaultKey}` }
  })
  const vaultData = await vaultResponse.json()
  console.log(`Vault account: ${vaultData.count} files`)
  vaultData.rows?.forEach((f: any) => {
    console.log(`  - ${f.ipfs_pin_hash} (${(f.size / 1024).toFixed(2)} KB)`)
  })

  console.log(`\nTotal files: ${capsuleData.count + vaultData.count}`)
}

listFiles().catch(console.error)
