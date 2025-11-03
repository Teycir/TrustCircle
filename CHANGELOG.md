# Changelog

All notable changes to TrustCircle will be documented in this file.

## [2.1.0] - 2025-11-03

### Added
- **Offline-First Capabilities**: Full functionality without internet connectivity
  - IndexedDB for local capsule storage
  - Operation queue for offline actions
  - Auto-sync every 30 seconds when online
  - Instant sync when connection restored
  - Visual offline indicator banner
  - Service worker for static asset caching
  - React hooks for offline state management

- **Admin Configuration Panel**: Runtime API key management
  - Admin page at /admin for updating API keys
  - Configure Pinata JWT token
  - Configure Supabase URL and anon key
  - Settings stored in browser localStorage
  - Auto-populate from environment variables
  - Show/hide API keys toggle
  - Reset to environment variables option
  - Dynamic client reconfiguration on config change

### Technical
- Added idb library for IndexedDB wrapper
- Created offline manager with sync queue
- Service worker for offline caching
- Config manager with localStorage persistence
- Client singleton with dynamic reconfiguration
- Offline indicator and sync manager components

## [2.0.0] - 2025-01-29

### Added
- **Capsule Analytics**: Usage statistics and insights dashboard
  - Total capsules created and received
  - Total capsules unlocked
  - Average days to unlock
  - Capsules expiring soon count
  - Unlock rate percentage
  - Accessible from home page

## [1.8.0] - 2025-01-29

### Added
- **Capsule Expiration & Auto-Delete**: Automatic capsule lifecycle management
  - Optional expiration date field when creating capsules
  - Auto-delete from IPFS and database after expiration
  - Expiration date display on dashboard with warning for capsules expiring within 7 days
  - Supabase Edge Function for automated cleanup
  - Database schema updated with expires_at column and index

### Technical
- Added expires_at column to capsules table
- Created cleanup-expired Edge Function for daily cron job
- Added deleteExpiredCapsules method to TrustCircleDB
- Updated CapsuleRecord interface with expires_at field

## [1.7.0] - 2025-01-29

### Added
- **QR Code for Public Key**: Generate QR code on identity page for easy in-person key sharing
  - Show/Hide QR Code toggle button
  - 200x200 SVG QR code display
  - Scan with phone camera to get public key
  - Perfect for face-to-face key exchange

- **Search & Filter Capsules**: Enhanced dashboard with search and filter capabilities
  - Search by title, notes, or capsule ID
  - Real-time search as you type
  - Filter by status: All, Locked, Unlocked
  - Visual feedback when no capsules match filters
  - Better management for users with many capsules

### Dependencies
- Added qrcode.react for QR code generation

## [1.6.1] - 2025-01-29

### Added
- **Delete Identity**: Added ability to delete current identity to import old backups
  - Delete button on Identity page with confirmation dialog
  - Clears identity from IndexedDB to allow fresh import
  - Enables recovery of old capsules with backup files

### Improved
- **Unlock Page Workflow**: Simplified lock/unlock workflow
  - Lock/Unlock toggle button shows current state (green for unlock, yellow for lock)
  - Download button always visible, enabled when capsule is unlocked
  - Removed confusing intermediate states
  - Status based on database state, not client-side memory

- **Mobile Responsiveness**: Made entire app mobile-friendly
  - Responsive padding and text sizes across all pages
  - Buttons wrap and resize appropriately on small screens
  - Flex layouts stack vertically on mobile
  - Optimized spacing for mobile devices

### Fixed
- **Dashboard Loading**: Fixed infinite loading state when no identity exists
- **Button Size Consistency**: Fixed buttons changing size during state transitions
- **Code Quality**: Fixed SonarQube warnings
  - Used optional chaining for null checks
  - Fixed TypeScript compilation errors
  - Improved error handling

## [1.6.0] - 2025-01-29

### Added
- **Shareable Capsule Links**: Generate and share direct URLs to capsules
  - Format: trustcircle.app/capsule/[id]
  - Copy Link button on create success page
  - Copy Link button on dashboard for each capsule
  - Dedicated capsule detail page with full information
  - Direct unlock capability for designated approvers
  - Share capsules without manually copying IDs

- **Capsule Preview & Unlock Conditions**: Display unlock requirements before attempting unlock
  - Shows unlock date and time with countdown timer
  - Displays location requirement if set
  - Real-time countdown for time-locked capsules
  - Visual indicators for met and unmet conditions
  - Appears on dashboard, unlock page, and capsule detail page
  - Helps users understand why they cannot unlock yet

- **Quick Copy Capsule ID**: One-click copy functionality
  - Copy button next to capsule ID on dashboard
  - Copy button on unlock page
  - Copy button on capsule detail page
  - Visual feedback with checkmark animation
  - Faster capsule sharing workflow

### Improved
- **Create Page Success**: Enhanced success message with shareable link
  - Prominent display of capsule ID and share link
  - Quick copy buttons for both ID and link
  - View Capsule button to see details immediately
  - Better visual design with icons and color coding

- **Dashboard**: Enhanced capsule cards with more information
  - Copy ID and Copy Link buttons for each capsule
  - View Details link to dedicated capsule page
  - Unlock conditions preview for received capsules
  - Better visual organization and spacing

- **Unlock Page**: Improved capsule list with unlock conditions
  - Shows unlock requirements for each locked capsule
  - Copy button for quick ID sharing
  - Countdown timers for time-locked capsules
  - Better understanding of unlock status

## [1.5.0] - 2025-01-29

### Added
- **Unlock Page Improvements**: Enhanced unlock workflow with separate unlock/lock/download actions
  - Unlock button decrypts capsule and stores data in memory
  - Separate Download button for user-controlled downloads
  - Lock button transforms from Unlock after successful decryption
  - Lock button clears decrypted data and updates database status
  - Multiple capsules can be unlocked simultaneously
  - Status syncs with Supabase database

- **Create Page Enhancement**: Added "Use My Key" button
  - Auto-fills approver key field with user's own public key
  - Useful for testing capsules with yourself
  - Prevents data loss from navigating to Identity page

### Fixed
- **Unlock State Management**: Fixed inconsistent lock/unlock button states
  - Buttons now properly reflect database status
  - Handles capsules unlocked in previous sessions
  - Shows Lock button for unlocked capsules without decrypted data in memory

## [1.4.0] - 2025-01-29

### Added
- **Authentication Protection**: Implemented route protection to prevent unauthorized access
  - Created ProtectedRoute component for client-side authentication checks
  - Protected dashboard, create, unlock, and identity pages
  - Automatic redirect to login for unauthenticated users
  - Configured Supabase client with proper session persistence
  - Added authentication test suite

### Fixed
- **Session Persistence**: Fixed authentication state not persisting across page navigation
  - Enabled autoRefreshToken and persistSession in Supabase client
  - Configured localStorage for session storage
  - Removed problematic server-side middleware causing redirect loops

### Dependencies
- Added @supabase/ssr for server-side authentication support

## [1.3.0] - 2025-01-29

### Added
- **UI/UX Improvements**:
  - Replaced static "How It Works" with collapsible FAQ component on home page
  - Added FAQ explaining how to send capsules to recipients
  - Redesigned Identity page with color-coded sections for sharing and backup
  - Added "Save as TXT" button to export public key as text file
  - Added "Export Full Backup" button for complete key backup as JSON
  - Improved security status display with 3 clear checkpoints

- **Dashboard Improvements**:
  - Changed "Received" tab to "Sent to Me" for clarity
  - Better visual organization of capsule lists

- **Unlock Page Redesign**:
  - Complete redesign showing list of available capsules
  - Display capsule title, status, date, time, and ID for each capsule
  - One-click unlock and automatic download
  - Added delete button for each capsule
  - Enhanced error messages with common reasons for unlock failures
  - Removed manual ID entry in favor of visual selection

- **Create Page Improvements**:
  - Added quick link to Identity page to get approver's public key
  - Added step-by-step instructions for obtaining approver's key
  - Blue info box with clear 4-step process

- **Delete Functionality**:
  - Added deleteCapsule method to database client
  - Automatic deletion of IPFS files when capsule is deleted
  - Added unpin method to Pinata client for storage cleanup
  - Confirmation dialog before deletion

### Fixed
- **Code Quality**:
  - Removed all trailing whitespace from TypeScript files
  - Extracted nested ternary operations into independent statements
  - Added DOM library to tsconfig for browser API support

## [1.2.0] - 2025-01-29

### Added
- **Branding**: Updated app name from "TrustCircle Lite" to "TrustCircle"
  - Added 🔐 icon to navigation across all pages
  - Added favicon with lock icon to browser tab
- **Storage Management**: Automatic purge system for Pinata storage
  - Monitors storage usage and purges oldest files when approaching 90% capacity
  - Dynamically detects storage limits from Pinata API
  - Reduces storage to 70% when purge is triggered
  - Pre-upload validation to prevent exceeding available space
  
- **UI Improvements**:
  - Storage usage display in navigation bar showing used/total space
  - Required title field for capsule creation
  - Timestamp appended to filenames to distinguish duplicate uploads
  - Original filename preserved on download with timestamp
  - Consistent branding with lock icon across all pages
  
- **Configuration**:
  - Added support for NEXT_PUBLIC_PINATA_JWT environment variable
  - Updated Tailwind CSS to v4 with new @import syntax
  - Fixed PostCSS configuration for Tailwind v4 compatibility
  - Added path aliases to tsconfig.json for @/ imports

### Fixed
- **Database**: Created missing Supabase capsules table with proper schema
- **Key Format**: Simplified public key format to use both ed25519 and x25519 keys
- **File Naming**: Fixed Pinata uploads defaulting to "blob" by adding proper filenames

### Testing
- Added purge.test.ts for storage management validation
- Verified storage usage monitoring and purge functionality

## [1.1.0] - 2025-01-02

### Security Fixes
- **CRITICAL**: Fixed timing attack vulnerability (CWE-208) in policy.ts signature comparison
  - Added constant-time comparison function for hash verification
  - Prevents attackers from using timing differences to guess valid hashes
  
- **HIGH**: Fixed loose file permissions issue (CWE-732) in geolocation.ts
  - Added coordinate validation to prevent invalid values
  - Added proper timeout handling with cleanup
  - Validates latitude (-90 to 90) and longitude (-180 to 180) ranges

### Error Handling Improvements
- **retry.ts**: Properly initialized lastError variable and added input validation
- **crypto.ts**: Added comprehensive input validation for all cryptographic functions
  - Validates key lengths (32 bytes for AES/X25519, 12 bytes for nonces)
  - Validates data integrity before operations
  - Added proper error messages for debugging
  
- **keystore.ts**: Enhanced IndexedDB operations with try-finally blocks
  - Ensures database connections are always closed
  - Added input validation for all operations
  - Improved error messages for failed operations
  
- **client.ts**: Added environment variable validation
  - Throws clear errors if required configuration is missing
  - Validates inputs before file operations
  
- **compression.ts**: Added error handling with try-catch blocks
  - Validates input data before compression/decompression
  - Provides clear error messages on failure
  
- **hooks.ts**: Added error handling in useEffect for identity loading
  - Prevents silent failures during initialization
  - Logs errors for debugging
  
- **ErrorMessage.tsx**: Added null/undefined checks
  - Handles edge cases gracefully
  - Provides fallback error messages

### Performance Improvements
- **crypto.ts**: Fixed memory leak in nonce cache
  - Limited cache size to 10,000 entries
  - Automatically clears cache when limit is reached
  - Prevents unbounded memory growth in long-running sessions

### Code Quality
- Added input validation across all modules
- Improved error messages for better debugging
- Enhanced type safety with proper null checks
- Removed unused error parameters

### Testing
- All 56 tests passing
- 9 test suites covering all modules
- Verified all fixes with existing test suite

### Documentation
- Removed redundant documentation files
- Consolidated security information
- Updated changelog with all changes

## [1.0.0] - 2025-11-02

### Initial Release
- Client-side encryption with AES-256-GCM
- Ed25519 signatures for metadata integrity
- X25519 key agreement for CMK wrapping
- Policy-based unlocking (date and location)
- IPFS storage via Pinata
- Supabase metadata storage
- IndexedDB key persistence
- Compression with fflate
- Next.js 14 with App Router
- Tailwind CSS UI
- Comprehensive test suite
