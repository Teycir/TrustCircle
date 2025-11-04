# Dead Hand Quick Start Guide

## For End Users

### Creating a Capsule with Dead Hand

1. Go to **Create Capsule** page
2. Fill in your file, title, and approver key
3. Scroll to **Dead Hand Configuration**
4. Check ☑️ "Enable automatic unlock if not reset"
5. Set **Trigger Date** (e.g., 90 days from now)
6. Enter **Your Email** for warnings
7. Enter **Recipient Emails** (comma-separated)
8. Click **Create Capsule**

### Managing Dead Hand

1. Go to **Dashboard**
2. View **Created by Me** tab
3. See dead hand status for each capsule
4. Click **Reset Date** to extend trigger
5. Click **Disable** to turn off dead hand

### What Happens

**Day -2**: You receive warning email
**Day 0**: Grace period starts (2 days)
**Day +2**: Auto unlock + recipients notified

## For Developers

### Quick Setup

```bash
# 1. Install dependencies (already done)
npm install resend

# 2. Set environment variables
echo "RESEND_API_KEY=re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe" >> .env
echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> .env

# 3. Set Edge Function secrets
npx supabase login
npx supabase secrets set RESEND_API_KEY=re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe --project-ref ooihmwfsxvinrgeuapfl
npx supabase secrets set APP_URL=https://thetrustcircle.vercel.app --project-ref ooihmwfsxvinrgeuapfl
```

### Test It

```typescript
import { TrustCircleDB } from "./lib/supabase";
import { enableDeadHand } from "./lib/dead-hand";

const db = new TrustCircleDB(supabaseUrl, supabaseKey);

await enableDeadHand(db, capsuleId, {
  triggerDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  recipients: ["test@example.com"],
  ownerEmail: "owner@example.com"
});
```

### Manual Trigger

```bash
curl -X POST https://ooihmwfsxvinrgeuapfl.supabase.co/functions/v1/check-dead-hand \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## For Admins

### Configuration

1. Go to `/admin`
2. Enter **Resend API Key**: `re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe`
3. Click **Save Configuration**

### Monitoring

```sql
-- View all dead hand capsules
SELECT id, title, dead_hand_status, dead_hand_trigger_date
FROM capsules
WHERE dead_hand_trigger_date IS NOT NULL;

-- Check cron job
SELECT * FROM cron.job WHERE jobname = 'check-dead-hand-daily';

-- View execution history
SELECT * FROM cron.job_run_details WHERE jobid = 1 ORDER BY start_time DESC LIMIT 10;
```

### Troubleshooting

**Emails not sending?**
- Check Resend dashboard: https://resend.com/emails
- Verify API key is set
- Check rate limits (100/day)

**Cron not running?**
- View Edge Function logs
- Check `cron.job_run_details` for errors
- Verify function is deployed

## Key Files

- **Backend**: `lib/dead-hand.ts`, `lib/email.ts`
- **UI**: `components/DeadHandStatus.tsx`, `app/create/page.tsx`
- **Cron**: `supabase/functions/check-dead-hand/index.ts`
- **Schema**: `supabase/sql/dead-hand-schema.sql`
- **Docs**: `Doc/DEAD_HAND_*.md`

## API Reference

```typescript
// Enable
enableDeadHand(db, capsuleId, { triggerDate, recipients, ownerEmail })

// Reset
resetDeadHandDate(db, capsuleId, newDate)

// Disable
disableDeadHand(db, capsuleId)

// Status
getDeadHandStatus(db, capsuleId)
```

## Timeline

```
T-2 days: Warning email → Owner
T+0 days: Grace period starts
T+2 days: Auto unlock → Recipients
```

## Status Flow

```
null → warning_sent → grace_period → triggered
```

## That's It!

Dead Hand is ready to use. Create a capsule, enable dead hand, and test the workflow!
