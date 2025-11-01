export interface DeviceContext {
  now: Date
  lat?: number
  lon?: number
}

export class PolicyError extends Error {
  constructor(message: string, public type: 'DATE' | 'LOCATION' | 'UNKNOWN') {
    super(message)
    this.name = 'PolicyError'
  }
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
  if (lat < -90 || lat > 90) throw new Error('Latitude must be between -90 and 90')
  if (lon < -180 || lon > 180) throw new Error('Longitude must be between -180 and 180')
  
  const factor = 10 ** precision
  const roundedLat = Math.round(lat * factor) / factor
  const roundedLon = Math.round(lon * factor) / factor
  const dayUtc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    .toISOString().split('T')[0]
  
  const input = `${salt}:${roundedLat}:${roundedLon}:${dayUtc}`
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
}

export async function evaluate(policy: UnlockPolicy, context: DeviceContext): Promise<boolean> {
  const results = await Promise.all(
    policy.conditions.map(c => evaluateCondition(c, context))
  )
  
  const passed = policy.logic === 'ALL' ? results.every(r => r.passed) : results.some(r => r.passed)
  
  if (!passed) {
    const failedTypes = results.filter(r => !r.passed).map(r => r.type)
    if (failedTypes.includes('DATE')) {
      throw new PolicyError('This capsule is not available yet.', 'DATE')
    }
    if (failedTypes.includes('LOCATION')) {
      throw new PolicyError('You are not in the required unlock area.', 'LOCATION')
    }
    throw new PolicyError('Policy conditions not met.', 'UNKNOWN')
  }
  
  return true
}

async function evaluateCondition(condition: PolicyCondition, context: DeviceContext): Promise<{ passed: boolean; type: 'DATE' | 'LOCATION' | 'UNKNOWN' }> {
  if (condition.type === 'DATE_AFTER') {
    return { passed: context.now >= new Date(condition.value), type: 'DATE' }
  }
  
  if (condition.type === 'LOCATION_HASH_EQ') {
    if (!context.lat || !context.lon || !condition.precision || !condition.salt) {
      return { passed: false, type: 'LOCATION' }
    }
    
    const hash = await buildLocationHash(
      context.lat,
      context.lon,
      context.now,
      condition.precision,
      condition.salt
    )
    
    return { passed: hash === condition.value, type: 'LOCATION' }
  }
  
  return { passed: false, type: 'UNKNOWN' }
}
