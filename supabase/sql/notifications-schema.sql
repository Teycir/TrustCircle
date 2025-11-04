-- Notifications table for in-app Dead Hand alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_notifications_capsule ON notifications(capsule_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read notifications for their capsules"
ON notifications FOR SELECT
USING (
  capsule_id IN (
    SELECT id FROM capsules 
    WHERE creator_pubkey = current_setting('app.user_pubkey', true)
    OR approver_pubkey = current_setting('app.user_pubkey', true)
  )
);

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
ON notifications FOR UPDATE
USING (
  capsule_id IN (
    SELECT id FROM capsules 
    WHERE creator_pubkey = current_setting('app.user_pubkey', true)
    OR approver_pubkey = current_setting('app.user_pubkey', true)
  )
);
