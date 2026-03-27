# Fix Signup Trigger - Instructions

## Problem
When users try to sign up, they get database errors because the automatic profile creation trigger was accidentally removed in the `complete-fresh-start.sql` script.

## Solution
Run the `fix-signup-trigger.sql` script to restore the trigger.

## Steps

### Option 1: Via Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/fix-signup-trigger.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Cmd/Ctrl + Enter`
7. You should see a success message: "✓ SIGNUP TRIGGER FIXED"

### Option 2: Via Supabase CLI

```bash
supabase db push --file supabase/fix-signup-trigger.sql
```

## What This Does

1. **Removes old trigger** (if it exists) to start clean
2. **Creates the `handle_new_user()` function** that:
   - Automatically creates a profile when a user signs up
   - Uses the email and name from signup
   - Defaults to "buyer" user type
   - Handles errors gracefully (won't break signup if profile already exists)
3. **Creates the trigger** that runs after every user signup
4. **Grants proper permissions** so the trigger can execute

## After Running

Test by creating a new user:
1. Go to your app
2. Try signing up with a new email
3. The signup should now work without errors
4. Check the profiles table to verify the profile was created

## Verification

After running the script, you can verify it worked by checking:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if function exists  
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

Both queries should return results.

## Notes

- This fix is safe to run multiple times
- It won't affect existing users or profiles
- The trigger handles duplicate profiles gracefully
- If signup still fails, check the console logs for specific error messages
