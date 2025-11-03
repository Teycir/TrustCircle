import { describe, it, expect } from 'vitest'
import {
  generateIdentity,
  aesGcmEncrypt,
  aesGcmDecrypt,
  wrapCmkForRecipient,
  unwrapCmk,
  signMetadata,
  verifyMetadata,
  toBase64,
  fromBase64
} from '../lib/crypto'

describe('Crypto Engine', () => {
  it('generates identity keypairs', async () => {
    const identity = await generateIdentity()
    expect(identity.ed25519.privateKey).toHaveLength(32)
    expect(identity.ed25519.publicKey).toHaveLength(32)
    expect(identity.x25519.privateKey).toHaveLength(32)
    expect(identity.x25519.publicKey).toHaveLength(32)
  })

  it('encrypts and decrypts with AES-GCM', async () => {
    const key = crypto.getRandomValues(new Uint8Array(32))
    const plaintext = new TextEncoder().encode('test data')

    const ciphertext = await aesGcmEncrypt(key, plaintext)
    const decrypted = await aesGcmDecrypt(key, ciphertext)

    expect(new TextDecoder().decode(decrypted)).toBe('test data')
  })

  it('wraps and unwraps CMK', async () => {
    const cmk = crypto.getRandomValues(new Uint8Array(32))
    const recipient = await generateIdentity()

    const wrapped = await wrapCmkForRecipient(cmk, recipient.x25519.publicKey)
    const unwrapped = await unwrapCmk(
      wrapped.ciphertext,
      recipient.x25519.privateKey,
      wrapped.ephemeralPub,
      wrapped.nonce
    )

    expect(unwrapped).toEqual(cmk)
  })

  it('signs and verifies metadata', async () => {
    const identity = await generateIdentity()
    const metadata = { test: 'data', timestamp: Date.now() }

    const signature = signMetadata(metadata, identity.ed25519.privateKey)
    const valid = verifyMetadata(metadata, signature, identity.ed25519.publicKey)

    expect(valid).toBe(true)
  })

  it('detects tampered metadata', async () => {
    const identity = await generateIdentity()
    const metadata = { test: 'data' }

    const signature = signMetadata(metadata, identity.ed25519.privateKey)
    const tamperedMetadata = { test: 'tampered' }
    const valid = verifyMetadata(tamperedMetadata, signature, identity.ed25519.publicKey)

    expect(valid).toBe(false)
  })

  it('converts to and from base64', () => {
    const data = crypto.getRandomValues(new Uint8Array(32))
    const encoded = toBase64(data)
    const decoded = fromBase64(encoded)

    expect(decoded).toEqual(data)
  })
})
