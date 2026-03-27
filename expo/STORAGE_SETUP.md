# Storage Policies Setup

## Problem
The image upload during seller verification is failing with error:
```
"new row violates row-level security policy"
```

This is because the storage bucket `verification-documents` doesn't have proper RLS policies configured.

## Solution

You need to run the SQL script to create the storage bucket and configure its RLS policies.

### Steps:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the content from `supabase/storage-policies.sql`
4. Click **Run**

### What the script does:

1. **Creates the storage bucket**: Creates a public bucket called `verification-documents`
2. **Sets up RLS policies**:
   - Authenticated users can upload documents to their own folder (folder name must match their user ID)
   - Users can view their own documents
   - Public can view documents (needed for admin review)
   - Users can update/delete their own documents

### Storage Structure:

The storage structure will be:
```
verification-documents/
  └── {user_id}/
      ├── id_front_{timestamp}.jpg
      ├── id_back_{timestamp}.jpg
      └── permit_{timestamp}.jpg
```

This ensures that users can only upload to their own folder, preventing unauthorized access.

## Verification

After running the script:
1. Try uploading images in the seller verification flow again
2. Images should upload successfully without the RLS error
3. Check Supabase Storage dashboard to verify the bucket was created

## Security Notes

- Each user can only upload to a folder named with their user ID
- Public read access allows admins to review documents
- Users cannot access other users' documents for upload/update/delete operations
