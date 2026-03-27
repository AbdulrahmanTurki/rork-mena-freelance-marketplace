# Signup Fix Instructions

Your signup is failing because the database trigger isn't creating profiles properly. Follow these steps:

## Step 1: Run the SQL Fix Script

1. Open your Supabase dashboard
2. Go to the **SQL Editor**
3. Copy and paste the entire contents of `supabase/fix-signup-comprehensive.sql`
4. Click **Run** to execute the script

## Step 2: Test Signup

After running the script:

1. Try creating a new account in your app
2. Use a fresh email address (not one you've tried before)
3. Signup should now work successfully

## What This Fix Does

The script:
- Removes old broken triggers and policies
- Creates a new, simpler trigger function that auto-creates profiles
- Sets up proper Row Level Security (RLS) policies
- Grants all necessary database permissions
- Adds error handling so signup doesn't fail

## If Signup Still Fails

Check the browser/app console logs for specific errors:
- Look for messages starting with `[AuthContext]`
- If you see "Profile not found, creating manually" - the trigger isn't working
- If you see "Profile insert error" - there's a permissions issue

Run this in SQL Editor to check if trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## Common Issues

**Email already exists**: The email is in `auth.users` but profile wasn't created. To fix:
```sql
-- Replace USER_ID with the actual user ID from auth.users
INSERT INTO profiles (id, email, full_name, user_type)
SELECT id, email, raw_user_meta_data->>'full_name', 'buyer'
FROM auth.users
WHERE id = 'USER_ID'
ON CONFLICT (id) DO NOTHING;
```

**Rate limiting**: Wait 5 minutes between signup attempts, or use a different email.
