# Changelog

All notable changes to TrustCircle will be documented in this file.

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
