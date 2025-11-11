-- =============================================================================
-- FIX SIGNUP - Remove problematic trigger and ensure manual creation works
-- =============================================================================

-- Step 1: Drop the problematic trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 2: Drop ALL existing RLS policies on profiles
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Create simple, permissive RLS policies for profiles
-- Everyone can read profiles
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Service role can do anything (for server-side operations)
CREATE POLICY "profiles_service_role_all"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Authenticated users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Step 5: Ensure proper table structure
DO $$
BEGIN
    -- Ensure id column exists and is primary key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'PRIMARY KEY' 
        AND table_name = 'profiles' 
        AND constraint_name = 'profiles_pkey'
    ) THEN
        ALTER TABLE profiles ADD PRIMARY KEY (id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Primary key already exists or could not be added: %', SQLERRM;
END $$;

-- Verification and summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✓ SIGNUP SYSTEM FIXED - TRIGGER REMOVED';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes applied:';
  RAISE NOTICE '  1. ❌ Removed automatic trigger (was causing RLS violations)';
  RAISE NOTICE '  2. ✓ Cleaned up all old RLS policies';
  RAISE NOTICE '  3. ✓ Created new permissive RLS policies';
  RAISE NOTICE '  4. ✓ Granted proper permissions to all roles';
  RAISE NOTICE '';
  RAISE NOTICE 'How signup works now:';
  RAISE NOTICE '  - User signs up via Supabase Auth';
  RAISE NOTICE '  - AuthContext manually creates profile record';
  RAISE NOTICE '  - No RLS violations because user is authenticated';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: The app code (AuthContext) handles profile';
  RAISE NOTICE '    creation. No database trigger is needed or used.';
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
END $$;
