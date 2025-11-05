# TrustCircle

🔐 Privacy-first secure data sharing with time and location-based unlocking. Built with Next.js, all encryption happens client-side.

**Version:** 2.4.0

---

## Overview

TrustCircle lets you lock files so that exactly one designated approver can unlock them under specific conditions like date/time and location. Encryption and policy checks happen in the browser before any upload.

### Core Features

- ✅ **Client-Side Encryption**: AES-256-GCM encryption in browser
- ✅ **Time-Based Unlocking**: Set unlock dates for future access
- ✅ **Location-Based Unlocking**: Require specific GPS location with 1km radius
- ✅ **Dead Hand Protocol**: Automatic unlock if owner becomes inactive
- ✅ **Professional Vaults**: Store documents with cryptographic proof and public verification
- ✅ **Dashboard Management**: Track created and received capsules
- ✅ **Search & Filter**: Find capsules by title, notes, or status
- ✅ **Analytics**: View usage statistics with optimized caching
- ✅ **QR Code Sharing**: Share public keys via QR code
- ✅ **Auto-Expiration**: Optional capsule expiration dates
- ✅ **Offline Support**: Works without internet connectivity
- ✅ **Mobile Responsive**: Works on all devices

---

## Professional Vaults

Secure storage for professional documents with cryptographic proof of existence and public verification capabilities.

### What are Vaults?

Vaults are encrypted document storage containers designed for professional use cases like certifications, contracts, diplomas, and licenses. Unlike time capsules that unlock at specific times, vaults are always accessible by the owner and provide verifiable proof of document existence.

### Key Differences from Capsules

**Capsules:**
- Time locked until specific date
- Shared with designated approver
- Location based unlocking optional
- Dead hand protocol support
- Temporary secure sharing

**Vaults:**
- Always accessible by owner
- No time or location restrictions
- Public verification without content disclosure
- Professional document metadata
- Permanent secure storage

### Vault Features

1. **Instant Access**: No waiting period, access your documents anytime
2. **Document Metadata**: Store document type, issuer, and reference ID
3. **Public Verification**: Generate shareable links that prove document existence without revealing content
4. **Cryptographic Proof**: IPFS CID and timestamp provide immutable proof
5. **Separate Storage**: Dedicated IPFS storage separate from capsules

### How Vaults Work

1. **Upload**: Select document and add metadata like type, issuer, document ID
2. **Encrypt**: File encrypted client side with AES 256 GCM
3. **Store**: Encrypted file uploaded to dedicated Pinata IPFS vault storage
4. **Access**: Retrieve and decrypt anytime from your dashboard
5. **Verify**: Generate public verification links showing metadata and proof without exposing content

### Understanding CID vs Vault ID

**Vault ID (UUID):**
- Database identifier for the vault record
- Used to query vault metadata from Supabase
- Mutable - can be deleted from database
- Links to application features like dashboard, access control
- Example: `83353b20-5ca7-43ac-b0e6-5f7433526216`

**CID (Content Identifier):**
- IPFS hash of the encrypted file content
- Immutable - content cannot be changed
- Permanent - exists on IPFS forever
- Cryptographic proof of file integrity
- Example: `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`

**Why Both?**
- **Vault ID**: Application layer for access control, metadata, and user management
- **CID**: Storage layer for immutable content and cryptographic verification
- **Separation**: Database can be rebuilt from CIDs, but CIDs provide eternal proof independent of any database

**Verification CID:**
Each vault also has a separate verification CID pointing to a JSON file on IPFS containing:
- Document metadata (type, issuer, timestamp)
- Vault CID reference
- Creator public key
- File information

This verification file is eternal and can prove document existence even if the TrustCircle website disappears.

### Verification Links

Verification links allow third parties to confirm:
- Document exists and was uploaded at specific timestamp
- Document type and issuer information
- File hash (CID) and size for integrity verification
- Owner public key for authenticity
- Immutable proof via IPFS that survives website changes

Verification links do NOT reveal:
- Encrypted document content
- Decryption keys
- File preview or download

### Use Cases

- Professional certifications and credentials
- Legal contracts and agreements
- Academic diplomas and transcripts
- Professional licenses
- Important business documents
- Proof of document existence for legal purposes

---

## Dead Hand Protocol

Automatic capsule unlocking if the owner becomes inactive, ensuring important information reaches designated recipients.

### Workflow

1. **Active State**: Dead hand enabled with trigger date
2. **Warning Phase**: 2 days before trigger, owner receives warning email
3. **Grace Period**: 2 days after trigger date for final reset
4. **Auto-Unlock**: Capsule unlocks and recipients are notified

### Configuration

- Trigger date must be between unlock date and expiry date
- Owner email required for warnings
- At least one recipient email required
- Owner can reset date or disable anytime before trigger

### Use Cases

- Estate planning and digital legacy
- Emergency access to critical information
- Business continuity planning
- Backup access for important documents

---

## Technology Stack

- **Framework**: Next.js 14 with App Router and TypeScript
- **Deployment**: Vercel
- **UI**: Tailwind CSS with gradient design system
- **Crypto**: noble-curves for Ed25519/X25519, Web Crypto API for AES-GCM
- **Storage**: Dual Pinata IPFS (separate for Capsules and Vaults), Supabase for metadata
- **Caching**: In-memory with 5-minute TTL and smart invalidation
- **Geolocation**: Browser Geolocation API
- **Local Storage**: IndexedDB for keys and preferences
- **Compression**: fflate for file compression

---

## Quick Start

### For Users

1. Visit the deployed TrustCircle app
2. Go to Identity page and generate your keys (no API keys needed)
3. Share your public key with others
4. Create capsules or unlock capsules sent to you

### For Developers

```bash
# Clone and install
git clone https://github.com/yourusername/TrustCircle.git
cd TrustCircle
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with:
# - Supabase credentials
# - Pinata credentials for Capsules (PINATA_JWT, PINATA_API_KEY, PINATA_API_SECRET)
# - Pinata credentials for Vaults (PINATA_VAULT_JWT, PINATA_VAULT_API_KEY, PINATA_VAULT_API_SECRET)

# Setup database configuration
# Run scripts/setup-config.sql in your Supabase SQL Editor
# Then run scripts/setup-config.local.sql with your actual credentials

# Run development server
npm run dev

# Run tests
npm test
```

### Configuration

API credentials are stored in Supabase `app_config` table:

1. Run `supabase/sql/app-config-schema.sql` to create the table
2. Run `scripts/setup-config.sql` to create schema with placeholders
3. Run `scripts/setup-config.local.sql` to populate with actual credentials (local only)
4. Environment variables in `.env.local` take priority over database config

Dual IPFS storage:
- Capsules use primary Pinata account with PINATA_JWT credentials
- Vaults use secondary Pinata account with PINATA_VAULT_JWT credentials
- Separate storage ensures isolation and independent quota management

See [SETUP.md](SETUP.md) for detailed configuration instructions.

---

## Architecture

### Key Generation

User cryptographic keys are generated entirely client-side:
- Ed25519 key pair for signing metadata
- X25519 key pair for key agreement
- Keys stored locally in IndexedDB
- No server communication required
- Export/import for multi-device usage

### Data Flow

**Capsules:**
```
Create: Browser Crypto -> Pinata IPFS -> Supabase metadata
Unlock: Supabase metadata -> Pinata IPFS -> Browser Crypto decrypt
```

**Vaults:**
```
Create: Browser Crypto -> Pinata Vault IPFS -> Supabase vaults table
Access: Supabase vaults table -> Pinata Vault IPFS -> Browser Crypto decrypt
Verify: Supabase vaults table -> Public metadata only no decryption
```

### Security

- **Data Encryption**: AES-256-GCM with random CMK
- **CMK Wrapping**: ECIES-style using X25519 ECDH
- **Metadata Integrity**: Ed25519 signatures
- **Policy Privacy**: Location details reduced to salted hash
- **No RPC**: Direct Supabase queries for simplicity

### Performance Optimizations

- **Analytics Cache**: 5-minute TTL, instant repeat loads
- **List Cache**: Dashboard loads cached for 5 minutes
- **Capsule Cache**: Individual capsule details cached
- **Smart Invalidation**: Cache cleared on mutations
- **Parallel Queries**: Promise.all for analytics
- **Database Aggregation**: Count queries instead of full data fetch

---

## Database Schema

**Capsules Table:**
```sql
create table capsules (
  id uuid primary key default gen_random_uuid(),
  creator_pubkey text not null,
  approver_pubkey text not null,
  title text,
  notes text,
  payload_cid text not null,
  metadata jsonb not null,
  status text default 'locked',
  created_at timestamp default now(),
  unlocked_at timestamp,
  expires_at timestamp,
  dead_hand_trigger_date timestamp,
  dead_hand_status text,
  warning_sent_at timestamp
);
```

**Vaults Table:**
```sql
create table vaults (
  id uuid primary key default gen_random_uuid(),
  creator_pubkey text not null,
  title text not null,
  notes text,
  document_type text not null,
  issuer text not null,
  document_id text,
  payload_cid text not null,
  metadata jsonb not null,
  file_name text,
  file_size bigint,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

Row Level Security policies ensure users can only access their own capsules and vaults. Public verification access is read only for vault metadata.

---

## Recent Updates (v2.5.0)

- 🔧 Removed admin panel UI
- 💾 Configuration stored in Supabase `app_config` table
- 🔒 Environment variables prioritized for security
- 📝 Added setup scripts for easy deployment
- 🚀 Simplified configuration management

See [CHANGELOG.md](CHANGELOG.md) for full version history.

---

## FAQ

### Vaults vs Capsules

**Q: What is the difference between a Vault and a Capsule?**

A: Capsules are time locked containers for sharing files with specific unlock conditions like date, time, and location. Vaults are always accessible encrypted storage for professional documents with public verification capabilities. Use capsules for temporary secure sharing and vaults for permanent document storage.

**Q: When should I use a Vault instead of a Capsule?**

A: Use vaults for:
- Professional certifications and credentials
- Legal contracts requiring proof of existence
- Academic diplomas and transcripts
- Documents you need to access anytime
- Documents requiring public verification

Use capsules for:
- Time sensitive information sharing
- Location based access requirements
- Dead hand protocol scenarios
- Temporary secure file sharing

**Q: Can I share vault contents with others?**

A: Vault contents remain encrypted and accessible only to you. However, you can generate public verification links that prove the document exists and show metadata like document type, issuer, and timestamp without revealing the actual content.

**Q: How does vault verification work?**

A: Verification links display public metadata including document type, issuer, creation timestamp, file hash, and file size. This provides cryptographic proof the document exists without exposing encrypted content or decryption keys. Anyone with the link can verify but cannot access the document.

**Q: Are vaults and capsules stored separately?**

A: Yes, vaults use dedicated Pinata IPFS storage separate from capsules. This ensures isolation, independent quota management, and better organization. Each has separate storage limits and tracking.

### Storage

**Q: What are the storage limits?**

A: Each user has 250MB total storage limit split between:
- Capsules: Up to 250MB
- Vaults: Up to 250MB

Global limits:
- Total Capsules: 1GB across all users
- Total Vaults: 1GB across all users

**Q: How do I check my storage usage?**

A: Storage usage is displayed in the navigation bar on the home page showing:
- Your current usage for Capsules and Vaults
- Available global storage for both types
- Warning indicator when approaching limits

**Q: What happens when I reach the storage limit?**

A: When you reach 80% of your personal limit or global storage drops below 20%, you'll see a warning indicator. You won't be able to create new capsules or vaults until you delete existing ones or storage becomes available.

**Q: How is storage calculated?**

A: Storage is calculated based on the encrypted file size stored on IPFS. Compression is applied before encryption to minimize storage usage.

**Q: Can I increase my storage limit?**

A: Storage limits are currently fixed. Consider deleting old or expired capsules to free up space.

---

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## License

MIT

---

## Support

For issues and questions, please open an issue on GitHub.
