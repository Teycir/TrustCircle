# Changelog

All notable changes to TrustCircle will be documented in this file.

## [2.10.2] - 2025-01-11

### Fixed

- Storage display now uses real-time pinList API instead of cached userPinnedDataTotal API
- IPFS verification on vault and capsule listing to auto-cleanup deleted files from database
- Vault delete functionality with proper button styling matching capsule design
- Storage display format changed to 0.00 (2 decimal places) in dashboard
- Removed storage display from main page navigation

### Changed

- listVaults and listCapsules now verify file existence on IPFS before returning
- Database records automatically cleaned when IPFS files no longer exist
- Storage tooltips show exact byte count and cache delay warning
- Dashboard storage refreshes every 30 seconds and after data operations

### Added

- Storage separation test script for verifying capsule and vault account isolation
- Delete buttons for vaults in dashboard and vault detail pages
- Gray gradient styling for vault delete buttons

## [2.10.1] - 2025-01-09

### Removed

- Dead email service (lib/email.ts, test files, resend dependency)
- Unused streaming module (lib/streaming.ts)
- Development-only SQL files (disable-rls-for-development.sql, permissive-insert-policy.sql)
- Applied migration file (remove-email-fields.sql)

### Changed

- Cleaned up package.json dependencies

## [2.10.0] - 2025-01-09

### Added

- Docker support with production-ready containerization
- Multi-stage Dockerfile for optimized image size
- docker-compose.yml for easy deployment
- .dockerignore for efficient build context
- DOCKER.md comprehensive deployment guide
- DOCKER_STATUS.md with current installation status
- Multiple port mappings (3001-3004) for flexibility
- Health checks with wget every 30 seconds
- Auto-restart policy for high availability

### Changed

- Updated README with Docker deployment option as recommended method
- Supabase client now uses placeholder values during build for security
- API keys injected at runtime only, never baked into Docker image
- Removed obsolete version field from docker-compose.yml

### Security

- Docker images contain only placeholder credentials
- Real API keys loaded from environment at container startup
- Non-root user execution in container (nextjs:nodejs)
- Image can be shared publicly without exposing secrets

## [2.9.0] - 2025-01-09

### Added

- Storage warning banners on Create Capsule and Create Vault pages
- Warning at 80% storage usage with usage statistics
- Critical alert at 95% storage capacity blocking uploads
- Comprehensive storage stress testing suite
- Unit tests for storage quota enforcement with Vitest
- Integration script for real-world storage stress testing
- Database-level SQL tests for quota enforcement
- Storage monitoring scripts and utilities
- npm scripts for storage testing: test:storage, test:stress, storage:check

### Changed

- Storage warnings now display real-time usage percentages
- Enhanced user feedback for storage capacity issues

### Dependencies

- Added tsx for TypeScript execution
- Added dotenv for environment variable management

## [2.8.2] - 2025-01-09

### Added

- FAQ explaining the two CIDs in vaults (Encrypted File CID vs Verification CID)
- FAQ about IPFS gateways and multiple gateway options
- FAQ clarifying TrustCircle's independence from Pinata
- File name now stored with capsule metadata
- Emoji icons for dashboard tabs (🔒 for Created, 📨 for Sent)

### Changed

- Improved README documentation for vault CID explanation
- Enhanced IPFS gateway independence documentation
- Simplified home page tagline to "Secure file storage and sharing"
- Refactored unlock page variable names for better clarity

### Fixed

- Better separation of encrypted content vs public verification proof concepts

## [2.8.1] - 2025-01-09

### Added

- Comprehensive SEO metadata with Open Graph and Twitter Cards
- PWA manifest.json for installable mobile app experience
- Dynamic sitemap.ts for search engine indexing
- robots.txt for crawler instructions
- Favicon with gradient lock icon
- Global ErrorBoundary component for graceful error handling
- App shortcuts for quick access to Create and Dashboard

### Changed

- Enhanced metadata with 14 relevant keywords
- Improved type safety by replacing `any` with `unknown` and `Record<string, unknown>`
- Better structured metadata with title templates
- Added canonical URLs and format detection settings

### Fixed

- Type safety in cache, validation, and capsule modules
- Proper TypeScript types for location condition checking

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
