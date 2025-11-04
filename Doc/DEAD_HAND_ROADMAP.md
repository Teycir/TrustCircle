# Dead Hand Feature Roadmap

## Overview
Dead Hand is an automatic unlock mechanism that triggers when a capsule creator fails to reset a trigger date. This ensures capsules can be accessed by designated recipients even if the creator becomes unavailable.

## Feature Specification

### Core Concept
- Creator sets a trigger date for a capsule
- System sends warning email 2 days before trigger date
- If not reset, grace period begins at trigger date for 2 days
- After grace period expires, capsule auto unlocks and recipients receive access emails

### Timeline Flow
```
Day -2: Warning email sent to owner
Day 0:  Trigger date reached, grace period starts
Day +2: Grace period ends, auto unlock, recipient emails sent
```

### User Actions
- **Enable Dead Hand**: Set trigger date and recipient emails when creating capsule
- **Reset Trigger Date**: Push date forward to prevent auto unlock
- **Disable Dead Hand**: Remove dead hand configuration from capsule

## Technical Architecture

### Database Schema Changes

Add to capsules table:
- `dead_hand_trigger_date` timestamp - When dead hand activates
- `dead_hand_recipients` text array - Email addresses to notify
- `dead_hand_status` text - Current status: null, warning sent, grace period, triggered
- `owner_email` text - Creator email for warnings
- `warning_sent_at` timestamp - When warning was sent

### Status States
1. **null**: Dead hand not enabled or reset after warning
2. **warning_sent**: Warning email sent 2 days before trigger
3. **grace_period**: Trigger date reached, 2 day countdown active
4. **triggered**: Grace period expired, capsule auto unlocked

### API Integration

**Resend Email Service**
- API Key: re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe
- Endpoint: https://api.resend.com/emails
- Free tier: 3000 emails per month, 100 per day

## Implementation Phases

### Phase 1: Database and Core Functions
**Files to create:**
- `supabase/sql/dead-hand-schema.sql` - Database migration
- `lib/dead-hand.ts` - Core dead hand functions
- Update `lib/supabase.ts` - Add dead hand methods to TrustCircleDB

**Functions:**
- `enableDeadHand(capsuleId, triggerDate, recipients, ownerEmail)`
- `resetDeadHandDate(capsuleId, newDate)`
- `disableDeadHand(capsuleId)`
- `getDeadHandStatus(capsuleId)`

### Phase 2: Email Integration
**Files to create:**
- `lib/email.ts` - Resend email client and templates
- Update `.env.example` - Add RESEND_API_KEY

**Functions:**
- `sendOwnerWarning(email, capsuleId, capsuleTitle, resetLink)`
- `sendRecipientNotification(emails, capsuleId, capsuleTitle, downloadLink)`

**Email Templates:**
1. Owner Warning: "Your capsule will auto unlock in 2 days"
2. Recipient Notification: "You have access to a capsule"

### Phase 3: Automated Checking
**Files to create:**
- `supabase/functions/check-dead-hand/index.ts` - Cron job function
- `supabase/functions/check-dead-hand/deno.json` - Deno config

**Cron Schedule:**
- Runs daily at midnight UTC
- Checks all capsules with dead hand enabled

**Logic:**
1. Find capsules where `trigger_date - 2 days <= now` and status is null
   - Send warning email
   - Set status to warning sent
   
2. Find capsules where `trigger_date <= now` and status is warning sent
   - Set status to grace period
   
3. Find capsules where `trigger_date + 2 days <= now` and status is grace period
   - Set status to triggered
   - Update capsule status to unlocked
   - Send recipient emails

### Phase 4: UI Components
**Files to create:**
- `components/DeadHandConfig.tsx` - Configuration form
- `app/dead-hand/page.tsx` - Dead hand management page

**Features:**
- Enable/disable dead hand toggle
- Date picker for trigger date
- Recipient email list management
- Status display with countdown
- Reset button

### Phase 5: Policy Integration
**Files to update:**
- `lib/policy.ts` - Add DEAD_HAND_TRIGGERED condition
- `lib/capsule.ts` - Check dead hand status during unlock

**New Policy Condition:**
```typescript
{
  type: "DEAD_HAND_TRIGGERED",
  value: "true"
}
```

## Security Considerations

### CMK Handling for Auto Unlock
When dead hand triggers, recipients need access without approver interaction.

**Options:**
1. Store CMK encrypted with system key in environment
2. Store CMK encrypted with each recipient public key
3. Generate one time access tokens

**Recommended:** Option 3 - Generate secure tokens that allow one time download

### Access Control
- Only creator can enable/reset dead hand
- Only creator can modify recipient list
- Recipients receive unique access tokens
- Tokens expire after first use or 30 days

## Configuration

### Environment Variables
```
RESEND_API_KEY=re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe
DEAD_HAND_SYSTEM_KEY=<generated-key-for-cmk-encryption>
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### Supabase Edge Function Secrets
```
RESEND_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

## Testing Strategy

### Unit Tests
- Dead hand enable/disable/reset functions
- Email sending with mock Resend API
- Status transitions
- Date calculations

### Integration Tests
- Full dead hand lifecycle
- Email delivery verification
- Cron job execution
- Auto unlock process

### E2E Tests
- Create capsule with dead hand
- Reset trigger date
- Verify warning email
- Verify recipient email
- Download via access token

## Deployment Checklist

1. Run database migration
2. Add Resend API key to environment
3. Deploy Supabase Edge Function
4. Configure cron schedule
5. Test email delivery
6. Update UI to show dead hand options
7. Document user guide

## Future Enhancements

- Multiple warning emails at different intervals
- SMS notifications via Twilio
- Configurable grace period duration
- Dead hand analytics dashboard
- Batch operations for multiple capsules
- Recipient confirmation before unlock

## API Reference

### Dead Hand Functions

```typescript
// Enable dead hand for a capsule
enableDeadHand(
  capsuleId: string,
  triggerDate: Date,
  recipients: string[],
  ownerEmail: string
): Promise<void>

// Reset trigger date to prevent unlock
resetDeadHandDate(
  capsuleId: string,
  newTriggerDate: Date
): Promise<void>

// Disable dead hand completely
disableDeadHand(capsuleId: string): Promise<void>

// Get current dead hand status
getDeadHandStatus(capsuleId: string): Promise<{
  enabled: boolean;
  triggerDate: Date | null;
  status: string | null;
  recipients: string[];
  daysUntilTrigger: number | null;
}>
```

### Email Functions

```typescript
// Send warning to owner
sendOwnerWarning(
  email: string,
  capsuleId: string,
  capsuleTitle: string,
  resetLink: string
): Promise<void>

// Send notification to recipients
sendRecipientNotification(
  emails: string[],
  capsuleId: string,
  capsuleTitle: string,
  downloadLink: string
): Promise<void>
```

## Success Metrics

- Dead hand enabled on X percent of capsules
- Average reset frequency
- Email delivery success rate
- Time to unlock after trigger
- User satisfaction with feature

## Support and Documentation

- User guide for enabling dead hand
- FAQ for common questions
- Troubleshooting guide
- Email template customization guide
