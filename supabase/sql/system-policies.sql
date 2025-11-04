-- System policies for automated operations without bypassing security
-- These allow edge functions to perform necessary operations with proper context

-- Policy: Allow reading capsules for dead hand checking
CREATE POLICY "System can read dead hand capsules"
ON capsules FOR SELECT
USING (
  dead_hand_trigger_date IS NOT NULL
);

-- Policy: Allow system to update dead hand status
CREATE POLICY "System can update dead hand status"
ON capsules FOR UPDATE
USING (
  dead_hand_trigger_date IS NOT NULL
)
WITH CHECK (
  dead_hand_trigger_date IS NOT NULL
);

-- Policy: Allow reading expired capsules for cleanup
CREATE POLICY "System can read expired capsules"
ON capsules FOR SELECT
USING (
  expires_at IS NOT NULL AND expires_at < NOW()
);

-- Policy: Allow deleting expired capsules
CREATE POLICY "System can delete expired capsules"
ON capsules FOR DELETE
USING (
  expires_at IS NOT NULL AND expires_at < NOW()
);
