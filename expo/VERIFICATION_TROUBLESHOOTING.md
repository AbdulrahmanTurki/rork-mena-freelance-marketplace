# Verification Data Not Showing in Admin Dashboard - Troubleshooting Guide

## Problem
When viewing user "azt.2003@hotmail.com" in the admin dashboard, the debug tool shows "no verification data found for this user" even though the user submitted verification documents.

## Root Causes

### 1. RLS (Row Level Security) Policies Blocking Admin Access
The most common issue is that RLS policies on the `seller_verifications` table don't allow admin users to see verification records.

### 2. Missing Verification Record
The verification submission might have failed silently during the upload or database insert.

### 3. User Type Not Set to Admin
The admin user might not have the `user_type` set to 'admin' in the profiles table.

## Step-by-Step Fix

### Step 1: Run Diagnostic Queries
1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Run the queries in `VERIFICATION_DEBUG.sql` file

This will help you:
- Verify if the user exists
- Check if verification data exists
- See what RLS policies are active

### Step 2: Fix RLS Policies
1. In Supabase SQL Editor, run: `supabase/fix-verification-rls.sql`
2. This will:
   - Create proper RLS policies for admin access
   - Allow admins to SELECT all verification records
   - Allow admins to UPDATE verification records
   - Allow users to INSERT and SELECT their own records

### Step 3: Verify Admin User Type
Check that your admin user has the correct user_type:

```sql
-- Check your admin user
SELECT id, email, user_type 
FROM profiles 
WHERE email = 'your-admin-email@example.com';

-- If user_type is not 'admin', update it:
UPDATE profiles 
SET user_type = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### Step 4: Check Storage Policies
The verification documents are stored in the `verification-documents` bucket. Ensure:

1. Go to **Storage** > **verification-documents** > **Policies**
2. Ensure there's a policy that allows:
   - Authenticated users to INSERT files
   - Admins to SELECT all files
   - Users to SELECT their own files

If missing, create these policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "verification_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (auth.uid()::text = (storage.foldername(name))[1])
);

-- Allow users to read their own files
CREATE POLICY "verification_select_own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (auth.uid()::text = (storage.foldername(name))[1])
);

-- Allow admins to read all files
CREATE POLICY "verification_select_admin"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);
```

### Step 5: Test the Fix
1. Log out and log back in to the admin dashboard
2. Navigate to User Management
3. Find the user "azt.2003@hotmail.com"
4. Check if verification data now appears

## Common Issues

### Issue: "Access denied" or empty verification list
**Solution**: Make sure your admin account has `user_type = 'admin'` in the profiles table.

### Issue: Images not loading
**Solution**: Check storage policies allow admin access to the verification-documents bucket.

### Issue: Data shows but images show 404
**Solution**: 
- Check that the URLs in `id_front_url`, `id_back_url`, `permit_document_url` are valid
- Verify the storage bucket has public access or proper RLS policies
- Check the URLs in the browser to see the exact error

### Issue: Verification record doesn't exist
**Solution**: Ask the user to resubmit their verification. Check console logs during submission for errors.

## Verification Data Structure

A complete verification record should have:
```typescript
{
  id: string;
  user_id: string;
  permit_number: string;
  permit_expiration_date: string;
  id_front_url: string;  // URL to front of ID
  id_back_url: string;   // URL to back of ID
  permit_document_url: string; // URL to permit document
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}
```

## Debug Checklist

- [ ] User exists in profiles table
- [ ] User has email "azt.2003@hotmail.com"
- [ ] Verification record exists in seller_verifications table
- [ ] Verification record has valid user_id matching the user
- [ ] RLS policies allow admin to SELECT from seller_verifications
- [ ] Admin user has user_type = 'admin'
- [ ] Storage policies allow admin to read verification documents
- [ ] URLs in verification record are valid and accessible

## Support

If the issue persists after following these steps, check:
1. Browser console for JavaScript errors
2. Network tab to see if API requests are failing
3. Supabase logs for any database errors
4. React Query DevTools to see if data is being fetched but not displayed
