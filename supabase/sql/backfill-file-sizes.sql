-- Backfill file_size for existing capsules and vaults
-- This sets a default size of 1MB for existing records without file_size
-- You can adjust this or query actual sizes from IPFS if needed

UPDATE capsules 
SET file_size = 1048576 
WHERE file_size IS NULL OR file_size = 0;

UPDATE vaults 
SET file_size = 1048576 
WHERE file_size IS NULL OR file_size = 0;

-- Update global storage limits to reflect current usage
UPDATE global_storage_limits
SET current_usage = (SELECT COALESCE(SUM(file_size), 0) FROM capsules)
WHERE storage_type = 'capsules';

UPDATE global_storage_limits
SET current_usage = (SELECT COALESCE(SUM(file_size), 0) FROM vaults)
WHERE storage_type = 'vaults';
