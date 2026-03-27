-- Fix Admin Login - Complete Solution
-- This script creates the missing RPC function, adds RLS policies, and creates an admin user

-- Step 1: Add RLS policies for admin_roles table
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view own role" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON admin_roles;

-- Admins can view their own role
CREATE POLICY "Admins can view own role" 
  ON admin_roles FOR SELECT 
  USING (auth.uid() = user_id);

-- Super admins can manage all roles (for future use)
CREATE POLICY "Super admins can manage all roles" 
  ON admin_roles FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Step 2: Create the RPC function to get admin role securely
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

-- Step 3: Create admin user at.2004@hotmail.com with password abdul2003
-- First, we need to check if the user already exists in auth.users
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'at.2004@hotmail.com';
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = admin_email;

  -- If user doesn't exist, we can't create it directly via SQL
  -- The user must be created via Supabase Auth API or dashboard
  -- So we'll just show a message
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'User % does not exist. Please create via Supabase dashboard or use the auth API.', admin_email;
    RAISE NOTICE 'Go to Supabase Dashboard > Authentication > Users > Add User';
    RAISE NOTICE 'Email: at.2004@hotmail.com';
    RAISE NOTICE 'Password: abdul2003';
  ELSE
    -- User exists, create/update profile
    INSERT INTO profiles (id, email, full_name, user_type)
    VALUES (admin_user_id, admin_email, 'Admin User', 'buyer')
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

    -- Create/update admin role
    INSERT INTO admin_roles (user_id, role, permissions)
    VALUES (admin_user_id, 'super_admin', '{"all": true}'::jsonb)
    ON CONFLICT (user_id) DO UPDATE 
    SET role = EXCLUDED.role, permissions = EXCLUDED.permissions;

    RAISE NOTICE 'Admin user % configured successfully!', admin_email;
  END IF;
END $$;

-- Step 4: Also configure admin_final@gmail.com if it exists
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'admin_final@gmail.com';
BEGIN
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = admin_email;

  IF admin_user_id IS NOT NULL THEN
    -- User exists, create/update profile
    INSERT INTO profiles (id, email, full_name, user_type)
    VALUES (admin_user_id, admin_email, 'Final Admin', 'buyer')
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

    -- Create/update admin role
    INSERT INTO admin_roles (user_id, role, permissions)
    VALUES (admin_user_id, 'super_admin', '{"all": true}'::jsonb)
    ON CONFLICT (user_id) DO UPDATE 
    SET role = EXCLUDED.role, permissions = EXCLUDED.permissions;

    RAISE NOTICE 'Admin user % configured successfully!', admin_email;
  END IF;
END $$;

-- Verification query to check admin setup
SELECT 
  p.email,
  p.full_name,
  ar.role,
  ar.permissions
FROM profiles p
INNER JOIN admin_roles ar ON ar.user_id = p.id
ORDER BY ar.created_at DESC;
