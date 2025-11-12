-- =============================================================================
-- EMERGENCY FIX FOR SIGNUP
-- This completely removes the problematic trigger and fixes all RLS policies
-- =============================================================================

-- Step 1: Drop ALL triggers on auth.users
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT t.tgname, c.relname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE c.relname = 'users' 
        AND n.nspname = 'auth'
        AND NOT t.tgisinternal
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', r.tgname);
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- Step 2: Drop ALL handle_new_user functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS auth.handle_new_user() CASCADE;

-- Step 3: Clean up profiles table RLS policies
-- Remove ALL existing policies first
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Step 4: Create clean, simple policies

-- Service role can do everything (needed for backend operations)
CREATE POLICY "service_role_all"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Everyone can view profiles
CREATE POLICY "profiles_select_all"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 5: Grant necessary permissions
GRANT SELECT ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Step 6: Verify the fix
DO $$
DECLARE
    trigger_count INT;
    policy_count INT;
BEGIN
    -- Check triggers
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relname = 'users' 
    AND n.nspname = 'auth'
    AND NOT t.tgisinternal;

    -- Check policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'profiles';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ EMERGENCY FIX APPLIED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Triggers on auth.users: %', trigger_count;
    RAISE NOTICE 'Policies on profiles: %', policy_count;
    RAISE NOTICE '';
    
    IF trigger_count = 0 THEN
        RAISE NOTICE '✅ All triggers removed successfully';
    ELSE
        RAISE WARNING '⚠️ % triggers still exist!', trigger_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Profile creation is now handled entirely by the app.';
    RAISE NOTICE 'Try signing up again!';
    RAISE NOTICE '========================================';
END $$;
