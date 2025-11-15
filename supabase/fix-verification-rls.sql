-- Fix RLS policies for seller_verifications table to allow admin access

-- Drop existing policies
DROP POLICY IF EXISTS "seller_verifications_select" ON seller_verifications;
DROP POLICY IF EXISTS "seller_verifications_insert" ON seller_verifications;
DROP POLICY IF EXISTS "seller_verifications_update" ON seller_verifications;

-- Enable RLS
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;

-- 1. Allow users to insert their own verification
CREATE POLICY "seller_verifications_insert"
ON seller_verifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to view their own verification
CREATE POLICY "seller_verifications_select_own"
ON seller_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Allow admins to view ALL verifications (CRITICAL FIX)
CREATE POLICY "seller_verifications_select_admin"
ON seller_verifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- 4. Allow admins to update verifications
CREATE POLICY "seller_verifications_update_admin"
ON seller_verifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- 5. Fix profiles table RLS to allow admin access
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;

CREATE POLICY "profiles_select_admin"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

-- 6. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON seller_verifications TO authenticated;
GRANT SELECT ON profiles TO authenticated;

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('seller_verifications', 'profiles')
ORDER BY tablename, policyname;
