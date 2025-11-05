import { PinataClient } from "./pinata";
import { validateFileSize, aesGcmEncrypt, compress } from "@trustcircle/core";

export async function checkStorageSpace(
  pinata: PinataClient,
  fileSize: number
): Promise<void> {
  const usage = await pinata.getStorageUsage();
  const availableSpace = usage.limit - usage.used;
  const estimatedSize = fileSize * 1.2;

  if (estimatedSize > availableSpace) {
    const availableMB = (availableSpace / 1024 / 1024).toFixed(2);
    const requiredMB = (estimatedSize / 1024 / 1024).toFixed(2);
    throw new Error(
      `Not enough storage space. Available: ${availableMB} MB, Required: ${requiredMB} MB`
    );
  }
}

export async function prepareAndEncryptFile(
  files: Uint8Array,
  cmk: Uint8Array
): Promise<Uint8Array> {
  validateFileSize(files.length);
  const compressed = compress(files);
  return await aesGcmEncrypt(cmk, compressed);
}

export async function uploadEncryptedFile(
  pinata: PinataClient,
  cipherArchive: Uint8Array,
  filename: string
): Promise<string> {
  await pinata.purgeOldFiles(0.9);
  return await pinata.uploadBytes(cipherArchive, filename);
}
