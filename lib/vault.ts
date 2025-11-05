import { generateIdentity, aesGcmDecrypt, toBase64, fromBase64 } from "./crypto";
import { PinataClient } from "./pinata";
import { TrustCircleDB } from "./supabase";
import { decompress } from "./compression";
import { checkStorageSpace, prepareAndEncryptFile, uploadEncryptedFile } from "./storage-common";

export interface CreateVaultParams {
  files: Uint8Array;
  creatorKeys: Awaited<ReturnType<typeof generateIdentity>>;
  title: string;
  notes?: string;
  documentType: string;
  issuer: string;
  documentId?: string;
  fileName: string;
  fileSize: number;
}

export interface UnlockVaultParams {
  vaultId: string;
  creatorKeys: Awaited<ReturnType<typeof generateIdentity>>;
}

export class VaultManager {
  constructor(
    private readonly pinata: PinataClient,
    private readonly db: TrustCircleDB
  ) {}

  async createVault(params: CreateVaultParams): Promise<string> {
    try {
      await checkStorageSpace(this.pinata, params.files.length);

      const cmk = crypto.getRandomValues(new Uint8Array(32));
      const cipherArchive = await prepareAndEncryptFile(params.files, cmk);
      const timestamp = Date.now();
      const filename = `vault_${params.title}_${timestamp}.encrypted`;
      const payloadCid = await uploadEncryptedFile(this.pinata, cipherArchive, filename);

      const metadata = {
        version: '1.0',
        creator_pubkey: `ed25519:${toBase64(params.creatorKeys.ed25519.publicKey)}`,
        payload_cid: payloadCid,
        created_at: new Date().toISOString(),
        encrypted_cmk: toBase64(cmk),
        file_name: params.fileName,
        file_size: params.fileSize,
      };

      const verificationData = {
        version: '1.0',
        vault_type: 'TrustCircle Professional Vault',
        title: params.title,
        document_type: params.documentType,
        issuer: params.issuer,
        document_id: params.documentId,
        file_name: params.fileName,
        file_size: params.fileSize,
        creator_pubkey: metadata.creator_pubkey,
        payload_cid: payloadCid,
        created_at: metadata.created_at,
        timestamp_unix: timestamp,
        notes: params.notes,
        ipfs_gateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud',
      };

      const verificationJson = JSON.stringify(verificationData, null, 2);
      const verificationBytes = new TextEncoder().encode(verificationJson);
      const verificationCid = await this.pinata.uploadBytes(
        verificationBytes,
        `verification_${params.title}_${timestamp}.json`
      );

      const vaultId = await this.db.saveVault({
        creator_pubkey: metadata.creator_pubkey,
        title: params.title,
        notes: params.notes,
        document_type: params.documentType,
        issuer: params.issuer,
        document_id: params.documentId,
        payload_cid: payloadCid,
        metadata: { ...metadata, verification_cid: verificationCid },
        file_name: params.fileName,
        file_size: params.fileSize,
      }, metadata.creator_pubkey);

      return vaultId;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Vault creation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async unlockVault(params: UnlockVaultParams): Promise<{ data: Uint8Array; filename: string }> {
    try {
      const vault = await this.db.getVault(params.vaultId);
      const cipherArchive = await this.pinata.getBytes(vault.payload_cid);
      const cmk = fromBase64(vault.metadata.encrypted_cmk);
      const compressed = await aesGcmDecrypt(cmk, cipherArchive);
      const archive = decompress(compressed);

      const filename = vault.file_name || vault.title;
      return { data: archive, filename };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Vault unlock failed: ${error.message}`);
      }
      throw error;
    }
  }
}
