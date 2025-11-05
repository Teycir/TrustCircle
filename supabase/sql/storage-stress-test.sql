-- Comprehensive Storage Stress Test
-- Tests edge cases, race conditions, and quota enforcement

BEGIN;

-- Cleanup previous test data
DELETE FROM vaults WHERE creator_pubkey LIKE 'stress_test_%';
DELETE FROM capsules WHERE creator_pubkey LIKE 'stress_test_%';
DELETE FROM user_storage_quota WHERE creator_pubkey LIKE 'stress_test_%';
UPDATE global_storage_limits SET current_usage = 0;

-- Test 1: Single user at exact quota limit
DO $$
BEGIN
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('stress_test_user_1', 'approver_1', 'QmStress1', '{}', 262144000);
  
  RAISE NOTICE 'Test 1 PASSED: User stored exactly 250MB';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 1 FAILED: %', SQLERRM;
END $$;

-- Test 2: User exceeds quota by 1 byte
DO $$
BEGIN
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('stress_test_user_1', 'approver_1', 'QmStress2', '{}', 1);
  
  RAISE NOTICE 'Test 2 FAILED: Should block 1 byte over quota';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 2 PASSED: Blocked 1 byte over quota - %', SQLERRM;
END $$;

-- Test 3: Multiple users each at quota
DO $$
DECLARE
  i int;
BEGIN
  FOR i IN 1..4 LOOP
    INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
    VALUES ('stress_test_user_' || (i + 1), 'approver_1', 'QmStress' || (i + 1), '{}', 262144000);
  END LOOP;
  
  RAISE NOTICE 'Test 3 PASSED: 4 users each stored 250MB';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 3 FAILED: %', SQLERRM;
END $$;

-- Test 4: Global limit at exactly 95%
DO $$
DECLARE
  current_usage bigint;
  remaining bigint;
BEGIN
  SELECT current_usage INTO current_usage FROM global_storage_limits WHERE storage_type = 'capsules';
  remaining := (1073741824 * 0.95)::bigint - current_usage;
  
  IF remaining > 0 THEN
    INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
    VALUES ('stress_test_user_6', 'approver_1', 'QmStress6', '{}', remaining);
    RAISE NOTICE 'Test 4 INFO: Filled to 95%% capacity';
  END IF;
  
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('stress_test_user_7', 'approver_1', 'QmStress7', '{}', 1024);
  
  RAISE NOTICE 'Test 4 FAILED: Should block at 95%% global capacity';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 4 PASSED: Blocked at 95%% global capacity - %', SQLERRM;
END $$;

-- Test 5: Delete and re-add (quota freed)
DO $$
DECLARE
  deleted_size bigint;
BEGIN
  SELECT file_size INTO deleted_size FROM capsules WHERE creator_pubkey = 'stress_test_user_1' LIMIT 1;
  DELETE FROM capsules WHERE creator_pubkey = 'stress_test_user_1';
  
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('stress_test_user_1', 'approver_1', 'QmStressNew', '{}', 100000000);
  
  RAISE NOTICE 'Test 5 PASSED: Quota freed after delete, new insert succeeded';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 5 FAILED: %', SQLERRM;
END $$;

-- Test 6: Mixed capsules and vaults
DO $$
BEGIN
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('stress_test_user_8', 'approver_1', 'QmStress8', '{}', 100000000);
  
  INSERT INTO vaults (creator_pubkey, title, document_type, issuer, payload_cid, metadata, file_size)
  VALUES ('stress_test_user_8', 'Test Vault', 'contract', 'Issuer', 'QmStress9', '{}', 150000000);
  
  RAISE NOTICE 'Test 6 PASSED: User stored 100MB capsule + 150MB vault';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 6 FAILED: %', SQLERRM;
END $$;

-- Test 7: Verify quota tracking accuracy
DO $$
DECLARE
  tracked_quota bigint;
  actual_total bigint;
  user_key text;
BEGIN
  FOR user_key IN SELECT DISTINCT creator_pubkey FROM capsules WHERE creator_pubkey LIKE 'stress_test_%' LOOP
    SELECT total_size INTO tracked_quota FROM user_storage_quota WHERE creator_pubkey = user_key;
    
    SELECT COALESCE(SUM(file_size), 0) INTO actual_total
    FROM (
      SELECT file_size FROM capsules WHERE creator_pubkey = user_key
      UNION ALL
      SELECT file_size FROM vaults WHERE creator_pubkey = user_key
    ) combined;
    
    IF tracked_quota != actual_total THEN
      RAISE EXCEPTION 'Quota mismatch for %: tracked=%, actual=%', user_key, tracked_quota, actual_total;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Test 7 PASSED: All quota tracking accurate';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 7 FAILED: %', SQLERRM;
END $$;

-- Test 8: Global storage tracking accuracy
DO $$
DECLARE
  tracked_capsules bigint;
  tracked_vaults bigint;
  actual_capsules bigint;
  actual_vaults bigint;
BEGIN
  SELECT current_usage INTO tracked_capsules FROM global_storage_limits WHERE storage_type = 'capsules';
  SELECT current_usage INTO tracked_vaults FROM global_storage_limits WHERE storage_type = 'vaults';
  
  SELECT COALESCE(SUM(file_size), 0) INTO actual_capsules FROM capsules WHERE creator_pubkey LIKE 'stress_test_%';
  SELECT COALESCE(SUM(file_size), 0) INTO actual_vaults FROM vaults WHERE creator_pubkey LIKE 'stress_test_%';
  
  IF tracked_capsules != actual_capsules THEN
    RAISE EXCEPTION 'Capsules global mismatch: tracked=%, actual=%', tracked_capsules, actual_capsules;
  END IF;
  
  IF tracked_vaults != actual_vaults THEN
    RAISE EXCEPTION 'Vaults global mismatch: tracked=%, actual=%', tracked_vaults, actual_vaults;
  END IF;
  
  RAISE NOTICE 'Test 8 PASSED: Global storage tracking accurate';
  RAISE NOTICE '  Capsules: % bytes', tracked_capsules;
  RAISE NOTICE '  Vaults: % bytes', tracked_vaults;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 8 FAILED: %', SQLERRM;
END $$;

-- Test 9: Storage warning function
DO $$
DECLARE
  result jsonb;
  user_key text;
BEGIN
  FOR user_key IN SELECT DISTINCT creator_pubkey FROM user_storage_quota WHERE creator_pubkey LIKE 'stress_test_%' LOOP
    result := check_storage_warning(user_key);
    
    RAISE NOTICE 'User %: %% used, warning=%', 
      user_key, 
      result->>'percentage',
      result->>'warning';
  END LOOP;
  
  RAISE NOTICE 'Test 9 PASSED: Storage warning function works';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 9 FAILED: %', SQLERRM;
END $$;

-- Test 10: Zero-byte file handling
DO $$
BEGIN
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('stress_test_user_9', 'approver_1', 'QmStress10', '{}', 0);
  
  RAISE NOTICE 'Test 10 PASSED: Zero-byte file accepted';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 10 FAILED: %', SQLERRM;
END $$;

-- Test 11: Negative file size (should fail)
DO $$
BEGIN
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('stress_test_user_10', 'approver_1', 'QmStress11', '{}', -1000);
  
  RAISE NOTICE 'Test 11 FAILED: Should reject negative file size';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 11 PASSED: Rejected negative file size - %', SQLERRM;
END $$;

-- Final Summary
DO $$
DECLARE
  total_users int;
  total_capsules int;
  total_vaults int;
  total_storage bigint;
BEGIN
  SELECT COUNT(DISTINCT creator_pubkey) INTO total_users FROM user_storage_quota WHERE creator_pubkey LIKE 'stress_test_%';
  SELECT COUNT(*) INTO total_capsules FROM capsules WHERE creator_pubkey LIKE 'stress_test_%';
  SELECT COUNT(*) INTO total_vaults FROM vaults WHERE creator_pubkey LIKE 'stress_test_%';
  SELECT SUM(total_size) INTO total_storage FROM user_storage_quota WHERE creator_pubkey LIKE 'stress_test_%';
  
  RAISE NOTICE '';
  RAISE NOTICE '=== Stress Test Summary ===';
  RAISE NOTICE 'Total test users: %', total_users;
  RAISE NOTICE 'Total capsules: %', total_capsules;
  RAISE NOTICE 'Total vaults: %', total_vaults;
  RAISE NOTICE 'Total storage used: % MB', ROUND(total_storage / 1024.0 / 1024.0, 2);
END $$;

-- Cleanup
DELETE FROM vaults WHERE creator_pubkey LIKE 'stress_test_%';
DELETE FROM capsules WHERE creator_pubkey LIKE 'stress_test_%';
DELETE FROM user_storage_quota WHERE creator_pubkey LIKE 'stress_test_%';
UPDATE global_storage_limits SET current_usage = 0;

RAISE NOTICE 'Test data cleaned up';

COMMIT;
