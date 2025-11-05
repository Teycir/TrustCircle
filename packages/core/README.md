# @trustcircle/core

Core cryptographic and utility functions for TrustCircle applications.

## Features

- **Cryptography**: AES-GCM encryption, Ed25519/X25519 key generation, signing and verification
- **Compression**: gzip compression and decompression
- **Validation**: Input validation for keys, IDs, and file sizes
- **Storage**: IndexedDB-based key storage management
- **Geolocation**: Browser geolocation utilities

## Installation

```bash
npm install @trustcircle/core
```

## Usage

```typescript
import { generateIdentity, aesGcmEncrypt, compress } from '@trustcircle/core'

const identity = await generateIdentity()
const encrypted = await aesGcmEncrypt(key, data)
const compressed = compress(data)
```

## Dependencies

- @noble/curves - Cryptographic curves
- fflate - Fast compression
