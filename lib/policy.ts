export interface DeviceContext {
  now: Date
  lat?: number
  lon?: number
}

export interface PolicyCondition {
  type: 'DATE_AFTER' | 'LOCATION_HASH_EQ'
  value: string
  precision?: number
  salt?: string
}

export interface UnlockPolicy {
  conditions: PolicyCondition[]
  logic: 'ALL' | 'ANY'
}

export async function buildLocationHash(
  lat: number,
  lon: number,
  date: Date,
  precision: number,
  salt: string
): Promise<string> {
  const roundedLat = Math.round(lat * Math.pow(10, precision)) / Math.pow(10, precision)
  const roundedLon = Math.round(lon * Math.pow(10, precision)) / Math.pow(10, precision)
  const dayUtc = date.toISOString().split('T')[0]
  
  const input = `${salt}:${roundedLat}:${roundedLon}:${dayUtc}`
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
}

export async function evaluate(policy: UnlockPolicy, context: DeviceContext): Promise<boolean> {
  const results = await Promise.all(
    policy.conditions.map(c => evaluateCondition(c, context))
  )
  
  return policy.logic === 'ALL' ? results.every(r => r) : results.some(r => r)
}

async function evaluateCondition(condition: PolicyCondition, context: DeviceContext): Promise<boolean> {
  if (condition.type === 'DATE_AFTER') {
    return context.now >= new Date(condition.value)
  }
  
  if (condition.type === 'LOCATION_HASH_EQ') {
    if (!context.lat || !context.lon || !condition.precision || !condition.salt) {
      return false
    }
    
    const hash = await buildLocationHash(
      context.lat,
      context.lon,
      context.now,
      condition.precision,
      condition.salt
    )
    
    return hash === condition.value
  }
  
  return false
}
