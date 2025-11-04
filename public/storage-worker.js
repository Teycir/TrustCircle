self.onmessage = async function(e) {
  const { pubkey, supabaseUrl, supabaseKey } = e.data
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_storage_usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ user_pubkey: pubkey })
    })
    
    const data = await response.json()
    self.postMessage({ success: true, data })
  } catch (error) {
    self.postMessage({ success: false, error: error.message })
  }
}
