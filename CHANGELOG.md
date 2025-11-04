# Changelog

All notable changes to TrustCircle will be documented in this file.

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
