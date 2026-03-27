-- ============================================
-- Add Admin User: azt.2004@hotmail.com
-- ============================================
-- 
-- IMPORTANT: This user must first be created through either:
-- 1. The app's signup page with email: azt.2004@hotmail.com and password: abdul2003
-- 2. Supabase Dashboard > Authentication > Users > Add user
--
-- After the user is created and their profile exists, run this script
-- to grant them admin access.
--
-- ============================================

-- Step 1: Verify the user exists in profiles
SELECT 
  id,
  email,
  full_name,
  user_type,
  created_at
FROM profiles
WHERE email = 'azt.2004@hotmail.com';

-- If no results appear above, the user hasn't been created yet.
-- Please create the user first through the app or Supabase dashboard.

-- Step 2: Add admin role (run after confirming user exists)
INSERT INTO admin_roles (user_id, role, permissions, created_at, updated_at)
SELECT 
  id,
  'super_admin',
  '{"all": true}'::jsonb,
  NOW(),
  NOW()
FROM profiles
WHERE email = 'azt.2004@hotmail.com'
ON CONFLICT (user_id) DO UPDATE
SET 
  role = 'super_admin',
  permissions = '{"all": true}'::jsonb,
  updated_at = NOW();

-- Step 3: Verify admin role was added successfully
SELECT 
  p.id,
  p.email,
  p.full_name,
  ar.role,
  ar.permissions,
  ar.created_at as admin_since
FROM profiles p
JOIN admin_roles ar ON p.id = ar.user_id
WHERE p.email = 'azt.2004@hotmail.com';

-- If you see results above with role = 'super_admin', setup is complete!
-- You can now login with azt.2004@hotmail.com / abdul2003 at /admin/login

-- ============================================
-- Optional: Update user profile details
-- ============================================
-- Uncomment and run if you want to update the admin's profile
-- UPDATE profiles
-- SET 
--   full_name = 'Abdul Admin',
--   full_name_arabic = 'عبد الله',
--   updated_at = NOW()
-- WHERE email = 'azt.2004@hotmail.com';
