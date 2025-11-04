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
- ✅ **Dashboard Management**: Track created and received capsules
- ✅ **Search & Filter**: Find capsules by title, notes, or status
- ✅ **Analytics**: View usage statistics with optimized caching
- ✅ **QR Code Sharing**: Share public keys via QR code
- ✅ **Auto-Expiration**: Optional capsule expiration dates
- ✅ **Offline Support**: Works without internet connectivity
- ✅ **Mobile Responsive**: Works on all devices

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
- **Storage**: Pinata for IPFS, Supabase for metadata
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
# Edit .env.local with your Pinata and Supabase credentials

# Setup database configuration
# Run scripts/setup-config.sql in your Supabase SQL Editor

# Run development server
npm run dev

# Run tests
npm test
```

### Configuration

API credentials are stored in Supabase `app_config` table:

1. Run `supabase/sql/app-config-schema.sql` to create the table
2. Run `scripts/setup-config.sql` to populate your credentials
3. Environment variables in `.env.local` take priority over database config

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

```
Create: Browser Crypto -> Pinata IPFS -> Supabase metadata
Unlock: Supabase metadata -> Pinata IPFS -> Browser Crypto decrypt
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

create index idx_capsules_creator on capsules(creator_pubkey);
create index idx_capsules_approver on capsules(approver_pubkey);
```

Row Level Security policies ensure users can only access their own capsules.

---

## Recent Updates (v2.5.0)

- 🔧 Removed admin panel UI
- 💾 Configuration stored in Supabase `app_config` table
- 🔒 Environment variables prioritized for security
- 📝 Added setup scripts for easy deployment
- 🚀 Simplified configuration management

See [CHANGELOG.md](CHANGELOG.md) for full version history.

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
