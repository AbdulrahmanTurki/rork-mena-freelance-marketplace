-- Add admin policies for seller_verifications table
-- This allows admins to view, update all seller verifications

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all verifications" ON seller_verifications;
DROP POLICY IF EXISTS "Admins can update all verifications" ON seller_verifications;

-- Allow admins to view all verifications
CREATE POLICY "Admins can view all verifications" ON seller_verifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_roles
    WHERE admin_roles.user_id = auth.uid()
  )
  OR auth.uid() = user_id
);

-- Allow admins to update all verifications (for approval/rejection)
CREATE POLICY "Admins can update all verifications" ON seller_verifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_roles
    WHERE admin_roles.user_id = auth.uid()
  )
  OR auth.uid() = user_id
);
