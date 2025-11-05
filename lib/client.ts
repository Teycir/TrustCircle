import { CapsuleManager } from "./capsule";
import { VaultManager } from "./vault";
import { PinataClient } from "./pinata";
import { TrustCircleDB } from "./supabase";
import { getConfig } from "./config";

let clientInstance: CapsuleManager | null = null;
let vaultInstance: VaultManager | null = null;
let lastConfig = "";

export function getClient(): CapsuleManager {
  const apiKey = getConfig("pinataJWT");
  const supabaseUrl = getConfig("supabaseUrl");
  const supabaseKey = getConfig("supabaseAnonKey");

  if (!apiKey) throw new Error("NEXT_PUBLIC_PINATA_JWT not configured");
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
  if (!supabaseKey)
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY not configured");

  const currentConfig = `${apiKey}|${supabaseUrl}|${supabaseKey}`;
  if (!clientInstance || lastConfig !== currentConfig) {
    const pinata = new PinataClient(
      apiKey,
      process.env.NEXT_PUBLIC_PINATA_GATEWAY,
    );
    const db = new TrustCircleDB(supabaseUrl, supabaseKey, pinata);
    clientInstance = new CapsuleManager(pinata, db);
    lastConfig = currentConfig;
  }

  return clientInstance;
}

export function getVaultClient(): VaultManager {
  const vaultApiKey = getConfig("vaultPinataJWT");
  const supabaseUrl = getConfig("supabaseUrl");
  const supabaseKey = getConfig("supabaseAnonKey");

  if (!vaultApiKey) throw new Error("NEXT_PUBLIC_VAULT_PINATA_JWT not configured");
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
  if (!supabaseKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY not configured");

  const currentConfig = `${vaultApiKey}|${supabaseUrl}|${supabaseKey}`;
  if (!vaultInstance || lastConfig !== currentConfig) {
    const pinata = new PinataClient(vaultApiKey, process.env.NEXT_PUBLIC_PINATA_GATEWAY);
    const db = new TrustCircleDB(supabaseUrl, supabaseKey, pinata);
    vaultInstance = new VaultManager(pinata, db);
    lastConfig = currentConfig;
  }

  return vaultInstance;
}

export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

export function downloadFile(data: Uint8Array, filename: string) {
  if (!data?.length) throw new Error("Data cannot be empty");
  if (!filename?.trim()) throw new Error("Filename cannot be empty");

  const blob = new Blob([data as BlobPart]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function getStorageUsage(): Promise<{ used: number; limit: number; percentage: number }> {
  const apiKey = getConfig('pinataJWT')
  if (!apiKey) throw new Error('NEXT_PUBLIC_PINATA_JWT not configured')

  const pinata = new PinataClient(apiKey)
  return await pinata.getStorageUsage()
}

export async function getVaultStorageUsage(): Promise<{ used: number; limit: number; percentage: number }> {
  const apiKey = getConfig('vaultPinataJWT')
  if (!apiKey) throw new Error('NEXT_PUBLIC_PINATA_VAULT_JWT not configured')

  const pinata = new PinataClient(apiKey)
  return await pinata.getStorageUsage()
}

