# Library Extraction Roadmap

## Goal
Extract reusable, framework-agnostic utilities from TrustCircle into a standalone library package.

## Phase 1: Setup Library Structure
- [x] Create packages directory
- [x] Initialize @trustcircle/core package
- [x] Setup package.json with minimal dependencies
- [x] Configure TypeScript for library build
- [x] Setup exports in index.ts

## Phase 2: Extract Core Modules
- [x] Extract crypto utilities (encryption, keys, signing)
- [x] Extract compression utilities
- [x] Extract validation utilities
- [x] Extract retry logic
- [x] Extract geolocation utilities
- [x] Extract keystore utilities

## Phase 3: Update TrustCircle to Use Library
- [x] Add local package dependency
- [x] Update imports in all files
- [x] Fix code quality issues
- [ ] Remove old lib files
- [ ] Test all functionality

## Phase 4: Testing & Validation
- [ ] Run existing tests
- [ ] Verify build works
- [ ] Verify Docker build works
- [ ] Manual testing of key features

## Status: Phase 3 Complete
All imports updated to use @trustcircle/core library. Ready for testing.

## Implementation Steps

### Step 1: Create Library Package Structure
```
packages/
└── core/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── crypto/
    │   ├── storage/
    │   ├── utils/
    │   └── index.ts
    └── README.md
```

### Step 2: Module Mapping
- `lib/crypto.ts` → `packages/core/src/crypto/index.ts`
- `lib/compression.ts` → `packages/core/src/utils/compression.ts`
- `lib/validation.ts` → `packages/core/src/utils/validation.ts`
- `lib/retry.ts` → `packages/core/src/utils/retry.ts`
- `lib/geolocation.ts` → `packages/core/src/utils/geolocation.ts`
- `lib/keystore.ts` → `packages/core/src/storage/keystore.ts`

### Step 3: Import Updates
Replace:
```typescript
import { aesGcmEncrypt } from './lib/crypto'
```
With:
```typescript
import { aesGcmEncrypt } from '@trustcircle/core'
```

## Dependencies to Move
- @noble/curves (crypto)
- fflate (compression)

## Success Criteria
- All tests pass
- Application builds successfully
- Docker image builds successfully
- No runtime errors
- Library can be used independently
