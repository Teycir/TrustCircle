import { describe, it, expect, beforeEach, vi } from 'vitest'
import { signIn, signUp, signOut, getCurrentUser } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  savePublicKeys: vi.fn()
}))

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should sign in successfully', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    vi.mocked(signIn).mockResolvedValue({ user: mockUser, session: {} } as any)

    const result = await signIn('test@example.com', 'password')
    expect(result.user).toEqual(mockUser)
  })

  it('should sign up successfully', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    vi.mocked(signUp).mockResolvedValue({ user: mockUser, session: {} } as any)

    const result = await signUp('test@example.com', 'password')
    expect(result.user).toEqual(mockUser)
  })

  it('should get current user', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)

    const user = await getCurrentUser()
    expect(user).toEqual(mockUser)
  })

  it('should sign out successfully', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined)
    await expect(signOut()).resolves.toBeUndefined()
  })
})
