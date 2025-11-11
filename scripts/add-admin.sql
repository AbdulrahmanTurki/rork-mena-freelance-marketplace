-- Script to add an admin user
-- This should be run in Supabase SQL Editor

-- First, you need to create the user through Supabase Auth UI or by signing up
-- Email: azt.2004@hotmail.com
-- Password: abdul2003

-- Then, once the user is created and you have their UUID, run:
-- Replace 'USER_UUID_HERE' with the actual UUID from the profiles table

-- Add admin role to the user
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
SET role = 'super_admin',
    permissions = '{"all": true}'::jsonb,
    updated_at = NOW();
