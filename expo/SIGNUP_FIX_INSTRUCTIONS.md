# Fix Supabase Signup Error

You're getting a "Database error saving new user" error. This happens because the automatic profile creation trigger needs proper permissions.

## Step 1: Run the Fix SQL Script

1. **Open your Supabase Dashboard**: https://supabase.com/dashboard
2. **Go to your project** (dhasylndfvisgqbvdwbd)
3. **Navigate to**: SQL Editor (left sidebar)
4. **Click**: "New query"
5. **Copy the entire contents** of `supabase/fix-signup.sql`
6. **Paste** it into the SQL editor
7. **Click** "Run" (bottom right)

You should see a success message saying "Success. No rows returned"

## Step 2: Test Signup Again

After running the SQL script:

1. **Reload your app** in the browser/device
2. **Try signing up again** with a new email address
3. The signup should now work properly

## What the Fix Does

The SQL script:
- ✅ Recreates the `handle_new_user()` function with proper permissions
- ✅ Adds error handling to prevent crashes
- ✅ Adds an INSERT policy for profile creation
- ✅ Grants necessary permissions to all roles

## Common Issues

### Issue 1: "Email already exists"
**Solution**: Use a different email address or delete the old account first

### Issue 2: "Still getting database error"
**Solution**: 
1. Check if the SQL script ran successfully
2. Make sure you're connected to the correct project
3. Try restarting your Expo server: Stop the server and run `npx expo start` again

### Issue 3: "Profile not found after signup"
**Solution**: 
1. The trigger creates the profile automatically
2. Wait 1-2 seconds after signup for the profile to be created
3. The app has a built-in delay to handle this

## Testing Checklist

- [ ] SQL script executed without errors
- [ ] New user signup completes successfully
- [ ] User profile is created automatically
- [ ] User can log in after signup
- [ ] User type (buyer/seller) is set correctly

## Need More Help?

If you're still having issues:
1. Check the Supabase logs: Dashboard > Logs > Postgres Logs
2. Look for error messages related to profile creation
3. Make sure your Supabase project is not in a paused state
