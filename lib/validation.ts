export function validatePublicKey(key: string): void {
  if (!key || typeof key !== "string") {
    throw new Error("Public key must be a non-empty string");
  }

  const parts = key.split(":");
  if (parts.length !== 2 || parts[0] !== "ed25519" || !parts[1]) {
    throw new Error('Invalid key format. Expected "ed25519:..."');
  }

  try {
    const decoded = atob(parts[1]);
    if (decoded.length !== 32) {
      throw new Error("Invalid key length");
    }
  } catch (error) {
    throw new Error("Invalid base64 encoding");
  }
}

export function validateCapsuleId(id: string): void {
  if (!id || typeof id !== "string") {
    throw new Error("Capsule ID must be a non-empty string");
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error("Invalid capsule ID format");
  }
}

export function validateFileSize(size: number, maxMB = 100): void {
  if (size > maxMB * 1024 * 1024) {
    throw new Error(`File size exceeds ${maxMB}MB limit`);
  }
}

export function sanitizeMetadata(metadata: any): any {
  const allowed = [
    "title",
    "notes",
    "version",
    "created_at",
    "unlock_policy",
    "encrypted_cmk",
    "metadata_sig",
    "creator_pubkey",
    "approver_pubkey",
    "payload_cid",
  ];
  const sanitized: any = {};

  for (const key of allowed) {
    if (key in metadata) {
      sanitized[key] = metadata[key];
    }
  }

  return sanitized;
}
