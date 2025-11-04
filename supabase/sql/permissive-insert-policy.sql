-- Permissive INSERT policy for capsules
-- Allows all capsule inserts without restrictions
-- Use only when RLS is enabled but you want unrestricted inserts

-- Drop conflicting INSERT policies
DROP POLICY IF EXISTS "Allow insert for creator" ON capsules;
DROP POLICY IF EXISTS "Users can create capsules" ON capsules;
DROP POLICY IF EXISTS "Authenticated users can insert capsules" ON capsules;

-- Create a single permissive INSERT policy
CREATE POLICY "allow_all_inserts" ON capsules
FOR INSERT
WITH CHECK (true);