-- =============================================================================
-- COMPLETE FIX: Remove trigger that's causing "Database error saving new user"
-- =============================================================================

-- Step 1: Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Step 2: Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 3: Verify no triggers remain
DO $$
DECLARE
    trigger_count INT;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relname = 'users' 
    AND n.nspname = 'auth'
    AND NOT t.tgisinternal
    AND t.tgname LIKE '%user%';

    IF trigger_count > 0 THEN
        RAISE WARNING 'Still found % triggers on auth.users - please check manually', trigger_count;
    ELSE
        RAISE NOTICE '✅ No triggers found on auth.users';
    END IF;
END $$;

-- Step 4: Ensure profiles table has correct policies
-- Drop and recreate to ensure clean state
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON profiles;

-- Service role can do anything (used by Supabase)
CREATE POLICY "profiles_service_role_all"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Step 5: Grant necessary permissions
GRANT INSERT ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ SIGNUP FIX COMPLETE';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE 'The database trigger has been removed.';
RAISE NOTICE 'Profile creation is now handled by the app (AuthContext).';
RAISE NOTICE '';
RAISE NOTICE 'Try signing up again - it should work now!';
RAISE NOTICE '========================================';
