import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function checkMissingFiles() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('Checking capsules...')
  const { data: capsules } = await supabase
    .from('capsules')
    .select('id, title, payload_cid, created_at')
    .order('created_at', { ascending: false })

  console.log(`Found ${capsules?.length || 0} capsules in database:`)
  capsules?.forEach(c => {
    console.log(`  - ${c.title}: CID=${c.payload_cid}`)
  })

  console.log('\nChecking vaults...')
  const { data: vaults } = await supabase
    .from('vaults')
    .select('id, title, payload_cid, created_at')
    .order('created_at', { ascending: false })

  console.log(`Found ${vaults?.length || 0} vaults in database:`)
  vaults?.forEach(v => {
    console.log(`  - ${v.title}: CID=${v.payload_cid}`)
  })

  console.log(`\nTotal files in database: ${(capsules?.length || 0) + (vaults?.length || 0)}`)
  console.log('Total files in Pinata: 2 (322 bytes)')
  console.log(`Missing files: ${(capsules?.length || 0) + (vaults?.length || 0) - 2}`)
}

checkMissingFiles()
