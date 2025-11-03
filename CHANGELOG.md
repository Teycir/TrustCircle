# Changelog

All notable changes to TrustCircle will be documented in this file.

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
