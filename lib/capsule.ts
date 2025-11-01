import { generateIdentity, aesGcmEncrypt, aesGcmDecrypt, wrapCmkForRecipient, unwrapCmk, signMetadata, verifyMetadata, toBase64, fromBase64 } from './crypto'
import { buildLocationHash, evaluate, type UnlockPolicy, type DeviceContext } from './policy'
import { PinataClient } from './pinata'
import { TrustCircleDB, type CapsuleRecord } from './supabase'

export interface CapsuleMetadata {
  version: string
  capsule_id: string
  creator_pubkey: string
  approver_pubkey: string
  payload_cid: string
  created_at: string
  unlock_policy: UnlockPolicy
  encrypted_cmk: {
    scheme: string
    ciphertext: string
    ephemeral_pub: string
    nonce: string
  }
  metadata_sig: {
    alg: string
    signature: string
  }
  hints?: {
    title?: string
    notes?: string
  }
}

export interface CreateCapsuleParams {
  files: Uint8Array
  approverPubkey: { ed25519: Uint8Array; x25519: Uint8Array }
  creatorKeys: Awaited<ReturnType<typeof generateIdentity>>
  policy: UnlockPolicy
  title?: string
  notes?: string
}

export interface UnlockCapsuleParams {
  capsuleId: string
  approverKeys: Awaited<ReturnType<typeof generateIdentity>>
  context: DeviceContext
}

export class CapsuleManager {
  constructor(
    private pinata: PinataClient,
    private db: TrustCircleDB
  ) {}

  async createCapsule(params: CreateCapsuleParams): Promise<string> {
    const cmk = crypto.getRandomValues(new Uint8Array(32))
    const cipherArchive = await aesGcmEncrypt(cmk, params.files)
    const payloadCid = await this.pinata.uploadBytes(cipherArchive)

    const wrap = await wrapCmkForRecipient(cmk, params.approverPubkey.x25519)
    
    const metadata: Omit<CapsuleMetadata, 'metadata_sig' | 'capsule_id'> = {
      version: '1.0',
      creator_pubkey: `ed25519:${toBase64(params.creatorKeys.ed25519.publicKey)}`,
      approver_pubkey: `ed25519:${toBase64(params.approverPubkey.ed25519)}`,
      payload_cid: payloadCid,
      created_at: new Date().toISOString(),
      unlock_policy: params.policy,
      encrypted_cmk: {
        scheme: 'x25519+aes256gcm',
        ciphertext: toBase64(wrap.ciphertext),
        ephemeral_pub: `x25519:${toBase64(wrap.ephemeralPub)}`,
        nonce: toBase64(wrap.nonce)
      },
      hints: { title: params.title, notes: params.notes }
    }

    const signature = signMetadata(metadata, params.creatorKeys.ed25519.privateKey)
    const fullMetadata: Omit<CapsuleMetadata, 'capsule_id'> = {
      ...metadata,
      metadata_sig: { alg: 'ed25519', signature: toBase64(signature) }
    }

    const record: CapsuleRecord = {
      creator_pubkey: metadata.creator_pubkey,
      approver_pubkey: metadata.approver_pubkey,
      title: params.title,
      notes: params.notes,
      payload_cid: payloadCid,
      metadata: fullMetadata
    }

    return await this.db.saveCapsule(record)
  }

  async unlockCapsule(params: UnlockCapsuleParams): Promise<Uint8Array> {
    const capsule = await this.db.getCapsule(params.capsuleId)
    const metadata = capsule.metadata as CapsuleMetadata

    const creatorPubkey = fromBase64(metadata.creator_pubkey.split(':')[1])
    const signature = fromBase64(metadata.metadata_sig.signature)
    const { metadata_sig, capsule_id, ...metadataToVerify } = metadata

    if (!verifyMetadata(metadataToVerify, signature, creatorPubkey)) {
      throw new Error('This capsule details are invalid. It may have been altered.')
    }

    if (!await evaluate(metadata.unlock_policy, params.context)) {
      throw new Error('Access denied. Policy conditions not met.')
    }

    const cipherArchive = await this.pinata.getBytes(metadata.payload_cid)
    
    const ephemeralPub = fromBase64(metadata.encrypted_cmk.ephemeral_pub.split(':')[1])
    const ciphertext = fromBase64(metadata.encrypted_cmk.ciphertext)
    const nonce = fromBase64(metadata.encrypted_cmk.nonce)

    const cmk = await unwrapCmk(ciphertext, params.approverKeys.x25519.privateKey, ephemeralPub, nonce)
    const archive = await aesGcmDecrypt(cmk, cipherArchive)

    await this.db.updateStatus(params.capsuleId, 'unlocked')

    return archive
  }
}
