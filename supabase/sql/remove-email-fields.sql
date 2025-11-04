-- Remove email-related columns from capsules table
-- These are no longer needed since we use in-app notifications

ALTER TABLE capsules
  DROP COLUMN IF EXISTS dead_hand_recipients,
  DROP COLUMN IF EXISTS owner_email;

-- Keep these columns as they are still used:
-- dead_hand_trigger_date - when to trigger auto-unlock
-- dead_hand_status - current status (null, warning_sent, grace_period, triggered)
-- warning_sent_at - timestamp when warning was created
