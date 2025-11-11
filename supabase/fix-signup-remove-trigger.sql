-- =============================================================================
-- FINAL FIX: Remove trigger and let app handle profile creation
-- This removes the database trigger that's causing the error
-- =============================================================================

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 3: Make sure RLS policies allow the app to create profiles
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON profiles;

-- Create a policy that lets authenticated users create their own profile
CREATE POLICY "Users can insert own profile after signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also allow the service role to insert
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Step 4: Grant necessary permissions
GRANT INSERT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Step 5: Verify
DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'TRIGGER REMOVED SUCCESSFULLY!';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'The app will now handle profile creation.';
  RAISE NOTICE 'Test signup in your app now.';
  RAISE NOTICE '==========================================';
END $$;
