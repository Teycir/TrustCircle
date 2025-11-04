-- Complete RLS Setup with Security
-- Run this script in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own capsules" ON capsules;
DROP POLICY IF EXISTS "Users can create capsules" ON capsules;
DROP POLICY IF EXISTS "Approvers can unlock capsules" ON capsules;
DROP POLICY IF EXISTS "Creators can delete their capsules" ON capsules;
DROP POLICY IF EXISTS "Creators can update dead hand" ON capsules;

-- Drop function if exists
DROP FUNCTION IF EXISTS set_user_context(text);

-- Enable RLS
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read capsules where they are creator or approver
CREATE POLICY "Users can read own capsules"
ON capsules FOR SELECT
USING (
  creator_pubkey = current_setting('app.user_pubkey', true)
  OR approver_pubkey = current_setting('app.user_pubkey', true)
);

-- Policy: Users can insert capsules as creator
CREATE POLICY "Users can create capsules"
ON capsules FOR INSERT
WITH CHECK (
  creator_pubkey = current_setting('app.user_pubkey', true)
);

-- Policy: Approvers can update status
CREATE POLICY "Approvers can unlock capsules"
ON capsules FOR UPDATE
USING (
  approver_pubkey = current_setting('app.user_pubkey', true)
)
WITH CHECK (
  approver_pubkey = current_setting('app.user_pubkey', true)
  AND status IN ('locked', 'unlocked')
);

-- Policy: Creators can delete their capsules
CREATE POLICY "Creators can delete their capsules"
ON capsules FOR DELETE
USING (
  creator_pubkey = current_setting('app.user_pubkey', true)
);

-- Policy: Creators can update dead hand settings
CREATE POLICY "Creators can update dead hand"
ON capsules FOR UPDATE
USING (
  creator_pubkey = current_setting('app.user_pubkey', true)
)
WITH CHECK (
  creator_pubkey = current_setting('app.user_pubkey', true)
);
