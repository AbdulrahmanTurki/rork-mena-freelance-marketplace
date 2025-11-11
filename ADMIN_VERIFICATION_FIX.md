# Fix Admin Verification Access

## Problem
Admins cannot see seller verification documents (ID front/back, permit documents) because Row Level Security (RLS) policies only allow users to view their own verification data.

## Solution
The issue is that the `seller_verifications` table has RLS policies that restrict access. We need to add policies that allow admins to view all verifications.

## Steps to Fix

### Option 1: Run SQL in Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/admin-verification-policies.sql`
5. Click **Run** to execute the SQL

### Option 2: Use Supabase CLI

If you have Supabase CLI installed locally:

```bash
# Apply the migration
supabase db execute < supabase/admin-verification-policies.sql
```

## What This Does

The SQL script:
1. **Drops** the existing restrictive policies for `seller_verifications`
2. **Creates** new policies that allow:
   - Admins (users in `admin_roles` table) to view ALL verifications
   - Admins to update ALL verifications (for approval/rejection)
   - Regular users to still view/update only their own verifications

## Verification

After running the SQL:
1. Refresh your admin panel
2. Click on a seller user in User Management
3. You should now see:
   - Verification information section
   - Attached documents (ID front, ID back, Permit document)
   - The images should load properly

## Technical Details

The new policies check if the current user exists in the `admin_roles` table:
```sql
EXISTS (
  SELECT 1 FROM admin_roles
  WHERE admin_roles.user_id = auth.uid()
)
```

If they do, they can access all verification records. Otherwise, they can only access their own (`auth.uid() = user_id`).
