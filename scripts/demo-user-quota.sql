-- Demonstration: User Quota Enforcement
-- Shows how the system prevents a single user from exceeding 250MB

-- Test user trying to exceed quota
DO $$
BEGIN
  RAISE NOTICE 'Test 1: User uploads 200MB - Should succeed';
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('demo_user', 'approver', 'QmDemo1', '{}', 200000000);
  RAISE NOTICE '  ✓ Success: 200MB uploaded';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '  ✗ Failed: %', SQLERRM;
END $$;

DO $$
BEGIN
  RAISE NOTICE 'Test 2: Same user uploads 40MB - Should succeed (total 240MB)';
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('demo_user', 'approver', 'QmDemo2', '{}', 40000000);
  RAISE NOTICE '  ✓ Success: 40MB uploaded, total 240MB';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '  ✗ Failed: %', SQLERRM;
END $$;

DO $$
BEGIN
  RAISE NOTICE 'Test 3: Same user tries 20MB more - Should FAIL (would be 260MB)';
  INSERT INTO capsules (creator_pubkey, approver_pubkey, payload_cid, metadata, file_size)
  VALUES ('demo_user', 'approver', 'QmDemo3', '{}', 20000000);
  RAISE NOTICE '  ✗ UNEXPECTED: Should have been blocked!';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '  ✓ BLOCKED: %', SQLERRM;
END $$;

-- Check user quota
DO $$
DECLARE
  user_quota RECORD;
BEGIN
  SELECT * INTO user_quota FROM user_storage_quota WHERE creator_pubkey = 'demo_user';
  RAISE NOTICE '';
  RAISE NOTICE 'User Quota Status:';
  RAISE NOTICE '  Used: % MB', ROUND(user_quota.total_size / 1024.0 / 1024.0, 2);
  RAISE NOTICE '  Limit: % MB', ROUND(user_quota.quota_limit / 1024.0 / 1024.0, 2);
  RAISE NOTICE '  Percentage: %', ROUND((user_quota.total_size::numeric / user_quota.quota_limit::numeric) * 100, 2);
END $$;

-- Cleanup
DELETE FROM capsules WHERE creator_pubkey = 'demo_user';
DELETE FROM user_storage_quota WHERE creator_pubkey = 'demo_user';
RAISE NOTICE '';
RAISE NOTICE 'Demo completed and cleaned up';
