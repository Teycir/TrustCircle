import { ed25519, x25519 } from "@noble/curves/ed25519.js";

const usedNonces = new Set<string>();
const MAX_NONCE_CACHE = 10000;

if (typeof crypto === 'undefined') {
  throw new TypeError('Web Crypto API is not available');
}

async function hkdf(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: string,
  length: number,
): Promise<Uint8Array> {
  if (!ikm || ikm.length === 0) throw new Error("IKM cannot be empty");
  if (!salt || salt.length === 0) throw new Error("Salt cannot be empty");
  if (length <= 0) throw new Error("Length must be positive");

  const key = await crypto.subtle.importKey(
    "raw",
    ikm as BufferSource,
    "HKDF",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: salt as BufferSource,
      info: new TextEncoder().encode(info),
    },
    key,
    length * 8,
  );
  return new Uint8Array(bits);
}

function generateUniqueNonce(): Uint8Array {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const nonceStr = toBase64(nonce);

  if (usedNonces.size >= MAX_NONCE_CACHE) {
    usedNonces.clear();
  }

  usedNonces.add(nonceStr);
  return nonce;
}

export async function generateIdentity(): Promise<{
  ed25519: { privateKey: Uint8Array; publicKey: Uint8Array };
  x25519: { privateKey: Uint8Array; publicKey: Uint8Array };
}> {
  try {
    const ed25519Keys = ed25519.keygen();
    const x25519Keys = x25519.keygen();

    return {
      ed25519: {
        privateKey: ed25519Keys.secretKey,
        publicKey: ed25519Keys.publicKey,
      },
      x25519: {
        privateKey: x25519Keys.secretKey,
        publicKey: x25519Keys.publicKey,
      },
    };
  } catch (error) {
    throw new Error(`Failed to generate identity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function aesGcmEncrypt(
  key: Uint8Array,
  data: Uint8Array,
): Promise<Uint8Array> {
  if (!key || key.length !== 32) throw new Error("Key must be 32 bytes");
  if (!data) throw new Error("Data cannot be null");

  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key as BufferSource,
      "AES-GCM",
      false,
      ["encrypt"],
    );
    const iv = generateUniqueNonce();
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      data as BufferSource,
    );

    const result = new Uint8Array(iv.length + ciphertext.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(ciphertext), iv.length);
    return result as Uint8Array;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function aesGcmDecrypt(
  key: Uint8Array,
  data: Uint8Array,
): Promise<Uint8Array> {
  if (!key || key.length !== 32) throw new Error("Key must be 32 bytes");
  if (!data || data.length < 12) throw new Error("Data too short");

  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key as BufferSource,
      "AES-GCM",
      false,
      ["decrypt"],
    );
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      ciphertext as BufferSource,
    );
    return new Uint8Array(plaintext);
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function wrapCmkForRecipient(
  cmk: Uint8Array,
  recipientX25519Pub: Uint8Array,
): Promise<{
  ciphertext: Uint8Array;
  ephemeralPub: Uint8Array;
  nonce: Uint8Array;
}> {
  if (!cmk || cmk.length !== 32) throw new Error("CMK must be 32 bytes");
  if (!recipientX25519Pub || recipientX25519Pub.length !== 32)
    throw new Error("Public key must be 32 bytes");

  try {
    const ephemeralPriv = crypto.getRandomValues(new Uint8Array(32));
    const ephemeralPub = x25519.getPublicKey(ephemeralPriv) as Uint8Array;
    const sharedSecret = x25519.getSharedSecret(
      ephemeralPriv,
      recipientX25519Pub,
    ) as Uint8Array;

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const wrappingKey = await hkdf(sharedSecret, salt, "TCL-CMK-WRAP", 32);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      wrappingKey,
      "AES-GCM",
      false,
      ["encrypt"],
    );
    const iv = generateUniqueNonce();
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      cmk as BufferSource,
    );

    const result = new Uint8Array(salt.length + ciphertext.byteLength);
    result.set(salt, 0);
    result.set(new Uint8Array(ciphertext), salt.length);

    return {
      ciphertext: result as Uint8Array,
      ephemeralPub,
      nonce: iv,
    };
  } catch (error) {
    throw new Error(`CMK wrapping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function unwrapCmk(
  ciphertext: Uint8Array,
  recipientX25519Priv: Uint8Array,
  ephemeralPub: Uint8Array,
  nonce: Uint8Array,
): Promise<Uint8Array> {
  if (!ciphertext?.length || ciphertext.length < 16)
    throw new Error("Invalid ciphertext");
  if (recipientX25519Priv?.length !== 32)
    throw new Error("Private key must be 32 bytes");
  if (ephemeralPub?.length !== 32)
    throw new Error("Ephemeral public key must be 32 bytes");
  if (!nonce || nonce.length !== 12) throw new Error("Nonce must be 12 bytes");

  try {
    const sharedSecret = x25519.getSharedSecret(
      recipientX25519Priv,
      ephemeralPub,
    );

    const salt = ciphertext.slice(0, 16);
    const actualCiphertext = ciphertext.slice(16);
    const wrappingKey = await hkdf(
      sharedSecret,
      salt,
      "TCL-CMK-WRAP",
      32,
    );

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      wrappingKey,
      "AES-GCM",
      false,
      ["decrypt"],
    );
    const cmk = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce },
      cryptoKey,
      actualCiphertext as BufferSource,
    );
    return new Uint8Array(cmk);
  } catch (error) {
    throw new Error(`CMK unwrapping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function canonicalJson(obj: any): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalJson).join(",")}]`;
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((k) => `"${k}":${canonicalJson(obj[k])}`);
  return `{${pairs.join(",")}}`;
}

export function signMetadata(
  metadata: any,
  ed25519Priv: Uint8Array,
): Uint8Array {
  try {
    const message = new TextEncoder().encode(canonicalJson(metadata));
    return ed25519.sign(message, ed25519Priv);
  } catch (error) {
    throw new Error(`Signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function verifyMetadata(
  metadata: any,
  signature: Uint8Array,
  ed25519Pub: Uint8Array,
): boolean {
  try {
    const message = new TextEncoder().encode(canonicalJson(metadata));
    return ed25519.verify(signature, message, ed25519Pub);
  } catch (error) {
    throw new Error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function toBase64(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

export function fromBase64(data: string): Uint8Array {
  return Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
}

export function ed25519PublicKeyToX25519(ed25519Pub: Uint8Array): Uint8Array {
  try {
    return ed25519.getPublicKey(ed25519Pub.slice(0, 32));
  } catch (error) {
    throw new Error(`Key conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
