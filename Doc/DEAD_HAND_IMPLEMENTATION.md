# Dead Hand Implementation Summary

## Completed Files

### 1. Database Schema
**File:** `supabase/sql/dead-hand-schema.sql`
- Added columns to capsules table for dead hand functionality
- Created indexes for efficient queries

### 2. Core Functions
**File:** `lib/dead-hand.ts`
- `enableDeadHand()` - Enable dead hand for a capsule
- `resetDeadHandDate()` - Reset trigger date to prevent unlock
- `disableDeadHand()` - Disable dead hand completely
- `getDeadHandStatus()` - Get current status and countdown

### 3. Database Methods
**File:** `lib/supabase.ts` (updated)
- Added `updateDeadHand()` method
- Added `getDeadHandCapsules()` method
- Updated CapsuleRecord interface with dead hand fields

### 4. Email Service
**File:** `lib/email.ts`
- Integrated Resend SDK
- `sendOwnerWarning()` - Warning email 2 days before trigger
- `sendRecipientNotification()` - Access email to recipients

### 5. Cron Job Function
**File:** `supabase/functions/check-dead-hand/index.ts`
- Checks capsules daily
- Sends warning emails
- Transitions status through grace period
- Triggers auto unlock and recipient emails

### 6. Cron Schedule
**File:** `supabase/sql/dead-hand-cron.sql`
- Schedules daily execution at midnight UTC

### 7. Environment Configuration
**File:** `.env.example` (updated)
- Added RESEND_API_KEY
- Added NEXT_PUBLIC_APP_URL

## Next Steps

### 1. Database Setup
```bash
# Run the migration
psql -h your-db-host -U postgres -d your-db < supabase/sql/dead-hand-schema.sql
```

Or via Supabase Dashboard:
- Go to SQL Editor
- Paste contents of `dead-hand-schema.sql`
- Run query

### 2. Environment Variables
Add to your `.env` file:
```
RESEND_API_KEY=re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Deploy Edge Function
```bash
# Deploy the function
supabase functions deploy check-dead-hand

# Set secrets
supabase secrets set RESEND_API_KEY=re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe
supabase secrets set APP_URL=https://your-app.com
```

### 4. Setup Cron Schedule
- Go to Supabase Dashboard > Database > Extensions
- Enable `pg_cron` extension
- Run `dead-hand-cron.sql` in SQL Editor
- Update URL and auth token in the SQL

### 5. Test the Implementation
```typescript
import { TrustCircleDB } from "./lib/supabase";
import { enableDeadHand, getDeadHandStatus } from "./lib/dead-hand";

const db = new TrustCircleDB(url, key);

// Enable dead hand
await enableDeadHand(db, capsuleId, {
  triggerDate: new Date("2024-12-31"),
  recipients: ["recipient@example.com"],
  ownerEmail: "owner@example.com"
});

// Check status
const status = await getDeadHandStatus(db, capsuleId);
console.log(status);
```

## Timeline Verification

### Day -2 (2 days before trigger)
- Cron job detects capsule
- Sends warning email to owner
- Sets status to "warning_sent"

### Day 0 (trigger date)
- Cron job detects warning_sent capsules
- Sets status to "grace_period"

### Day +2 (2 days after trigger)
- Cron job detects grace_period expired
- Sets status to "triggered"
- Updates capsule status to "unlocked"
- Sends emails to all recipients

## API Key Configuration

**Resend API Key:** `re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe`

This key is configured in:
- `lib/email.ts` (fallback)
- Environment variable `RESEND_API_KEY` (recommended)
- Supabase Edge Function secrets (for cron job)

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Environment variables configured
- [ ] Edge function deployed
- [ ] Cron schedule created
- [ ] Test email sending with Resend
- [ ] Create test capsule with dead hand
- [ ] Verify warning email received
- [ ] Verify status transitions
- [ ] Verify recipient emails sent
- [ ] Verify capsule unlocks automatically

## Remaining Work

### UI Components (Phase 4)
- Create `components/DeadHandConfig.tsx`
- Add dead hand section to capsule creation form
- Add reset button to dashboard
- Display countdown timer

### Policy Integration (Phase 5)
- Add DEAD_HAND_TRIGGERED policy condition
- Update unlock logic to check dead hand status
- Handle CMK unwrapping for triggered capsules

### Testing
- Write unit tests for dead hand functions
- Write integration tests for email sending
- Write E2E tests for full lifecycle

## Usage Example

```typescript
// When creating a capsule
const capsuleId = await capsuleManager.createCapsule(params);

// Enable dead hand
await enableDeadHand(db, capsuleId, {
  triggerDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  recipients: ["heir@example.com", "lawyer@example.com"],
  ownerEmail: "owner@example.com"
});

// Later, to reset the date
await resetDeadHandDate(db, capsuleId, new Date(Date.now() + 180 * 24 * 60 * 60 * 1000));

// Check status anytime
const status = await getDeadHandStatus(db, capsuleId);
console.log(`Days until trigger: ${status.daysUntilTrigger}`);
```
