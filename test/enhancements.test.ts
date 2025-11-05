import { describe, it, expect } from 'vitest'
import { generateIdentity, wrapCmkForRecipient, unwrapCmk } from '@trustcircle/core'
import { PolicyError } from '../lib/policy'

describe('Enhancements', () => {
  it('HKDF key derivation in CMK wrapping', async () => {
    const cmk = crypto.getRandomValues(new Uint8Array(32))
    const recipient = await generateIdentity()

    const wrapped = await wrapCmkForRecipient(cmk, recipient.x25519.publicKey)
    expect(wrapped.ciphertext.length).toBeGreaterThan(32)

    const unwrapped = await unwrapCmk(
      wrapped.ciphertext,
      recipient.x25519.privateKey,
      wrapped.ephemeralPub,
      wrapped.nonce
    )

    expect(unwrapped).toEqual(cmk)
  })

  it('PolicyError has specific types', () => {
    const dateError = new PolicyError('Date error', 'DATE')
    const locationError = new PolicyError('Location error', 'LOCATION')

    expect(dateError.type).toBe('DATE')
    expect(dateError.message).toBe('Date error')
    expect(locationError.type).toBe('LOCATION')
  })

  it('unique nonces are generated', async () => {
    const key = crypto.getRandomValues(new Uint8Array(32))
    const data = new TextEncoder().encode('test')

    const { aesGcmEncrypt } = await import('../lib/crypto')

    const encrypted1 = await aesGcmEncrypt(key, data)
    const encrypted2 = await aesGcmEncrypt(key, data)

    const nonce1 = encrypted1.slice(0, 12)
    const nonce2 = encrypted2.slice(0, 12)

    expect(nonce1).not.toEqual(nonce2)
  })
})
