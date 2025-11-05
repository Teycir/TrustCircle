import { describe, it, expect } from 'vitest'
import { validatePublicKey, validateCapsuleId, validateFileSize } from '@trustcircle/core'

describe('Validation Edge Cases', () => {
  describe('validatePublicKey', () => {
    it('rejects empty string', () => {
      expect(() => validatePublicKey('')).toThrow('Public key must be a non-empty string')
    })

    it('rejects invalid format', () => {
      expect(() => validatePublicKey('invalid')).toThrow('Invalid key format')
    })

    it('rejects wrong key type', () => {
      expect(() => validatePublicKey('rsa:abc123')).toThrow('Invalid key format')
    })

    it('rejects invalid base64', () => {
      expect(() => validatePublicKey('ed25519:!!!invalid!!!')).toThrow('Invalid base64 encoding')
    })

    it('rejects wrong key length', () => {
      const validLength = btoa('a'.repeat(32))
      const shortKey = 'ed25519:' + validLength.slice(0, -4)
      expect(() => validatePublicKey(shortKey)).toThrow()
    })

    it('accepts valid ed25519 key', () => {
      const validKey = 'ed25519:' + btoa('a'.repeat(32))
      expect(() => validatePublicKey(validKey)).not.toThrow()
    })
  })

  describe('validateCapsuleId', () => {
    it('rejects empty string', () => {
      expect(() => validateCapsuleId('')).toThrow('Capsule ID must be a non-empty string')
    })

    it('rejects invalid UUID format', () => {
      expect(() => validateCapsuleId('not-a-uuid')).toThrow('Invalid capsule ID format')
    })

    it('accepts valid UUID', () => {
      expect(() => validateCapsuleId('123e4567-e89b-12d3-a456-426614174000')).not.toThrow()
    })
  })

  describe('validateFileSize', () => {
    it('rejects files over default limit', () => {
      expect(() => validateFileSize(101 * 1024 * 1024)).toThrow('File size exceeds 100MB limit')
    })

    it('accepts files under limit', () => {
      expect(() => validateFileSize(50 * 1024 * 1024)).not.toThrow()
    })

    it('respects custom limit', () => {
      expect(() => validateFileSize(10 * 1024 * 1024, 5)).toThrow('File size exceeds 5MB limit')
    })
  })
})
