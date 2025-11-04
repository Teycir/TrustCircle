-- Add separate tracking for capsules and vaults per user
CREATE TABLE IF NOT EXISTS user_storage_detailed (
  creator_pubkey text PRIMARY KEY,
  capsules_size bigint DEFAULT 0,
  vaults_size bigint DEFAULT 0,
  total_size bigint DEFAULT 0,
  last_updated timestamp DEFAULT now()
);

ALTER TABLE user_storage_detailed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read storage"
ON user_storage_detailed FOR SELECT
USING (true);

-- Function to update detailed user storage
CREATE OR REPLACE FUNCTION update_user_storage_detailed()
RETURNS TRIGGER AS $$
DECLARE
  size_delta bigint;
BEGIN
  size_delta := COALESCE(NEW.file_size, 0);
  
  IF TG_OP = 'DELETE' THEN
    size_delta := -COALESCE(OLD.file_size, 0);
  END IF;

  IF TG_TABLE_NAME = 'capsules' THEN
    INSERT INTO user_storage_detailed (creator_pubkey, capsules_size, total_size)
    VALUES (COALESCE(NEW.creator_pubkey, OLD.creator_pubkey), size_delta, size_delta)
    ON CONFLICT (creator_pubkey)
    DO UPDATE SET 
      capsules_size = GREATEST(0, user_storage_detailed.capsules_size + size_delta),
      total_size = GREATEST(0, user_storage_detailed.total_size + size_delta),
      last_updated = now();
  ELSE
    INSERT INTO user_storage_detailed (creator_pubkey, vaults_size, total_size)
    VALUES (COALESCE(NEW.creator_pubkey, OLD.creator_pubkey), size_delta, size_delta)
    ON CONFLICT (creator_pubkey)
    DO UPDATE SET 
      vaults_size = GREATEST(0, user_storage_detailed.vaults_size + size_delta),
      total_size = GREATEST(0, user_storage_detailed.total_size + size_delta),
      last_updated = now();
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop old triggers
DROP TRIGGER IF EXISTS capsule_storage_detailed ON capsules;
DROP TRIGGER IF EXISTS vault_storage_detailed ON vaults;

-- Create new triggers
CREATE TRIGGER capsule_storage_detailed
AFTER INSERT OR DELETE ON capsules
FOR EACH ROW EXECUTE FUNCTION update_user_storage_detailed();

CREATE TRIGGER vault_storage_detailed
AFTER INSERT OR DELETE ON vaults
FOR EACH ROW EXECUTE FUNCTION update_user_storage_detailed();

-- Initialize data from existing capsules and vaults
INSERT INTO user_storage_detailed (creator_pubkey, capsules_size, vaults_size, total_size)
SELECT 
  creator_pubkey,
  COALESCE(SUM(file_size), 0) as capsules_size,
  0 as vaults_size,
  COALESCE(SUM(file_size), 0) as total_size
FROM capsules
GROUP BY creator_pubkey
ON CONFLICT (creator_pubkey) 
DO UPDATE SET 
  capsules_size = EXCLUDED.capsules_size,
  total_size = user_storage_detailed.total_size + EXCLUDED.capsules_size;

INSERT INTO user_storage_detailed (creator_pubkey, capsules_size, vaults_size, total_size)
SELECT 
  creator_pubkey,
  0 as capsules_size,
  COALESCE(SUM(file_size), 0) as vaults_size,
  COALESCE(SUM(file_size), 0) as total_size
FROM vaults
GROUP BY creator_pubkey
ON CONFLICT (creator_pubkey) 
DO UPDATE SET 
  vaults_size = EXCLUDED.vaults_size,
  total_size = user_storage_detailed.total_size + EXCLUDED.vaults_size;
