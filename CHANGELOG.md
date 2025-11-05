# Changelog

All notable changes to TrustCircle will be documented in this file.

## [2.8.0] - 2025-01-09

### Added
- Separate VaultManager class for better code organization
- Common storage utilities module for shared functions
- Eternal IPFS verification links for vaults independent of website
- Verification JSON files uploaded to IPFS with vault metadata
- FAQ explaining difference between Vault ID and CID
- Comprehensive CID vs Vault ID documentation in README

### Changed
- Refactored vault creation to use dedicated VaultManager
- Extracted common encryption and storage functions to storage-common module
- Vault verification now uses direct IPFS links instead of website URLs
- Improved mobile responsiveness for storage display and dashboard tabs
- Storage display shows abbreviated "TC" on mobile devices
- Reduced storage decimal precision from 2 to 1 for compact display

### Fixed
- Ambiguous storage_type column reference in SQL triggers
- RLS policies for user_storage_quota and global_storage_limits tables
- Mobile layout issues with storage frame and navigation
- Dashboard tabs now scroll horizontally on mobile

### Removed
- Obsolete 'total' storage_type from global_storage_limits table
- Unused imports in capsule and vault modules

## [2.7.1] - 2025-01-09

### Changed
- Simplified storage display to show only total Pinata storage
- Storage now displays used/max format for both capsules and vaults
- Changed capsule icon from box to lock emoji to match card design
- Improved storage precision to 2 decimal places

### Removed
- Per-user storage tracking in favor of total storage only
- Database-based storage calculations replaced with Pinata API

## [2.7.0] - 2025-01-09

### Added
- Storage usage display in navigation bar on home page and dashboard
- Real-time Pinata storage usage from API
- Storage FAQ section with limits and usage information
- Granular storage display for capsules and vaults

### Changed
- Improved FAQ interaction with single-click responsiveness
- Storage data now fetched from Pinata API for accuracy
- Optimized storage loading with proper async handling

### Fixed
- FAQ cards now respond instantly without lag
- Storage display shows actual file sizes from IPFS
- Removed blocking operations from page load

## [2.6.0] - 2025-01-09

### Added
- Professional Vault feature for document storage with cryptographic proof
- Separate vaults table in database for better performance and security
- Create Vault page with gold theme and safe icon
- Vaults tab in Dashboard with vault specific display
- Vault view page with document download and metadata display
- Public verification page for shareable proof of document existence
- Vault CRUD operations in database layer
- Document metadata fields: document type issuer document ID
- Gold gradient theme for all vault related UI
- IPFS storage integration for vault documents

### Changed
- Dashboard now supports three tabs: Created Sent and Vaults
- Main page includes Create Vault card alongside Create Capsule

## [2.5.0] - 2025-01-09

### Added
- Configuration stored in Supabase app_config table
- IndexedDB caching for offline config support
- ConfigLoader component for automatic config initialization
- Offline mode sync on reconnection
- Styled tooltips for checkbox options with white background and rounded edges
- CacheProvider wrapper in root layout

### Changed
- Removed admin panel UI completely
- Configuration now loaded from database into global variable
- Environment variables used only for initial Supabase connection
- Improved UI with tooltips explaining Dead Hand and location features
- Removed "Dead Hand Configuration" label for cleaner interface

### Fixed
- TypeScript error in unlock page with null identity check
- Cache provider missing error by adding to root layout

### Removed
- Admin page and all references from main page
- Admin FAQ section
- LocalStorage config management

## [2.4.0] - 2025-01-08

### Added
- Comprehensive caching system for analytics, capsule lists, and individual capsules
- Database-level aggregation for analytics queries
- Parallel query execution with Promise.all

### Changed
- Removed RPC dependencies for simpler architecture
- Optimized analytics page with 95% reduction in data transfer
- Updated README with current features and architecture

### Performance
- Analytics: First load ~200ms, cached loads <1ms
- Dashboard: Instant tab switching with 5-minute cache
- Capsule details: Cached for 5 minutes with smart invalidation

### Removed
- RPC function `set_user_context` from SQL files
- Unnecessary documentation files from root directory

## [2.3.0] - 2025-01-XX

### Added
- Complete location lock feature with privacy-preserving hash storage
- Beautiful gradient buttons across entire app
- Default unlock date set to yesterday for easy testing

### Fixed
- Storage calculation for accurate usage display
- Newest capsules appear first on dashboard
- Enhanced security with proper error handling

### Improved
- Mobile responsiveness across all pages

## [2.2.0] - 2024-XX-XX

### Added
- Dead Hand Protocol with automatic unlock
- Email notifications for warnings and unlocks
- Dead Hand status component in dashboard
- Grace period and warning system

### Changed
- Enhanced dashboard with dead hand alerts
- Improved capsule management UI

## [2.1.0] - 2024-XX-XX

### Added
- Analytics page with usage statistics
- Search and filter functionality in dashboard
- QR code sharing for public keys
- Auto-expiration for capsules

### Improved
- Dashboard layout and organization
- Error handling and user feedback

## [2.0.0] - 2024-XX-XX

### Added
- Complete rewrite with Next.js 14 App Router
- Client-side encryption with AES-256-GCM
- Time-based and location-based unlocking
- IPFS storage via Pinata
- Supabase for metadata storage
- IndexedDB for local key storage

### Changed
- Modern gradient UI design
- Improved mobile responsiveness
- Better error messages

## [1.0.0] - 2024-XX-XX

### Added
- Initial release
- Basic capsule creation and unlocking
- Ed25519 and X25519 key generation
- Simple UI
