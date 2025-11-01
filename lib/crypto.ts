import { ed25519, x25519 } from '@noble/curves/ed25519'

export async function generateIdentity() {
  const ed25519Priv = ed25519.utils.randomPrivateKey()
  const ed25519Pub = ed25519.getPublicKey(ed25519Priv)
  
  const x25519Priv = crypto.getRandomValues(new Uint8Array(32))
  const x25519Pub = x25519.getPublicKey(x25519Priv)
  
  return {
    ed25519: { privateKey: ed25519Priv, publicKey: ed25519Pub },
    x25519: { privateKey: x25519Priv, publicKey: x25519Pub }
  }
}

export async function aesGcmEncrypt(key: Uint8Array, data: Uint8Array) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, data)
  
  const result = new Uint8Array(iv.length + ciphertext.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(ciphertext), iv.length)
  return result
}

export async function aesGcmDecrypt(key: Uint8Array, data: Uint8Array) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['decrypt'])
  const iv = data.slice(0, 12)
  const ciphertext = data.slice(12)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext)
  return new Uint8Array(plaintext)
}

export async function wrapCmkForRecipient(cmk: Uint8Array, recipientX25519Pub: Uint8Array) {
  const ephemeralPriv = crypto.getRandomValues(new Uint8Array(32))
  const ephemeralPub = x25519.getPublicKey(ephemeralPriv)
  const sharedSecret = x25519.getSharedSecret(ephemeralPriv, recipientX25519Pub)
  
  const wrappingKey = await crypto.subtle.importKey('raw', sharedSecret, 'AES-GCM', false, ['encrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrappingKey, cmk)
  
  return {
    ciphertext: new Uint8Array(ciphertext),
    ephemeralPub,
    nonce: iv
  }
}

export async function unwrapCmk(
  ciphertext: Uint8Array,
  recipientX25519Priv: Uint8Array,
  ephemeralPub: Uint8Array,
  nonce: Uint8Array
) {
  const sharedSecret = x25519.getSharedSecret(recipientX25519Priv, ephemeralPub)
  const wrappingKey = await crypto.subtle.importKey('raw', sharedSecret, 'AES-GCM', false, ['decrypt'])
  const cmk = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, wrappingKey, ciphertext)
  return new Uint8Array(cmk)
}

export function signMetadata(metadata: any, ed25519Priv: Uint8Array) {
  const message = new TextEncoder().encode(JSON.stringify(metadata))
  return ed25519.sign(message, ed25519Priv)
}

export function verifyMetadata(metadata: any, signature: Uint8Array, ed25519Pub: Uint8Array) {
  const message = new TextEncoder().encode(JSON.stringify(metadata))
  return ed25519.verify(signature, message, ed25519Pub)
}

export function toBase64(data: Uint8Array) {
  return Buffer.from(data).toString('base64')
}

export function fromBase64(data: string) {
  return new Uint8Array(Buffer.from(data, 'base64'))
}
