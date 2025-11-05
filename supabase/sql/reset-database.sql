-- Complete Database Reset and Rebuild
-- WARNING: This will delete ALL data

-- Drop all triggers
DROP TRIGGER IF EXISTS vault_quota_check ON vaults;
DROP TRIGGER IF EXISTS capsule_quota_check ON capsules;
DROP TRIGGER IF EXISTS vault_quota_update ON vaults;
DROP TRIGGER IF EXISTS capsule_quota_update ON capsules;
DROP TRIGGER IF EXISTS vault_global_update ON vaults;
DROP TRIGGER IF EXISTS capsule_global_update ON capsules;
DROP TRIGGER IF EXISTS capsule_storage_detailed ON capsules;
DROP TRIGGER IF EXISTS vault_storage_detailed ON vaults;

-- Drop all functions
DROP FUNCTION IF EXISTS update_user_storage_quota();
DROP FUNCTION IF EXISTS update_global_storage();
DROP FUNCTION IF EXISTS check_storage_quota();
DROP FUNCTION IF EXISTS check_storage_warning(text);
DROP FUNCTION IF EXISTS update_user_storage_detailed();

-- Drop all tables
DROP TABLE IF EXISTS user_storage_detailed CASCADE;
DROP TABLE IF EXISTS user_storage_quota CASCADE;
DROP TABLE IF EXISTS global_storage_limits CASCADE;
DROP TABLE IF EXISTS vaults CASCADE;
DROP TABLE IF EXISTS capsules CASCADE;

-- Recreate capsules table
CREATE TABLE capsules (
  id uuid primary key default gen_random_uuid(),
  creator_pubkey text not null,
  approver_pubkey text not null,
  title text,
  notes text,
  payload_cid text not null,
  metadata jsonb not null,
  status text default 'locked',
  created_at timestamp default now(),
  unlocked_at timestamp,
  expires_at timestamp,
  dead_hand_trigger_date timestamp,
  dead_hand_status text,
  warning_sent_at timestamp,
  file_size bigint
);

CREATE INDEX idx_capsules_creator ON capsules(creator_pubkey);
CREATE INDEX idx_capsules_approver ON capsules(approver_pubkey);
CREATE INDEX idx_capsules_status ON capsules(status);
CREATE INDEX idx_capsules_creator_created ON capsules(creator_pubkey, created_at ASC);

ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read all capsules" ON capsules FOR SELECT USING (true);
CREATE POLICY "Anyone can insert capsules" ON capsules FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update capsules" ON capsules FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete capsules" ON capsules FOR DELETE USING (true);

-- Recreate vaults table
CREATE TABLE vaults (
  id uuid primary key default gen_random_uuid(),
  creator_pubkey text not null,
  title text not null,
  notes text,
  document_type text not null,
  issuer text not null,
  document_id text,
  payload_cid text not null,
  metadata jsonb not null,
  file_name text,
  file_size bigint,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

CREATE INDEX idx_vaults_creator ON vaults(creator_pubkey);
CREATE INDEX idx_vaults_document_type ON vaults(document_type);
CREATE INDEX idx_vaults_issuer ON vaults(issuer);
CREATE INDEX idx_vaults_created_at ON vaults(created_at DESC);
CREATE INDEX idx_vaults_creator_created ON vaults(creator_pubkey, created_at ASC);

ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read all vaults" ON vaults FOR SELECT USING (true);
CREATE POLICY "Anyone can insert vaults" ON vaults FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vaults" ON vaults FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete vaults" ON vaults FOR DELETE USING (true);

-- Recreate storage tables
CREATE TABLE global_storage_limits (
  storage_type text PRIMARY KEY,
  total_limit bigint NOT NULL,
  current_usage bigint DEFAULT 0,
  last_updated timestamp DEFAULT now()
);

INSERT INTO global_storage_limits (storage_type, total_limit) VALUES
  ('capsules', 1073741824),
  ('vaults', 1073741824);

ALTER TABLE global_storage_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read global limits" ON global_storage_limits FOR SELECT USING (true);
CREATE POLICY "System can update global limits" ON global_storage_limits FOR UPDATE USING (true);

CREATE TABLE user_storage_quota (
  creator_pubkey text PRIMARY KEY,
  total_size bigint DEFAULT 0,
  quota_limit bigint DEFAULT 262144000,
  last_updated timestamp DEFAULT now()
);

ALTER TABLE user_storage_quota ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read quota" ON user_storage_quota FOR SELECT USING (true);
CREATE POLICY "System can insert quota" ON user_storage_quota FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update quota" ON user_storage_quota FOR UPDATE USING (true);

-- Recreate functions
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
    RAISE EXCEPTION 'Global storage capacity reached. System is at 95%% capacity.';
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

-- Recreate triggers
CREATE TRIGGER vault_quota_check BEFORE INSERT ON vaults FOR EACH ROW EXECUTE FUNCTION check_storage_quota();
CREATE TRIGGER capsule_quota_check BEFORE INSERT ON capsules FOR EACH ROW EXECUTE FUNCTION check_storage_quota();
CREATE TRIGGER vault_quota_update AFTER INSERT OR DELETE ON vaults FOR EACH ROW EXECUTE FUNCTION update_user_storage_quota();
CREATE TRIGGER capsule_quota_update AFTER INSERT OR DELETE ON capsules FOR EACH ROW EXECUTE FUNCTION update_user_storage_quota();
CREATE TRIGGER vault_global_update AFTER INSERT OR DELETE ON vaults FOR EACH ROW EXECUTE FUNCTION update_global_storage();
CREATE TRIGGER capsule_global_update AFTER INSERT OR DELETE ON capsules FOR EACH ROW EXECUTE FUNCTION update_global_storage();
