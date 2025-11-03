import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    test: {
      globals: true,
      environment: 'node',
      include: ['test/**/*.test.ts'],
      env: {
        NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_PINATA_JWT: env.NEXT_PUBLIC_PINATA_JWT,
        NEXT_PUBLIC_PINATA_GATEWAY: env.NEXT_PUBLIC_PINATA_GATEWAY
      }
    }
  }
})
