-- Complete Admin Setup Fix
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Create admin_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'support_agent', 'finance_admin')),
  permissions JSONB DEFAULT '{"all": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS on admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view own role" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON admin_roles;

-- Step 4: Create RLS policies
CREATE POLICY "Admins can view own role" 
  ON admin_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" 
  ON admin_roles FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Step 5: Create the critical RPC function
DROP FUNCTION IF EXISTS get_my_admin_role();

CREATE OR REPLACE FUNCTION get_my_admin_role()
RETURNS TABLE (
  role TEXT,
  permissions JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    admin_roles.role,
    admin_roles.permissions
  FROM admin_roles
  WHERE admin_roles.user_id = auth.uid()
  LIMIT 1;
END;
$$;

-- Step 6: Add admin users
-- For at.2004@hotmail.com
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'at.2004@hotmail.com';
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = admin_email;

  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'User % not found. Create this user first:', admin_email;
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User" > "Create new user"';
    RAISE NOTICE '3. Email: at.2004@hotmail.com';
    RAISE NOTICE '4. Password: abdul2003';
    RAISE NOTICE '5. Then run this script again';
  ELSE
    -- Create or update profile
    INSERT INTO profiles (id, email, full_name, user_type)
    VALUES (admin_user_id, admin_email, 'Admin User', 'buyer')
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

    -- Create or update admin role
    INSERT INTO admin_roles (user_id, role, permissions)
    VALUES (admin_user_id, 'super_admin', '{"all": true}'::jsonb)
    ON CONFLICT (user_id) DO UPDATE 
    SET role = EXCLUDED.role, permissions = EXCLUDED.permissions;

    RAISE NOTICE '✅ Admin user % configured successfully!', admin_email;
  END IF;
END $$;

-- For admin_final@gmail.com
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'admin_final@gmail.com';
BEGIN
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = admin_email;

  IF admin_user_id IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, user_type)
    VALUES (admin_user_id, admin_email, 'Final Admin', 'buyer')
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

    INSERT INTO admin_roles (user_id, role, permissions)
    VALUES (admin_user_id, 'super_admin', '{"all": true}'::jsonb)
    ON CONFLICT (user_id) DO UPDATE 
    SET role = EXCLUDED.role, permissions = EXCLUDED.permissions;

    RAISE NOTICE '✅ Admin user % configured successfully!', admin_email;
  END IF;
END $$;

-- Step 7: Verify setup
SELECT 
  u.email,
  p.full_name,
  ar.role,
  ar.permissions,
  ar.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN admin_roles ar ON ar.user_id = u.id
WHERE ar.role IS NOT NULL
ORDER BY ar.created_at DESC;
