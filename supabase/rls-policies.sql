-- Enable Row Level Security
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

-- Function to set user context
CREATE OR REPLACE FUNCTION set_user_context(pubkey TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_pubkey', pubkey, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
