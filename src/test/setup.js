import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Unit tests use the bundled content regardless of the developer's .env files.
vi.stubEnv('VITE_CONTENT_SOURCE', 'local')
vi.stubEnv('VITE_SUPABASE_URL', '')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
vi.stubEnv('VITE_SANITY_PROJECT_ID', '')
vi.stubEnv('VITE_SANITY_DATASET', 'production')
vi.stubEnv('VITE_SANITY_API_VERSION', '2026-11-14')

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})
