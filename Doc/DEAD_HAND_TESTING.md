# Dead Hand Testing Documentation

## Test Suite Overview

Comprehensive test coverage for the Dead Hand feature including unit tests, integration tests, and email functionality tests.

## Test Files

### 1. `test/dead-hand.test.ts` - Core Functions
Tests for the main dead hand functions.

**Coverage:**
- `enableDeadHand()` - Enable dead hand with configuration
- `resetDeadHandDate()` - Reset trigger date
- `disableDeadHand()` - Disable dead hand completely
- `getDeadHandStatus()` - Get current status and calculations

**Tests (8 total):**
- ✅ Enable dead hand with valid config
- ✅ Handle multiple recipients
- ✅ Reset trigger date and clear status
- ✅ Clear all dead hand fields
- ✅ Return disabled status when not enabled
- ✅ Calculate days until trigger correctly
- ✅ Calculate warning date correctly
- ✅ Return current status

### 2. `test/dead-hand-email.test.ts` - Email Functions
Tests for Resend email integration.

**Coverage:**
- `sendOwnerWarning()` - Warning email to owner
- `sendRecipientNotification()` - Access email to recipients

**Tests (6 total):**
- ✅ Send warning email to owner
- ✅ Include capsule title in email
- ✅ Include reset link in email
- ✅ Send notification to single recipient
- ✅ Send notification to multiple recipients
- ✅ Include download link in email

### 3. `test/dead-hand-integration.test.ts` - Integration Tests
Tests for timeline logic, date calculations, and validation.

**Coverage:**
- Timeline flow and status transitions
- Date calculations (warning, grace period, trigger)
- Email validation
- Recipient list processing
- Status checks

**Tests (14 total):**
- ✅ Follow correct status transitions
- ✅ Calculate warning date as 2 days before trigger
- ✅ Calculate grace period end as 2 days after trigger
- ✅ Correctly calculate days until trigger
- ✅ Handle negative days for past triggers
- ✅ Validate single email format
- ✅ Validate multiple emails
- ✅ Reject invalid email format
- ✅ Parse comma-separated emails
- ✅ Handle extra whitespace
- ✅ Filter empty entries
- ✅ Identify warning phase
- ✅ Identify grace period
- ✅ Identify trigger condition

## Running Tests

### Run All Dead Hand Tests
```bash
npm test -- test/dead-hand
```

### Run Specific Test File
```bash
npm test -- test/dead-hand.test.ts
npm test -- test/dead-hand-email.test.ts
npm test -- test/dead-hand-integration.test.ts
```

### Run with Coverage
```bash
npm test -- --coverage test/dead-hand
```

### Watch Mode
```bash
npm test -- --watch test/dead-hand
```

## Test Results

```
Test Files  3 passed (3)
Tests       28 passed (28)
Duration    ~260ms
```

## Mock Strategy

### Database Mocking
```typescript
vi.mock('../lib/supabase', () => ({
  TrustCircleDB: class {
    updateDeadHand = mockUpdateDeadHand
    getCapsule = mockGetCapsule
  },
}))
```

### Email Mocking
```typescript
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockSend }
  },
}))
```

## Test Scenarios

### Scenario 1: Enable Dead Hand
```typescript
const config = {
  triggerDate: new Date('2025-12-31'),
  recipients: ['test@example.com'],
  ownerEmail: 'owner@example.com',
}
await enableDeadHand(db, capsuleId, config)
```

### Scenario 2: Reset Date
```typescript
const newDate = new Date('2026-06-30')
await resetDeadHandDate(db, capsuleId, newDate)
```

### Scenario 3: Check Status
```typescript
const status = await getDeadHandStatus(db, capsuleId)
// Returns: enabled, triggerDate, status, recipients, daysUntilTrigger, warningDate
```

### Scenario 4: Send Emails
```typescript
await sendOwnerWarning(email, capsuleId, title, resetLink)
await sendRecipientNotification(emails, capsuleId, title, downloadLink)
```

## Edge Cases Tested

1. **Multiple Recipients**: Handles arrays of email addresses
2. **Past Triggers**: Correctly calculates negative days
3. **Invalid Emails**: Validates email format
4. **Whitespace Handling**: Trims and filters recipient lists
5. **Null Values**: Returns disabled status when not configured
6. **Date Boundaries**: Tests exact 2-day calculations

## Integration Testing

### Timeline Verification
```
null → warning_sent → grace_period → triggered
```

### Date Calculations
- Warning Date = Trigger Date - 2 days
- Grace Period End = Trigger Date + 2 days
- Days Until Trigger = (Trigger - Now) / 86400000ms

### Status Checks
- Warning Phase: now >= warningDate && now < triggerDate
- Grace Period: now >= triggerDate && now < gracePeriodEnd
- Triggered: now >= gracePeriodEnd

## Manual Testing Checklist

### UI Testing
- [ ] Create capsule with dead hand enabled
- [ ] View dead hand status on dashboard
- [ ] Reset trigger date
- [ ] Disable dead hand
- [ ] Verify countdown display
- [ ] Test with multiple recipients
- [ ] Test email validation

### Backend Testing
- [ ] Database migration applied
- [ ] Cron job scheduled
- [ ] Edge function deployed
- [ ] Manual function trigger works
- [ ] Email delivery confirmed
- [ ] Status transitions correct

### End-to-End Testing
- [ ] Create capsule with trigger date 4 days from now
- [ ] Verify status shows "Active"
- [ ] Wait for warning email (or manually trigger)
- [ ] Verify status changes to "warning_sent"
- [ ] Reset date and verify status resets
- [ ] Let grace period expire (or manually trigger)
- [ ] Verify recipients receive emails
- [ ] Verify capsule status is "unlocked"

## Continuous Integration

Add to CI pipeline:
```yaml
- name: Run Dead Hand Tests
  run: npm test -- test/dead-hand
```

## Test Maintenance

### Adding New Tests
1. Create test file in `test/` directory
2. Follow naming convention: `dead-hand-*.test.ts`
3. Use existing mocks for consistency
4. Update this documentation

### Updating Tests
- Keep tests minimal and focused
- Mock external dependencies
- Test one thing per test
- Use descriptive test names

## Performance

- All tests run in ~260ms
- No external API calls (mocked)
- No database connections (mocked)
- Fast feedback loop for development

## Coverage Goals

- Core functions: 100%
- Email functions: 100%
- Integration logic: 100%
- Edge cases: Comprehensive

## Known Limitations

1. Email delivery not tested end-to-end (requires Resend account)
2. Cron job execution not tested (requires Supabase environment)
3. UI components not tested (requires React testing library)

## Future Test Enhancements

- [ ] E2E tests with Playwright
- [ ] Component tests for DeadHandStatus
- [ ] Load testing for cron job
- [ ] Email template rendering tests
- [ ] Database constraint tests
- [ ] Error handling tests
- [ ] Retry logic tests

## Debugging Tests

### View Test Output
```bash
npm test -- test/dead-hand --reporter=verbose
```

### Debug Single Test
```bash
npm test -- test/dead-hand.test.ts -t "should enable dead hand"
```

### Check Mock Calls
```typescript
console.log(mockUpdateDeadHand.mock.calls)
console.log(mockSend.mock.calls[0][0])
```

## Conclusion

The Dead Hand feature has comprehensive test coverage with 28 passing tests across 3 test files. All core functionality, email integration, and timeline logic are thoroughly tested with mocked dependencies for fast, reliable test execution.
