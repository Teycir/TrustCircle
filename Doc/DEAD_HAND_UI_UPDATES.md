# Dead Hand UI Updates

## Summary

Updated the TrustCircle UI to support Dead Hand functionality across capsule creation, admin configuration, and dashboard management.

## Files Updated

### 1. Create Capsule Page (`app/create/page.tsx`)

**Added Features:**
- Dead Hand configuration section with checkbox to enable
- Trigger date picker
- Owner email input for warning notifications
- Recipients email list (comma-separated)
- Informational help text explaining the 4-day timeline
- Automatic dead hand setup after capsule creation

**User Flow:**
1. User creates capsule as normal
2. Optionally enables "Dead Hand" checkbox
3. Sets trigger date (when dead hand activates)
4. Enters their email for warnings
5. Enters recipient emails (comma-separated)
6. On submit, capsule is created and dead hand is configured

**Timeline Display:**
```
• Warning email sent 2 days before trigger date
• 2 day grace period after trigger date
• Auto unlock and notify recipients if not reset
• You can reset the date anytime to prevent unlock
```

### 2. Admin Page (`app/admin/page.tsx`)

**Added Features:**
- Resend API key configuration field
- Stored in localStorage as `resend-api-key`
- Included in reset functionality
- Help text explaining it's for dead hand emails

**Configuration:**
- Field label: "Resend API Key (for Dead Hand emails)"
- Placeholder: "re_..."
- Masked by default (shown when "Show API keys" is checked)
- Saved to localStorage on "Save Configuration"

### 3. Dashboard Page (`app/dashboard/page.tsx`)

**Added Features:**
- Dead Hand status display for created capsules
- Shows current status, dates, and countdown
- Reset and disable buttons

**Integration:**
- DeadHandStatus component imported
- Displayed only on "Created by Me" tab
- Shows for each capsule with dead hand enabled

### 4. New Component: DeadHandStatus (`components/DeadHandStatus.tsx`)

**Features:**
- Displays dead hand configuration and status
- Color-coded status badges:
  - Blue: Active (normal state)
  - Yellow: Warning sent
  - Orange: Grace period
  - Red: Triggered (auto-unlocked)
- Shows trigger date, warning date, and countdown
- Lists number of recipients
- Reset date functionality with date picker
- Disable dead hand button
- Real-time status updates

**Status Display:**
```
Dead Hand Status                    [Active]
Trigger Date: Dec 31, 2024 12:00 PM
Warning Date: Dec 29, 2024 12:00 PM
90 days until trigger
Recipients: 2 email(s)

[Reset Date] [Disable]
```

## User Workflows

### Creating a Capsule with Dead Hand

1. Navigate to Create Capsule page
2. Fill in file, title, approver key, unlock conditions
3. Check "Enable automatic unlock if not reset"
4. Set trigger date (e.g., 90 days from now)
5. Enter your email for warnings
6. Enter recipient emails (comma-separated)
7. Click "Create Capsule"
8. Dead hand is automatically configured

### Managing Dead Hand from Dashboard

1. Navigate to Dashboard
2. View "Created by Me" tab
3. See dead hand status for each capsule
4. Click "Reset Date" to extend trigger date
5. Pick new date and confirm
6. Or click "Disable" to turn off dead hand

### Receiving Notifications

**Owner (2 days before trigger):**
- Email subject: "Dead Hand Warning: [Capsule Title] will unlock in 2 days"
- Contains reset link to dashboard
- Capsule ID included

**Recipients (after grace period):**
- Email subject: "Capsule Access: [Capsule Title]"
- Contains download link
- Capsule ID included

## Configuration Requirements

### Environment Variables

Add to `.env`:
```
RESEND_API_KEY=re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Admin Configuration

1. Navigate to `/admin`
2. Enter Resend API key
3. Click "Save Configuration"
4. Key stored in localStorage

## Visual Design

### Color Scheme
- **Active**: Blue (`bg-blue-50`, `border-blue-200`)
- **Warning Sent**: Yellow (`bg-yellow-50`, `border-yellow-200`)
- **Grace Period**: Orange (`bg-orange-50`, `border-orange-200`)
- **Triggered**: Red (`bg-red-50`, `border-red-200`)

### Layout
- Dead hand section in create form uses border-left accent
- Status component uses full-width card with rounded corners
- Buttons use gradient backgrounds matching app theme
- Responsive design for mobile and desktop

## Testing Checklist

- [ ] Create capsule without dead hand (should work as before)
- [ ] Create capsule with dead hand enabled
- [ ] Verify dead hand status appears on dashboard
- [ ] Test reset date functionality
- [ ] Test disable dead hand functionality
- [ ] Verify email validation for recipients
- [ ] Test with multiple recipient emails
- [ ] Verify admin page saves Resend API key
- [ ] Test on mobile devices
- [ ] Verify countdown displays correctly

## Future Enhancements

- Visual countdown timer with progress bar
- Email preview before sending
- Bulk dead hand management (reset multiple capsules)
- Dead hand templates (30 days, 90 days, 1 year)
- Notification preferences (email frequency)
- SMS notifications option
- Dead hand analytics (how many resets, average interval)

## Notes

- Dead hand configuration is optional
- Existing capsules without dead hand continue to work normally
- Dead hand can be disabled at any time
- Resetting the date resets the status to "active"
- Recipients list can be updated by disabling and re-enabling
- All dates are displayed in user's local timezone
