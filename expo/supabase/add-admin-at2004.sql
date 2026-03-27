-- Simple script to add at.2004@hotmail.com as admin
-- Run this in Supabase SQL Editor AFTER creating the user in Auth

-- First, create the user in Supabase Dashboard:
-- 1. Go to Authentication > Users > Add User
-- 2. Email: at.2004@hotmail.com
-- 3. Password: abdul2003
-- 4. Auto Confirm: YES
-- 5. Then run this SQL script

-- Add admin role for at.2004@hotmail.com
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'at.2004@hotmail.com';
BEGIN
  -- Get user ID
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = admin_email;

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found! Create the user in Authentication > Users first', admin_email;
  END IF;

  -- Create/update profile
  INSERT INTO profiles (id, email, full_name, user_type)
  VALUES (admin_user_id, admin_email, 'Admin User', 'buyer')
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email;

  -- Create/update admin role
  INSERT INTO admin_roles (user_id, role, permissions)
  VALUES (admin_user_id, 'super_admin', '{"all": true}'::jsonb)
  ON CONFLICT (user_id) DO UPDATE 
  SET role = 'super_admin', permissions = '{"all": true}'::jsonb;

  RAISE NOTICE '✅ Admin user % configured successfully!', admin_email;
END $$;
