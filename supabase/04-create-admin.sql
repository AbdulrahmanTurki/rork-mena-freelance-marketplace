-- =============================================================================
-- CREATE ADMIN USER
-- Run this after 03-functions-triggers.sql
-- This script is IDEMPOTENT - safe to run multiple times
-- 
-- IMPORTANT: Change the email and password before running!
-- =============================================================================

-- Ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CONFIGURATION - CHANGE THESE VALUES
-- =============================================================================

DO $$
DECLARE
  admin_email TEXT := 'admin_final@gmail.com';  -- CHANGE THIS
  admin_password TEXT := 'Admin@123';            -- CHANGE THIS
  admin_name TEXT := 'System Administrator';
  
  admin_user_id UUID;
  existing_user_id UUID;
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'CREATING ADMIN USER';
  RAISE NOTICE '====================================================';
  
  -- Check if user already exists in auth.users
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF existing_user_id IS NOT NULL THEN
    RAISE NOTICE 'User already exists with email: %', admin_email;
    RAISE NOTICE 'User ID: %', existing_user_id;
    admin_user_id := existing_user_id;
  ELSE
    -- Create new auth user
    RAISE NOTICE 'Creating new auth user...';
    
    admin_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', admin_name),
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
    
    RAISE NOTICE '✓ Auth user created with ID: %', admin_user_id;
  END IF;
  
  -- Create or update profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type
  ) VALUES (
    admin_user_id,
    admin_email,
    admin_name,
    'buyer'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  RAISE NOTICE '✓ Profile created/updated';
  
  -- Create or update admin role
  INSERT INTO public.admin_roles (
    user_id,
    role,
    permissions
  ) VALUES (
    admin_user_id,
    'super_admin',
    '{
      "users": {"view": true, "edit": true, "delete": true},
      "orders": {"view": true, "edit": true, "cancel": true},
      "gigs": {"view": true, "edit": true, "delete": true},
      "disputes": {"view": true, "resolve": true},
      "financials": {"view": true, "edit": true},
      "settings": {"view": true, "edit": true}
    }'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();
  
  RAISE NOTICE '✓ Admin role created/updated';
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✓ ADMIN USER SETUP COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Password: %', admin_password;
  RAISE NOTICE 'User ID: %', admin_user_id;
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: Change the password after first login!';
  RAISE NOTICE '====================================================';
  
  -- Verify admin setup
  PERFORM verify_admin_setup(admin_user_id);
END $$;

-- =============================================================================
-- VERIFICATION FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION verify_admin_setup(check_user_id UUID)
RETURNS void AS $$
DECLARE
  auth_exists BOOLEAN;
  profile_exists BOOLEAN;
  admin_role_exists BOOLEAN;
  admin_role_value TEXT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'VERIFICATION RESULTS';
  RAISE NOTICE '====================================================';
  
  -- Check auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = check_user_id)
  INTO auth_exists;
  RAISE NOTICE 'Auth user exists: %', auth_exists;
  
  -- Check profiles
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = check_user_id)
  INTO profile_exists;
  RAISE NOTICE 'Profile exists: %', profile_exists;
  
  -- Check admin_roles
  SELECT EXISTS(SELECT 1 FROM admin_roles WHERE user_id = check_user_id)
  INTO admin_role_exists;
  RAISE NOTICE 'Admin role exists: %', admin_role_exists;
  
  -- Get admin role value
  SELECT role INTO admin_role_value
  FROM admin_roles
  WHERE user_id = check_user_id;
  RAISE NOTICE 'Admin role: %', COALESCE(admin_role_value, 'NONE');
  
  RAISE NOTICE '====================================================';
  
  IF auth_exists AND profile_exists AND admin_role_exists THEN
    RAISE NOTICE '✓ ALL CHECKS PASSED - ADMIN READY TO USE';
  ELSE
    RAISE WARNING '✗ SOME CHECKS FAILED - REVIEW ABOVE';
  END IF;
  
  RAISE NOTICE '====================================================';
END;
$$ LANGUAGE plpgsql;
