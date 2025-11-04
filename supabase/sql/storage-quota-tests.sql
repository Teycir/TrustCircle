-- Storage Quota Stress Tests
-- Tests user limits, global limits, and edge cases

-- Test 1: User can store up to 250MB
DO $$
BEGIN
  INSERT INTO vaults (creator_pubkey, title, document_type, issuer, payload_cid, metadata, file_size)
  VALUES ('test_user_1', 'Test Vault 1', 'contract', 'Test Issuer', 'QmTest1', '{}', 100000000);
  
  INSERT INTO vaults (creator_pubkey, title, document_type, issuer, payload_cid, metadata, file_size)
  VALUES ('test_user_1', 'Test Vault 2', 'contract', 'Test Issuer', 'QmTest2', '{}', 150000000);
  
  RAISE NOTICE 'Test 1 PASSED: User stored 250MB successfully';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 1 FAILED: %', SQLERRM;
END $$;

-- Test 2: User cannot exceed 250MB
DO $$
BEGIN
  INSERT INTO vaults (creator_pubkey, title, document_type, issuer, payload_cid, metadata, file_size)
  VALUES ('test_user_1', 'Test Vault 3', 'contract', 'Test Issuer', 'QmTest3', '{}', 20000000);
  
  RAISE NOTICE 'Test 2 FAILED: Should have blocked insert over 250MB';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 2 PASSED: Correctly blocked user over 250MB - %', SQLERRM;
END $$;

-- Test 3: Multiple users can each store 250MB
DO $$
BEGIN
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('test_user_2', 'approver_1', 'QmTest4', '{}', 250000000);
  
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('test_user_3', 'approver_1', 'QmTest5', '{}', 250000000);
  
  RAISE NOTICE 'Test 3 PASSED: Multiple users can store 250MB each';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 3 FAILED: %', SQLERRM;
END $$;

-- Test 4: Global limit blocks at 95% (1020MB for 1GB limit)
DO $$
DECLARE
  i int;
BEGIN
  FOR i IN 1..5 LOOP
    INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
    VALUES ('test_user_' || (i + 3), 'approver_1', 'QmTest' || (i + 5), '{}', 200000000);
  END LOOP;
  
  RAISE NOTICE 'Test 4 FAILED: Should have blocked at 95%% global capacity';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 4 PASSED: Correctly blocked at 95%% global capacity - %', SQLERRM;
END $$;

-- Test 5: Delete frees up quota
DO $$
DECLARE
  vault_id uuid;
BEGIN
  DELETE FROM vaults WHERE creator_pubkey = 'test_user_1' LIMIT 1 RETURNING id INTO vault_id;
  
  INSERT INTO vaults (creator_pubkey, title, document_type, issuer, payload_cid, metadata, file_size)
  VALUES ('test_user_1', 'Test Vault After Delete', 'contract', 'Test Issuer', 'QmTestNew', '{}', 50000000);
  
  RAISE NOTICE 'Test 5 PASSED: Delete freed up quota for new insert';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 5 FAILED: %', SQLERRM;
END $$;

-- Test 6: Check storage warning function
DO $$
DECLARE
  result jsonb;
BEGIN
  result := check_storage_warning('test_user_1');
  
  IF (result->>'warning')::boolean = true THEN
    RAISE NOTICE 'Test 6 PASSED: Warning triggered at 80%% - %', result;
  ELSE
    RAISE NOTICE 'Test 6 INFO: User at %% - %', result->>'percentage', result;
  END IF;
END $$;

-- Test 7: Verify quota tracking accuracy
DO $$
DECLARE
  user_quota bigint;
  expected_size bigint;
BEGIN
  SELECT total_size INTO user_quota FROM user_storage_quota WHERE creator_pubkey = 'test_user_1';
  
  SELECT SUM(file_size) INTO expected_size FROM vaults WHERE creator_pubkey = 'test_user_1';
  
  IF user_quota = expected_size THEN
    RAISE NOTICE 'Test 7 PASSED: Quota tracking accurate - % bytes', user_quota;
  ELSE
    RAISE NOTICE 'Test 7 FAILED: Quota mismatch - tracked: %, actual: %', user_quota, expected_size;
  END IF;
END $$;

-- Cleanup test data
DELETE FROM vaults WHERE creator_pubkey LIKE 'test_user_%';
DELETE FROM capsules WHERE creator_pubkey LIKE 'test_user_%';
DELETE FROM user_storage_quota WHERE creator_pubkey LIKE 'test_user_%';
UPDATE global_storage_limits SET current_usage = 0;

RAISE NOTICE 'All tests completed. Test data cleaned up.';
