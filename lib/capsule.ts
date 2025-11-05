import {
  generateIdentity,
  aesGcmDecrypt,
  wrapCmkForRecipient,
  unwrapCmk,
  signMetadata,
  verifyMetadata,
  toBase64,
  fromBase64,
} from "./crypto";
import {
  evaluate,
  type UnlockPolicy,
  type DeviceContext,
  PolicyError,
} from "./policy";
import { PinataClient } from "./pinata";
import { TrustCircleDB, type CapsuleRecord } from "./supabase";
import { decompress } from "./compression";
import { checkStorageSpace, prepareAndEncryptFile, uploadEncryptedFile } from "./storage-common";

export interface CapsuleMetadata {
  version: string;
  capsule_id: string;
  creator_pubkey: string;
  approver_pubkey: string;
  payload_cid: string;
  created_at: string;
  unlock_policy: UnlockPolicy;
  encrypted_cmk: {
    scheme: string;
    ciphertext: string;
    ephemeral_pub: string;
    nonce: string;
  };
  metadata_sig: {
    alg: string;
    signature: string;
  };
  hints?: {
    title?: string;
    notes?: string;
    location?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
  };
}

export interface CreateCapsuleParams {
  files: Uint8Array;
  approverPubkey: { ed25519: Uint8Array; x25519: Uint8Array };
  creatorKeys: Awaited<ReturnType<typeof generateIdentity>>;
  policy: UnlockPolicy;
  title?: string;
  notes?: string;
  expiresAt?: string;
}

export interface UnlockCapsuleParams {
  capsuleId: string;
  approverKeys: Awaited<ReturnType<typeof generateIdentity>>;
  context: DeviceContext;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function checkLocationCondition(
  policy: any,
  currentLocation: { latitude: number; longitude: number },
): void {
  if (!policy.location) return;

  const { latitude, longitude, radius } = policy.location;

  if (latitude < -90 || latitude > 90) {
    throw new Error("Invalid latitude");
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error("Invalid longitude");
  }
  if (radius < 0) {
    throw new Error("Invalid radius");
  }

  const distance = haversineDistance(
    latitude,
    longitude,
    currentLocation.latitude,
    currentLocation.longitude,
  );

  if (distance > radius) {
    throw new Error("Location requirement not met");
  }
}

export class CapsuleManager {
  constructor(
    private readonly pinata: PinataClient,
    private readonly db: TrustCircleDB,
  ) {}

  async createCapsule(params: CreateCapsuleParams): Promise<string> {
    try {
      await checkStorageSpace(this.pinata, params.files.length);

      const cmk = crypto.getRandomValues(new Uint8Array(32));
      const cipherArchive = await prepareAndEncryptFile(params.files, cmk);
      const timestamp = Date.now();
      const filename = params.title
        ? `${params.title}_${timestamp}.encrypted`
        : `capsule_${timestamp}.encrypted`;
      const payloadCid = await uploadEncryptedFile(this.pinata, cipherArchive, filename);

      const wrap = await wrapCmkForRecipient(cmk, params.approverPubkey.x25519);

      const metadata: Omit<CapsuleMetadata, "metadata_sig" | "capsule_id"> = {
        version: "1.0",
        creator_pubkey: `ed25519:${toBase64(params.creatorKeys.ed25519.publicKey)}`,
        approver_pubkey: `ed25519:${toBase64(params.approverPubkey.ed25519)}`,
        payload_cid: payloadCid,
        created_at: new Date().toISOString(),
        unlock_policy: params.policy,
        encrypted_cmk: {
          scheme: "x25519+aes256gcm",
          ciphertext: toBase64(wrap.ciphertext),
          ephemeral_pub: `x25519:${toBase64(wrap.ephemeralPub)}`,
          nonce: toBase64(wrap.nonce),
        },
        hints: { title: params.title, notes: params.notes },
      };

      const signature = signMetadata(
        metadata,
        params.creatorKeys.ed25519.privateKey,
      );
      const fullMetadata: Omit<CapsuleMetadata, "capsule_id"> = {
        ...metadata,
        metadata_sig: { alg: "ed25519", signature: toBase64(signature) },
      };

      const record: CapsuleRecord = {
        creator_pubkey: metadata.creator_pubkey,
        approver_pubkey: metadata.approver_pubkey,
        title: params.title,
        notes: params.notes,
        payload_cid: payloadCid,
        metadata: fullMetadata,
        expires_at: params.expiresAt,
      };

      return await this.db.saveCapsule(record, metadata.creator_pubkey);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Capsule creation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async unlockCapsule(
    params: UnlockCapsuleParams,
  ): Promise<{ data: Uint8Array; filename: string }> {
    try {
      const capsule = await this.db.getCapsule(params.capsuleId);
      const metadata = capsule.metadata as CapsuleMetadata;

      if (metadata.version !== "1.0") {
        throw new Error("Unsupported capsule version");
      }

      const creatorPubkey = fromBase64(metadata.creator_pubkey.split(":")[1]);
      const signature = fromBase64(metadata.metadata_sig.signature);
      const { metadata_sig, capsule_id, ...metadataToVerify } = metadata;

      if (!verifyMetadata(metadataToVerify, signature, creatorPubkey)) {
        throw new Error(
          "This capsule details are invalid. It may have been altered.",
        );
      }

      try {
        await evaluate(metadata.unlock_policy, params.context);
      } catch (error) {
        if (error instanceof PolicyError) {
          throw error;
        }
        throw new Error("Access denied. Policy conditions not met.");
      }

      const cipherArchive = await this.pinata.getBytes(metadata.payload_cid);

      const ephemeralPub = fromBase64(
        metadata.encrypted_cmk.ephemeral_pub.split(":")[1],
      );
      const ciphertext = fromBase64(metadata.encrypted_cmk.ciphertext);
      const nonce = fromBase64(metadata.encrypted_cmk.nonce);

      const cmk = await unwrapCmk(
        ciphertext,
        params.approverKeys.x25519.privateKey,
        ephemeralPub,
        nonce,
      );
      const compressed = await aesGcmDecrypt(cmk, cipherArchive);
      const archive = decompress(compressed);

      const approverPubkey = `ed25519:${toBase64(params.approverKeys.ed25519.publicKey)}`;
      await this.db.updateStatus(params.capsuleId, "unlocked", approverPubkey);

      const timestamp = new Date(metadata.created_at).getTime();
      const filename = metadata.hints?.title
        ? `${metadata.hints.title}_${timestamp}`
        : `capsule_${timestamp}`;

      return { data: archive, filename };
    } catch (error) {
      if (error instanceof PolicyError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Capsule unlock failed: ${error.message}`);
      }
      throw error;
    }
  }

}
