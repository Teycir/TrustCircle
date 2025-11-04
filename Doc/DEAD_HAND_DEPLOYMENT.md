# Dead Hand Deployment Guide

## ✅ Completed Steps

### 1. Database Setup
- ✅ `pg_cron` extension enabled
- ✅ Dead hand schema migration applied
- ✅ Cron job scheduled (Job ID: 1)
- ✅ Runs daily at midnight UTC

### 2. Edge Function
- ✅ `check-dead-hand` function deployed
- ✅ Function is active and ready

### 3. Cron Configuration
- ✅ Schedule: `0 0 * * *` (Daily at midnight UTC)
- ✅ Endpoint: `https://ooihmwfsxvinrgeuapfl.supabase.co/functions/v1/check-dead-hand`
- ✅ Authentication configured

## 🔧 Remaining Setup

### Set Edge Function Secrets

You need to set two secrets for the edge function to work properly:

```bash
# Login to Supabase CLI first
npx supabase login

# Set Resend API key
npx supabase secrets set RESEND_API_KEY=re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe --project-ref ooihmwfsxvinrgeuapfl

# Set your application URL
npx supabase secrets set APP_URL=https://your-production-url.com --project-ref ooihmwfsxvinrgeuapfl
```

**For local development:**
```bash
npx supabase secrets set APP_URL=http://localhost:3000 --project-ref ooihmwfsxvinrgeuapfl
```

### Verify Secrets Are Set

```bash
npx supabase secrets list --project-ref ooihmwfsxvinrgeuapfl
```

You should see:
- `RESEND_API_KEY`
- `APP_URL`
- `SUPABASE_URL` (auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-set)

## 📋 System Overview

### Database Schema
The `capsules` table now includes:
- `dead_hand_trigger_date` - When to trigger dead hand
- `dead_hand_recipients` - Array of recipient emails
- `dead_hand_status` - Current status (null, warning_sent, grace_period, triggered)
- `owner_email` - Owner's email for warnings
- `warning_sent_at` - Timestamp of warning email

### Automated Process

**Daily at 00:00 UTC**, the cron job executes:

1. **Warning Phase** (2 days before trigger)
   - Finds capsules where `trigger_date - 2 days <= now`
   - Sends warning email to owner
   - Sets status to `warning_sent`

2. **Grace Period Phase** (at trigger date)
   - Finds capsules where `trigger_date <= now` and status is `warning_sent`
   - Sets status to `grace_period`

3. **Trigger Phase** (2 days after trigger date)
   - Finds capsules where `trigger_date + 2 days <= now` and status is `grace_period`
   - Sends access emails to all recipients
   - Sets capsule status to `unlocked`
   - Sets dead hand status to `triggered`

### Email Configuration

**Resend API Key:** `re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe`

**Email Templates:**
- **Owner Warning:** "Your capsule will auto unlock in 2 days"
- **Recipient Access:** "You have been granted access to a capsule"

**From Address:** `onboarding@resend.dev`

## 🧪 Testing

### Manual Trigger Test

You can manually trigger the edge function to test:

```bash
curl -X POST \
  https://ooihmwfsxvinrgeuapfl.supabase.co/functions/v1/check-dead-hand \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaWhtd2ZzeHZpbnJnZXVhcGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTY5ODMsImV4cCI6MjA3NzU5Mjk4M30.12uLdklgbMwl7OkVmlCc_3ywOwVWcbpaO-vWGnCl_hU" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "warnings": 0,
  "grace": 0,
  "triggered": 0
}
```

### Create Test Capsule

```typescript
import { TrustCircleDB } from "./lib/supabase";
import { enableDeadHand } from "./lib/dead-hand";

const db = new TrustCircleDB(supabaseUrl, supabaseKey);

// Create a test capsule with dead hand
await enableDeadHand(db, capsuleId, {
  triggerDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
  recipients: ["test@example.com"],
  ownerEmail: "owner@example.com"
});
```

### Monitor Cron Execution

```sql
-- View cron job details
SELECT * FROM cron.job WHERE jobname = 'check-dead-hand-daily';

-- View execution history
SELECT * FROM cron.job_run_details 
WHERE jobid = 1 
ORDER BY start_time DESC 
LIMIT 10;
```

## 📊 Monitoring

### Check Dead Hand Capsules

```sql
-- All capsules with dead hand enabled
SELECT id, title, dead_hand_trigger_date, dead_hand_status, owner_email
FROM capsules
WHERE dead_hand_trigger_date IS NOT NULL;

-- Capsules in warning phase
SELECT * FROM capsules WHERE dead_hand_status = 'warning_sent';

-- Capsules in grace period
SELECT * FROM capsules WHERE dead_hand_status = 'grace_period';

-- Triggered capsules
SELECT * FROM capsules WHERE dead_hand_status = 'triggered';
```

### Email Delivery

Check Resend dashboard for email delivery status:
- https://resend.com/emails

## 🔒 Security Notes

1. **API Keys**: Resend API key is stored as Edge Function secret
2. **Authentication**: Cron job uses anon key for function invocation
3. **Email Validation**: Recipients list should be validated before storage
4. **Rate Limits**: Resend free tier allows 100 emails/day, 3000/month

## 🚀 Production Checklist

- [ ] Supabase CLI logged in
- [ ] `RESEND_API_KEY` secret set
- [ ] `APP_URL` secret set to production URL
- [ ] Secrets verified with `supabase secrets list`
- [ ] Manual test of edge function successful
- [ ] Test capsule created with dead hand
- [ ] Cron job execution verified in `cron.job_run_details`
- [ ] Email delivery tested and confirmed
- [ ] Monitoring queries bookmarked

## 📝 Usage in Application

### Enable Dead Hand on Capsule Creation

```typescript
import { enableDeadHand } from "./lib/dead-hand";

// After creating capsule
const capsuleId = await capsuleManager.createCapsule(params);

// Enable dead hand
await enableDeadHand(db, capsuleId, {
  triggerDate: new Date("2025-12-31"),
  recipients: ["heir@example.com", "lawyer@example.com"],
  ownerEmail: user.email
});
```

### Reset Trigger Date

```typescript
import { resetDeadHandDate } from "./lib/dead-hand";

// Push date forward by 90 days
const newDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
await resetDeadHandDate(db, capsuleId, newDate);
```

### Check Status

```typescript
import { getDeadHandStatus } from "./lib/dead-hand";

const status = await getDeadHandStatus(db, capsuleId);
console.log(`Days until trigger: ${status.daysUntilTrigger}`);
console.log(`Current status: ${status.status}`);
```

## 🆘 Troubleshooting

### Cron Job Not Running
```sql
-- Check if job is active
SELECT * FROM cron.job WHERE jobname = 'check-dead-hand-daily';

-- Check for errors
SELECT * FROM cron.job_run_details WHERE status = 'failed';
```

### Emails Not Sending
1. Verify `RESEND_API_KEY` is set correctly
2. Check Resend dashboard for delivery status
3. Verify email addresses are valid
4. Check rate limits (100/day, 3000/month)

### Edge Function Errors
```bash
# View function logs
npx supabase functions logs check-dead-hand --project-ref ooihmwfsxvinrgeuapfl
```

## 📞 Support

- Resend Documentation: https://resend.com/docs
- Supabase Cron: https://supabase.com/docs/guides/database/extensions/pg_cron
- Edge Functions: https://supabase.com/docs/guides/functions
