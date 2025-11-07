# TrustCircle

<div align="center">

![MIT License](https://img.shields.io/badge/License-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![IPFS](https://img.shields.io/badge/IPFS-Storage-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

</div>

<div align="center">

## 🔐 Send Files to the Future. Prove Documents Forever.

**TrustCircle** is a privacy-first platform for secure file sharing with time-locks, location restrictions, and cryptographic proof. Create encrypted capsules that unlock only when your conditions are met, or store documents with eternal verification links—all with client-side encryption that keeps your data truly private.

**🎯 Perfect for:** Estate planning • Legal contracts • Scheduled releases • Emergency access • Professional credentials • Dead hand protocols

</div>

<p align="center">
  <img src="Assets/Images/mainpagetrustcircle.png" alt="TrustCircle Main Page" width="800" />
</p>

### ✨ Why TrustCircle?

**Capsules - Conditional Sharing:**
- **⏰ Time-Locked Delivery** - Send files that unlock at specific dates for scheduled releases or future delivery.
- **📍 Location-Based Access** - Require recipients to be at GPS coordinates to unlock sensitive documents.
- **💀 Dead Hand Protocol** - Automatically unlock capsules if you become inactive—your digital legacy, protected.

**Vaults - Permanent Storage:**
- **💼 Professional Documents** - Store certifications, contracts, diplomas with instant access anytime.
- **✅ Public Verification** - Generate shareable proof links that verify documents without revealing content.
- **🌐 Eternal Proof** - IPFS-based verification that survives even if TrustCircle disappears.

**Universal Security:**
- **🔒 Zero-Knowledge Encryption** - All files encrypted in your browser before upload. We never see your data.
- **🔑 Client-Side Keys** - Your encryption keys never leave your device. True end-to-end encryption.

---

## Overview

TrustCircle provides two secure file management solutions:

**Capsules** - Time-locked file sharing with designated approvers. Create encrypted files that unlock only when specific conditions are met (date, time, location). Perfect for scheduled secure delivery, dead hand protocols, and conditional access.

**Vaults** - Professional document storage with cryptographic proof. Store important documents with instant access and generate public verification links that prove document existence without revealing content. Ideal for certifications, contracts, and credentials.

### Capsule Features

<p align="center">
  <img src="Assets/Images/createcapsule.png" alt="Create Capsule" />
</p>

- ✅ **Client-Side Encryption**: AES-256-GCM encryption in browser
- ✅ **Time-Based Unlocking**: Set unlock dates for future access
- ✅ **Location-Based Unlocking**: Require specific GPS location with 1km radius
- ✅ **Designated Approver**: Only one person can decrypt with their private key
- ✅ **Dead Hand Protocol**: Automatic unlock if owner becomes inactive
- ✅ **Auto-Expiration**: Optional capsule expiration dates
- ✅ **Dashboard Management**: Track created and received capsules
- ✅ **Search & Filter**: Find capsules by title, notes, or status
- ✅ **QR Code Sharing**: Share public keys via QR code

### Capsule Use Cases

- Scheduled secure file delivery
- Time-sensitive information release
- Location-restricted document access
- Estate planning and digital legacy
- Emergency access to critical information
- Business continuity planning
- Conditional file sharing with approval

### Vault Features

<p align="center">
  <img src="Assets/Images/createvault.png" alt="Create Vault" />
</p>

- ✅ **Instant Access**: No waiting period, access documents anytime
- ✅ **Document Metadata**: Store type, issuer, document ID, timestamp
- ✅ **Public Verification**: Generate shareable proof links
- ✅ **Cryptographic Proof**: IPFS CID provides immutable evidence
- ✅ **Separate Storage**: Dedicated IPFS storage isolated from capsules
- ✅ **Gateway Independence**: Access via any IPFS gateway

### Vault Use Cases

- Professional certifications and credentials
- Legal contracts and agreements
- Academic diplomas and transcripts
- Professional licenses
- Important business documents
- Proof of document existence for legal purposes

### General Features

- ✅ **Analytics**: View usage statistics with optimized caching
- ✅ **Offline Support**: Works without internet connectivity
- ✅ **Mobile Responsive**: Works on all devices

---

- Consistent environment across all systems
- API keys never baked into image (runtime injection only)
- Production-ready configuration
- Multiple ports available (3001-3004)

See [DOCKER.md](DOCKER.md) for detailed Docker deployment guide.

#### Option 2: Local Development

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

## Deployment Options

### Docker Deployment

TrustCircle includes production-ready Docker configuration:

**Security Features:**

- API keys NOT baked into Docker image
- Placeholder values used during build
- Real credentials injected at runtime only
- Non-root user execution (nextjs:nodejs)
- Health checks and auto-restart

**Quick Deploy:**

```bash
cp .env.example .env
# Edit .env with your credentials
docker compose up -d
```

**Access Points:**

- http://localhost:3001
- http://localhost:3002
- http://localhost:3003
- http://localhost:3004

See [DOCKER.md](DOCKER.md) for complete Docker documentation.

### Vercel Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel deployment instructions.

---

## Recent Updates

- 🔧 Configuration stored in Supabase for easy management
- 🔒 Environment variables prioritized for security
- 🐳 Docker support with secure credential management
- 📝 Setup scripts for easy deployment
- 🔄 Automatic IPFS sync to remove orphaned records
- 🎨 Footer with creator attribution
- 📊 Real-time storage monitoring and sync

See [CHANGELOG.md](CHANGELOG.md) for full version history.

---

## FAQ

### Complete Workflow Example

Alice wants to send a confidential document to Bob that can only be opened on December 1st:

1. Bob goes to Identity page and copies his public key
2. Bob shares his public key with Alice
3. Alice goes to Create Capsule page
4. Alice uploads her document and sets unlock date to December 1st
5. Alice pastes Bob's public key in the Approver field
6. Alice creates the capsule and copies the Capsule ID
7. Alice shares the Capsule ID with Bob
8. Bob sees the capsule in his Dashboard under Received
9. On December 1st, Bob clicks Unlock and downloads the decrypted document

The file was encrypted in Alice's browser and only Bob can decrypt it with his private key.

### How does TrustCircle work?

TrustCircle uses end-to-end encryption to secure your files:

1. Your browser generates unique cryptographic keys locally
2. When you create a capsule, your file is encrypted in your browser using AES-256-GCM
3. You set unlock conditions like date, time, and optional location requirements
4. You specify an approver by their public key who can decrypt the file
5. The encrypted file is uploaded to IPFS for decentralized storage
6. Metadata and unlock conditions are stored in Supabase database
7. When conditions are met, the approver can unlock the capsule
8. The file is decrypted in the approver's browser using their private key

Your encryption keys never leave your browser and the server never sees your unencrypted files.

### Is my data secure?

Yes. All encryption happens client-side in your browser using AES-256-GCM. Your files are encrypted before leaving your device, and only you and the designated approver have the keys.

### What are unlock conditions?

You can set a date and time when the capsule becomes unlockable, and optionally require the approver to be within a certain distance of a specific location.

### Where is my data stored?

Encrypted files are stored on IPFS via Pinata for decentralized storage. Capsules and Vaults use separate IPFS accounts for isolation. Metadata is stored on Supabase. Your encryption keys never leave your browser.

### What happens to my keys?

Your cryptographic keys are stored locally in your browser using IndexedDB. You can export them for backup and import them on other devices.

### How do I send a capsule to someone?

To securely send a capsule to someone:

1. Ask the recipient to visit TrustCircle and go to their Identity page
2. The recipient clicks Copy Public Key button to copy their public key
3. The recipient shares their public key with you via email, message, or any channel
4. You go to Create Capsule page and upload your file
5. You set the unlock date and time when the capsule can be opened
6. You paste the recipient's public key in the Approver Public Key field
7. You click Create Capsule and wait for encryption to complete
8. You copy the generated Capsule ID from the success message
9. You share the Capsule ID with the recipient
10. The recipient sees the capsule in their Dashboard under Received tab
11. When unlock conditions are met, the recipient can unlock and download the file

Only the recipient with the matching private key can decrypt and access the file.

### Do I need an API key to use TrustCircle?

No. As a user, you don't need any API keys. Key generation happens entirely in your browser. API keys are only needed by whoever deploys the website for Pinata and Supabase, not by end users.

### Can I use TrustCircle on multiple devices?

Yes. Each device will have its own identity by default. You can either use different identities on each device with their own public keys, or export your keys from one device and import them on another to use the same identity everywhere.

### Can I share capsules with multiple people?

Currently, each capsule has one creator and one approver. The approver is the person who can unlock and access the encrypted files.

### How does time-based unlocking work?

<p align="center">
  <img src="Assets/Images/unlockcapsule.png" alt="Unlock Capsule" />
</p>

Time-based unlocking ensures capsules can only be opened after a specific date and time:

1. When creating a capsule, you set an unlock date and time
2. The unlock condition is stored with the capsule metadata
3. Before the unlock time, the Unlock button is disabled
4. The system checks the current time against the unlock time
5. Once the unlock time is reached, the approver can decrypt the capsule
6. The time check happens in real-time when the approver attempts to unlock

This is perfect for scheduled releases, time-sensitive documents, or future delivery of information.

### How does location-based unlocking work?

Location-based unlocking restricts capsule access to specific geographic locations:

1. When creating a capsule, you can optionally set a location requirement
2. You specify coordinates and a radius in meters
3. When the approver tries to unlock, their browser requests location permission
4. The system calculates the distance between their location and the required location
5. If they are within the specified radius, unlocking is allowed
6. If they are outside the radius, unlocking is denied with an error message

This is useful for location-specific documents, event access, or geo-restricted content.

### What can I do in the Dashboard?

<p align="center">
  <img src="Assets/Images/dashboardcapsules.png" alt="Dashboard Capsules" />
</p>

The Dashboard is your central hub for managing all capsules:

1. View all capsules you created in the Created tab
2. View all capsules sent to you in the Received tab
3. See capsule status: locked, unlocked, or expired
4. Check unlock conditions and expiration dates
5. Copy Capsule IDs to share with others
6. Delete capsules you no longer need
7. Monitor which capsules are approaching expiration
8. Track when capsules were created and unlocked

The Dashboard provides a complete overview of your secure file sharing activity.

<p align="center">
  <img src="Assets/Images/dashboardvault.png" alt="Dashboard Vaults" />
</p>

### How do I manage my Identity and keys?

<p align="center">
  <img src="Assets/Images/identitymanagement.png" alt="Identity Management" />
</p>

The Identity page lets you manage your cryptographic keys:

1. Generate new keys if you don't have any yet
2. View your public key that others need to send you capsules
3. Copy your public key with one click to share it
4. Export your keys as a JSON file for backup
5. Import previously exported keys to restore your identity
6. Use the same identity across multiple devices by importing keys
7. Regenerate keys if needed, but this will make old capsules inaccessible

Always backup your keys! Without them, you cannot decrypt capsules sent to you.

### What insights does Analytics provide?

<p align="center">
  <img src="Assets/Images/analytics.png" alt="Analytics" />
</p>

Analytics gives you detailed statistics about your capsule usage:

1. Total number of capsules you have created
2. Total number of capsules you have received
3. Number of capsules that have been unlocked
4. Average time between creation and unlocking
5. Number of capsules expiring soon
6. Overall unlock rate percentage
7. Visual cards showing each metric clearly

Use Analytics to understand your usage patterns and manage your capsules effectively.

### What is a Vault and how is it different from a Capsule?

Vaults and Capsules serve different purposes for secure file management:

**Capsules - Time Locked Sharing:**
- Time and location based unlocking conditions
- Shared with designated approver using their public key
- Perfect for scheduled secure file delivery
- Dead Hand protocol for automatic unlock if inactive
- Temporary secure sharing with unlock countdown

**Vaults - Professional Document Storage:**
- Always accessible by you no time locks or waiting
- Store professional documents like certifications, contracts, diplomas
- Generate public verification links to prove document exists
- Document metadata: type, issuer, document ID, timestamp
- Separate IPFS storage isolated from capsules
- Cryptographic proof with IPFS CID and creation timestamp

Use Capsules for sharing files with unlock conditions. Use Vaults for permanent encrypted storage with public verification.

### How do Vault verification links work?

Verification links let you prove a document exists without revealing its contents:

**What Verification Shows:**
- Document type and category
- Issuer organization or person
- Document ID or reference number
- Creation timestamp proving when uploaded
- IPFS CID file hash for integrity verification
- File size and name
- Your public key for authenticity

**What Verification Does NOT Show:**
- Encrypted document content
- Decryption keys
- File preview or download
- Any sensitive information from the document

**How to Use:**
- Open your vault from Dashboard
- Click Generate Verification Link button
- Copy the public URL and share it
- Anyone with the link can verify but not access content

Perfect for proving credentials to employers, verifying contracts, or demonstrating document authenticity.

### When should I use a Vault instead of a Capsule?

Choose based on your use case:

**Use Vaults For:**
- Professional certifications and credentials you need to access anytime
- Legal contracts requiring proof of existence and timestamp
- Academic diplomas and transcripts for verification
- Professional licenses that need public verification
- Important business documents you access frequently
- Documents where you need to prove authenticity to third parties
- Long term storage without unlock conditions

**Use Capsules For:**
- Sharing files that unlock at specific future date and time
- Location restricted access requiring GPS verification
- Dead Hand scenarios for emergency access if inactive
- Temporary secure file sharing with another person
- Time sensitive information delivery
- Files that need approval from designated recipient

Vaults are for your own permanent storage with verification. Capsules are for conditional sharing with others.

### How do I create and manage Vaults?

Creating and managing vaults is simple:

**Creating a Vault:**
- Click Create Vault from home page
- Upload your document file
- Enter title and optional description
- Select document type: Certification, Contract, Diploma, License, etc
- Enter issuer name: organization or person who issued document
- Add document ID or reference number if applicable
- Click Create Vault to encrypt and store
- File encrypted client side before upload to IPFS

**Accessing Your Vaults:**
- Go to Dashboard and click Vaults tab
- See all your vaults with metadata
- Click any vault to view and download
- No waiting period, instant access anytime
- Decrypt happens in your browser with your keys

**Verification:**
- Open vault and click Generate Verification Link
- Share link with employers, institutions, or anyone
- They can verify document exists without seeing content

Vaults use separate IPFS storage from capsules for better organization and quota management.

### What is Dead Hand and how does it work?

Dead Hand is an automatic unlock feature that ensures your capsule reaches recipients even if you become inactive:

**Setup:**
- When creating a capsule, enable Dead Hand and set a trigger date
- Trigger date must be between unlock date and expiry date
- No email configuration needed - uses in-app notifications

**Warning Phase (2 days before trigger):**
- System creates a warning notification in your Dashboard
- Check Dashboard to see the warning
- You can postpone by resetting the trigger date

**Grace Period (trigger date + 2 days):**
- If you don't reset, grace period begins
- You have 2 more days to reset the date
- Capsule still locked during grace period

**Auto-Unlock (after grace period):**
- Capsule automatically unlocks
- Notification appears in Dashboard
- Capsule becomes available in Unlock page
- Status changes to triggered

**Management:**
- View status in Dashboard under created capsules
- Reset trigger date anytime to postpone
- Disable Dead Hand completely if needed

Use cases: Estate planning, emergency access, business continuity, digital legacy.

### What is the difference between Vault ID and CID?

Vaults use two different identifiers that serve distinct purposes:

**Vault ID (UUID):**
- Database identifier like 83353b20-5ca7-43ac-b0e6-5f7433526216
- Used to query vault metadata from Supabase database
- Mutable - can be deleted from database
- Links to application features like dashboard and access control
- Needed to access vault through TrustCircle website

**CID (Content Identifier):**
- IPFS hash like QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
- Cryptographic hash of the encrypted file content
- Immutable - content cannot be changed
- Permanent - exists on IPFS forever
- Provides cryptographic proof of file integrity

**Why Both?**
- Vault ID: Application layer for user management and features
- CID: Storage layer for immutable content and verification
- Separation: Database can be rebuilt from CIDs
- CIDs provide eternal proof independent of any database or website

**Verification CID:**
- Each vault also has a verification CID
- Points to JSON file on IPFS with document metadata
- Contains: type, issuer, timestamp, vault CID, creator key
- Eternal proof that survives even if TrustCircle website disappears
- Share verification CID to prove document existence forever

The verification link uses the verification CID to provide permanent, immutable proof of your document on IPFS.

### What are the two CIDs in my vault?

Each vault has two different IPFS Content Identifiers serving different purposes:

**Encrypted File CID:**
- Your actual document stored encrypted on IPFS
- Private and secure - only you can decrypt with your keys
- Cannot be accessed or viewed by anyone else
- Permanent storage of your encrypted file

**Verification CID:**
- Public metadata JSON file on IPFS
- Contains document info: type, issuer, timestamp
- Does NOT contain your actual document or decryption keys
- Shareable proof that document exists
- Anyone can view metadata but not the document content

This separation lets you prove a document exists without revealing what's inside.

### What is an IPFS gateway and why are there multiple options?

IPFS gateways provide web browser access to IPFS content:

**What is a Gateway?**
- Web servers that let you access IPFS through HTTP
- Think of them as different doors to the same building
- The CID is the permanent address
- Gateways are just different ways to access it

**Available Gateways:**
- gateway.pinata.cloud - Pinata's gateway
- ipfs.io - Public IPFS gateway
- cloudflare-ipfs.com - Cloudflare's gateway
- Any other public or private IPFS gateway

**Why Multiple Gateways?**
- No single company controls IPFS
- If one gateway is down, use another
- True decentralization and independence
- Your proof remains accessible even if one service fails

Use the CID with any gateway: gateway.example.com/ipfs/[YOUR_CID]

### Is TrustCircle dependent on Pinata?

TrustCircle uploads to Pinata but your data is not locked to them:

**What Pinata Provides:**
- Reliable IPFS pinning service for uploads
- Fast gateway for accessing content
- Storage infrastructure

**Your Independence:**
- Data stored on IPFS, not just Pinata
- CIDs work with any IPFS gateway
- Can access via ipfs.io, Cloudflare, or any gateway
- Verification proof survives even if Pinata disappears
- You can run your own IPFS node to access the data

The CID is the permanent identifier - gateways are just access methods.

### What are the storage limits?

TrustCircle has storage limits to ensure fair usage across all users:

**Personal Limits:**
- Each user has 250MB total storage
- Capsules: Up to 250MB
- Vaults: Up to 250MB

**Global Limits:**
- Total Capsules across all users: 1GB
- Total Vaults across all users: 1GB

**Monitoring:**
- Storage usage shown in navigation bar
- Warning appears at 80% personal usage
- Warning appears when global storage below 20%

**Managing Storage:**
- Delete old or expired capsules to free space
- Storage calculated from encrypted file size
- Compression applied before encryption

Check the navigation bar to monitor your current usage and available storage.

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
