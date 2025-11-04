# Professional Vault Feature Roadmap

## Overview

Add a Professional Vault feature to TrustCircle for storing and verifying professional documents with cryptographic proof of existence and authenticity.

## Core Principles

- Reuse existing capsule encryption and storage mechanisms
- Minimal changes to current architecture
- Separate UI for vaults vs time capsules
- Always accessible by owner no time locks
- Public verification without content disclosure
- Gold theme with safe icons

---

## Phase 1: Core Vault Functionality

### Step 1: Database Schema

**File:** `supabase/sql/add_vault_support.sql`

**Architecture Decision:** Separate `vaults` table for better performance and security

```sql
-- Create vaults table
CREATE TABLE vaults (
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

**Benefits:**
- Better query performance separate indexes
- Clearer security policies RLS
- No nullable columns cleaner schema
- Independent evolution from capsules
- Easier to add vault specific features later

**Fields:**
- `document_type`: Type of document certification contract diploma etc
- `issuer`: Organization or person who issued the document
- `document_id`: Reference number or ID for the document
- `payload_cid`: IPFS CID of encrypted file
- `metadata`: Cryptographic details and encryption info

---

### Step 2: Main Page - Add Create Vault Card

**File:** `app/page.tsx`

**Changes:**
- Add new card next to Create Time Capsule
- Gold gradient background amber 500 to yellow 600
- Safe or Vault icon from lucide react
- Routes to `/create-vault`

**Visual Design:**
- Gold theme distinct from blue capsule theme
- Safe icon
- Text: Create Vault and Store professional documents with cryptographic proof

---

### Step 3: Create Vault Page

**File:** `app/create-vault/page.tsx`

**Clone from:** `app/create/page.tsx`

**Form Fields:**
- Title required
- Description optional
- Document Type required dropdown or text
  - Options: Certification Contract Diploma Transcript License Other
- Issuer required
- Document ID optional
- File Upload required

**Remove:**
- Unlock date picker
- Location lock checkbox
- Dead Hand options

**Logic:**
- Set `capsule_type = 'vault'`
- Set `unlock_date = new Date()` current timestamp
- Use same encryption AES 256 GCM
- Use same IPFS storage via Pinata
- Store encryption key in IndexedDB

**Styling:**
- Gold gradient theme
- Safe icon
- Match existing form patterns

---

### Step 4: Dashboard - Add Vaults Tab

**File:** `app/dashboard/page.tsx`

**Changes:**
- Add Vaults tab next to Capsules tab
- Filter query: `WHERE capsule_type = 'vault'`
- Display vault cards with metadata
- Show: title document type issuer created date
- Open Vault button always enabled no countdown

**Vault Card Design:**
- Gold accent border or background
- Safe icon
- Display metadata prominently
- No unlock countdown
- No location status

**Cache Strategy:**
- Same 5 minute cache as capsules
- Separate cache key for vaults

---

### Step 5: Vault View Page

**File:** `app/vault/[id]/page.tsx`

**Clone from:** `app/unlock/[id]/page.tsx`

**Simplified Logic:**
- No time check always accessible
- No location check
- Direct decrypt and display
- Retrieve key from IndexedDB
- Decrypt from IPFS

**Display:**
- Document metadata
  - Title
  - Document Type
  - Issuer
  - Document ID
  - Created timestamp
  - File hash IPFS CID
  - File size
- File preview or download
- Generate Verification Link button

**Styling:**
- Gold theme
- Safe icon
- Clean professional layout

---

## Phase 2: Public Verification

### Step 6: Public Verification Page

**File:** `app/verify/[id]/page.tsx`

**Purpose:**
- Public route no authentication required
- Prove document exists without revealing content
- Shareable verification link

**Display Information:**
- Document Verified checkmark
- Upload Timestamp
- Document Type
- Issuer
- Document ID
- File Hash IPFS CID
- File Size
- Owner Public Key
- QR Code for verification URL

**Does NOT Show:**
- Encrypted content
- Decryption keys
- File preview
- Owner identity details

**Styling:**
- Gold theme
- Professional certificate style layout
- QR code for easy sharing
- Print friendly

**Security:**
- Read only public access
- No sensitive data exposed
- Rate limiting on verification endpoint

---

### Step 7: Generate Verification Link

**File:** `app/vault/[id]/page.tsx` update

**Add Button:**
- Generate Verification Link
- Creates shareable URL: `https://trustcircle.app/verify/[vault-id]`
- Copy to clipboard
- Show QR code modal

**Implementation:**
- Verification link is just the vault ID
- Public page queries capsule metadata only
- No encryption keys in URL

---

## Phase 3: Enhancements Optional

### Analytics Integration

**File:** `app/analytics/page.tsx`

**Add Metrics:**
- Total vaults created
- Vaults by document type
- Verification link views
- Storage used by vaults vs capsules

### Search and Filter

**File:** `app/dashboard/page.tsx`

**Add Filters:**
- Search by document type
- Search by issuer
- Search by document ID
- Date range filter

### Export Features

**Add Functionality:**
- Export verification certificate as PDF
- Batch download vault documents
- Export metadata as JSON

---

## Technical Implementation Details

### Encryption Flow

```
Same as capsules:
1. Generate random AES 256 key
2. Encrypt file with AES GCM
3. Upload encrypted file to IPFS via Pinata
4. Store AES key in IndexedDB
5. Store metadata in Supabase
```

### Access Control

**Owner Access:**
- Always can decrypt and view
- Can generate verification links
- Can delete vault

**Public Verification:**
- Can view metadata only
- Cannot decrypt content
- Cannot modify or delete

### Database Queries

**List Vaults:**
```sql
SELECT * FROM vaults 
WHERE creator_pubkey = $1 
ORDER BY created_at DESC
```

**Get Vault for Verification:**
```sql
SELECT 
  id, title, document_type, issuer, document_id,
  created_at, payload_cid, file_size, file_name
FROM vaults 
WHERE id = $1
```

---

## File Structure

```
/app
  /create-vault
    page.tsx          NEW
  /vault
    /[id]
      page.tsx        NEW
  /verify
    /[id]
      page.tsx        NEW
  /dashboard
    page.tsx          UPDATE add Vaults tab
  page.tsx            UPDATE add Create Vault card

/supabase/sql
  add_vault_support.sql  NEW

/lib
  vault.ts            NEW optional helper functions
```

---

## Testing Checklist

### Phase 1 Testing

- [ ] Database migration runs successfully
- [ ] Create Vault card appears on main page
- [ ] Create Vault page loads and form works
- [ ] Vault is created with correct metadata
- [ ] Vault appears in Dashboard Vaults tab
- [ ] Vault can be opened immediately
- [ ] File decrypts and displays correctly
- [ ] Vault uses gold theme consistently

### Phase 2 Testing

- [ ] Generate Verification Link button works
- [ ] Verification URL is shareable
- [ ] Public verification page loads without auth
- [ ] Metadata displays correctly
- [ ] Content is NOT exposed
- [ ] QR code generates correctly
- [ ] Verification page is mobile responsive

### Phase 3 Testing

- [ ] Analytics shows vault metrics
- [ ] Search and filter work correctly
- [ ] Export features function properly

---

## Design Specifications

### Color Scheme

**Vault Gold Theme:**
- Primary: `from-amber-500 to-yellow-600`
- Accent: `border-amber-400`
- Text: `text-amber-900`
- Background: `bg-amber-50`

**Capsule Blue Theme existing:**
- Primary: `from-blue-500 to-purple-600`

### Icons

- Vault/Safe: `lucide-react` Vault or ShieldCheck
- Verification: CheckCircle
- Document: FileText
- Share: Share2

### Typography

- Headings: Bold professional
- Metadata labels: Uppercase small text
- Values: Regular weight clear

---

## Security Considerations

### Encryption

- Same AES 256 GCM as capsules
- Keys never leave client
- IPFS CID is public but content encrypted

### Verification Page

- No authentication required
- Only metadata exposed
- Rate limit to prevent abuse
- No PII in public view

### Access Control

- Owner only can decrypt
- RLS policies enforce user isolation
- Verification links are read only

---

## Migration Strategy

### Backward Compatibility

- Existing capsules default to `capsule_type = 'capsule'`
- No breaking changes to existing functionality
- New columns are nullable or have defaults

### Rollout Plan

1. Deploy database migration
2. Deploy backend changes
3. Deploy frontend vault creation
4. Deploy dashboard updates
5. Deploy verification pages
6. Announce feature to users

---

## Success Metrics

### Adoption

- Number of vaults created
- Vault to capsule ratio
- Active users creating vaults

### Usage

- Verification link generations
- Verification page views
- Document types distribution

### Performance

- Vault creation time
- Verification page load time
- Storage efficiency

---

## Future Enhancements

### Multi Party Signatures

- Allow multiple parties to sign a vault
- Cryptographic proof of agreement
- Timestamp each signature

### Expiration Policies

- Optional auto delete after retention period
- Compliance with data retention laws

### Advanced Verification

- Blockchain anchoring for immutable proof
- Integration with third party notary services
- API for programmatic verification

### Collaboration

- Share vault access with specific users
- Granular permissions view only vs full access
- Audit logs for access tracking

---

## Questions and Decisions

### Resolved

- ✅ Use same table with capsule_type field
- ✅ Gold theme with safe icons
- ✅ Separate creation flows
- ✅ Public verification page
- ✅ No expiration dates
- ✅ Always accessible by owner
- ✅ Metadata: document_type issuer document_id

### Pending

- [ ] Should document_type be dropdown or free text?
- [ ] Rate limiting strategy for verification pages?
- [ ] Should verification links expire?
- [ ] Analytics integration priority?
- [ ] Export format preferences?

---

## Timeline Estimate

### Phase 1: Core Functionality
- Database migration: 30 min
- Create Vault page: 2 hours
- Dashboard updates: 1 hour
- Vault view page: 1 hour
- Testing: 1 hour
**Total: ~5 hours**

### Phase 2: Verification
- Verification page: 2 hours
- Generate link feature: 1 hour
- QR code integration: 30 min
- Testing: 1 hour
**Total: ~4.5 hours**

### Phase 3: Enhancements
- Analytics: 1 hour
- Search/filter: 1 hour
- Export: 1 hour
**Total: ~3 hours**

**Grand Total: ~12.5 hours**

---

## Next Steps

1. Review and approve this roadmap
2. Start with Phase 1 Step 1 database migration
3. Implement features sequentially
4. Test each step before moving forward
5. Deploy incrementally
6. Gather user feedback
7. Iterate on Phase 3 enhancements

---

## Notes

- Keep implementation minimal and focused
- Reuse existing patterns and components
- Maintain consistency with current UX
- Prioritize security and privacy
- Document as we build
- Test thoroughly before deployment
