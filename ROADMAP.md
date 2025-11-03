# TrustCircle Roadmap

This document outlines planned features and improvements for TrustCircle.

## Version 1.6.0 - Sharing & Discovery (Q1 2025)

### High Priority

#### 1. Shareable Capsule Links
- **Status**: Planned
- **Effort**: 30 minutes
- **Value**: High
- **Description**: Generate shareable URLs for capsules
  - Format: `trustcircle.app/capsule/[id]`
  - "Copy Link" button on create success page
  - Direct link access shows capsule details
  - Unlock button if user is the designated approver
- **Benefits**: Eliminates need to manually copy/paste capsule IDs

#### 2. Capsule Preview & Unlock Conditions
- **Status**: Planned
- **Effort**: 20 minutes
- **Value**: High
- **Description**: Display unlock requirements before attempting unlock
  - Show unlock date/time
  - Display location requirement if set
  - Countdown timer for time-locked capsules
  - Visual indicator of which conditions are met
- **Benefits**: Users understand why they can't unlock yet

#### 3. Quick Copy Capsule ID
- **Status**: Planned
- **Effort**: 10 minutes
- **Value**: Medium
- **Description**: One-click copy functionality
  - Copy button next to capsule ID on dashboard
  - Copy button on unlock page
  - Visual feedback (checkmark animation)
  - Toast notification on copy
- **Benefits**: Faster capsule sharing workflow

## Version 1.7.0 - Communication & Notifications (Q1 2025)

### Medium Priority

#### 4. Email Notifications
- **Status**: Planned
- **Effort**: 45 minutes
- **Value**: High
- **Description**: Automated email notifications via Supabase
  - Notify recipient when new capsule is sent to them
  - Notify creator when capsule is unlocked
  - Optional: Reminder when capsule becomes unlockable
  - Email preferences in user settings
- **Benefits**: Users stay informed without checking constantly
- **Technical**: Supabase Edge Functions + email service integration

#### 5. QR Code for Public Key
- **Status**: Planned
- **Effort**: 15 minutes
- **Value**: Medium
- **Description**: Generate QR code on identity page
  - Display QR code containing public key
  - Scan with phone camera to get key
  - "Show QR Code" button on identity page
  - Works for in-person key exchange
- **Benefits**: Easy face-to-face key sharing
- **Technical**: Use qrcode.react library

## Version 1.8.0 - Organization & Management (Q2 2025)

### Medium Priority

#### 6. Search & Filter Capsules
- **Status**: Planned
- **Effort**: 20 minutes
- **Value**: Medium
- **Description**: Enhanced capsule organization
  - Search by title, notes, or capsule ID
  - Filter by status (locked/unlocked)
  - Filter by date range
  - Sort by date, title, or status
- **Benefits**: Better management for power users with many capsules

#### 7. Capsule Expiration & Auto-Delete
- **Status**: Planned
- **Effort**: 30 minutes
- **Value**: Medium
- **Description**: Automatic capsule lifecycle management
  - Set expiration date when creating capsule
  - Auto-delete from IPFS and database after expiration
  - Warning notification before expiration
  - Optional: Extend expiration date
- **Benefits**: Automatic cleanup, enhanced privacy, reduced storage costs
- **Technical**: Supabase cron job or Edge Function

## Version 2.0.0 - Advanced Features (Q2 2025)

### Future Enhancements

#### 8. Multi-Recipient Capsules
- **Status**: Planned
- **Effort**: 2 hours
- **Value**: High
- **Description**: Share capsules with multiple approvers
  - Add multiple public keys when creating
  - Any approver can unlock
  - Track who unlocked and when
  - Group sharing functionality

#### 9. Capsule Templates
- **Status**: Planned
- **Effort**: 1 hour
- **Value**: Medium
- **Description**: Pre-configured capsule settings
  - Save frequently used unlock conditions
  - Quick create from template
  - Share templates with others
  - Common templates: "1 week delay", "Birthday surprise", etc.

#### 10. Mobile App
- **Status**: Planned
- **Effort**: 4-6 weeks
- **Value**: High
- **Description**: Native mobile applications
  - iOS and Android apps
  - Push notifications
  - Camera integration for QR codes
  - Biometric authentication
  - Offline key storage

#### 11. Browser Extension
- **Status**: Planned
- **Effort**: 2 weeks
- **Value**: Medium
- **Description**: Browser extension for quick access
  - Quick create capsule from any webpage
  - Encrypt selected text
  - Notification badge for new capsules
  - One-click unlock from extension

#### 12. Capsule Analytics
- **Status**: Planned
- **Effort**: 1 hour
- **Value**: Low
- **Description**: Usage statistics and insights
  - Total capsules created/received
  - Average unlock time
  - Storage usage over time
  - Most common unlock conditions

## Version 3.0.0 - Enterprise Features (Q3 2025)

### Long-term Vision

#### 13. Team Workspaces
- **Status**: Planned
- **Effort**: 3 weeks
- **Value**: High
- **Description**: Collaborative capsule management
  - Shared team workspaces
  - Role-based access control
  - Team member management
  - Audit logs

#### 14. API Access
- **Status**: Planned
- **Effort**: 2 weeks
- **Value**: Medium
- **Description**: Programmatic access to TrustCircle
  - RESTful API
  - API key management
  - Rate limiting
  - Webhook support
  - SDK for popular languages

#### 15. Self-Hosted Option
- **Status**: Planned
- **Effort**: 1 week
- **Value**: Medium
- **Description**: Deploy TrustCircle on your own infrastructure
  - Docker container
  - Configuration guide
  - Custom IPFS node support
  - Custom database support

## Contributing

Have ideas for new features? Open an issue on GitHub or submit a pull request!

## Priority Legend

- **High Priority**: Essential features that significantly improve user experience
- **Medium Priority**: Valuable features that enhance functionality
- **Low Priority**: Nice-to-have features for specific use cases

## Effort Estimates

- **< 30 min**: Quick wins, can be done in a single session
- **30 min - 2 hours**: Small features, can be completed in a day
- **2 hours - 1 week**: Medium features, require planning and testing
- **1+ weeks**: Large features, require significant development effort
