-- Run these queries in your Supabase SQL editor to debug the verification issue

-- 1. Check if the user exists in profiles table
SELECT 
  id, 
  email, 
  full_name, 
  user_type,
  created_at
FROM profiles 
WHERE email = 'azt.2003@hotmail.com';

-- 2. Check if there's a verification record for this user
-- First, get the user_id from step 1, then:
SELECT 
  id,
  user_id,
  permit_number,
  permit_expiration_date,
  id_front_url,
  id_back_url,
  permit_document_url,
  status,
  rejection_reason,
  created_at
FROM seller_verifications
WHERE user_id IN (
  SELECT id FROM profiles WHERE email = 'azt.2003@hotmail.com'
);

-- 3. Check ALL verification records (to see if any exist)
SELECT 
  sv.id,
  sv.user_id,
  p.email,
  p.full_name,
  sv.permit_number,
  sv.status,
  sv.created_at
FROM seller_verifications sv
LEFT JOIN profiles p ON p.id = sv.user_id
ORDER BY sv.created_at DESC
LIMIT 20;

-- 4. Check RLS policies on seller_verifications table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'seller_verifications';

-- 5. Check storage bucket policies for verification-documents
-- Run this in Supabase Dashboard > Storage > verification-documents > Policies
