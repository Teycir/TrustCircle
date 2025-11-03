# Authentication Implementation Guide

## What Was Implemented

### Phase 1: Import Functionality ✅
- Added `importKeys` function to `lib/hooks.ts`
- Updated Identity page with import UI
- Users can now import exported key files

### Phase 2: Database Schema ✅
- Created `supabase/auth-schema.sql`
- Added `user_public_keys` table
- Added `creator_user_id` and `approver_user_id` to capsules
- Updated RLS policies for authenticated access

### Phase 3: Auth Utilities ✅
- Created `lib/auth.ts` with sign up, sign in, sign out functions
- Added public key sync functions
- Created `lib/useAuth.ts` hook for auth state management

### Phase 4: Auth Pages ✅
- Created `/login` page
- Created `/signup` page
- Added auth UI to home page navigation
- Integrated auth with Identity page

## Setup Instructions

### 1. Enable Supabase Auth

In your Supabase project dashboard:
1. Go to Authentication → Settings
2. Enable Email provider
3. Configure email templates if needed

### 2. Run Database Migration

Execute the SQL in `supabase/auth-schema.sql`:

```bash
psql -h your-project.supabase.co -U postgres -d postgres -f supabase/auth-schema.sql
```

Or run it directly in Supabase SQL Editor.

### 3. Test the Flow

**New User:**
1. Visit `/signup`
2. Create account
3. Go to `/identity`
4. Generate keys (auto-syncs public keys to server)

**Existing User on New Device:**
1. Visit `/login`
2. Sign in
3. Go to `/identity`
4. Import keys from backup file
5. Public keys auto-sync to server

## Architecture

```
Authentication Flow:
├─ User signs up/in (Supabase Auth)
├─ Keys generated/imported locally (IndexedDB)
├─ Public keys synced to server (user_public_keys table)
└─ Private keys NEVER leave browser

Key Storage:
├─ Private keys: IndexedDB (local only)
├─ Public keys: Supabase (for discovery)
└─ User profile: Supabase Auth

Security Model:
├─ Zero-knowledge: Server never sees private keys
├─ Auth gates access to app features
├─ Public keys enable user discovery
└─ Import/export for portability
```

## Next Steps

### Optional Enhancements

1. **User Discovery**
   - Add user search by email
   - Show user email instead of raw public keys
   - "Send to user" feature

2. **Protected Routes**
   - Add middleware to require auth for certain pages
   - Redirect to login if not authenticated

3. **Email Verification**
   - Enable email confirmation in Supabase
   - Add verification flow

4. **Password Reset**
   - Add forgot password page
   - Implement reset flow

5. **Profile Management**
   - Add profile page
   - Allow updating email/password
   - Show linked devices

## Testing

1. Sign up with new account
2. Generate keys on Identity page
3. Export keys
4. Sign out
5. Sign in from different browser/device
6. Import keys
7. Verify public keys synced to server

## Security Notes

- Private keys stored in IndexedDB (browser-specific)
- Public keys stored in Supabase (for discovery)
- Auth required to access app features
- Keys portable via export/import
- Zero-knowledge architecture maintained
