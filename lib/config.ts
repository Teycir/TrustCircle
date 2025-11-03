const CONFIG_KEY = 'trustcircle-config'

export interface AppConfig {
  pinataJWT?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
}

export function getConfig(): AppConfig {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem(CONFIG_KEY)
  return stored ? JSON.parse(stored) : {}
}

export function saveConfig(config: AppConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function getEnvOrConfig(envKey: string, configKey: keyof AppConfig): string | undefined {
  const envValue = process.env[envKey]
  if (envValue) return envValue
  
  const config = getConfig()
  return config[configKey]
}
