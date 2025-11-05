-- Storage Quota Management
-- Generic system for both capsules and vaults
-- Tracks per-user and global storage limits

-- Global storage limits for Pinata accounts
CREATE TABLE IF NOT EXISTS global_storage_limits (
  storage_type text PRIMARY KEY,
  total_limit bigint NOT NULL,
  current_usage bigint DEFAULT 0,
  last_updated timestamp DEFAULT now()
);

INSERT INTO global_storage_limits (storage_type, total_limit) VALUES
  ('capsules', 1073741824),
  ('vaults', 1073741824)
ON CONFLICT (storage_type) DO NOTHING;

ALTER TABLE global_storage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read global limits"
ON global_storage_limits FOR SELECT
USING (true);

-- User storage quota table
CREATE TABLE IF NOT EXISTS user_storage_quota (
  creator_pubkey text PRIMARY KEY,
  total_size bigint DEFAULT 0,
  quota_limit bigint DEFAULT 262144000,
  last_updated timestamp DEFAULT now()
);

ALTER TABLE user_storage_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quota"
ON user_storage_quota FOR SELECT
USING (creator_pubkey = current_setting('app.user_pubkey', true));

-- Generic function to update quota
CREATE OR REPLACE FUNCTION update_user_storage_quota()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_storage_quota (creator_pubkey, total_size)
    VALUES (NEW.creator_pubkey, COALESCE(NEW.file_size, 0))
    ON CONFLICT (creator_pubkey)
    DO UPDATE SET 
      total_size = user_storage_quota.total_size + COALESCE(NEW.file_size, 0),
      last_updated = now();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_storage_quota
    SET total_size = GREATEST(0, total_size - COALESCE(OLD.file_size, 0)),
        last_updated = now()
    WHERE creator_pubkey = OLD.creator_pubkey;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update global storage usage
CREATE OR REPLACE FUNCTION update_global_storage()
RETURNS TRIGGER AS $$
DECLARE
  v_storage_type text;
BEGIN
  IF TG_TABLE_NAME = 'capsules' THEN
    v_storage_type := 'capsules';
  ELSE
    v_storage_type := 'vaults';
  END IF;

  IF TG_OP = 'INSERT' THEN
    UPDATE global_storage_limits
    SET current_usage = current_usage + COALESCE(NEW.file_size, 0),
        last_updated = now()
    WHERE storage_type = v_storage_type;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE global_storage_limits
    SET current_usage = GREATEST(0, current_usage - COALESCE(OLD.file_size, 0)),
        last_updated = now()
    WHERE storage_type = v_storage_type;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Check storage before insert
CREATE OR REPLACE FUNCTION check_storage_quota()
RETURNS TRIGGER AS $$
DECLARE
  current_size bigint;
  quota bigint;
  new_size bigint;
  global_usage bigint;
  global_limit bigint;
  v_storage_type text;
BEGIN
  IF TG_TABLE_NAME = 'capsules' THEN
    v_storage_type := 'capsules';
  ELSE
    v_storage_type := 'vaults';
  END IF;

  SELECT current_usage, total_limit INTO global_usage, global_limit
  FROM global_storage_limits
  WHERE storage_type = v_storage_type;

  IF (global_usage + COALESCE(NEW.file_size, 0)) > (global_limit * 0.95) THEN
    RAISE EXCEPTION 'Global storage capacity reached. System is at 95%% capacity. New uploads are temporarily disabled.';
  END IF;

  SELECT total_size, quota_limit INTO current_size, quota
  FROM user_storage_quota
  WHERE creator_pubkey = NEW.creator_pubkey;

  IF NOT FOUND THEN
    current_size := 0;
    quota := 262144000;
  END IF;

  new_size := current_size + COALESCE(NEW.file_size, 0);

  IF new_size > quota THEN
    RAISE EXCEPTION 'Storage quota exceeded. Current: % bytes, Limit: % bytes', current_size, quota;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to check quota before insert
DROP TRIGGER IF EXISTS vault_quota_check ON vaults;
CREATE TRIGGER vault_quota_check
BEFORE INSERT ON vaults
FOR EACH ROW EXECUTE FUNCTION check_storage_quota();

DROP TRIGGER IF EXISTS capsule_quota_check ON capsules;
CREATE TRIGGER capsule_quota_check
BEFORE INSERT ON capsules
FOR EACH ROW EXECUTE FUNCTION check_storage_quota();

-- Triggers to update quota after insert/delete
DROP TRIGGER IF EXISTS vault_quota_update ON vaults;
CREATE TRIGGER vault_quota_update
AFTER INSERT OR DELETE ON vaults
FOR EACH ROW EXECUTE FUNCTION update_user_storage_quota();

DROP TRIGGER IF EXISTS capsule_quota_update ON capsules;
CREATE TRIGGER capsule_quota_update
AFTER INSERT OR DELETE ON capsules
FOR EACH ROW EXECUTE FUNCTION update_user_storage_quota();

-- Triggers to update global storage
DROP TRIGGER IF EXISTS vault_global_update ON vaults;
CREATE TRIGGER vault_global_update
AFTER INSERT OR DELETE ON vaults
FOR EACH ROW EXECUTE FUNCTION update_global_storage();

DROP TRIGGER IF EXISTS capsule_global_update ON capsules;
CREATE TRIGGER capsule_global_update
AFTER INSERT OR DELETE ON capsules
FOR EACH ROW EXECUTE FUNCTION update_global_storage();

-- Function to check if user is near quota (80%)
CREATE OR REPLACE FUNCTION check_storage_warning(user_pubkey text)
RETURNS jsonb AS $$
DECLARE
  current_size bigint;
  quota bigint;
  percentage numeric;
  total_global bigint;
  capsules_usage bigint;
  vaults_usage bigint;
BEGIN
  SELECT total_size, quota_limit INTO current_size, quota
  FROM user_storage_quota
  WHERE creator_pubkey = user_pubkey;

  IF NOT FOUND THEN
    current_size := 0;
    quota := 262144000;
  END IF;

  SELECT current_usage INTO capsules_usage
  FROM global_storage_limits
  WHERE storage_type = 'capsules';

  SELECT current_usage INTO vaults_usage
  FROM global_storage_limits
  WHERE storage_type = 'vaults';

  total_global := COALESCE(capsules_usage, 0) + COALESCE(vaults_usage, 0);
  percentage := (current_size::numeric / quota::numeric) * 100;

  RETURN jsonb_build_object(
    'warning', percentage >= 80,
    'percentage', ROUND(percentage, 2),
    'used', current_size,
    'limit', quota,
    'global_total', total_global,
    'global_capsules', COALESCE(capsules_usage, 0),
    'global_vaults', COALESCE(vaults_usage, 0)
  );
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_vaults_creator_created ON vaults(creator_pubkey, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_capsules_creator_created ON capsules(creator_pubkey, created_at ASC);

COMMENT ON TABLE global_storage_limits IS 'Global Pinata storage limits for capsules and vaults';
COMMENT ON FUNCTION check_storage_quota IS 'Blocks insert if user or global quota exceeded';
COMMENT ON FUNCTION check_storage_warning IS 'Returns storage usage and warning if over 80%';
COMMENT ON FUNCTION update_global_storage IS 'Updates global storage usage counters';
