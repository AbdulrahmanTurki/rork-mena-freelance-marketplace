-- Complete Admin Login Diagnostic
-- Run this in Supabase SQL Editor to see what's wrong

-- 1. Check if the user exists in auth.users
SELECT 
  'AUTH USER CHECK' as test,
  id,
  email,
  created_at,
  confirmed_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'admin_final@gmail.com';

-- 2. Check if profile exists
SELECT 
  'PROFILE CHECK' as test,
  id,
  email,
  full_name,
  user_type
FROM profiles
WHERE email = 'admin_final@gmail.com';

-- 3. Check if admin_roles table exists and has structure
SELECT 
  'ADMIN_ROLES TABLE STRUCTURE' as test,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'admin_roles'
ORDER BY ordinal_position;

-- 4. Check if admin role exists for this user
SELECT 
  'ADMIN ROLE CHECK' as test,
  ar.user_id,
  u.email,
  ar.role,
  ar.permissions,
  ar.created_at
FROM admin_roles ar
JOIN auth.users u ON u.id = ar.user_id
WHERE u.email = 'admin_final@gmail.com';

-- 5. Check if RPC function exists
SELECT 
  'RPC FUNCTION CHECK' as test,
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name = 'get_my_admin_role';

-- 6. Test the RPC function (this will only work if you're logged in as that user)
-- SELECT * FROM get_my_admin_role();

-- 7. Check RLS policies on admin_roles
SELECT 
  'RLS POLICIES CHECK' as test,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'admin_roles';

-- 8. Show all admin users
SELECT 
  'ALL ADMIN USERS' as test,
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
